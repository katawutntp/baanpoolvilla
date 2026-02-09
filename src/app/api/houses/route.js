import { NextResponse } from 'next/server';
import { getAllWebsiteHouses, createWebsiteHouse } from '@/lib/firebaseApi';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const guests = searchParams.get('guests');

    let houses = await getAllWebsiteHouses();

    // Filter only active
    houses = houses.filter((h) => h.isActive !== false);

    if (zone) {
      houses = houses.filter((h) => h.zone === zone);
    }

    if (featured === 'true') {
      houses = houses.filter((h) => h.isFeatured);
    }

    if (search) {
      const s = search.toLowerCase();
      houses = houses.filter(
        (h) =>
          h.name?.toLowerCase().includes(s) ||
          h.description?.toLowerCase().includes(s) ||
          h.zone?.toLowerCase().includes(s) ||
          h.address?.toLowerCase().includes(s)
      );
    }

    if (guests) {
      const g = parseInt(guests);
      houses = houses.filter((h) => h.maxGuests >= g);
    }

    return NextResponse.json(houses);
  } catch (error) {
    console.error('Error fetching houses:', error);
    return NextResponse.json({ error: 'Failed to fetch houses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Creating house with data:', JSON.stringify(data).substring(0, 200));
    const house = await createWebsiteHouse(data);
    console.log('House created successfully:', house.id);
    return NextResponse.json(house, { status: 201 });
  } catch (error) {
    console.error('Error creating house:', error.message, error.code, error.stack);
    return NextResponse.json(
      { error: 'Failed to create house', details: error.message, code: error.code },
      { status: 500 }
    );
  }
}
