import { NextResponse } from 'next/server';
import { uploadHouseImage, deleteHouseImage } from '@/lib/firebaseApi';

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
      const result = await uploadHouseImage(files[0], houseId);
      return NextResponse.json(result);
    }

    // อัปโหลดหลายไฟล์
    const results = [];
    for (const file of files) {
      try {
        const result = await uploadHouseImage(file, houseId);
        results.push(result);
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        results.push({ error: `Upload failed: ${file.name}` });
      }
    }
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error uploading:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { storagePath } = await request.json();
    if (!storagePath) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }
    await deleteHouseImage(storagePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
