'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRefreshCw, FiFilter, FiUser, FiCalendar, FiHome } from 'react-icons/fi';
import { FaLine } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  pending: { text: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  confirmed: { text: 'ยืนยันแล้ว', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  cancelled: { text: 'ยกเลิก', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [actionLoading, setActionLoading] = useState(null); // booking id being processed

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('โหลดข้อมูลล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookingId, action) => {
    const actionText = action === 'confirmed' ? 'ยืนยัน' : 'ยกเลิก';
    if (!confirm(`ต้องการ${actionText}การจองนี้?`)) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        toast.success(`${actionText}การจองสำเร็จ`);
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: action } : b))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">จัดการการจอง</h1>
          <p className="text-gray-500 mt-1">ยืนยันหรือยกเลิกการจองจากลูกค้า</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <FiRefreshCw size={18} />
          รีเฟรช
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { key: 'all', label: 'ทั้งหมด', color: 'bg-blue-500' },
          { key: 'pending', label: 'รอชำระเงิน', color: 'bg-yellow-500' },
          { key: 'confirmed', label: 'ยืนยันแล้ว', color: 'bg-green-500' },
          { key: 'cancelled', label: 'ยกเลิก', color: 'bg-red-500' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`bg-white rounded-xl p-4 shadow-sm text-left transition-all ${
              filter === item.key ? 'ring-2 ring-primary-400' : ''
            }`}
          >
            <div className={`w-3 h-3 ${item.color} rounded-full mb-2`} />
            <p className="text-2xl font-bold">{counts[item.key]}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-400">
          <FiCalendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>ไม่มีรายการจอง</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusInfo = STATUS_LABELS[booking.status] || STATUS_LABELS.pending;
            const isProcessing = actionLoading === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Booking info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <div className={`w-2 h-2 ${statusInfo.dot} rounded-full`} />
                        {statusInfo.text}
                      </span>
                      {booking.lineMessageSent && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <FaLine size={12} /> ส่ง LINE แล้ว
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FiHome size={16} className="text-primary-500" />
                      {booking.villaName}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiUser size={14} className="text-gray-400" />
                        <span>{booking.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar size={14} className="text-gray-400" />
                        <span>{booking.checkIn} → {booking.checkOut}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-600">
                          ฿{(booking.totalPrice || 0).toLocaleString()}
                        </span>
                        <span className="text-gray-400 ml-1">({booking.nights} คืน, {booking.guests} คน)</span>
                      </div>
                    </div>

                    {booking.message && (
                      <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                        💬 {booking.message}
                      </p>
                    )}

                    {booking.userPhone && (
                      <p className="mt-1 text-sm text-gray-500">
                        📞 {booking.userPhone}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      จองเมื่อ: {booking.createdAt ? new Date(booking.createdAt).toLocaleString('th-TH') : '-'}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 lg:flex-col">
                      <button
                        onClick={() => handleAction(booking.id, 'confirmed')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="spinner w-4 h-4" />
                        ) : (
                          <>
                            <FiCheck size={16} />
                            ยืนยัน
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, 'cancelled')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="spinner w-4 h-4" />
                        ) : (
                          <>
                            <FiX size={16} />
                            ยกเลิก
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
