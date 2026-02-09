'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';
import { ZONES, AMENITIES_LIST } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function NewHousePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    zone: 'pattaya',
    address: '',
    shortDescription: '',
    description: '',
    nearbyPlaces: '',
    rules: '',
    note: '',
    detailRoom: '',
    bedrooms: 4,
    bathrooms: 5,
    maxGuests: 10,
    pricePerNight: 9000,
    farFromSea: '',
    parking: 3,
    pets: false,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    isActive: true,
    isFeatured: false,
    amenities: ['pool', 'wifi', 'parking', 'aircon'],
    images: [],
    latitude: null,
    longitude: null,
    sortOrder: 99999,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      toast.error('กรุณากรอกชื่อบ้านพัก');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('เพิ่มบ้านพักสำเร็จ');
        router.push('/admin/houses');
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Create house error:', errData);
        toast.error(errData.details || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Create house fetch error:', err);
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (value) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((a) => a !== value)
        : [...prev.amenities, value],
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/houses"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark-100">เพิ่มบ้านพักใหม่</h1>
          <p className="text-gray-500 mt-1">กรอกข้อมูลบ้านพักเพื่อแสดงบนเว็บไซต์</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">ข้อมูลพื้นฐาน</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบ้านพัก *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น Pool Villa Pattaya 4 ห้องนอน"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสบ้าน (ซิงค์ปฏิทิน)
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="เช่น PT124"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">ใช้รหัสเดียวกับระบบปฏิทิน Calendar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">โซน / ทำเล</label>
                  <select
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    className="input-field"
                  >
                    {ZONES.map((z) => (
                      <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="เช่น จอมเทียน พัทยา ชลบุรี"
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายสั้น</label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="คำอธิบายสั้นๆ 1-2 ประโยค"
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="รายละเอียดเต็มของบ้านพัก..."
                    rows={6}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">รายละเอียดห้อง & ราคา</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ห้องนอน</label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })}
                    className="input-field" min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ห้องน้ำ</label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: parseInt(e.target.value) || 0 })}
                    className="input-field" min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คนสูงสุด</label>
                  <input
                    type="number"
                    value={form.maxGuests}
                    onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) || 0 })}
                    className="input-field" min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคา/คืน (฿)</label>
                  <input
                    type="number"
                    value={form.pricePerNight}
                    onChange={(e) => setForm({ ...form, pricePerNight: parseInt(e.target.value) || 0 })}
                    className="input-field" min="0" step="100"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">รูปภาพ</h2>
              <ImageUploader
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
                houseId="temp"
              />
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">สิ่งอำนวยความสะดวก</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES_LIST.map((amenity) => (
                  <label
                    key={amenity.value}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                      form.amenities.includes(amenity.value)
                        ? 'bg-primary-50 border-primary-300'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(amenity.value)}
                      onChange={() => toggleAmenity(amenity.value)}
                      className="sr-only"
                    />
                    <span className="text-xl">{amenity.icon}</span>
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* กฎของที่พัก */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">กฎของที่พัก</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเช็คอิน</label>
                  <input
                    type="time"
                    value={form.checkInTime}
                    onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเช็คเอาท์</label>
                  <input
                    type="time"
                    value={form.checkOutTime}
                    onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ที่จอดรถ (คัน)</label>
                  <input
                    type="number"
                    value={form.parking}
                    onChange={(e) => setForm({ ...form, parking: parseInt(e.target.value) || 0 })}
                    className="input-field" min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ระยะห่างจากทะเล</label>
                  <input
                    type="text"
                    value={form.farFromSea}
                    onChange={(e) => setForm({ ...form, farFromSea: e.target.value })}
                    placeholder="เช่น 500 เมตร"
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pets}
                      onChange={(e) => setForm({ ...form, pets: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">รับสัตว์เลี้ยง</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กฎเพิ่มเติม</label>
                <textarea
                  value={form.rules}
                  onChange={(e) => setForm({ ...form, rules: e.target.value })}
                  placeholder="เช่น ห้ามจัดปาร์ตี้, ห้ามก่อเสียงรบกวนหลัง 22:00..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="หมายเหตุเพิ่มเติม..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* สถานที่ใกล้เคียง */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">สถานที่ใกล้เคียง</h2>
              <textarea
                value={form.nearbyPlaces}
                onChange={(e) => setForm({ ...form, nearbyPlaces: e.target.value })}
                placeholder="เช่น&#10;- ตลาดจอมเทียน 500 เมตร&#10;- เซ็นทรัลพัทยา 5 กม.&#10;- หาดจอมเทียน 200 เมตร"
                rows={6}
                className="input-field resize-none"
              />
            </div>

            {/* รายละเอียดห้อง */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">รายละเอียดห้อง</h2>
              <textarea
                value={form.detailRoom}
                onChange={(e) => setForm({ ...form, detailRoom: e.target.value })}
                placeholder="เช่น&#10;ห้องนอน 1: เตียงคิงไซส์, แอร์, ทีวี&#10;ห้องนอน 2: เตียงเดี่ยว 2 เตียง, แอร์..."
                rows={6}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Publish settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">การเผยแพร่</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">เปิดแสดงผลบนเว็บ</span>
                  <div
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      form.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form.isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">แนะนำ (Featured)</span>
                  <div
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      form.isFeatured ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form.isFeatured ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลำดับ</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="input-field" min="0"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              {saving ? (
                <div className="spinner w-5 h-5" />
              ) : (
                <>
                  <FiSave size={20} />
                  เพิ่มบ้านพัก
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
