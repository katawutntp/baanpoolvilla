'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';

const CATEGORY_INFO = [
  { key: 'cover', label: 'ภาพปก', icon: '🏠' },
  { key: 'exterior', label: 'ภายนอก', icon: '🌳' },
  { key: 'living', label: 'ห้องนั่งเล่น', icon: '🛋️' },
  { key: 'bedroom', label: 'ห้องนอน', icon: '🛏️' },
  { key: 'kitchen', label: 'ห้องครัว', icon: '🍳' },
  { key: 'bathroom', label: 'ห้องน้ำ', icon: '🚿' },
];

export default function VillaGallery({ images = [] }) {
  const [fullscreenImages, setFullscreenImages] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultImages = [
    { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80', category: 'cover' },
    { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', category: 'exterior' },
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', category: 'exterior' },
  ];

  const allImgs = images.length > 0 ? images : defaultImages;
  const hasCategories = allImgs.some((img) => img.category);

  // แยกรูปตามหมวดหมู่
  const getByCategory = (cat) => allImgs.filter((img) => img.category === cat);
  const uncategorized = allImgs.filter((img) => !img.category);

  // ถ้าไม่มี category เลย → ใช้แบบเดิม (legacy)
  const coverImgs = hasCategories ? getByCategory('cover') : allImgs.slice(0, 3);

  const goNext = () => setFullscreenImages((imgs) => { setCurrentIndex((i) => (i + 1) % imgs.length); return imgs; });
  const goPrev = () => setFullscreenImages((imgs) => { setCurrentIndex((i) => (i - 1 + imgs.length) % imgs.length); return imgs; });

  const openFullscreen = (imgs, idx = 0) => {
    setFullscreenImages(imgs);
    setCurrentIndex(idx);
  };

  // สร้าง cover grid (3 รูป)
  const renderCoverGrid = () => {
    const imgs = coverImgs.length > 0 ? coverImgs : allImgs.slice(0, 3);
    if (imgs.length === 0) return null;

    if (imgs.length === 1) {
      return (
        <div className="rounded-2xl overflow-hidden h-[300px] md:h-[500px]">
          <div
            className="relative cursor-pointer group h-full"
            onClick={() => openFullscreen(imgs, 0)}
          >
            <img src={imgs[0]?.url} alt="Villa cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="image-overlay" />
          </div>
        </div>
      );
    }

    if (imgs.length === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[500px]">
          {imgs.map((img, idx) => (
            <div key={idx} className="relative cursor-pointer group"
              onClick={() => openFullscreen(imgs, idx)}>
              <img src={img.url} alt={`Villa cover ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="image-overlay" />
            </div>
          ))}
        </div>
      );
    }

    // 3 รูป: 1 ใหญ่ซ้าย + 2 เล็กขวา
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[500px]">
        <div
          className="md:col-span-2 relative cursor-pointer group"
          onClick={() => openFullscreen(imgs, 0)}
        >
          <img src={imgs[0]?.url} alt="Villa cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="image-overlay" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2">
          {imgs.slice(1, 3).map((img, idx) => (
            <div key={idx} className="relative cursor-pointer group"
              onClick={() => openFullscreen(imgs, idx + 1)}>
              <img src={img.url} alt={`Villa cover ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="image-overlay" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // แสดงรูปแต่ละหมวด
  const renderCategorySection = (catKey, catLabel, catIcon) => {
    const catImgs = getByCategory(catKey);
    if (catImgs.length === 0) return null;

    return (
      <div key={catKey} className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>{catIcon}</span> {catLabel}
          <span className="text-sm font-normal text-gray-400">({catImgs.length} รูป)</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
          {catImgs.map((img, idx) => (
            <div key={idx}
              className="relative cursor-pointer group aspect-[4/3] rounded-lg overflow-hidden"
              onClick={() => openFullscreen(catImgs, idx)}>
              <img src={img.url} alt={`${catLabel} ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="image-overlay" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ภาพปก */}
      <div className="relative">
        {renderCoverGrid()}
        <button
          onClick={() => openFullscreen(allImgs, 0)}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
        >
          <FiMaximize2 size={16} />
          ดูรูปทั้งหมด ({allImgs.length})
        </button>
      </div>

      {/* แต่ละหมวด (ไม่รวม cover) */}
      {hasCategories && (
        <div>
          {CATEGORY_INFO.filter((c) => c.key !== 'cover').map((cat) =>
            renderCategorySection(cat.key, cat.label, cat.icon)
          )}
          {/* รูปเก่าไม่มีหมวด */}
          {uncategorized.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📷 รูปอื่นๆ ({uncategorized.length} รูป)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
                {uncategorized.map((img, idx) => (
                  <div key={idx}
                    className="relative cursor-pointer group aspect-[4/3] rounded-lg overflow-hidden"
                    onClick={() => openFullscreen(uncategorized, idx)}>
                    <img src={img.url} alt={`อื่นๆ ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="image-overlay" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreenImages && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setFullscreenImages(null)}
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
              src={fullscreenImages[currentIndex]?.url}
              alt={`Villa ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
            />
            <div className="text-center text-white mt-4">
              <span>{currentIndex + 1} / {fullscreenImages.length}</span>
              {fullscreenImages[currentIndex]?.category && (
                <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm">
                  {CATEGORY_INFO.find((t) => t.key === fullscreenImages[currentIndex].category)?.label || ''}
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
            {fullscreenImages.map((img, idx) => (
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
