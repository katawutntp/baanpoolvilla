'use client';

import ImageUploader from './ImageUploader';

const IMAGE_CATEGORIES = [
  { key: 'cover', label: 'ภาพปก', icon: '🏠', max: 3 },
  { key: 'exterior', label: 'ภายนอก', icon: '🌳', max: 10 },
  { key: 'living', label: 'ห้องนั่งเล่น', icon: '🛋️', max: 10 },
  { key: 'bedroom', label: 'ห้องนอน', icon: '🛏️', max: 10 },
  { key: 'kitchen', label: 'ห้องครัว', icon: '🍳', max: 10 },
  { key: 'bathroom', label: 'ห้องน้ำ', icon: '🚿', max: 10 },
];

export { IMAGE_CATEGORIES };

export default function CategorizedImageUploader({ images = [], onChange, houseId = 'temp' }) {
  // แยกรูปตาม category
  const getImagesByCategory = (cat) => images.filter((img) => img.category === cat);

  // รูปที่ไม่มี category (เก่า) ถือเป็น cover
  const getUncategorized = () => images.filter((img) => !img.category);

  const handleCategoryChange = (category, newCatImages) => {
    // เอารูปหมวดอื่นมารวม แล้วแทนที่หมวดนี้
    const otherImages = images.filter((img) => img.category !== category);
    onChange([...otherImages, ...newCatImages]);
  };

  const uncategorized = getUncategorized();

  return (
    <div className="space-y-6">
      {/* แจ้งเตือนรูปเก่าที่ไม่มีหมวดหมู่ */}
      {uncategorized.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-700 font-medium mb-2">
            ⚠️ มีรูปเก่า {uncategorized.length} รูปที่ยังไม่ได้จัดหมวดหมู่
          </p>
          <p className="text-xs text-yellow-600 mb-3">
            รูปเหล่านี้จะแสดงเป็นภาพปกชั่วคราว คุณสามารถลบแล้วอัปโหลดใหม่ในหมวดที่ถูกต้องได้
          </p>
          <ImageUploader
            images={uncategorized}
            onChange={(newImages) => {
              const categorized = images.filter((img) => img.category);
              onChange([...categorized, ...newImages]);
            }}
            houseId={houseId}
            maxImages={30}
            label="รูปเก่า (ไม่มีหมวดหมู่)"
          />
        </div>
      )}

      {/* หมวดหมู่รูปภาพ */}
      {IMAGE_CATEGORIES.map((cat) => {
        const catImages = getImagesByCategory(cat.key);
        return (
          <div key={cat.key} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.icon}</span>
              <h3 className="font-semibold text-gray-700">{cat.label}</h3>
              {cat.key === 'cover' && (
                <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                  จำเป็น
                </span>
              )}
            </div>
            <ImageUploader
              images={catImages}
              onChange={(newImages) => handleCategoryChange(cat.key, newImages)}
              houseId={houseId}
              maxImages={cat.max}
              category={cat.key}
              label={`${cat.label} (${catImages.length}/${cat.max})`}
            />
          </div>
        );
      })}

      {/* สรุป */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          <strong>รูปทั้งหมด:</strong> {images.length} รูป
          {IMAGE_CATEGORIES.map((cat) => {
            const count = getImagesByCategory(cat.key).length;
            return count > 0 ? (
              <span key={cat.key} className="ml-3">
                {cat.icon} {count}
              </span>
            ) : null;
          })}
          {uncategorized.length > 0 && (
            <span className="ml-3 text-yellow-600">⚠️ ไม่มีหมวด {uncategorized.length}</span>
          )}
        </p>
      </div>
    </div>
  );
}
