'use client';

import Link from 'next/link';

const zones = [
  {
    id: 'bangsaen',
    name: 'บางแสน',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    count: 20,
  },
  {
    id: 'pattaya',
    name: 'พัทยา',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80',
    count: 49,
  },
  {
    id: 'sattahip',
    name: 'สัตหีบ',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
    count: 11,
  },
  {
    id: 'rayong',
    name: 'ระยอง',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80',
    count: 3,
  },
];

export default function PopularDestinations() {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">ทำเลยอดนิยม</h2>
          <p className="section-subtitle">พูลวิลล่าในทำเลที่คุณชื่นชอบ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <Link
              key={zone.id}
              href={`/villas?zone=${zone.id}`}
              className="group relative h-72 rounded-2xl overflow-hidden card-shadow"
            >
              <img
                src={zone.image}
                alt={zone.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-1">{zone.name}</h3>
                <p className="text-white/80 text-sm">{zone.count}+ พูลวิลล่า</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
