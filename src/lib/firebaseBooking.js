import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const BOOKINGS_COLLECTION = 'bookings';

// ===== Users =====

// สร้างหรืออัปเดต user จาก LINE Login
export async function upsertLineUser(lineProfile) {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('lineId', '==', lineProfile.userId));
    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      // อัปเดต user ที่มีอยู่
      const existingDoc = snapshot.docs[0];
      const updateData = {
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl || '',
        lastLoginAt: serverTimestamp(),
      };
      // บันทึกสถานะเพื่อน OA
      if (lineProfile.isFriend !== undefined) {
        updateData.isFriend = lineProfile.isFriend;
      }
      if (lineProfile.friendshipChanged !== undefined) {
        updateData.friendshipChanged = lineProfile.friendshipChanged;
      }
      await updateDoc(doc(db, USERS_COLLECTION, existingDoc.id), updateData);
      return { id: existingDoc.id, ...existingDoc.data(), ...updateData };
    } else {
      // สร้าง user ใหม่
      const newUser = {
        lineId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl || '',
        statusMessage: lineProfile.statusMessage || '',
        isFriend: lineProfile.isFriend || false,
        friendshipChanged: lineProfile.friendshipChanged || false,
        phoneNumber: '',
        email: '',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      const docRef = doc(usersRef);
      await setDoc(docRef, newUser);
      return { id: docRef.id, ...newUser };
    }
  } catch (error) {
    console.error('Error upserting LINE user:', error);
    throw error;
  }
}

export async function getUserByLineId(lineId) {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('lineId', '==', lineId));
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      const d = snapshot.docs[0];
      return { id: d.id, ...d.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by LINE ID:', error);
    return null;
  }
}

export async function getUserById(userId) {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// ===== Bookings =====

export async function createBooking(bookingData) {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const newBooking = {
      userId: bookingData.userId,
      userLineId: bookingData.userLineId,
      userName: bookingData.userName,
      userPhone: bookingData.userPhone || '',
      villaId: bookingData.villaId,
      villaName: bookingData.villaName,
      villaCode: bookingData.villaCode || '',
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      nights: bookingData.nights,
      guests: bookingData.guests || 1,
      totalPrice: bookingData.totalPrice,
      message: bookingData.message || '',
      status: 'pending', // pending, confirmed, cancelled
      lineMessageSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = doc(bookingsRef);
    await setDoc(docRef, newBooking);
    return { id: docRef.id, ...newBooking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function getBookingsByUserId(userId) {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}

export async function updateBookingStatus(bookingId, status) {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

export async function markBookingMessageSent(bookingId) {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      lineMessageSent: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking booking message sent:', error);
  }
}

export async function updateBookingLineStatus(bookingId, status) {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const updateData = {
      lineMessageSent: !!status.sent,
      lineMessageStatus: status.status ?? null,
      lineMessageRequestId: status.requestId || '',
      lineMessageError: status.error || '',
      updatedAt: serverTimestamp(),
    };

    if (status.friendStatus) {
      updateData.lineFriendStatus = status.friendStatus;
    }

    if (status.sent) {
      updateData.lineMessageSentAt = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating LINE message status:', error);
  }
}

// ดึง booking ทั้งหมด (กรองตาม villaId หรือ status ได้)
export async function getAllBookings(filters = {}) {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    let q;

    if (filters.villaId && filters.status) {
      q = query(
        bookingsRef,
        where('villaId', '==', filters.villaId),
        where('status', '==', filters.status)
      );
    } else if (filters.villaId) {
      q = query(bookingsRef, where('villaId', '==', filters.villaId));
    } else if (filters.status) {
      q = query(bookingsRef, where('status', '==', filters.status));
    } else {
      q = query(bookingsRef);
    }

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Sort by createdAt descending
    bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return bookings;
  } catch (error) {
    console.error('Error getting all bookings:', error);
    return [];
  }
}

// ดึง booking ตาม ID
export async function getBookingById(bookingId) {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    };
  } catch (error) {
    console.error('Error getting booking:', error);
    return null;
  }
}
