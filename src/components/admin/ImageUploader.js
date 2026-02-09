'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiTrash2, FiMove } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ImageUploader({ images = [], onChange, houseId = 'temp' }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ไม่ใช่ไฟล์รูปภาพ`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} ขนาดเกิน 10MB`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('houseId', houseId);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newImages.push({
            url: data.url,
            storagePath: data.storagePath,
            name: file.name,
          });
        } else {
          toast.error(`อัปโหลด ${file.name} ล้มเหลว`);
        }
      } catch (err) {
        toast.error(`อัปโหลด ${file.name} ล้มเหลว`);
      }
    }

    onChange(newImages);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async (index) => {
    const img = images[index];
    const newImages = images.filter((_, i) => i !== index);

    if (img.storagePath) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storagePath: img.storagePath }),
        });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }

    onChange(newImages);
  };

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    onChange(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        รูปภาพ ({images.length})
      </label>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
              <img
                src={img.url}
                alt={img.name || `Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {idx > 0 && (
                  <button
                    onClick={() => moveImage(idx, idx - 1)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="เลื่อนไปซ้าย"
                  >
                    ←
                  </button>
                )}
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                  title="ลบ"
                >
                  <FiTrash2 size={16} />
                </button>
                {idx < images.length - 1 && (
                  <button
                    onClick={() => moveImage(idx, idx + 1)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="เลื่อนไปขวา"
                  >
                    →
                  </button>
                )}
              </div>
              {/* Index badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  หน้าปก
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }`}
      >
        {uploading ? (
          <div>
            <div className="spinner w-8 h-8 mx-auto mb-2" />
            <p className="text-gray-500">กำลังอัปโหลด...</p>
          </div>
        ) : (
          <div>
            <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</p>
            <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP (สูงสุด 10MB ต่อรูป)</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
