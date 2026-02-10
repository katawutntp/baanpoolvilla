'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VillaGallery from '@/components/VillaGallery';
import BookingCalendar from '@/components/BookingCalendar';
import BookingForm from '@/components/BookingForm';
import { PageLoading } from '@/components/LoadingSpinner';
import { FiMapPin, FiUsers, FiHome, FiCheck, FiChevronRight, FiSend } from 'react-icons/fi';
import { BiBath } from 'react-icons/bi';
import { formatPriceCurrency, getAmenityInfo } from '@/lib/utils';
import Link from 'next/link';

export default function VillaDetailPage() {
  const params = useParams();
  const [villa, setVilla] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({ checkIn: null, checkOut: null });

  useEffect(() => {
    if (params.id) {
      fetchVillaData();
    }
  }, [params.id]);

  const fetchVillaData = async () => {
    try {
      // Fetch villa details
      const villaRes = await fetch(`/api/houses/${params.id}`);
      if (villaRes.ok) {
        const villaData = await villaRes.json();
        setVilla(villaData);

        // Fetch calendar data from Calendar project using house code
        if (villaData.code) {
          const calRes = await fetch(`/api/calendar?code=${villaData.code}`);
          if (calRes.ok) {
            const calData = await calRes.json();
            setBookingData(calData);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (dates) => {
    setSelectedDates(dates);
  };

  if (loading) return <PageLoading />;

  if (!villa) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen">
          <div className="container-custom py-20 text-center">
            <p className="text-6xl mb-4">🏠</p>
            <h2 className="text-2xl font-bold mb-2">ไม่พบพูลวิลล่า</h2>
            <p className="text-gray-500 mb-6">ลิงก์อาจไม่ถูกต้อง หรือบ้านพักนี้ถูกลบออกแล้ว</p>
            <Link href="/villas" className="btn-primary">กลับหน้ารายการ</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const zoneLabels = {
    pattaya: 'พัทยา-ชลบุรี',
    huahin: 'หัวหิน-ประจวบฯ',
    khaoyai: 'เขาใหญ่-นครราชสีมา',
    rayong: 'ระยอง',
    bangkok: 'กรุงเทพฯ-ปริมณฑล',
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container-custom py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary-500">หน้าแรก</Link>
              <FiChevronRight size={14} />
              <Link href="/villas" className="hover:text-primary-500">พูลวิลล่า</Link>
              <FiChevronRight size={14} />
              <span className="text-gray-700 font-medium">{villa.name}</span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="container-custom py-6">
          <VillaGallery images={villa.images} />
        </div>

        {/* Content */}
        <div className="container-custom pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title section */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-primary-500 mb-2">
                      <FiMapPin size={14} />
                      <span>{zoneLabels[villa.zone] || villa.zone || 'ไม่ระบุ'}</span>
                      {villa.address && (
                        <span className="text-gray-400">• {villa.address}</span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-100 mb-3">
                      {villa.name}
                    </h1>

                    {/* Features row */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <FiHome size={16} className="text-primary-500" />
                        <span>{villa.bedrooms || 0} ห้องนอน</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BiBath size={16} className="text-primary-500" />
                        <span>{villa.bathrooms || 0} ห้องน้ำ</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiUsers size={16} className="text-primary-500" />
                        <span>สูงสุด {villa.maxGuests || 0} คน</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm text-gray-400">เริ่มต้น</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPriceCurrency(villa.pricePerNight)}
                      <span className="text-sm font-normal text-gray-500">/คืน</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar - ย้ายขึ้นมาอยู่ใต้ Title */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">ปฏิทินจองห้องพัก</h2>
                <p className="text-sm text-gray-500 mb-4">
                  เลือกวันเช็คอินและเช็คเอาท์ สีเหลือง=รอชำระเงิน สีแดง=จองแล้ว
                </p>
                <BookingCalendar
                  houseCode={villa.code}
                  bookingData={bookingData}
                  onDateSelect={handleDateSelect}
                  selectable={true}
                />

                {/* Mobile book button - แสดงเฉพาะบนมือถือ */}
                <div className="mt-4 lg:hidden">
                  <button
                    onClick={() => {
                      const el = document.getElementById('booking-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <FiSend size={20} />
                    {selectedDates.checkIn && selectedDates.checkOut
                      ? `จองเลย ${Math.ceil((selectedDates.checkOut - selectedDates.checkIn) / (1000*60*60*24))} คืน`
                      : 'จองบ้านพักนี้'
                    }
                  </button>
                </div>
              </div>

              {/* Description */}
              {villa.description && (
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">รายละเอียด</h2>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {villa.description}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {villa.amenities?.length > 0 && (
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">สิ่งอำนวยความสะดวก</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {villa.amenities.map((a) => {
                      const info = getAmenityInfo(a);
                      return (
                        <div key={a} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-xl">{info.icon}</span>
                          <span className="text-sm font-medium">{info.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* House rules */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">กฎของที่พัก</h2>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="text-green-500 flex-shrink-0" />
                      เช็คอิน: {villa.checkInTime || '14:00'} น.
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="text-green-500 flex-shrink-0" />
                      เช็คเอาท์: {villa.checkOutTime || '11:00'} น.
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="text-green-500 flex-shrink-0" />
                      ที่จอดรถ: {villa.parking || 0} คัน
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCheck className={`${villa.pets ? 'text-green-500' : 'text-red-500'} flex-shrink-0`} />
                      {villa.pets ? 'รับสัตว์เลี้ยง' : 'ไม่รับสัตว์เลี้ยง'}
                    </div>
                  </div>
                  {villa.rules && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-line text-gray-600 leading-relaxed">{villa.rules}</p>
                    </div>
                  )}
                  {villa.note && (
                    <div className="mt-3 p-4 bg-yellow-50 rounded-lg">
                      <p className="font-medium text-yellow-700 mb-1">หมายเหตุ</p>
                      <p className="whitespace-pre-line text-gray-600 leading-relaxed text-xs">{villa.note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nearby places */}
              {villa.nearbyPlaces && (
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">สถานที่ใกล้เคียง</h2>
                  <p className="whitespace-pre-line text-gray-600 text-sm leading-relaxed">{villa.nearbyPlaces}</p>
                </div>
              )}

              {/* Room details */}
              {villa.detailRoom && (
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">รายละเอียดห้อง</h2>
                  <p className="whitespace-pre-line text-gray-600 text-sm leading-relaxed">{villa.detailRoom}</p>
                </div>
              )}
            </div>

            {/* Right: Booking sidebar */}
            <div id="booking-form" className="lg:col-span-1">
              <BookingForm
                villa={villa}
                bookingData={bookingData}
                checkIn={selectedDates.checkIn}
                checkOut={selectedDates.checkOut}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
