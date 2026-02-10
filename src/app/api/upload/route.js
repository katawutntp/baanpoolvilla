import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function ensureCloudinaryConfig() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary config is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
  }
}

async function uploadToCloudinary(file, houseId) {
  ensureCloudinaryConfig();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `website_houses/${houseId || 'temp'}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          url: result.secure_url,
          storagePath: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

async function deleteFromCloudinary(publicId) {
  ensureCloudinaryConfig();
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file');
    const houseId = formData.get('houseId') || 'temp';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // รองรับหลายไฟล์พร้อมกัน
    if (files.length === 1) {
      try {
        const result = await uploadToCloudinary(files[0], houseId);
        return NextResponse.json(result);
      } catch (error) {
        return NextResponse.json(
          { error: 'Upload failed', details: error?.message || 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // อัปโหลดหลายไฟล์
    const results = [];
    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file, houseId);
        results.push(result);
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        results.push({
          error: `Upload failed: ${file.name}`,
          details: err?.message || 'Unknown error',
        });
      }
    }
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error uploading:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { storagePath } = await request.json();
    if (!storagePath) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }
    await deleteFromCloudinary(storagePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
