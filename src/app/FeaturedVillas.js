'use client';

import { useState, useEffect } from 'react';
import VillaCard from '@/components/VillaCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FeaturedVillas() {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVillas();
  }, []);

  const fetchFeaturedVillas = async () => {
    try {
      const res = await fetch('/api/houses?featured=true');
      if (res.ok) {
        let data = await res.json();
        // If no featured villas, get all
        if (data.length === 0) {
          const res2 = await fetch('/api/houses');
          if (res2.ok) data = await res2.json();
        }
        setVillas(data.slice(0, 8));
      }
    } catch (err) {
      console.error('Error fetching featured:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <LoadingSpinner className="py-20" />
        </div>
      </section>
    );
  }

  if (villas.length === 0) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">พูลวิลล่าแนะนำ</h2>
            <p className="section-subtitle">ที่พักยอดนิยมที่คัดสรรมาเพื่อคุณ</p>
          </div>
          <div className="text-center py-16 text-gray-400">
            <p className="text-6xl mb-4">🏠</p>
            <p className="text-lg">ยังไม่มีข้อมูลพูลวิลล่า</p>
            <p className="text-sm mt-2">กรุณาเพิ่มข้อมูลบ้านในระบบหลังบ้าน</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-title">พูลวิลล่าแนะนำ</h2>
            <p className="section-subtitle">ที่พักยอดนิยมที่คัดสรรมาเพื่อคุณ</p>
          </div>
          <a
            href="/villas"
            className="hidden md:inline-block btn-outline !py-2 !px-5 text-sm"
          >
            ดูทั้งหมด →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <a href="/villas" className="btn-outline">
            ดูทั้งหมด →
          </a>
        </div>
      </div>
    </section>
  );
}
