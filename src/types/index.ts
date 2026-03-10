export interface Innovation {
  id: number;
  code: string;
  cat: string;
  name: string;
  innovator: string;
  desc: string;
  lat: number;
  lng: number;
}

export const CATEGORIES: Record<string, { color: string; icon: string; label: string; labelEn: string }> = {
  'อาหารและแปรรูป': { color: '#f97316', icon: '🍽️', label: 'อาหารและแปรรูป', labelEn: 'Food' },
  'หัตถกรรม/สิ่งทอ': { color: '#a855f7', icon: '🧶', label: 'หัตถกรรม/สิ่งทอ', labelEn: 'Crafts' },
  'สิ่งแวดล้อม': { color: '#22c55e', icon: '🌿', label: 'สิ่งแวดล้อม', labelEn: 'Environment' },
  'สุขภาพ': { color: '#ec4899', icon: '💊', label: 'สุขภาพ', labelEn: 'Health' },
  'เกษตรอัจฉริยะ': { color: '#84cc16', icon: '🌾', label: 'เกษตรอัจฉริยะ', labelEn: 'Smart Agri' },
  'ดิจิทัล/AI': { color: '#3b82f6', icon: '💻', label: 'ดิจิทัล/AI', labelEn: 'Digital/AI' },
  'ท่องเที่ยว': { color: '#14b8a6', icon: '🗺️', label: 'ท่องเที่ยว', labelEn: 'Tourism' },
};

export interface Province {
  name: string;
  nameEn: string;
  coord: [number, number];
}

export const PROVINCES: Province[] = [
  { name: 'เชียงใหม่', nameEn: 'Chiang Mai', coord: [98.9817, 18.7883] },
  { name: 'เชียงราย', nameEn: 'Chiang Rai', coord: [99.8325, 19.9070] },
  { name: 'ลำปาง', nameEn: 'Lampang', coord: [99.5087, 18.2888] },
  { name: 'ลำพูน', nameEn: 'Lamphun', coord: [99.0087, 18.5744] },
  { name: 'แม่ฮ่องสอน', nameEn: 'Mae Hong Son', coord: [97.9654, 19.2990] },
  { name: 'น่าน', nameEn: 'Nan', coord: [100.7730, 18.7756] },
  { name: 'พะเยา', nameEn: 'Phayao', coord: [99.9022, 19.1664] },
  { name: 'แพร่', nameEn: 'Phrae', coord: [100.1399, 18.1445] },
  { name: 'ตาก', nameEn: 'Tak', coord: [99.1258, 16.8840] },
];
