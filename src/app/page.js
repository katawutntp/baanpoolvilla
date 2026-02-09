import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import PopularDestinations from '@/components/PopularDestinations';
import Testimonials from '@/components/Testimonials';
import FeaturedVillas from './FeaturedVillas';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <Features />
        <FeaturedVillas />
        <PopularDestinations />
        <Testimonials />
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="container-custom text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              พร้อมออกเดินทางหรือยัง?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              จองพูลวิลล่าของคุณวันนี้ รับส่วนลดพิเศษ สำหรับการจองล่วงหน้า
            </p>
            <a
              href="/villas"
              className="inline-block bg-white text-primary-600 font-bold py-4 px-8 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              ดูพูลวิลล่าทั้งหมด →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
