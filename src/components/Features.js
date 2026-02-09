import { FiShield, FiClock, FiHeadphones, FiAward } from 'react-icons/fi';

const features = [
  {
    icon: <FiShield size={32} />,
    title: 'รับประกันราคาดีที่สุด',
    description: 'เราเปรียบเทียบราคาจากหลายแหล่ง เพื่อให้คุณได้ราคาที่ดีที่สุด',
  },
  {
    icon: <FiClock size={32} />,
    title: 'จองง่าย & รวดเร็ว',
    description: 'ระบบจองที่ใช้งานง่าย สะดวก รวดเร็ว ภายในไม่กี่คลิก',
  },
  {
    icon: <FiHeadphones size={32} />,
    title: 'บริการลูกค้า 24/7',
    description: 'ทีมงานพร้อมให้บริการตลอด 24 ชั่วโมง ทุกวัน',
  },
  {
    icon: <FiAward size={32} />,
    title: 'คุณภาพมาตรฐาน',
    description: 'บ้านพักทุกหลังผ่านการตรวจสอบคุณภาพอย่างเข้มงวด',
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 text-center card-shadow hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center text-primary-500">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
