import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createBooking, getAllBookings, updateBookingLineStatus } from '@/lib/firebaseBooking';
import { sendBookingFlexMessage } from '@/lib/lineService';
import { blockDatesForBooking } from '@/lib/calendarSync';

// GET /api/bookings - ดึงรายการจองทั้งหมด (admin) หรือตาม villaId
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const villaId = searchParams.get('villaId');
    const status = searchParams.get('status');

    const bookings = await getAllBookings({ villaId, status });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Bookings GET Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// POST /api/bookings - สร้างการจองใหม่
export async function POST(request) {
  try {
    // ตรวจสอบ authentication
    const token = request.cookies.get('line_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนทำการจอง' }, { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    } catch {
      return NextResponse.json({ error: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }

    const body = await request.json();

    // Validate
    if (!body.villaId || !body.checkIn || !body.checkOut || !body.nights) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    // 1. บันทึก booking ใน Firebase
    const booking = await createBooking({
      userId: user.userId,
      userLineId: user.lineId,
      userName: body.userName || user.displayName,
      userPhone: body.userPhone || '',
      villaId: body.villaId,
      villaName: body.villaName,
      villaCode: body.villaCode || '',
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      nights: body.nights,
      guests: body.guests || 1,
      totalPrice: body.totalPrice,
      message: body.message || '',
    });

    // 2. บล็อควันที่ในปฏิทิน (สีเหลือง = pending/รอชำระเงิน)
    if (body.villaCode) {
      try {
        await blockDatesForBooking(body.villaCode, body.checkIn, body.checkOut, 'pending', booking.id);
      } catch (calErr) {
        console.error('Calendar block error (booking saved):', calErr);
      }
    }

    // 3. ส่ง LINE Message อัตโนมัติให้ลูกค้า
    let messageSent = false;
    let friendStatus = 'unknown';
    try {
      if (!user.lineId) {
        await updateBookingLineStatus(booking.id, {
          sent: false,
          status: 0,
          requestId: '',
          error: 'Missing LINE userId',
        });
      } else {
        // ตรวจสอบว่า user เป็นเพื่อน OA หรือไม่ (ผ่าน Messaging API Get Profile)
        try {
          const profileCheck = await fetch(`https://api.line.me/v2/bot/profile/${user.lineId}`, {
            headers: { Authorization: `Bearer ${process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}` },
          });
          if (profileCheck.ok) {
            friendStatus = 'friend';
          } else {
            friendStatus = 'not-friend';
            console.warn('User is NOT a friend of OA:', user.lineId, profileCheck.status);
          }
        } catch (e) {
          console.error('Friend check error:', e);
        }

        // ส่ง Flex Message
        const textResult = await sendBookingFlexMessage(user.lineId, {
          villaName: body.villaName,
          villaImage: body.villaImage || '',
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          nights: body.nights,
          guests: body.guests || 1,
          totalPrice: body.totalPrice,
        });

        if (textResult.success) {
          messageSent = friendStatus === 'friend'; // 200 แต่ไม่ใช่เพื่อน = ไม่ส่งจริง
          await updateBookingLineStatus(booking.id, {
            sent: friendStatus === 'friend',
            status: textResult.status,
            requestId: textResult.requestId,
            error: friendStatus === 'not-friend' ? 'API 200 but user not friend of OA - message not delivered' : '',
            friendStatus,
          });
        } else {
          await updateBookingLineStatus(booking.id, {
            sent: false,
            status: textResult.status,
            requestId: textResult.requestId,
            error: JSON.stringify(textResult.error) || 'LINE push failed',
            friendStatus,
          });
        }
      }
    } catch (lineErr) {
      console.error('LINE send error (booking saved):', lineErr);
      await updateBookingLineStatus(booking.id, {
        sent: false,
        status: 0,
        requestId: '',
        error: lineErr?.message || 'LINE send exception',
      });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: 'pending',
      },
      lineMessageSent: messageSent,
      friendStatus,
      lineOaUrl: `https://line.me/R/oaid/${process.env.NEXT_PUBLIC_LINE_OA_ID || '@313mzore'}`,
    });
  } catch (error) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
