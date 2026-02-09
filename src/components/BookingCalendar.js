'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, isAfter, isToday } from 'date-fns';
import { th } from 'date-fns/locale';
import { formatPriceCurrency } from '@/lib/utils';

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export default function BookingCalendar({ houseCode, bookingData = {}, onDateSelect, selectable = true }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Fill blanks before first day
  const blanks = Array(startDayOfWeek).fill(null);
  const allCells = [...blanks, ...daysInMonth];

  const getDateKey = (date) => format(date, 'yyyy-MM-dd');

  const getDayStatus = (date) => {
    const key = getDateKey(date);
    const data = bookingData[key];
    if (!data) return { status: 'available', price: null };
    return {
      status: data.status || 'available',
      price: data.price || null,
    };
  };

  const isBooked = (date) => {
    const { status } = getDayStatus(date);
    return status === 'booked' || status === 'confirmed' || status === 'pending';
  };

  const isPending = (date) => {
    const { status } = getDayStatus(date);
    return status === 'pending';
  };

  const isConfirmed = (date) => {
    const { status } = getDayStatus(date);
    return status === 'booked' || status === 'confirmed';
  };

  const isInSelectedRange = (date) => {
    if (!selectedCheckIn) return false;
    const end = selectedCheckOut || hoverDate;
    if (!end) return false;
    return isAfter(date, selectedCheckIn) && isBefore(date, end);
  };

  const handleDayClick = (date) => {
    if (!selectable) return;
    if (isBooked(date)) return;
    if (isBefore(date, new Date()) && !isToday(date)) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
      onDateSelect?.({ checkIn: date, checkOut: null });
    } else if (isBefore(date, selectedCheckIn)) {
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
      onDateSelect?.({ checkIn: date, checkOut: null });
    } else {
      // Check if any booked date is between check-in and this date
      const hasBookedBetween = daysInMonth.some(
        (d) => isAfter(d, selectedCheckIn) && isBefore(d, date) && isBooked(d)
      );
      if (hasBookedBetween) {
        setSelectedCheckIn(date);
        setSelectedCheckOut(null);
        onDateSelect?.({ checkIn: date, checkOut: null });
      } else {
        setSelectedCheckOut(date);
        onDateSelect?.({ checkIn: selectedCheckIn, checkOut: date });
      }
    }
  };

  const goNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-2xl border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: th })}
        </h3>
        <button
          onClick={goNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((name, i) => (
          <div
            key={i}
            className={`text-center text-sm font-medium py-2 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {allCells.map((date, idx) => {
          if (!date) {
            return <div key={`blank-${idx}`} className="h-14" />;
          }

          const dateKey = getDateKey(date);
          const { status, price } = getDayStatus(date);
          const booked = isBooked(date);
          const pending = isPending(date);
          const confirmed = isConfirmed(date);
          const isPast = isBefore(date, new Date()) && !isToday(date);
          const isCheckIn = selectedCheckIn && isSameDay(date, selectedCheckIn);
          const isCheckOut = selectedCheckOut && isSameDay(date, selectedCheckOut);
          const inRange = isInSelectedRange(date);
          const today = isToday(date);

          let dayClass = 'h-14 flex flex-col items-center justify-center rounded-lg text-sm transition-all relative ';

          if (confirmed) {
            dayClass += 'bg-red-50 text-red-400 cursor-not-allowed';
          } else if (pending) {
            dayClass += 'bg-yellow-50 text-yellow-600 cursor-not-allowed';
          } else if (isPast) {
            dayClass += 'text-gray-300 cursor-not-allowed';
          } else if (isCheckIn || isCheckOut) {
            dayClass += 'bg-primary-500 text-white font-bold cursor-pointer shadow-md';
          } else if (inRange) {
            dayClass += 'bg-primary-100 text-primary-700 cursor-pointer';
          } else if (today) {
            dayClass += 'ring-2 ring-primary-400 cursor-pointer hover:bg-primary-50';
          } else {
            dayClass += 'hover:bg-gray-50 cursor-pointer';
          }

          return (
            <div
              key={dateKey}
              className={dayClass}
              onClick={() => !isPast && handleDayClick(date)}
              onMouseEnter={() => selectable && !booked && !isPast && setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
            >
              <span>{format(date, 'd')}</span>
              {price && !isPast && !booked && (
                <span className={`text-[10px] text-gray-400`}>
                  {price > 999 ? `${(price / 1000).toFixed(0)}k` : price}
                </span>
              )}
              {confirmed && (
                <span className="text-[10px] text-red-300">จองแล้ว</span>
              )}
              {pending && !confirmed && (
                <span className="text-[10px] text-yellow-500">รอชำระ</span>
              )}
              {booked && (
                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${pending ? 'bg-yellow-400' : 'bg-red-400'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded border border-green-300" />
          <span>ว่าง</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded border border-yellow-300" />
          <span>รอชำระเงิน</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded border border-red-300" />
          <span>จองแล้ว</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-500 rounded" />
          <span>วันที่เลือก</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-100 rounded border border-primary-300" />
          <span>ช่วงที่เลือก</span>
        </div>
      </div>

      {/* Selected dates summary */}
      {selectedCheckIn && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">เช็คอิน:</span>
            <span className="font-medium">
              {format(selectedCheckIn, 'dd MMMM yyyy', { locale: th })}
            </span>
          </div>
          {selectedCheckOut && (
            <>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">เช็คเอาท์:</span>
                <span className="font-medium">
                  {format(selectedCheckOut, 'dd MMMM yyyy', { locale: th })}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">จำนวนคืน:</span>
                <span className="font-bold text-primary-600">
                  {Math.ceil((selectedCheckOut - selectedCheckIn) / (1000 * 60 * 60 * 24))} คืน
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
