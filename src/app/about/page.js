import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaLine, FaFacebook } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-16">
          <div className="container-custom text-center text-white">
            <h1 className="text-4xl font-bold mb-4">เกี่ยวกับเรา</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              BaanPoolVilla บริการจองบ้านพักพูลวิลล่าครบวงจร ราคาพิเศษ
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold mb-4">ยินดีต้อนรับสู่ BaanPoolVilla</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  เราเป็นผู้ให้บริการจองบ้านพักพูลวิลล่าชั้นนำ ครอบคลุมทุกทำเลยอดนิยมทั่วประเทศไทย
                  ไม่ว่าจะเป็น พัทยา หัวหิน เขาใหญ่ ระยอง และอีกมากมาย
                </p>
                <p>
                  บ้านพักทุกหลังของเราผ่านการคัดสรรอย่างพิถีพิถัน พร้อมสระว่ายน้ำส่วนตัว สิ่งอำนวยความสะดวกครบครัน
                  ในราคาที่คุ้มค่า เหมาะสำหรับครอบครัว กลุ่มเพื่อน และทุกโอกาสพิเศษ
                </p>
                <p>
                  ทีมงานของเราพร้อมให้บริการตลอด 24 ชั่วโมง เพื่อให้การเดินทางของคุณเป็นประสบการณ์ที่น่าจดจำ
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { value: '50+', label: 'บ้านพัก' },
                { value: '1,000+', label: 'ลูกค้า' },
                { value: '5+', label: 'ปีประสบการณ์' },
                { value: '4.8', label: 'คะแนนเฉลี่ย' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                  <p className="text-3xl font-bold text-primary-500">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
