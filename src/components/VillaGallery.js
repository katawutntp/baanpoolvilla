'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';

const GALLERY_TABS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'cover', label: '🏠 ภาพปก' },
  { key: 'exterior', label: '🌳 ภายนอก' },
  { key: 'living', label: '🛋️ ห้องนั่งเล่น' },
  { key: 'bedroom', label: '🛏️ ห้องนอน' },
  { key: 'kitchen', label: '🍳 ห้องครัว' },
  { key: 'bathroom', label: '🚿 ห้องน้ำ' },
];

export default function VillaGallery({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const defaultImages = [
    { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80' },
    { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80' },
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80' },
  ];

  const allImgs = images.length > 0 ? images : defaultImages;

  // เรียงลำดับ: cover ก่อน แล้วตาม category
  const categoryOrder = ['cover', 'exterior', 'living', 'bedroom', 'kitchen', 'bathroom', ''];
  const sortedAllImgs = [...allImgs].sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a.category || '');
    const bIdx = categoryOrder.indexOf(b.category || '');
    return aIdx - bIdx;
  });

  // Filter by active tab
  const filteredImgs = activeTab === 'all'
    ? sortedAllImgs
    : sortedAllImgs.filter((img) => img.category === activeTab);

  // Tab ที่มีรูป
  const availableTabs = GALLERY_TABS.filter((tab) => {
    if (tab.key === 'all') return true;
    return allImgs.some((img) => img.category === tab.key);
  });

  // ถ้าไม่มี category เลย (รูปเก่า) ไม่แสดง tabs
  const hasCategories = allImgs.some((img) => img.category);

  const imgs = filteredImgs.length > 0 ? filteredImgs : sortedAllImgs;

  const goNext = () => setCurrentIndex((i) => (i + 1) % imgs.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + imgs.length) % imgs.length);

  const openFullscreen = (idx) => {
    setCurrentIndex(idx);
    setIsFullscreen(true);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentIndex(0);
  };

  return (
    <>
      <div className="relative">
        {/* Category tabs */}
        {hasCategories && availableTabs.length > 2 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {availableTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-1 text-xs opacity-70">
                    ({allImgs.filter((img) => img.category === tab.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main image grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[500px]">
          {/* Main large image */}
          <div
            className="md:col-span-2 md:row-span-2 relative cursor-pointer group"
            onClick={() => openFullscreen(0)}
          >
            <img
              src={imgs[0]?.url}
              alt="Villa main"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="image-overlay" />
            {imgs[0]?.category && (
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                {GALLERY_TABS.find((t) => t.key === imgs[0].category)?.label || ''}
              </div>
            )}
          </div>

          {/* Side images */}
          {imgs.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="hidden md:block relative cursor-pointer group"
              onClick={() => openFullscreen(idx + 1)}
            >
              <img
                src={img.url}
                alt={`Villa ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="image-overlay" />
              {idx === 3 && imgs.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                  +{imgs.length - 5} รูป
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View all button */}
        <button
          onClick={() => openFullscreen(0)}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
        >
          <FiMaximize2 size={16} />
          ดูรูปทั้งหมด ({imgs.length})
        </button>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10"
          >
            <FiX size={28} />
          </button>

          <button
            onClick={goPrev}
            className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full z-10"
          >
            <FiChevronLeft size={32} />
          </button>

          <div className="max-w-5xl max-h-[85vh] mx-auto px-16">
            <img
              src={imgs[currentIndex]?.url}
              alt={`Villa ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
            />
            <div className="text-center text-white mt-4">
              <span>{currentIndex + 1} / {imgs.length}</span>
              {imgs[currentIndex]?.category && (
                <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm">
                  {GALLERY_TABS.find((t) => t.key === imgs[currentIndex].category)?.label || ''}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={goNext}
            className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full z-10"
          >
            <FiChevronRight size={32} />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] pb-2">
            {imgs.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex ? 'border-primary-500 scale-110' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
