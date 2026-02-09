import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram } from 'react-icons/fi';
import { FaLine } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark-100 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-gray-700">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white">รับข่าวสาร & โปรโมชั่น</h3>
              <p className="text-gray-400 mt-1">สมัครรับข่าวสารเพื่อรับส่วนลดพิเศษ</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                className="input-field bg-dark-200 border-gray-600 text-white placeholder-gray-500 flex-1 md:w-80"
              />
              <button className="btn-primary whitespace-nowrap">สมัครรับข่าว</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h4 className="text-xl font-bold text-white mb-4">
              <span className="text-primary-500">Baan</span>PoolVilla
            </h4>
            <p className="text-gray-400 mb-4">
              บริการจองบ้านพักพูลวิลล่า ราคาพิเศษ พัทยา หัวหิน เขาใหญ่ และทั่วประเทศ
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-dark-200 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-dark-200 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-dark-200 rounded-full flex items-center justify-center hover:bg-[#06C755] transition-colors">
                <FaLine size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">ลิงก์ด่วน</h5>
            <ul className="space-y-2">
              <li><Link href="/villas" className="hover:text-primary-400 transition-colors">พูลวิลล่าทั้งหมด</Link></li>
              <li><Link href="/villas?zone=pattaya" className="hover:text-primary-400 transition-colors">พูลวิลล่า พัทยา</Link></li>
              <li><Link href="/villas?zone=huahin" className="hover:text-primary-400 transition-colors">พูลวิลล่า หัวหิน</Link></li>
              <li><Link href="/villas?zone=khaoyai" className="hover:text-primary-400 transition-colors">พูลวิลล่า เขาใหญ่</Link></li>
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">เกี่ยวกับเรา</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">ช่วยเหลือ</h5>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-primary-400 transition-colors">คำถามที่พบบ่อย</Link></li>
              <li><Link href="/terms" className="hover:text-primary-400 transition-colors">ข้อกำหนดการใช้งาน</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link href="/contact" className="hover:text-primary-400 transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-4">ติดต่อเรา</h5>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FiPhone className="mt-1 text-primary-400" />
                <div>
                  <p>062-xxx-xxxx</p>
                  <p className="text-sm text-gray-500">จันทร์-อาทิตย์ 9:00-21:00</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FiMail className="mt-1 text-primary-400" />
                <span>info@baanpoolvilla.com</span>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin className="mt-1 text-primary-400" />
                <span>กรุงเทพมหานคร, ประเทศไทย</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 BaanPoolVilla. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary-400 transition-colors">เงื่อนไข</Link>
            <Link href="/privacy" className="hover:text-primary-400 transition-colors">ความเป็นส่วนตัว</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
