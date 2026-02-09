'use client';

import { useState } from 'react';
import { FiUser, FiPhone, FiMessageSquare, FiSend, FiCheck } from 'react-icons/fi';
import { FaLine } from 'react-icons/fa';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { formatPriceCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/authContext';
import toast from 'react-hot-toast';

export default function BookingForm({ villa, checkIn, checkOut, bookingData = {} }) {
  const { user, loginWithLine } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    guests: 1,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    : 0;

  // คำนวณราคาจากปฏิทิน (Calendar) ถ้ามี หรือใช้ pricePerNight
  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || nights <= 0) return 0;
    let total = 0;
    let hasCalendarPrice = false;
    const current = new Date(checkIn);
    const end = new Date(checkOut);
    while (current < end) {
      const dateKey = current.toISOString().split('T')[0];
      const dayData = bookingData[dateKey];
      if (dayData?.price && dayData.price > 0) {
        total += dayData.price;
        hasCalendarPrice = true;
      } else {
        total += villa?.pricePerNight || 0;
      }
      current.setDate(current.getDate() + 1);
    }
    return total;
  };

  const totalPrice = calculateTotalPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ถ้ายังไม่ login → redirect ไป LINE Login
    if (!user) {
      loginWithLine(window.location.pathname);
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('กรุณาเลือกวันเช็คอิน - เช็คเอาท์');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: villa.id,
          villaName: villa.name,
          villaCode: villa.code || '',
          villaImage: villa.images?.[0]?.url || '',
          checkIn: format(checkIn, 'yyyy-MM-dd'),
          checkOut: format(checkOut, 'yyyy-MM-dd'),
          nights,
          guests: parseInt(formData.guests),
          totalPrice,
          userName: user.displayName,
          userPhone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookingSuccess(data);
        toast.success('จองสำเร็จ! ตรวจสอบข้อความใน LINE ของคุณ');
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  // จองสำเร็จ - แสดงผลสำเร็จ + ลิงก์ไป LINE OA
  if (bookingSuccess) {
    return (
      <div className="bg-white rounded-2xl border p-6 sticky top-24">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-green-600 mb-2">จองสำเร็จ!</h3>
          <p className="text-gray-500 text-sm mb-4">
            {bookingSuccess.lineMessageSent
              ? 'ส่งข้อความยืนยันไปที่ LINE ของคุณแล้ว'
              : 'การจองบันทึกเรียบร้อยแล้ว'}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{villa?.name}</span>
            </p>
            <p className="text-sm text-gray-500">
              {checkIn && format(checkIn, 'dd MMM yy', { locale: th })} -{' '}
              {checkOut && format(checkOut, 'dd MMM yy', { locale: th })}
            </p>
            <p className="text-sm font-bold text-primary-600 mt-1">
              {formatPriceCurrency(totalPrice)} ({nights} คืน)
            </p>
          </div>

          {/* สถานะรอชำระเงิน */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-yellow-700 flex items-center gap-2">
              ⏳ สถานะ: รอชำระเงิน
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              กรุณาชำระเงินเพื่อยืนยันการจอง เจ้าหน้าที่จะติดต่อกลับเร็วที่สุด
            </p>
          </div>

          {/* แจ้งเตือนถ้ายังไม่ได้แอดเพื่อน OA */}
          {bookingSuccess.friendStatus === 'not-friend' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-red-700 mb-2">
                ⚠️ กรุณาเพิ่มเพื่อน LINE OA
              </p>
              <p className="text-xs text-red-600 mb-3">
                เพื่อรับข้อมูลการจองและสถานะผ่าน LINE
              </p>
              <a
                href={bookingSuccess.lineOaUrl || 'https://line.me/R/oaid/@313mzore'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#05b04c] transition-colors"
              >
                <FaLine size={16} />
                เพิ่มเพื่อน @TestBPV
              </a>
            </div>
          )}

          <button
            onClick={() => setBookingSuccess(null)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            จองเพิ่มเติม
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-6 sticky top-24">
      <h3 className="text-xl font-bold mb-1">{villa?.name}</h3>
      <p className="text-2xl font-bold text-primary-600 mb-4">
        {formatPriceCurrency(villa?.pricePerNight)}
        <span className="text-sm font-normal text-gray-500"> /คืน</span>
      </p>

      {/* Date summary */}
      {checkIn && (
        <div className="bg-primary-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">เช็คอิน</p>
              <p className="font-semibold">{format(checkIn, 'dd MMM yy', { locale: th })}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">เช็คเอาท์</p>
              <p className="font-semibold">
                {checkOut ? format(checkOut, 'dd MMM yy', { locale: th }) : '-'}
              </p>
            </div>
          </div>
          {nights > 0 && (
            <div className="mt-3 pt-3 border-t border-primary-200">
              <div className="flex justify-between text-sm">
                <span>{formatPriceCurrency(villa?.pricePerNight)} x {nights} คืน</span>
                <span className="font-bold">{formatPriceCurrency(totalPrice)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User info - ถ้า login แล้วแสดง profile */}
      {user && (
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-4">
          {user.pictureUrl && (
            <img
              src={user.pictureUrl}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-700">{user.displayName}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <FaLine size={12} /> เชื่อมต่อ LINE แล้ว
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {user ? (
          <>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="เบอร์โทรศัพท์ (เผื่อติดต่อ)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field pl-10 !py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">จำนวนผู้เข้าพัก</label>
              <select
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="input-field !py-2.5 text-sm"
              >
                {Array.from({ length: villa?.maxGuests || 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} คน
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
              <textarea
                placeholder="ข้อความเพิ่มเติม"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="input-field pl-10 !py-2.5 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !checkIn || !checkOut}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="spinner w-5 h-5" />
              ) : (
                <>
                  <FiSend size={16} />
                  จองเลย
                </>
              )}
            </button>
          </>
        ) : (
          /* ถ้ายังไม่ login - แสดงปุ่ม Login ด้วย LINE */
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-4">
              เข้าสู่ระบบด้วย LINE เพื่อทำการจอง
            </p>
            <button
              type="submit"
              className="bg-[#06C755] hover:bg-[#05b04c] text-white w-full py-3 rounded-lg font-medium 
                flex items-center justify-center gap-2 transition-colors"
            >
              <FaLine size={20} />
              เข้าสู่ระบบด้วย LINE เพื่อจอง
            </button>
            <p className="text-xs text-gray-400 mt-2">
              ระบบจะส่งข้อมูลการจองผ่าน LINE อัตโนมัติ
            </p>
          </div>
        )}
      </form>

      {/* Contact buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href="tel:+66123456789"
          className="btn-outline text-center !py-2 text-sm flex items-center justify-center gap-1"
        >
          <FiPhone size={14} />
          โทร
        </a>
        <a
          href="https://line.me/R/oaid/@313mzore"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#06C755] hover:bg-[#05b04c] text-white text-center !py-2 text-sm rounded-lg font-medium flex items-center justify-center gap-1 transition-colors"
        >
          <FaLine size={14} />
          Line
        </a>
      </div>
    </div>
  );
}
