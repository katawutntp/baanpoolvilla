import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createBooking, markBookingMessageSent, getAllBookings } from '@/lib/firebaseBooking';
import { sendBookingFlexMessage, sendBookingNotification } from '@/lib/lineService';
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
    try {
      const lineResult = await sendBookingFlexMessage(user.lineId, {
        villaName: body.villaName,
        villaImage: body.villaImage || '',
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        nights: body.nights,
        guests: body.guests || 1,
        totalPrice: body.totalPrice,
      });

      if (lineResult.success) {
        messageSent = true;
        await markBookingMessageSent(booking.id);
      } else {
        // Fallback: ส่ง text ธรรมดาถ้า Flex ไม่ได้
        const fallbackResult = await sendBookingNotification(user.lineId, {
          villaName: body.villaName,
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          nights: body.nights,
          guests: body.guests || 1,
          totalPrice: body.totalPrice,
        });
        if (fallbackResult.success) {
          messageSent = true;
          await markBookingMessageSent(booking.id);
        }
      }
    } catch (lineErr) {
      console.error('LINE send error (booking saved):', lineErr);
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
