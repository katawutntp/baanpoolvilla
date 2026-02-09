import { NextResponse } from 'next/server';
import { getBookingDataByCode, getAllBookingData } from '@/lib/firebaseApi';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';

const HOUSES_COLLECTION = 'houses';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const bookingData = await getBookingDataByCode(code);
      return NextResponse.json(bookingData);
    }

    // Return all booking data
    const allData = await getAllBookingData();
    return NextResponse.json(allData);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

// POST - block/unblock dates on Calendar house (sync with Calendar project)
export async function POST(request) {
  try {
    const { code, dates, status, price } = await request.json();

    if (!code || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: 'code and dates[] required' },
        { status: 400 }
      );
    }

    // Find house in Calendar's houses collection by code
    const housesRef = collection(db, HOUSES_COLLECTION);
    const q = query(housesRef, where('code', '==', code));
    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      return NextResponse.json(
        { error: `ไม่พบบ้านรหัส "${code}" ในระบบปฏิทิน Calendar` },
        { status: 404 }
      );
    }

    const houseDoc = snapshot.docs[0];
    const house = houseDoc.data();
    const prices = { ...(house.prices || {}) };

    // Update each date
    for (const date of dates) {
      if (status === 'available') {
        // ปลดบล็อค: ถ้ามีราคาอยู่ ให้เก็บราคาไว้
        if (prices[date]?.price && prices[date].price > 0) {
          prices[date] = { price: prices[date].price };
        } else {
          delete prices[date];
        }
      } else if (status === 'price-only') {
        // ตั้งราคาอย่างเดียว ไม่เปลี่ยนสถานะ
        prices[date] = {
          ...(prices[date] || {}),
          price: price !== undefined ? price : (prices[date]?.price || null),
        };
      } else {
        prices[date] = {
          price: price !== undefined ? price : (prices[date]?.price || null),
          status: status || 'booked',
        };
      }
    }

    // Update the Calendar house document
    await updateDoc(doc(db, HOUSES_COLLECTION, houseDoc.id), {
      prices,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: `อัพเดท ${dates.length} วันสำหรับบ้าน ${code} สำเร็จ`,
      updatedDates: dates,
      prices,
    });
  } catch (error) {
    console.error('Calendar POST error:', error);
    return NextResponse.json(
      { error: 'อัพเดทปฏิทินล้มเหลว', details: error.message },
      { status: 500 }
    );
  }
}
