import { db, storage } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// ===== Collections =====
const HOUSES_COLLECTION = 'houses';
const WEBSITE_HOUSES_COLLECTION = 'website_houses';
const COUNTERS_COLLECTION = 'counters';

// ===== Counter Helper =====
async function getNextId(counterName) {
  const counterRef = doc(db, COUNTERS_COLLECTION, counterName);
  const counterSnap = await getDoc(counterRef);

  if (!counterSnap.exists()) {
    await setDoc(counterRef, { value: 1 });
    return 1;
  }

  const currentValue = counterSnap.data().value || 0;
  const nextValue = currentValue + 1;
  await updateDoc(counterRef, { value: nextValue });
  return nextValue;
}

// ===== Calendar Houses (read-only from Calendar project) =====
export async function getCalendarHouses() {
  try {
    const housesRef = collection(db, HOUSES_COLLECTION);
    const snapshot = await getDocs(housesRef);
    return snapshot.docs.map((d) => ({
      docId: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error('Error getting calendar houses:', error);
    return [];
  }
}

export async function getCalendarHouseByCode(code) {
  try {
    const housesRef = collection(db, HOUSES_COLLECTION);
    const q = query(housesRef, where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      const d = snapshot.docs[0];
      return { docId: d.id, ...d.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting calendar house by code:', error);
    return null;
  }
}

// ===== Website Houses (full CRUD) =====
export async function getAllWebsiteHouses() {
  try {
    const ref = collection(db, WEBSITE_HOUSES_COLLECTION);
    const snapshot = await getDocs(ref);
    const houses = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    houses.sort((a, b) => {
      const orderA = a.sortOrder ?? 99999;
      const orderB = b.sortOrder ?? 99999;
      if (orderA !== orderB) return orderA - orderB;
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    return houses;
  } catch (error) {
    console.error('Error getting website houses:', error);
    return [];
  }
}

export async function getWebsiteHouseById(id) {
  try {
    const docRef = doc(db, WEBSITE_HOUSES_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error getting website house:', error);
    return null;
  }
}

export async function getWebsiteHouseByCode(code) {
  try {
    const ref2 = collection(db, WEBSITE_HOUSES_COLLECTION);
    const q = query(ref2, where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      const d = snapshot.docs[0];
      return { id: d.id, ...d.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting website house by code:', error);
    return null;
  }
}

export async function createWebsiteHouse(data) {
  try {
    const ref2 = collection(db, WEBSITE_HOUSES_COLLECTION);
    const newHouse = {
      ...data,
      images: data.images || [],
      amenities: data.amenities || [],
      zone: data.zone || '',
      code: data.code || '',
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      maxGuests: data.maxGuests || 0,
      pricePerNight: data.pricePerNight || 0,
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      address: data.address || '',
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      isActive: data.isActive !== false,
      isFeatured: data.isFeatured || false,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      sortOrder: data.sortOrder ?? 99999,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(ref2, newHouse);
    return { id: docRef.id, ...newHouse };
  } catch (error) {
    console.error('Error creating website house:', error);
    throw error;
  }
}

export async function updateWebsiteHouse(id, data) {
  try {
    const docRef = doc(db, WEBSITE_HOUSES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error updating website house:', error);
    throw error;
  }
}

export async function deleteWebsiteHouse(id) {
  try {
    const house = await getWebsiteHouseById(id);
    if (house?.images?.length) {
      for (const img of house.images) {
        try {
          if (img.storagePath) {
            const imgRef = ref(storage, img.storagePath);
            await deleteObject(imgRef);
          }
        } catch (e) {
          console.error('Error deleting image:', e);
        }
      }
    }
    await deleteDoc(doc(db, WEBSITE_HOUSES_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting website house:', error);
    throw error;
  }
}

// ===== Image Upload =====
export async function uploadHouseImage(file, houseId) {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `website_houses/${houseId}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url, storagePath };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteHouseImage(storagePath) {
  try {
    const imgRef = ref(storage, storagePath);
    await deleteObject(imgRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// ===== Calendar Sync =====
export async function getBookingDataByCode(code) {
  try {
    const house = await getCalendarHouseByCode(code);
    if (!house) return {};
    return house.prices || {};
  } catch (error) {
    console.error('Error getting booking data:', error);
    return {};
  }
}

// Get multiple houses booking data at once
export async function getAllBookingData() {
  try {
    const houses = await getCalendarHouses();
    const result = {};
    houses.forEach((h) => {
      if (h.code) {
        result[h.code] = h.prices || {};
      }
    });
    return result;
  } catch (error) {
    console.error('Error getting all booking data:', error);
    return {};
  }
}
