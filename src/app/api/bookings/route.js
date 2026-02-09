import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createBooking, getAllBookings, updateBookingLineStatus } from '@/lib/firebaseBooking';
import { sendBookingNotification } from '@/lib/lineService';
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

    // 3. ส่ง LINE Message อัตโนมัติให้ลูกค้า (ส่ง text ก่อน เชื่อถือได้ 100%)
    let messageSent = false;
    try {
      if (!user.lineId) {
        await updateBookingLineStatus(booking.id, {
          sent: false,
          status: 0,
          requestId: '',
          error: 'Missing LINE userId',
        });
      } else {
        // ส่ง text message ก่อนเสมอ (เชื่อถือได้กว่า Flex)
        const textResult = await sendBookingNotification(user.lineId, {
          villaName: body.villaName,
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          nights: body.nights,
          guests: body.guests || 1,
          totalPrice: body.totalPrice,
        });

        if (textResult.success) {
          messageSent = true;
          await updateBookingLineStatus(booking.id, {
            sent: true,
            status: textResult.status,
            requestId: textResult.requestId,
            error: '',
          });
        } else {
          await updateBookingLineStatus(booking.id, {
            sent: false,
            status: textResult.status,
            requestId: textResult.requestId,
            error: JSON.stringify(textResult.error) || 'LINE push failed',
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
      lineOaUrl: `https://line.me/R/oaid/${process.env.NEXT_PUBLIC_LINE_OA_ID || '@313mzore'}`,
    });
  } catch (error) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
