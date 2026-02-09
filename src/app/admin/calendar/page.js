'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiLock, FiUnlock, FiRefreshCw, FiDollarSign, FiEdit2 } from 'react-icons/fi';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isBefore,
  isToday,
  isAfter,
} from 'date-fns';
import { th } from 'date-fns/locale';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export default function AdminCalendarPage() {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [blockMode, setBlockMode] = useState('booked'); // 'booked', 'available', or 'price'
  const [priceInput, setPriceInput] = useState('');
  const [editingDate, setEditingDate] = useState(null); // for single-date price edit modal

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const res = await fetch('/api/houses');
      if (res.ok) {
        const data = await res.json();
        setHouses(data);
        if (data.length > 0) {
          selectHouse(data[0]);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectHouse = async (house) => {
    setSelectedHouse(house);
    setSelectedDates([]);
    if (house.code) {
      setLoadingCalendar(true);
      try {
        const res = await fetch(`/api/calendar?code=${house.code}`);
        if (res.ok) {
          const data = await res.json();
          setBookingData(data);
        }
      } catch (err) {
        console.error('Calendar error:', err);
      } finally {
        setLoadingCalendar(false);
      }
    } else {
      setBookingData({});
    }
  };

  const refreshCalendar = () => {
    if (selectedHouse) {
      selectHouse(selectedHouse);
    }
  };

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const blanks = Array(startDayOfWeek).fill(null);
  const allCells = [...blanks, ...daysInMonth];

  const getDateKey = (date) => format(date, 'yyyy-MM-dd');

  const getDayStatus = (date) => {
    const key = getDateKey(date);
    const data = bookingData[key];
    if (!data) return 'available';
    return data.status || 'available';
  };

  const isBooked = (date) => {
    const s = getDayStatus(date);
    return s === 'booked' || s === 'confirmed' || s === 'closed' || s === 'pending';
  };

  const isPendingDate = (date) => {
    return getDayStatus(date) === 'pending';
  };

  const isSelected = (date) => {
    return selectedDates.some((d) => isSameDay(d, date));
  };

  const toggleDate = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;

    setSelectedDates((prev) => {
      const exists = prev.find((d) => isSameDay(d, date));
      if (exists) {
        return prev.filter((d) => !isSameDay(d, date));
      }
      return [...prev, date];
    });
  };

  // Select range: click first & last date
  const selectRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const endDate = new Date(end);
    while (isBefore(current, endDate) || isSameDay(current, endDate)) {
      if (!isBefore(current, new Date()) || isToday(current)) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    setSelectedDates(dates);
  };

  const selectAllAvailable = () => {
    const available = daysInMonth.filter(
      (d) => !isBooked(d) && (!isBefore(d, new Date()) || isToday(d))
    );
    setSelectedDates(available);
  };

  const selectAllBooked = () => {
    const booked = daysInMonth.filter(
      (d) => isBooked(d) && (!isBefore(d, new Date()) || isToday(d))
    );
    setSelectedDates(booked);
  };

  const clearSelection = () => setSelectedDates([]);

  const handleBlockDates = async () => {
    if (!selectedHouse?.code) {
      toast.error('บ้านพักนี้ไม่มีรหัสสำหรับซิงค์กับ Calendar');
      return;
    }
    if (selectedDates.length === 0) {
      toast.error('กรุณาเลือกวันที่');
      return;
    }

    setSaving(true);
    try {
      const dateStrings = selectedDates.map((d) => format(d, 'yyyy-MM-dd'));

      // ถ้าโหมดตั้งราคา → ส่งราคาไปด้วย แต่ไม่เปลี่ยนสถานะ
      if (blockMode === 'price') {
        const priceNum = parseFloat(priceInput);
        if (!priceNum || priceNum <= 0) {
          toast.error('กรุณาระบุราคา');
          setSaving(false);
          return;
        }
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: selectedHouse.code,
            dates: dateStrings,
            status: 'price-only', // special mode: update price only
            price: priceNum,
          }),
        });
        const result = await res.json();
        if (res.ok) {
          toast.success(`ตั้งราคา ฿${priceNum.toLocaleString()} สำหรับ ${selectedDates.length} วัน`);
          setBookingData(result.prices || {});
          setSelectedDates([]);
          setPriceInput('');
        } else {
          toast.error(result.error || 'เกิดข้อผิดพลาด');
        }
      } else {
        // โหมดบล็อค / ปลดบล็อค
        const payload = {
          code: selectedHouse.code,
          dates: dateStrings,
          status: blockMode,
        };
        // ถ้ามีราคาที่ใส่ → ส่งไปด้วยตอนบล็อค
        if (blockMode === 'booked' && priceInput) {
          const priceNum = parseFloat(priceInput);
          if (priceNum > 0) payload.price = priceNum;
        }

        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (res.ok) {
          toast.success(
            blockMode === 'booked'
              ? `บล็อค ${selectedDates.length} วันสำเร็จ`
              : `ปลดบล็อค ${selectedDates.length} วันสำเร็จ`
          );
          setBookingData(result.prices || {});
          setSelectedDates([]);
        } else {
          toast.error(result.error || 'เกิดข้อผิดพลาด');
        }
      }
    } catch (err) {
      console.error('Block dates error:', err);
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ตั้งราคาวันเดียว (double click)
  const handleSingleDatePrice = async (newPrice) => {
    if (!editingDate || !selectedHouse?.code) return;
    setSaving(true);
    try {
      const priceNum = parseFloat(newPrice);
      if (!priceNum || priceNum <= 0) {
        toast.error('กรุณาระบุราคาที่ถูกต้อง');
        setSaving(false);
        return;
      }
      const dateStr = format(editingDate, 'yyyy-MM-dd');
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: selectedHouse.code,
          dates: [dateStr],
          status: 'price-only',
          price: priceNum,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`ตั้งราคา ฿${priceNum.toLocaleString()} สำหรับ ${format(editingDate, 'd MMM', { locale: th })}`);
        setBookingData(result.prices || {});
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
      setEditingDate(null);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">ปฏิทินจอง</h1>
        <p className="text-gray-500 mt-1">
          จัดการปฏิทิน บล็อค/ปลดบล็อควันที่ ซิงค์อัตโนมัติกับระบบ Calendar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* House list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold mb-3">เลือกบ้านพัก</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {houses.map((house) => (
                <button
                  key={house.id}
                  onClick={() => selectHouse(house)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedHouse?.id === house.id
                      ? 'bg-primary-50 border-primary-300 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-sm">{house.name}</p>
                  <p className="text-xs text-gray-500">
                    {house.code ? `รหัส: ${house.code}` : 'ไม่มีรหัส'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Block controls */}
          {selectedHouse?.code && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold mb-3">จัดการวันที่</h3>

              <div className="space-y-3">
                {/* Mode selector */}
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setBlockMode('booked')}
                    className={`p-2 text-xs rounded-lg font-medium flex items-center justify-center gap-1 ${
                      blockMode === 'booked'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiLock size={12} />
                    บล็อค
                  </button>
                  <button
                    onClick={() => setBlockMode('available')}
                    className={`p-2 text-xs rounded-lg font-medium flex items-center justify-center gap-1 ${
                      blockMode === 'available'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiUnlock size={12} />
                    ปลด
                  </button>
                  <button
                    onClick={() => setBlockMode('price')}
                    className={`p-2 text-xs rounded-lg font-medium flex items-center justify-center gap-1 ${
                      blockMode === 'price'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiDollarSign size={12} />
                    ราคา
                  </button>
                </div>

                {/* Price input (show for booked and price modes) */}
                {(blockMode === 'booked' || blockMode === 'price') && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {blockMode === 'price' ? 'ราคาต่อคืน (บาท) *' : 'ราคาต่อคืน (ถ้ามี)'}
                    </label>
                    <input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      placeholder="เช่น 5000"
                      className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    />
                  </div>
                )}

                {/* Quick select buttons */}
                <div className="space-y-2">
                  <button
                    onClick={blockMode === 'booked' ? selectAllAvailable : selectAllBooked}
                    className="w-full p-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {blockMode === 'booked' ? 'เลือกวันว่างทั้งหมด' : 'เลือกวันบล็อคทั้งหมด'}
                  </button>
                  <button
                    onClick={clearSelection}
                    className="w-full p-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    ยกเลิกการเลือก ({selectedDates.length})
                  </button>
                </div>

                {/* Apply button */}
                <button
                  onClick={handleBlockDates}
                  disabled={saving || selectedDates.length === 0}
                  className={`w-full p-3 rounded-lg font-medium text-white text-sm flex items-center justify-center gap-2 ${
                    blockMode === 'booked'
                      ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                      : blockMode === 'price'
                      ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'
                      : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                  }`}
                >
                  {saving ? (
                    <div className="spinner w-4 h-4" />
                  ) : (
                    <>
                      {blockMode === 'booked' ? <FiLock size={16} /> : blockMode === 'price' ? <FiDollarSign size={16} /> : <FiUnlock size={16} />}
                      {blockMode === 'booked'
                        ? `บล็อค ${selectedDates.length} วัน`
                        : blockMode === 'price'
                        ? `ตั้งราคา ${selectedDates.length} วัน`
                        : `ปลดบล็อค ${selectedDates.length} วัน`}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3">
          {selectedHouse ? (
            <div>
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{selectedHouse.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedHouse.code
                      ? `รหัสซิงค์: ${selectedHouse.code}`
                      : 'ไม่มีรหัสสำหรับซิงค์ กรุณาใส่รหัสในหน้าแก้ไขบ้านพัก'}
                  </p>
                </div>
                <button
                  onClick={refreshCalendar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="รีเฟรช"
                >
                  <FiRefreshCw size={20} />
                </button>
              </div>

              {loadingCalendar ? (
                <LoadingSpinner className="py-20" />
              ) : (
                <div className="bg-white rounded-2xl border p-6">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <h3 className="text-lg font-semibold">
                      {format(currentMonth, 'MMMM yyyy', { locale: th })}
                    </h3>
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
                        return <div key={`blank-${idx}`} className="h-20" />;
                      }

                      const dateKey = getDateKey(date);
                      const status = getDayStatus(date);
                      const dayData = bookingData[dateKey];
                      const dayPrice = dayData?.price;
                      const booked = isBooked(date);
                      const isPast = isBefore(date, new Date()) && !isToday(date);
                      const selected = isSelected(date);
                      const today = isToday(date);

                      let dayClass =
                        'h-20 flex flex-col items-center justify-center rounded-lg text-sm transition-all relative cursor-pointer ';

                      if (isPast) {
                        dayClass += 'text-gray-300 cursor-not-allowed bg-gray-50';
                      } else if (selected) {
                        dayClass +=
                          blockMode === 'booked'
                            ? 'bg-red-500 text-white font-bold ring-2 ring-red-300'
                            : blockMode === 'price'
                            ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-300'
                            : 'bg-green-500 text-white font-bold ring-2 ring-green-300';
                      } else if (isPendingDate(date)) {
                        dayClass += 'bg-yellow-50 text-yellow-600 font-medium';
                      } else if (booked) {
                        dayClass += 'bg-red-50 text-red-500 font-medium';
                      } else if (today) {
                        dayClass += 'ring-2 ring-primary-400 hover:bg-primary-50';
                      } else {
                        dayClass += 'hover:bg-gray-100';
                      }

                      return (
                        <div
                          key={dateKey}
                          className={dayClass}
                          onClick={() => !isPast && toggleDate(date)}
                          onDoubleClick={() => {
                            if (!isPast) {
                              setEditingDate(date);
                              setPriceInput(dayPrice ? String(dayPrice) : '');
                            }
                          }}
                          title={dayPrice ? `฿${dayPrice.toLocaleString()}/คืน` : 'ไม่มีราคา - ดับเบิ้ลคลิกเพื่อตั้งราคา'}
                        >
                          <span className="font-medium">{format(date, 'd')}</span>
                          {/* แสดงราคา */}
                          {dayPrice && dayPrice > 0 && !selected && (
                            <span className={`text-[9px] font-medium ${
                              booked ? 'text-red-400' : isPendingDate(date) ? 'text-yellow-600' : 'text-blue-500'
                            }`}>
                              ฿{dayPrice >= 1000 ? `${(dayPrice / 1000).toFixed(dayPrice % 1000 === 0 ? 0 : 1)}k` : dayPrice}
                            </span>
                          )}
                          {/* แสดงสถานะ */}
                          {isPendingDate(date) && !selected && (
                            <span className="text-[9px] text-yellow-500">รอชำระ</span>
                          )}
                          {booked && !isPendingDate(date) && !selected && (
                            <span className="text-[9px] text-red-400">บล็อค</span>
                          )}
                          {!booked && !isPast && !selected && !isPendingDate(date) && (
                            <span className="text-[9px] text-green-400">ว่าง</span>
                          )}
                          {selected && (
                            <span className="text-[9px]">
                              {blockMode === 'booked' ? '🔒' : blockMode === 'price' ? '💰' : '🔓'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white rounded border border-gray-300" />
                      <span>ว่าง</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-50 rounded border border-yellow-300" />
                      <span>รอชำระเงิน</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-50 rounded border border-red-300" />
                      <span>บล็อค/จองแล้ว</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 text-xs font-bold">฿5k</span>
                      <span>ราคา/คืน</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">💡</span>
                      <span>ดับเบิ้ลคลิก = ตั้งราคาวันเดียว</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p>กรุณาเลือกบ้านพักจากรายการด้านซ้าย</p>
            </div>
          )}
        </div>
      </div>

      {/* Price Edit Modal (single date) */}
      {editingDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingDate(null)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">ตั้งราคา</h3>
            <p className="text-sm text-gray-500 mb-4">
              {format(editingDate, 'd MMMM yyyy', { locale: th })}
              {bookingData[getDateKey(editingDate)]?.status && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  bookingData[getDateKey(editingDate)]?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  bookingData[getDateKey(editingDate)]?.status === 'booked' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {bookingData[getDateKey(editingDate)]?.status}
                </span>
              )}
            </p>
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">ราคาต่อคืน (บาท)</label>
              <input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="เช่น 5000"
                className="w-full p-3 border rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-300"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSingleDatePrice(priceInput);
                  if (e.key === 'Escape') setEditingDate(null);
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingDate(null)}
                className="flex-1 p-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleSingleDatePrice(priceInput)}
                disabled={saving}
                className="flex-1 p-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-blue-300"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
