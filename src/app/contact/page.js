'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import { FaLine, FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับโดยเร็ว');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-16">
          <div className="container-custom text-center text-white">
            <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
            <p className="text-white/80 text-lg">พร้อมให้บริการ ทุกวัน 9:00 - 21:00 น.</p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact cards */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <FiPhone className="text-primary-500 mb-3" size={28} />
                <h3 className="font-bold mb-1">โทรศัพท์</h3>
                <a href="tel:+66123456789" className="text-primary-500 font-medium">062-xxx-xxxx</a>
                <p className="text-sm text-gray-500 mt-1">จันทร์ - อาทิตย์ 9:00 - 21:00</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <FiMail className="text-primary-500 mb-3" size={28} />
                <h3 className="font-bold mb-1">อีเมล</h3>
                <a href="mailto:info@baanpoolvilla.com" className="text-primary-500 font-medium">
                  info@baanpoolvilla.com
                </a>
                <p className="text-sm text-gray-500 mt-1">ตอบกลับภายใน 24 ชั่วโมง</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-[#06C755] rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                    <FaLine size={24} />
                  </a>
                  <a href="#" className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                    <FaFacebook size={24} />
                  </a>
                </div>
                <p className="text-sm text-gray-500 mt-3">ติดตามเราบนโซเชียลมีเดีย</p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6">ส่งข้อความถึงเรา</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ข้อความ *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      className="input-field resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <FiSend size={16} />
                    ส่งข้อความ
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
