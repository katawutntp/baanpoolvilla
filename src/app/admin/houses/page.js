'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiEyeOff, FiStar } from 'react-icons/fi';
import { formatPriceCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminHousesPage() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const res = await fetch('/api/houses');
      if (res.ok) {
        const data = await res.json();
        setHouses(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`ต้องการลบ "${name}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/houses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบบ้านพักสำเร็จ');
        fetchHouses();
      } else {
        toast.error('เกิดข้อผิดพลาด');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const toggleActive = async (id, currentState) => {
    try {
      const res = await fetch(`/api/houses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (res.ok) {
        toast.success(currentState ? 'ปิดการแสดงผลแล้ว' : 'เปิดการแสดงผลแล้ว');
        fetchHouses();
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const toggleFeatured = async (id, currentState) => {
    try {
      const res = await fetch(`/api/houses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentState }),
      });
      if (res.ok) {
        toast.success(currentState ? 'ยกเลิกแนะนำแล้ว' : 'ตั้งเป็นแนะนำแล้ว');
        fetchHouses();
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">จัดการบ้านพัก</h1>
          <p className="text-gray-500 mt-1">รายการบ้านพักทั้งหมด {houses.length} หลัง</p>
        </div>
        <Link href="/admin/houses/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={18} />
          เพิ่มบ้านพักใหม่
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : houses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-5xl mb-4">🏠</p>
          <h3 className="text-lg font-bold text-gray-700 mb-2">ยังไม่มีบ้านพัก</h3>
          <p className="text-gray-500 mb-6">กดปุ่มด้านบนเพื่อเพิ่มบ้านพักหลังแรก</p>
          <Link href="/admin/houses/new" className="btn-primary inline-flex items-center gap-2">
            <FiPlus size={18} />
            เพิ่มบ้านพัก
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">รูป</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">ชื่อบ้านพัก</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">รหัส</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">โซน</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">ราคา/คืน</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">ห้องนอน</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">สถานะ</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {houses.map((house) => (
                  <tr key={house.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {house.images?.[0]?.url ? (
                          <img
                            src={house.images[0].url}
                            alt={house.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            ไม่มีรูป
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-dark-100">{house.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">สูงสุด {house.maxGuests || 0} คน</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{house.code || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{house.zone || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-primary-600">
                        {formatPriceCurrency(house.pricePerNight)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {house.bedrooms || 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(house.id, house.isActive !== false)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            house.isActive !== false
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={house.isActive !== false ? 'กดเพื่อซ่อน' : 'กดเพื่อแสดง'}
                        >
                          {house.isActive !== false ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => toggleFeatured(house.id, house.isFeatured)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            house.isFeatured
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={house.isFeatured ? 'ยกเลิกแนะนำ' : 'ตั้งเป็นแนะนำ'}
                        >
                          <FiStar size={16} className={house.isFeatured ? 'fill-yellow-400' : ''} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/houses/${house.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(house.id, house.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
