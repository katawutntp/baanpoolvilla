import { NextResponse } from 'next/server';
import { uploadHouseImage, deleteHouseImage } from '@/lib/firebaseApi';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const houseId = formData.get('houseId') || 'temp';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await uploadHouseImage(file, houseId);
    return NextResponse.json(result);
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
