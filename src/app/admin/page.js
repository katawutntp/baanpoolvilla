'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiCalendar, FiTrendingUp, FiActivity } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, featured: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/houses');
      if (res.ok) {
        const houses = await res.json();
        setStats({
          total: houses.length,
          active: houses.filter((h) => h.isActive !== false).length,
          featured: houses.filter((h) => h.isFeatured).length,
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'บ้านพักทั้งหมด', value: stats.total, icon: <FiHome size={24} />, color: 'bg-blue-500' },
    { label: 'เปิดใช้งาน', value: stats.active, icon: <FiActivity size={24} />, color: 'bg-green-500' },
    { label: 'แนะนำ', value: stats.featured, icon: <FiTrendingUp size={24} />, color: 'bg-primary-500' },
    { label: 'การจองเดือนนี้', value: '-', icon: <FiCalendar size={24} />, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">แดชบอร์ด</h1>
        <p className="text-gray-500 mt-1">ภาพรวมระบบจัดการบ้านพัก</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-100">
              {loading ? '...' : card.value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">การดำเนินการด่วน</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/admin/houses/new"
            className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
          >
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white">
              <FiHome size={20} />
            </div>
            <div>
              <p className="font-medium">เพิ่มบ้านพักใหม่</p>
              <p className="text-sm text-gray-500">ลงข้อมูลบ้านพักใหม่</p>
            </div>
          </a>

          <a
            href="/admin/houses"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <FiCalendar size={20} />
            </div>
            <div>
              <p className="font-medium">จัดการบ้านพัก</p>
              <p className="text-sm text-gray-500">แก้ไข / ลบ บ้านพัก</p>
            </div>
          </a>

          <a
            href="/"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="font-medium">ดูเว็บไซต์</p>
              <p className="text-sm text-gray-500">ตรวจสอบหน้าเว็บ</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
