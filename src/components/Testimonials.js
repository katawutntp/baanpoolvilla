'use client';

import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'คุณสมชาย ก.',
    role: 'ครอบครัว 6 คน',
    text: 'บ้านพักสวยมาก สระว่ายน้ำส่วนตัว สะอาด ถูกใจทุกคนในครอบครัว จะกลับมาพักอีกแน่นอน!',
    rating: 5,
    avatar: '👨‍💼',
  },
  {
    name: 'คุณมาลี ว.',
    role: 'กลุ่มเพื่อน 10 คน',
    text: 'จองง่ายมาก ทีมงานตอบไว ที่พักกว้างขวาง มีที่ปิ้งย่าง คาราโอเกะ สนุกสุดๆ คะ',
    rating: 5,
    avatar: '👩‍💼',
  },
  {
    name: 'คุณวิชัย ป.',
    role: 'คู่รัก',
    text: 'บรรยากาศโรแมนติกมาก วิลล่าสวย สระน้ำดี มีความเป็นส่วนตัว ราคาคุ้มค่ามาก ครับ',
    rating: 5,
    avatar: '👨',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">ลูกค้าพูดถึงเรา</h2>
          <p className="section-subtitle">รีวิวจากลูกค้าจริงที่ใช้บริการกับเรา</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 card-shadow relative"
            >
              {/* Quote mark */}
              <div className="absolute -top-3 left-6 text-5xl text-primary-200 font-serif">
                &ldquo;
              </div>

              <div className="pt-4">
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <FiStar key={i} className="text-yellow-400 fill-yellow-400" size={16} />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-600 mb-4 leading-relaxed">{t.text}</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
