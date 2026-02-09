import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const HOUSES_COLLECTION = 'houses';

/**
 * Generate date range array from checkIn to checkOut (excluding checkOut date)
 */
function getDateRange(checkIn, checkOut) {
  const dates = [];
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  let current = new Date(start);
  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Block dates in Calendar system when a booking is created
 * status: 'pending' (yellow) or 'booked'/'confirmed' (red)
 */
export async function blockDatesForBooking(houseCode, checkIn, checkOut, status = 'pending', bookingId = null) {
  const dates = getDateRange(checkIn, checkOut);
  if (dates.length === 0) return;

  const housesRef = collection(db, HOUSES_COLLECTION);
  const q = query(housesRef, where('code', '==', houseCode));
  const snapshot = await getDocs(q);

  if (snapshot.docs.length === 0) {
    console.warn(`House code "${houseCode}" not found in Calendar system`);
    return;
  }

  const houseDoc = snapshot.docs[0];
  const house = houseDoc.data();
  const prices = { ...(house.prices || {}) };

  for (const date of dates) {
    prices[date] = {
      price: prices[date]?.price || null,
      status: status,
      bookingId: bookingId || null,
    };
  }

  await updateDoc(doc(db, HOUSES_COLLECTION, houseDoc.id), {
    prices,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Release dates when booking is cancelled
 */
export async function releaseDatesForBooking(houseCode, checkIn, checkOut) {
  const dates = getDateRange(checkIn, checkOut);
  if (dates.length === 0) return;

  const housesRef = collection(db, HOUSES_COLLECTION);
  const q = query(housesRef, where('code', '==', houseCode));
  const snapshot = await getDocs(q);

  if (snapshot.docs.length === 0) return;

  const houseDoc = snapshot.docs[0];
  const house = houseDoc.data();
  const prices = { ...(house.prices || {}) };

  for (const date of dates) {
    delete prices[date];
  }

  await updateDoc(doc(db, HOUSES_COLLECTION, houseDoc.id), {
    prices,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Confirm dates (change pending → booked/confirmed)
 */
export async function confirmDatesForBooking(houseCode, checkIn, checkOut, bookingId = null) {
  await blockDatesForBooking(houseCode, checkIn, checkOut, 'booked', bookingId);
}
