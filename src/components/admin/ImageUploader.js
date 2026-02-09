'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiTrash2, FiMove } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ImageUploader({ images = [], onChange, houseId = 'temp', maxImages = 30 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  // ย่อขนาดรูปก่อน upload เพื่อประหยัดพื้นที่
  const compressImage = (file, maxWidth = 1920, quality = 0.85) => {
    return new Promise((resolve) => {
      // ถ้าไฟล์เล็กกว่า 500KB ไม่ต้องย่อ
      if (file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`อัปโหลดได้สูงสุด ${maxImages} รูป`);
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      toast(`เลือกอัปโหลดได้อีก ${remaining} รูป (จากที่เลือก ${files.length} รูป)`, { icon: '⚠️' });
    }

    setUploading(true);
    const newImages = [...images];
    let uploadedCount = 0;

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ไม่ใช่ไฟล์รูปภาพ`);
        continue;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} ขนาดเกิน 20MB`);
        continue;
      }

      try {
        setUploadProgress(`อัปโหลด ${++uploadedCount}/${filesToUpload.length}...`);

        // ย่อรูปก่อน upload
        const compressed = await compressImage(file);

        const formData = new FormData();
        formData.append('file', compressed);
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
    setUploadProgress('');
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
        รูปภาพ ({images.length}/{maxImages})
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
            <p className="text-gray-500">{uploadProgress || 'กำลังอัปโหลด...'}</p>
          </div>
        ) : images.length >= maxImages ? (
          <div>
            <FiImage className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 font-medium">ครบจำนวนสูงสุดแล้ว ({maxImages} รูป)</p>
          </div>
        ) : (
          <div>
            <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 font-medium">คลิกเพื่ออัปโหลดรูปภาพ (เลือกได้หลายรูป)</p>
            <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP (สูงสุด 20MB ต่อรูป, อัปโหลดได้อีก {maxImages - images.length} รูป)</p>
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
