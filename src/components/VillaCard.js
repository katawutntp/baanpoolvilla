'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiUsers, FiHome } from 'react-icons/fi';
import { BiBath } from 'react-icons/bi';
import { formatPriceCurrency } from '@/lib/utils';

export default function VillaCard({ villa }) {
  const mainImage = villa.images?.[0]?.url || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80';

  const zoneLabels = {
    pattaya: 'พัทยา-ชลบุรี',
    huahin: 'หัวหิน',
    khaoyai: 'เขาใหญ่',
    rayong: 'ระยอง',
    bangkok: 'กรุงเทพฯ',
  };

  return (
    <Link href={`/villas/${villa.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden card-shadow">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={mainImage}
            alt={villa.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="image-overlay" />

          {/* Badge */}
          {villa.isFeatured && (
            <div className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              แนะนำ
            </div>
          )}

          {/* Zone badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
            พูลวิลล่า {villa.zone === 'pattaya' ? 'พัทยา' : villa.zone === 'huahin' ? 'หัวหิน' : villa.zone === 'khaoyai' ? 'เขาใหญ่' : ''}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 right-3 bg-primary-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg">
            {formatPriceCurrency(villa.pricePerNight)} <span className="text-sm font-normal">/คืน</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Location */}
          <div className="flex items-center gap-1 text-primary-500 text-sm mb-2">
            <FiMapPin size={14} />
            <span>{zoneLabels[villa.zone] || villa.zone || 'ไม่ระบุ'}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-dark-100 group-hover:text-primary-500 transition-colors line-clamp-2 mb-3">
            {villa.name}
          </h3>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <FiHome size={14} />
              <span>{villa.bedrooms || 0} ห้องนอน</span>
            </div>
            <div className="flex items-center gap-1">
              <BiBath size={14} />
              <span>{villa.bathrooms || 0} ห้องน้ำ</span>
            </div>
            <div className="flex items-center gap-1">
              <FiUsers size={14} />
              <span>สูงสุด {villa.maxGuests || 0} คน</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-end pt-3 border-t">
            <div className="text-right">
              <p className="text-xs text-gray-400">เริ่มต้น</p>
              <p className="text-primary-600 font-bold">{formatPriceCurrency(villa.pricePerNight)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
