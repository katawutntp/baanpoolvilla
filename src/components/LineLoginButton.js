'use client';

import { useAuth } from '@/lib/authContext';
import { FaLine } from 'react-icons/fa';

export default function LineLoginButton({ className = '', size = 'md', redirectTo }) {
  const { user, loading, loginWithLine, logout } = useAuth();

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-10 w-28 ${className}`} />
    );
  }

  // ถ้า login แล้ว แสดง profile
  if (user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {user.pictureUrl && (
          <img
            src={user.pictureUrl}
            alt={user.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <span className="text-sm font-medium text-gray-700 hidden md:inline">
          {user.displayName}
        </span>
        <button
          onClick={logout}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1"
        >
          ออก
        </button>
      </div>
    );
  }

  // ปุ่ม Login
  const sizeClasses = {
    sm: 'text-sm !py-1.5 !px-3',
    md: 'text-sm !py-2 !px-4',
    lg: 'text-base !py-3 !px-6',
  };

  return (
    <button
      onClick={() => loginWithLine(redirectTo)}
      className={`bg-[#06C755] hover:bg-[#05b04c] text-white rounded-lg font-medium 
        flex items-center justify-center gap-2 transition-colors 
        ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <FaLine size={size === 'lg' ? 20 : 16} />
      <span>เข้าสู่ระบบด้วย LINE</span>
    </button>
  );
}
