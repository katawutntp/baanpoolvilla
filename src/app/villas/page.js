'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VillaCard from '@/components/VillaCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiSearch, FiFilter, FiMapPin, FiUsers, FiX, FiGrid, FiList } from 'react-icons/fi';
import { ZONES } from '@/lib/utils';

export default function VillasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner w-10 h-10" /></div>}>
      <VillasContent />
    </Suspense>
  );
}

function VillasContent() {
  const searchParams = useSearchParams();
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState(searchParams.get('zone') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVillas();
  }, [zone, search, guests]);

  const fetchVillas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (zone) params.set('zone', zone);
      if (search) params.set('search', search);
      if (guests) params.set('guests', guests);

      const res = await fetch(`/api/houses?${params.toString()}`);
      if (res.ok) {
        let data = await res.json();
        // Sort
        if (sortBy === 'price-low') data.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
        if (sortBy === 'price-high') data.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
        setVillas(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setZone('');
    setSearch('');
    setGuests('');
  };

  const hasFilters = zone || search || guests;

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-12">
          <div className="container-custom text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">รวมพูลวิลล่าทั้งหมด</h1>
            <p className="text-white/80">ค้นหาพูลวิลล่าที่ตอบโจทย์คุณ</p>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Filters bar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรือคำอธิบาย..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10 !py-2.5 text-sm"
                />
              </div>

              {/* Zone */}
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="input-field pl-10 !py-2.5 text-sm appearance-none cursor-pointer"
                >
                  <option value="">ทำเลทั้งหมด</option>
                  {ZONES.map((z) => (
                    <option key={z.value} value={z.value}>{z.label}</option>
                  ))}
                </select>
              </div>

              {/* Guests */}
              <div className="relative">
                <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="input-field pl-10 !py-2.5 text-sm appearance-none cursor-pointer"
                >
                  <option value="">จำนวนคน</option>
                  <option value="5">1-5 คน</option>
                  <option value="10">6-10 คน</option>
                  <option value="20">11-20 คน</option>
                  <option value="30">21-30 คน</option>
                  <option value="50">30+ คน</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); fetchVillas(); }}
                className="input-field !py-2.5 text-sm appearance-none cursor-pointer"
              >
                <option value="recommended">แนะนำ</option>
                <option value="price-low">ราคาต่ำ → สูง</option>
                <option value="price-high">ราคาสูง → ต่ำ</option>
              </select>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">ตัวกรอง:</span>
                {zone && (
                  <button
                    onClick={() => setZone('')}
                    className="badge bg-primary-50 text-primary-700 flex items-center gap-1"
                  >
                    {ZONES.find((z) => z.value === zone)?.label}
                    <FiX size={14} />
                  </button>
                )}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="badge bg-primary-50 text-primary-700 flex items-center gap-1"
                  >
                    &ldquo;{search}&rdquo;
                    <FiX size={14} />
                  </button>
                )}
                {guests && (
                  <button
                    onClick={() => setGuests('')}
                    className="badge bg-primary-50 text-primary-700 flex items-center gap-1"
                  >
                    {guests}+ คน
                    <FiX size={14} />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-700 ml-2"
                >
                  ล้างทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              พบ <span className="font-bold text-dark-100">{villas.length}</span> พูลวิลล่า
            </p>
          </div>

          {loading ? (
            <LoadingSpinner className="py-20" />
          ) : villas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {villas.map((villa) => (
                <VillaCard key={villa.id} villa={villa} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-gray-700 mb-2">ไม่พบพูลวิลล่า</h3>
              <p className="text-gray-500 mb-6">ลองเปลี่ยนเงื่อนไขการค้นหาใหม่</p>
              <button onClick={clearFilters} className="btn-primary">
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
