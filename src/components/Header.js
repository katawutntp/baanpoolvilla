'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiUser, FiPhone } from 'react-icons/fi';
import LineLoginButton from './LineLoginButton';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/villas', label: 'พูลวิลล่าทั้งหมด' },
    { href: '/about', label: 'เกี่ยวกับเรา' },
    { href: '/contact', label: 'ติดต่อเรา' },
  ];

  const headerBg = isHome
    ? isScrolled
      ? 'bg-white shadow-md'
      : 'bg-transparent'
    : 'bg-white shadow-md';

  const textColor = isHome && !isScrolled ? 'text-white' : 'text-gray-700';
  const logoColor = isHome && !isScrolled ? 'text-white' : 'text-primary-500';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${logoColor} transition-colors`}>
              <span className="text-primary-500">Baan</span>
              <span className={isHome && !isScrolled ? 'text-white' : 'text-dark-100'}>PoolVilla</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium hover:text-primary-500 transition-colors ${
                  pathname === link.href ? 'text-primary-500' : textColor
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LineLoginButton />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <FiX size={24} className={textColor} />
            ) : (
              <FiMenu size={24} className={textColor} />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white rounded-lg shadow-lg p-4 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-4 rounded-lg font-medium ${
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            <div className="py-3 px-4">
              <LineLoginButton className="w-full" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
