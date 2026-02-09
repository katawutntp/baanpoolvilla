import { format, parseISO, isValid, differenceInDays, addDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';

export function formatDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, fmt, { locale: th });
}

export function formatDateEN(date, fmt = 'dd MMM yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, fmt);
}

export function toDateString(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatPrice(price) {
  if (!price && price !== 0) return '-';
  return new Intl.NumberFormat('th-TH').format(price);
}

export function formatPriceCurrency(price) {
  if (!price && price !== 0) return '-';
  return `฿${new Intl.NumberFormat('th-TH').format(price)}`;
}

export function getDaysBetween(start, end) {
  if (!start || !end) return 0;
  return differenceInDays(end, start);
}

export function getDateRange(start, end) {
  const dates = [];
  let current = new Date(start);
  const endDate = new Date(end);
  while (isBefore(current, endDate) || isSameDay(current, endDate)) {
    dates.push(toDateString(current));
    current = addDays(current, 1);
  }
  return dates;
}

export function isDateInRange(date, start, end) {
  const d = new Date(date);
  return (isAfter(d, start) || isSameDay(d, start)) && (isBefore(d, end) || isSameDay(d, end));
}

export function getStatusColor(status) {
  switch (status) {
    case 'booked':
    case 'confirmed':
      return 'bg-red-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'available':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
}

export function getStatusText(status) {
  switch (status) {
    case 'booked':
    case 'confirmed':
      return 'จองแล้ว';
    case 'pending':
      return 'รอยืนยัน';
    case 'available':
      return 'ว่าง';
    default:
      return 'ไม่ระบุ';
  }
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export const ZONES = [
  { value: 'bangsaen', label: 'บางแสน' },
  { value: 'pattaya', label: 'พัทยา' },
  { value: 'sattahip', label: 'สัตหีบ' },
  { value: 'rayong', label: 'ระยอง' },
  { value: 'huahin', label: 'หัวหิน' },
  { value: 'khaoyai', label: 'เขาใหญ่' },
  { value: 'other', label: 'อื่นๆ' },
];

export const AMENITIES_LIST = [
  { value: 'pool', label: 'สระว่ายน้ำส่วนตัว', icon: '🏊' },
  { value: 'wifi', label: 'WiFi ฟรี', icon: '📶' },
  { value: 'parking', label: 'ที่จอดรถ', icon: '🅿️' },
  { value: 'kitchen', label: 'ห้องครัว', icon: '🍳' },
  { value: 'bbq', label: 'เตาบาร์บีคิว', icon: '🔥' },
  { value: 'karaoke', label: 'คาราโอเกะ', icon: '🎤' },
  { value: 'tv', label: 'ทีวีจอใหญ่', icon: '📺' },
  { value: 'aircon', label: 'แอร์ทุกห้อง', icon: '❄️' },
  { value: 'washer', label: 'เครื่องซักผ้า', icon: '🧺' },
  { value: 'garden', label: 'สวน', icon: '🌳' },
  { value: 'gym', label: 'ฟิตเนส', icon: '💪' },
  { value: 'waterslide', label: 'สไลเดอร์น้ำ', icon: '🎢' },
  { value: 'jacuzzi', label: 'จากุซซี่', icon: '🛁' },
  { value: 'playground', label: 'สนามเด็กเล่น', icon: '🎠' },
  { value: 'pet', label: 'สัตว์เลี้ยงเข้าได้', icon: '🐕' },
];

export function getAmenityInfo(value) {
  return AMENITIES_LIST.find((a) => a.value === value) || { value, label: value, icon: '✨' };
}
