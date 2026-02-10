'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';

export default function HeroSection() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (zone) params.set('zone', zone);
    if (guests) params.set('guests', guests);
    router.push(`/villas?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            ค้นหา<span className="text-primary-400">พูลวิลล่า</span>
            <br />สำหรับวันพักผ่อนของคุณ
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            บ้านพักพูลวิลล่าส่วนตัว พร้อมสระว่ายน้ำ ราคาพิเศษ พัทยา หัวหิน เขาใหญ่ และทั่วประเทศ
          </p>

          {/* Search box */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" size={20} />
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 appearance-none cursor-pointer"
                >
                  <option value="">ทำเลทั้งหมด</option>
                  <option value="pattaya">พัทยา-ชลบุรี</option>
                  <option value="huahin">หัวหิน-ประจวบฯ</option>
                  <option value="khaoyai">เขาใหญ่-นครราชสีมา</option>
                  <option value="rayong">ระยอง</option>
                  <option value="bangkok">กรุงเทพฯ-ปริมณฑล</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" size={20} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อวิลล่า..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* Guests */}
              <div className="relative">
                <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" size={20} />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 appearance-none cursor-pointer"
                >
                  <option value="">จำนวนผู้เข้าพัก</option>
                  <option value="5">1-5 คน</option>
                  <option value="10">6-10 คน</option>
                  <option value="20">11-20 คน</option>
                  <option value="30">21-30 คน</option>
                  <option value="50">30+ คน</option>
                </select>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 text-lg"
              >
                <FiSearch size={20} />
                ค้นหา
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
            <div>
              <p className="text-3xl font-bold text-primary-400">50+</p>
              <p className="text-gray-300 text-sm">พูลวิลล่า</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-400">1,000+</p>
              <p className="text-gray-300 text-sm">ลูกค้าพึงพอใจ</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-400">4.8</p>
              <p className="text-gray-300 text-sm">คะแนนเฉลี่ย</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-400">24/7</p>
              <p className="text-gray-300 text-sm">บริการลูกค้า</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="white"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
}
