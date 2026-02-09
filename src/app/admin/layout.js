'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome, FiGrid, FiPlusCircle, FiSettings, FiLogOut,
  FiMenu, FiX, FiCalendar, FiBarChart2, FiClipboard
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsLoggedIn(!!token);
    }
    setCheckingAuth(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  // Login page doesn't need sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isLoggedIn) return null;

  const navItems = [
    { href: '/admin', label: 'แดชบอร์ด', icon: <FiBarChart2 size={20} /> },
    { href: '/admin/houses', label: 'จัดการบ้านพัก', icon: <FiHome size={20} /> },
    { href: '/admin/houses/new', label: 'เพิ่มบ้านพักใหม่', icon: <FiPlusCircle size={20} /> },
    { href: '/admin/bookings', label: 'จัดการการจอง', icon: <FiClipboard size={20} /> },
    { href: '/admin/calendar', label: 'ปฏิทินจอง', icon: <FiCalendar size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-sm transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/admin" className="text-xl font-bold">
            <span className="text-primary-500">Baan</span>
            <span className="text-dark-100">PV</span>
            <span className="text-sm text-gray-400 ml-2">Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Link href="/" className="admin-sidebar-link mb-1">
            <FiGrid size={20} />
            <span>ดูเว็บไซต์</span>
          </Link>
          <button onClick={handleLogout} className="admin-sidebar-link text-red-500 w-full">
            <FiLogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
