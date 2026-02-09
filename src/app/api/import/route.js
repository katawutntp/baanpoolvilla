import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';

const WEBSITE_HOUSES_COLLECTION = 'website_houses';

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseInt(String(priceStr).replace(/,/g, '').replace(/[^\d]/g, '')) || 0;
}

function mapZone(area) {
  if (!area) return 'pattaya';
  const a = area.toLowerCase();
  if (a.includes('บางแสน')) return 'bangsaen';
  if (a.includes('พัทยา') || a.includes('จอมเทียน')) return 'pattaya';
  if (a.includes('สัตหีบ')) return 'sattahip';
  if (a.includes('ระยอง')) return 'rayong';
  if (a.includes('หัวหิน')) return 'huahin';
  if (a.includes('เขาใหญ่')) return 'khaoyai';
  return 'other';
}

function extractAmenities(detail) {
  if (!detail) return [];
  const amenities = [];
  const d = detail.toLowerCase();
  if (d.includes('สระว่ายน้ำ')) amenities.push('pool');
  if (d.includes('wifi') || d.includes('ไวไฟ')) amenities.push('wifi');
  if (d.includes('จากุ') || d.includes('jacuzzi')) amenities.push('jacuzzi');
  if (d.includes('คาราโอเกะ') || d.includes('karaoke')) amenities.push('karaoke');
  if (d.includes('smart tv') || d.includes('ทีวี') || d.includes('projector')) amenities.push('tv');
  if (d.includes('แอร์')) amenities.push('aircon');
  if (d.includes('ครัว') || d.includes('เตา') || d.includes('ไมโครเวฟ')) amenities.push('kitchen');
  if (d.includes('ปิ้งย่าง') || d.includes('บาร์บีคิว')) amenities.push('bbq');
  if (d.includes('โต๊ะพูล')) amenities.push('pooltable');
  return [...new Set(amenities)];
}

function extractCode(title) {
  // Extract code like BS49, PT54 from title
  const match = title.match(/([A-Z]{2}\d+)\s*$/);
  if (match) return match[1];
  // Try extracting from beginning like T1, A1, HS1, MG1
  const prefixMatch = title.match(/^([A-Z]+\d+)/);
  if (prefixMatch) return prefixMatch[1];
  return '';
}

function extractShortName(title) {
  // e.g. "T1-Tuscany poolvilla บางแสน-สาย4-BS49" → "Tuscany Bangsean T1"
  // Extract the meaningful part
  const parts = title.split('-');
  if (parts.length >= 2) {
    const prefix = parts[0].trim(); // T1, A1, HS1, MG1, etc.
    const namePart = parts[1].trim().split(' ')[0]; // Tuscany, Mountain, Hidden, Madaguscar
    return `${namePart} ${prefix}`;
  }
  return title;
}

function cleanHtml(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request) {
  try {
    const { houses: csvHouses, clearExisting } = await request.json();

    // Clear existing website_houses if requested
    if (clearExisting) {
      const ref = collection(db, WEBSITE_HOUSES_COLLECTION);
      const snapshot = await getDocs(ref);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      console.log(`Deleted ${snapshot.docs.length} existing houses`);
    }

    // Import each house
    const ref = collection(db, WEBSITE_HOUSES_COLLECTION);
    const results = [];

    for (let i = 0; i < csvHouses.length; i++) {
      const csv = csvHouses[i];
      const code = extractCode(csv.Title || '');
      const shortName = extractShortName(csv.Title || '');

      const house = {
        name: shortName,
        fullTitle: csv.Title || '',
        code: code,
        zone: mapZone(csv['พื้นที่'] || ''),
        areaName: csv['พื้นที่'] || '',
        description: cleanHtml(csv.detail_poolvilla || ''),
        shortDescription: `พูลวิลล่า ${csv.bedroom || 0} ห้องนอน ${csv.bathroom || 0} ห้องน้ำ รองรับ ${csv.maximum_occupancy || 0} ท่าน`,
        nearbyPlaces: cleanHtml(csv.nearby_places || ''),
        rules: cleanHtml(csv.rules || ''),
        note: cleanHtml(csv.note || ''),
        detailRoom: cleanHtml(csv.detail_room || ''),
        bedrooms: parseInt(csv.bedroom) || 0,
        bathrooms: parseInt(csv.bathroom) || 0,
        maxGuests: parseInt(csv.maximum_occupancy) || 0,
        pricePerNight: parsePrice(csv.price_s || csv.price),
        averagePrice: csv.average_price || '',
        farFromSea: csv.far_from_the_sea || '',
        parking: parseInt(csv.parking) || 0,
        pets: csv.pets === 'รับสัตว์เลี้ยง',
        checkInTime: csv.check_in_after || '14:00',
        checkOutTime: csv.check_out_early || '11:00',
        amenities: extractAmenities(csv.detail_poolvilla || ''),
        images: [],
        address: '',
        latitude: null,
        longitude: null,
        isActive: true,
        isFeatured: i < 4, // First 4 houses are featured
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(10 + Math.random() * 40),
        sortOrder: i + 1,
        csvId: parseInt(csv.ID) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(ref, house);
      results.push({ id: docRef.id, name: house.name, code: house.code });
    }

    return NextResponse.json({
      message: `Imported ${results.length} houses`,
      houses: results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error.message },
      { status: 500 }
    );
  }
}
