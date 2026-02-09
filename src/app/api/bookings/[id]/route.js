import { NextResponse } from 'next/server';
import { getBookingById, updateBookingStatus } from '@/lib/firebaseBooking';
import { blockDatesForBooking, releaseDatesForBooking, confirmDatesForBooking } from '@/lib/calendarSync';
import { sendStatusUpdateMessage } from '@/lib/lineService';

// PATCH /api/bookings/[id] - อัปเดตสถานะการจอง (approve / cancel)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body; // 'confirmed' or 'cancelled'

    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'สถานะไม่ถูกต้อง ต้องเป็น confirmed หรือ cancelled' },
        { status: 400 }
      );
    }

    // ดึง booking data
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบการจอง' }, { status: 404 });
    }

    // อัปเดตสถานะ booking
    await updateBookingStatus(id, status);

    // อัปเดตปฏิทิน
    if (booking.villaCode) {
      try {
        if (status === 'confirmed') {
          // เปลี่ยนจาก pending (เหลือง) → booked (แดง)
          await confirmDatesForBooking(booking.villaCode, booking.checkIn, booking.checkOut, id);
        } else if (status === 'cancelled') {
          // ปลดบล็อค - ลบวันทั้งหมดออก
          await releaseDatesForBooking(booking.villaCode, booking.checkIn, booking.checkOut);
        }
      } catch (calErr) {
        console.error('Calendar sync error:', calErr);
      }
    }

    // ส่ง LINE แจ้งลูกค้า
    if (booking.userLineId) {
      try {
        await sendStatusUpdateMessage(booking.userLineId, booking, status);
      } catch (lineErr) {
        console.error('LINE notify error:', lineErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'confirmed' ? 'ยืนยันการจองสำเร็จ' : 'ยกเลิกการจองสำเร็จ',
    });
  } catch (error) {
    console.error('Booking PATCH Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
