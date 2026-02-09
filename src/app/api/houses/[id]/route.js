import { NextResponse } from 'next/server';
import { getWebsiteHouseById, getWebsiteHouseBySlug, updateWebsiteHouse, deleteWebsiteHouse } from '@/lib/firebaseApi';

export async function GET(request, { params }) {
  try {
    let house = await getWebsiteHouseById(params.id);
    if (!house) {
      house = await getWebsiteHouseBySlug(params.id);
    }
    if (!house) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }
    return NextResponse.json(house);
  } catch (error) {
    console.error('Error fetching house:', error);
    return NextResponse.json({ error: 'Failed to fetch house' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const house = await updateWebsiteHouse(params.id, data);
    return NextResponse.json(house);
  } catch (error) {
    console.error('Error updating house:', error);
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteWebsiteHouse(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting house:', error);
    return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
  }
}
