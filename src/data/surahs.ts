import { SurahMeta, Reciter, QuranVerse } from '../types/quran';
import { extractCleanWords } from '../utils/arabicMatcher';

export const RECITERS: Reciter[] = [
  {
    id: 'Hudhaify_128kbps',
    name_ar: 'الشيخ الحذيفي',
    name_en: 'Al-Hudhaify',
    identifier: 'Hudhaify_128kbps',
    style: 'ترتيل متقن',
  },
  {
    id: 'Husary_Muallim_128kbps',
    name_ar: 'الحصري (المصحف المعلم)',
    name_en: 'Al-Husary (Muallim)',
    identifier: 'Husary_Muallim_128kbps',
    style: 'تعليمي',
  },
];

export const SURAHS_LIST: SurahMeta[] = [
  { id: 1, name_ar: "الفاتحة", name_en: "Al-Fatihah", verse_count: 7, page_start: 1, page_end: 1, revelation_type: "meccan", juz: 1 },
  { id: 2, name_ar: "البقرة", name_en: "Al-Baqarah", verse_count: 286, page_start: 2, page_end: 49, revelation_type: "medinan", juz: 1 },
  { id: 3, name_ar: "آل عمران", name_en: "Ali 'Imran", verse_count: 200, page_start: 50, page_end: 76, revelation_type: "medinan", juz: 3 },
  { id: 4, name_ar: "النساء", name_en: "An-Nisa", verse_count: 176, page_start: 77, page_end: 106, revelation_type: "medinan", juz: 4 },
  { id: 5, name_ar: "المائدة", name_en: "Al-Ma'idah", verse_count: 120, page_start: 106, page_end: 127, revelation_type: "medinan", juz: 6 },
  { id: 6, name_ar: "الأنعام", name_en: "Al-An'am", verse_count: 165, page_start: 128, page_end: 150, revelation_type: "meccan", juz: 7 },
  { id: 7, name_ar: "الأعراف", name_en: "Al-A'raf", verse_count: 206, page_start: 151, page_end: 176, revelation_type: "meccan", juz: 8 },
  { id: 8, name_ar: "الأنفال", name_en: "Al-Anfal", verse_count: 75, page_start: 177, page_end: 186, revelation_type: "medinan", juz: 9 },
  { id: 9, name_ar: "التوبة", name_en: "At-Tawbah", verse_count: 129, page_start: 187, page_end: 207, revelation_type: "medinan", juz: 10 },
  { id: 10, name_ar: "يونس", name_en: "Yunus", verse_count: 109, page_start: 208, page_end: 221, revelation_type: "meccan", juz: 11 },
  { id: 11, name_ar: "هود", name_en: "Hud", verse_count: 123, page_start: 221, page_end: 235, revelation_type: "meccan", juz: 11 },
  { id: 12, name_ar: "يوسف", name_en: "Yusuf", verse_count: 111, page_start: 235, page_end: 248, revelation_type: "meccan", juz: 12 },
  { id: 13, name_ar: "الرعد", name_en: "Ar-Ra'd", verse_count: 43, page_start: 249, page_end: 255, revelation_type: "medinan", juz: 13 },
  { id: 14, name_ar: "إبراهيم", name_en: "Ibrahim", verse_count: 52, page_start: 255, page_end: 261, revelation_type: "meccan", juz: 13 },
  { id: 15, name_ar: "الحجر", name_en: "Al-Hijr", verse_count: 99, page_start: 262, page_end: 267, revelation_type: "meccan", juz: 14 },
  { id: 16, name_ar: "النحل", name_en: "An-Nahl", verse_count: 128, page_start: 267, page_end: 281, revelation_type: "meccan", juz: 14 },
  { id: 17, name_ar: "الإسراء", name_en: "Al-Isra", verse_count: 111, page_start: 282, page_end: 293, revelation_type: "meccan", juz: 15 },
  { id: 18, name_ar: "الكهف", name_en: "Al-Kahf", verse_count: 110, page_start: 293, page_end: 304, revelation_type: "meccan", juz: 15 },
  { id: 19, name_ar: "مريم", name_en: "Maryam", verse_count: 98, page_start: 305, page_end: 312, revelation_type: "meccan", juz: 16 },
  { id: 20, name_ar: "طه", name_en: "Taha", verse_count: 135, page_start: 312, page_end: 321, revelation_type: "meccan", juz: 16 },
  { id: 21, name_ar: "الأنبياء", name_en: "Al-Anbiya", verse_count: 112, page_start: 322, page_end: 331, revelation_type: "meccan", juz: 17 },
  { id: 22, name_ar: "الحج", name_en: "Al-Hajj", verse_count: 78, page_start: 332, page_end: 341, revelation_type: "medinan", juz: 17 },
  { id: 23, name_ar: "المؤمنون", name_en: "Al-Mu'minun", verse_count: 118, page_start: 342, page_end: 349, revelation_type: "meccan", juz: 18 },
  { id: 24, name_ar: "النور", name_en: "An-Nur", verse_count: 64, page_start: 350, page_end: 359, revelation_type: "medinan", juz: 18 },
  { id: 25, name_ar: "الفرقان", name_en: "Al-Furqan", verse_count: 77, page_start: 359, page_end: 366, revelation_type: "meccan", juz: 18 },
  { id: 26, name_ar: "الشعراء", name_en: "Ash-Shu'ara", verse_count: 227, page_start: 367, page_end: 376, revelation_type: "meccan", juz: 19 },
  { id: 27, name_ar: "النمل", name_en: "An-Naml", verse_count: 93, page_start: 377, page_end: 385, revelation_type: "meccan", juz: 19 },
  { id: 28, name_ar: "القصص", name_en: "Al-Qasas", verse_count: 88, page_start: 385, page_end: 396, revelation_type: "meccan", juz: 20 },
  { id: 29, name_ar: "العنكبوت", name_en: "Al-'Ankabut", verse_count: 69, page_start: 396, page_end: 404, revelation_type: "meccan", juz: 20 },
  { id: 30, name_ar: "الروم", name_en: "Ar-Rum", verse_count: 60, page_start: 404, page_end: 410, revelation_type: "meccan", juz: 21 },
  { id: 31, name_ar: "لقمان", name_en: "Luqman", verse_count: 34, page_start: 411, page_end: 414, revelation_type: "meccan", juz: 21 },
  { id: 32, name_ar: "السجدة", name_en: "As-Sajdah", verse_count: 30, page_start: 415, page_end: 417, revelation_type: "meccan", juz: 21 },
  { id: 33, name_ar: "الأحزاب", name_en: "Al-Ahzab", verse_count: 73, page_start: 418, page_end: 427, revelation_type: "medinan", juz: 21 },
  { id: 34, name_ar: "سبأ", name_en: "Saba", verse_count: 54, page_start: 428, page_end: 434, revelation_type: "meccan", juz: 22 },
  { id: 35, name_ar: "فاطر", name_en: "Fatir", verse_count: 45, page_start: 434, page_end: 440, revelation_type: "meccan", juz: 22 },
  { id: 36, name_ar: "يس", name_en: "Ya-Sin", verse_count: 83, page_start: 440, page_end: 445, revelation_type: "meccan", juz: 22 },
  { id: 37, name_ar: "الصافات", name_en: "As-Saffat", verse_count: 182, page_start: 446, page_end: 452, revelation_type: "meccan", juz: 23 },
  { id: 38, name_ar: "ص", name_en: "Sad", verse_count: 88, page_start: 453, page_end: 458, revelation_type: "meccan", juz: 23 },
  { id: 39, name_ar: "الزمر", name_en: "Az-Zumar", verse_count: 75, page_start: 458, page_end: 467, revelation_type: "meccan", juz: 23 },
  { id: 40, name_ar: "غافر", name_en: "Ghafir", verse_count: 85, page_start: 467, page_end: 476, revelation_type: "meccan", juz: 24 },
  { id: 41, name_ar: "فصلت", name_en: "Fussilat", verse_count: 54, page_start: 477, page_end: 482, revelation_type: "meccan", juz: 24 },
  { id: 42, name_ar: "الشورى", name_en: "Ash-Shura", verse_count: 53, page_start: 483, page_end: 489, revelation_type: "meccan", juz: 25 },
  { id: 43, name_ar: "الزخرف", name_en: "Az-Zukhruf", verse_count: 89, page_start: 489, page_end: 495, revelation_type: "meccan", juz: 25 },
  { id: 44, name_ar: "الدخان", name_en: "Ad-Dukhan", verse_count: 59, page_start: 496, page_end: 498, revelation_type: "meccan", juz: 25 },
  { id: 45, name_ar: "الجاثية", name_en: "Al-Jathiyah", verse_count: 37, page_start: 499, page_end: 502, revelation_type: "meccan", juz: 25 },
  { id: 46, name_ar: "الأحقاف", name_en: "Al-Ahqaf", verse_count: 35, page_start: 502, page_end: 506, revelation_type: "meccan", juz: 26 },
  { id: 47, name_ar: "محمد", name_en: "Muhammad", verse_count: 38, page_start: 507, page_end: 510, revelation_type: "medinan", juz: 26 },
  { id: 48, name_ar: "الفتح", name_en: "Al-Fath", verse_count: 29, page_start: 511, page_end: 515, revelation_type: "medinan", juz: 26 },
  { id: 49, name_ar: "الحجرات", name_en: "Al-Hujurat", verse_count: 18, page_start: 515, page_end: 517, revelation_type: "medinan", juz: 26 },
  { id: 50, name_ar: "ق", name_en: "Qaf", verse_count: 45, page_start: 518, page_end: 520, revelation_type: "meccan", juz: 26 },
  { id: 51, name_ar: "الذاريات", name_en: "Adh-Dhariyat", verse_count: 60, page_start: 520, page_end: 523, revelation_type: "meccan", juz: 26 },
  { id: 52, name_ar: "الطور", name_en: "At-Tur", verse_count: 49, page_start: 523, page_end: 525, revelation_type: "meccan", juz: 27 },
  { id: 53, name_ar: "النجم", name_en: "An-Najm", verse_count: 62, page_start: 526, page_end: 528, revelation_type: "meccan", juz: 27 },
  { id: 54, name_ar: "القمر", name_en: "Al-Qamar", verse_count: 55, page_start: 528, page_end: 531, revelation_type: "meccan", juz: 27 },
  { id: 55, name_ar: "الرحمن", name_en: "Ar-Rahman", verse_count: 78, page_start: 531, page_end: 534, revelation_type: "medinan", juz: 27 },
  { id: 56, name_ar: "الواقعة", name_en: "Al-Waqi'ah", verse_count: 96, page_start: 534, page_end: 537, revelation_type: "meccan", juz: 27 },
  { id: 57, name_ar: "الحديد", name_en: "Al-Hadid", verse_count: 29, page_start: 537, page_end: 541, revelation_type: "medinan", juz: 27 },
  { id: 58, name_ar: "المجادلة", name_en: "Al-Mujadila", verse_count: 22, page_start: 542, page_end: 545, revelation_type: "medinan", juz: 28 },
  { id: 59, name_ar: "الحشر", name_en: "Al-Hashr", verse_count: 24, page_start: 545, page_end: 548, revelation_type: "medinan", juz: 28 },
  { id: 60, name_ar: "الممتحنة", name_en: "Al-Mumtahanah", verse_count: 13, page_start: 549, page_end: 551, revelation_type: "medinan", juz: 28 },
  { id: 61, name_ar: "الصف", name_en: "As-Saff", verse_count: 14, page_start: 551, page_end: 553, revelation_type: "medinan", juz: 28 },
  { id: 62, name_ar: "الجمعة", name_en: "Al-Jumu'ah", verse_count: 11, page_start: 553, page_end: 554, revelation_type: "medinan", juz: 28 },
  { id: 63, name_ar: "المنافقون", name_en: "Al-Munafiqun", verse_count: 11, page_start: 554, page_end: 555, revelation_type: "medinan", juz: 28 },
  { id: 64, name_ar: "التغابن", name_en: "At-Taghabun", verse_count: 18, page_start: 556, page_end: 557, revelation_type: "medinan", juz: 28 },
  { id: 65, name_ar: "الطلاق", name_en: "At-Talaq", verse_count: 12, page_start: 558, page_end: 559, revelation_type: "medinan", juz: 28 },
  { id: 66, name_ar: "التحريم", name_en: "At-Tahrim", verse_count: 12, page_start: 560, page_end: 561, revelation_type: "medinan", juz: 28 },
  { id: 67, name_ar: "الملك", name_en: "Al-Mulk", verse_count: 30, page_start: 562, page_end: 564, revelation_type: "meccan", juz: 29 },
  { id: 68, name_ar: "القلم", name_en: "Al-Qalam", verse_count: 52, page_start: 564, page_end: 566, revelation_type: "meccan", juz: 29 },
  { id: 69, name_ar: "الحاقة", name_en: "Al-Haqqah", verse_count: 52, page_start: 566, page_end: 568, revelation_type: "meccan", juz: 29 },
  { id: 70, name_ar: "المعارج", name_en: "Al-Ma'arij", verse_count: 44, page_start: 568, page_end: 570, revelation_type: "meccan", juz: 29 },
  { id: 71, name_ar: "نوح", name_en: "Nuh", verse_count: 28, page_start: 570, page_end: 571, revelation_type: "meccan", juz: 29 },
  { id: 72, name_ar: "الجن", name_en: "Al-Jinn", verse_count: 28, page_start: 572, page_end: 573, revelation_type: "meccan", juz: 29 },
  { id: 73, name_ar: "المزمل", name_en: "Al-Muzzammil", verse_count: 20, page_start: 574, page_end: 575, revelation_type: "meccan", juz: 29 },
  { id: 74, name_ar: "المدثر", name_en: "Al-Muddaththir", verse_count: 56, page_start: 575, page_end: 577, revelation_type: "meccan", juz: 29 },
  { id: 75, name_ar: "القيامة", name_en: "Al-Qiyamah", verse_count: 40, page_start: 577, page_end: 578, revelation_type: "meccan", juz: 29 },
  { id: 76, name_ar: "الإنسان", name_en: "Al-Insan", verse_count: 31, page_start: 578, page_end: 580, revelation_type: "medinan", juz: 29 },
  { id: 77, name_ar: "المرسلات", name_en: "Al-Mursalat", verse_count: 50, page_start: 580, page_end: 581, revelation_type: "meccan", juz: 29 },
  { id: 78, name_ar: "النبأ", name_en: "An-Naba", verse_count: 40, page_start: 582, page_end: 583, revelation_type: "meccan", juz: 30 },
  { id: 79, name_ar: "النازعات", name_en: "An-Nazi'at", verse_count: 46, page_start: 583, page_end: 584, revelation_type: "meccan", juz: 30 },
  { id: 80, name_ar: "عبس", name_en: "'Abasa", verse_count: 42, page_start: 585, page_end: 586, revelation_type: "meccan", juz: 30 },
  { id: 81, name_ar: "التكوير", name_en: "At-Takwir", verse_count: 29, page_start: 586, page_end: 586, revelation_type: "meccan", juz: 30 },
  { id: 82, name_ar: "الانفطار", name_en: "Al-Infitar", verse_count: 19, page_start: 587, page_end: 587, revelation_type: "meccan", juz: 30 },
  { id: 83, name_ar: "المطففين", name_en: "Al-Mutaffifin", verse_count: 36, page_start: 587, page_end: 589, revelation_type: "meccan", juz: 30 },
  { id: 84, name_ar: "الانشقاق", name_en: "Al-Inshiqaq", verse_count: 25, page_start: 589, page_end: 590, revelation_type: "meccan", juz: 30 },
  { id: 85, name_ar: "البروج", name_en: "Al-Buruj", verse_count: 22, page_start: 590, page_end: 590, revelation_type: "meccan", juz: 30 },
  { id: 86, name_ar: "الطارق", name_en: "At-Tariq", verse_count: 17, page_start: 591, page_end: 591, revelation_type: "meccan", juz: 30 },
  { id: 87, name_ar: "الأعلى", name_en: "Al-A'la", verse_count: 19, page_start: 591, page_end: 592, revelation_type: "meccan", juz: 30 },
  { id: 88, name_ar: "الغاشية", name_en: "Al-Ghashiyah", verse_count: 26, page_start: 592, page_end: 593, revelation_type: "meccan", juz: 30 },
  { id: 89, name_ar: "الفجر", name_en: "Al-Fajr", verse_count: 30, page_start: 593, page_end: 594, revelation_type: "meccan", juz: 30 },
  { id: 90, name_ar: "البلد", name_en: "Al-Balad", verse_count: 20, page_start: 594, page_end: 595, revelation_type: "meccan", juz: 30 },
  { id: 91, name_ar: "الشمس", name_en: "Ash-Shams", verse_count: 15, page_start: 595, page_end: 595, revelation_type: "meccan", juz: 30 },
  { id: 92, name_ar: "الليل", name_en: "Al-Layl", verse_count: 21, page_start: 595, page_end: 596, revelation_type: "meccan", juz: 30 },
  { id: 93, name_ar: "الضحى", name_en: "Ad-Duha", verse_count: 11, page_start: 596, page_end: 596, revelation_type: "meccan", juz: 30 },
  { id: 94, name_ar: "الشرح", name_en: "Ash-Sharh", verse_count: 8, page_start: 596, page_end: 596, revelation_type: "meccan", juz: 30 },
  { id: 95, name_ar: "التين", name_en: "At-Tin", verse_count: 8, page_start: 597, page_end: 597, revelation_type: "meccan", juz: 30 },
  { id: 96, name_ar: "العلق", name_en: "Al-'Alaq", verse_count: 19, page_start: 597, page_end: 597, revelation_type: "meccan", juz: 30 },
  { id: 97, name_ar: "القدر", name_en: "Al-Qadr", verse_count: 5, page_start: 598, page_end: 598, revelation_type: "meccan", juz: 30 },
  { id: 98, name_ar: "البينة", name_en: "Al-Bayyinah", verse_count: 8, page_start: 598, page_end: 599, revelation_type: "medinan", juz: 30 },
  { id: 99, name_ar: "الزلزلة", name_en: "Az-Zalzalah", verse_count: 8, page_start: 599, page_end: 599, revelation_type: "medinan", juz: 30 },
  { id: 100, name_ar: "العاديات", name_en: "Al-'Adiyat", verse_count: 11, page_start: 599, page_end: 600, revelation_type: "meccan", juz: 30 },
  { id: 101, name_ar: "القارعة", name_en: "Al-Qari'ah", verse_count: 11, page_start: 600, page_end: 600, revelation_type: "meccan", juz: 30 },
  { id: 102, name_ar: "التكاثر", name_en: "At-Takathur", verse_count: 8, page_start: 600, page_end: 600, revelation_type: "meccan", juz: 30 },
  { id: 103, name_ar: "العصر", name_en: "Al-'Asr", verse_count: 3, page_start: 601, page_end: 601, revelation_type: "meccan", juz: 30 },
  { id: 104, name_ar: "الهمزة", name_en: "Al-Humazah", verse_count: 9, page_start: 601, page_end: 601, revelation_type: "meccan", juz: 30 },
  { id: 105, name_ar: "الفيل", name_en: "Al-Fil", verse_count: 5, page_start: 601, page_end: 601, revelation_type: "meccan", juz: 30 },
  { id: 106, name_ar: "قريش", name_en: "Quraysh", verse_count: 4, page_start: 602, page_end: 602, revelation_type: "meccan", juz: 30 },
  { id: 107, name_ar: "الماعون", name_en: "Al-Ma'un", verse_count: 7, page_start: 602, page_end: 602, revelation_type: "meccan", juz: 30 },
  { id: 108, name_ar: "الكوثر", name_en: "Al-Kawthar", verse_count: 3, page_start: 602, page_end: 602, revelation_type: "meccan", juz: 30 },
  { id: 109, name_ar: "الكافرون", name_en: "Al-Kafirun", verse_count: 6, page_start: 603, page_end: 603, revelation_type: "meccan", juz: 30 },
  { id: 110, name_ar: "النصر", name_en: "An-Nasr", verse_count: 3, page_start: 603, page_end: 603, revelation_type: "medinan", juz: 30 },
  { id: 111, name_ar: "المسد", name_en: "Al-Masad", verse_count: 5, page_start: 603, page_end: 603, revelation_type: "meccan", juz: 30 },
  { id: 112, name_ar: "الإخلاص", name_en: "Al-Ikhlas", verse_count: 4, page_start: 604, page_end: 604, revelation_type: "meccan", juz: 30 },
  { id: 113, name_ar: "الفلق", name_en: "Al-Falaq", verse_count: 5, page_start: 604, page_end: 604, revelation_type: "meccan", juz: 30 },
  { id: 114, name_ar: "الناس", name_en: "An-Nas", verse_count: 6, page_start: 604, page_end: 604, revelation_type: "meccan", juz: 30 }
];

export function getKingFahdPageUrl(pageNumber: number): string {
  const padded = String(pageNumber).padStart(3, '0');
  return `https://files.quran.app/hafs/madani/width_1024/page${padded}.png`;
}

export function getVerseAudioUrl(reciterIdentifier: string, surahId: number, ayahNumber: number): string {
  const paddedSurah = String(surahId).padStart(3, '0');
  const paddedAyah = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/${reciterIdentifier}/${paddedSurah}${paddedAyah}.mp3`;
}

// Built-in verified datasets for instant offline/zero-latency startup
export const PRELOADED_SURAHS_DATA: Record<number, { ayah: number; text: string; page: number }[]> = {
  // Al-Fatiha
  1: [
    { ayah: 1, text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", page: 1 },
    { ayah: 2, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", page: 1 },
    { ayah: 3, text: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", page: 1 },
    { ayah: 4, text: "مَـٰلِكِ يَوْمِ ٱلدِّينِ", page: 1 },
    { ayah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", page: 1 },
    { ayah: 6, text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", page: 1 },
    { ayah: 7, text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", page: 1 },
  ],
  // Al-Baqarah (First 5 Ayahs + Ayat Al-Kursi)
  2: [
    { ayah: 1, text: "الم", page: 2 },
    { ayah: 2, text: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", page: 2 },
    { ayah: 3, text: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ", page: 2 },
    { ayah: 4, text: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ", page: 2 },
    { ayah: 5, text: "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ", page: 2 },
  ],
  // Al-Mulk (first 10 Ayahs)
  67: [
    { ayah: 1, text: "تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ", page: 562 },
    { ayah: 2, text: "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ", page: 562 },
    { ayah: 3, text: "ٱلَّذِى خَلَقَ سَبْعَ سَمَـٰوَٰتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَـٰنِ مِن تَفَـٰوُتٍ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ", page: 562 },
    { ayah: 4, text: "ثُمَّ ٱرْجِعِ ٱلْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ ٱلْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", page: 562 },
    { ayah: 5, text: "وَلَقَدْ زَيَّنَّا ٱلسَّمَآءَ ٱلدُّنْيَا بِمَصَـٰبِيحَ وَجَعَلْنَـٰهَا رُجُومًا لِّلشَّيَـٰطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ ٱلسَّعِيرِ", page: 562 },
  ],
  // Al-Ikhlas
  112: [
    { ayah: 1, text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", page: 604 },
    { ayah: 2, text: "ٱللَّهُ ٱلصَّمَدُ", page: 604 },
    { ayah: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", page: 604 },
    { ayah: 4, text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", page: 604 },
  ],
  // Al-Falaq
  113: [
    { ayah: 1, text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", page: 604 },
    { ayah: 2, text: "مِن شَرِّ مَا خَلَقَ", page: 604 },
    { ayah: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", page: 604 },
    { ayah: 4, text: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ", page: 604 },
    { ayah: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", page: 604 },
  ],
  // An-Nas
  114: [
    { ayah: 1, text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", page: 604 },
    { ayah: 2, text: "مَلِكِ ٱلنَّاسِ", page: 604 },
    { ayah: 3, text: "إِلَـٰهِ ٱلنَّاسِ", page: 604 },
    { ayah: 4, text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", page: 604 },
    { ayah: 5, text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", page: 604 },
    { ayah: 6, text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", page: 604 },
  ],
  // Al-Asr
  103: [
    { ayah: 1, text: "وَٱلْعَصْرِ", page: 601 },
    { ayah: 2, text: "إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ", page: 601 },
    { ayah: 3, text: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ", page: 601 },
  ],
  // Al-Kawthar
  108: [
    { ayah: 1, text: "إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ", page: 602 },
    { ayah: 2, text: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ", page: 602 },
    { ayah: 3, text: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ", page: 602 },
  ],
  // An-Naba (first 5 Ayahs)
  78: [
    { ayah: 1, text: "عَمَّ يَتَسَآءَلُونَ", page: 582 },
    { ayah: 2, text: "عَنِ ٱلنَّبَإِ ٱلْعَظِيمِ", page: 582 },
    { ayah: 3, text: "ٱلَّذِى هُمْ فِيهِ مُخْتَلِفُونَ", page: 582 },
    { ayah: 4, text: "كَلَّا سَيَعْلَمُونَ", page: 582 },
    { ayah: 5, text: "ثُمَّ كَلَّا سَيَعْلَمُونَ", page: 582 },
  ]
};

// In-memory cache for dynamic fetched surahs & pages
const surahCache: Record<number, QuranVerse[]> = {};
const pageCache: Record<number, QuranVerse[]> = {};

/**
 * Fetch verses for any Surah from Quran API with fallback to built-in datasets
 */
export async function fetchSurahVerses(surahId: number, reciterId: string = RECITERS[0].identifier): Promise<QuranVerse[]> {
  if (surahCache[surahId] && surahCache[surahId].length > 0) {
    return surahCache[surahId].map(v => ({
      ...v,
      audio_url: getVerseAudioUrl(reciterId, surahId, v.ayah_number),
    }));
  }

  try {
    // Fetch official verses with exact page_number and text_uthmani from Quran.com API v4
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahId}?per_page=300&words=false&fields=text_uthmani,verse_key,page_number,juz_number`);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    const meta = SURAHS_LIST.find(s => s.id === surahId);

    const verses: QuranVerse[] = data.verses.map((v: { verse_key: string; text_uthmani: string; page_number?: number; juz_number?: number }, index: number) => {
      const ayahNumber = index + 1;
      const wordsData = extractCleanWords(v.text_uthmani);
      const pageNumber = v.page_number || meta?.page_start || 1;
      const juzNumber = v.juz_number || meta?.juz || 1;

      return {
        surah_id: surahId,
        ayah_number: ayahNumber,
        verse_key: v.verse_key,
        text_uthmani: v.text_uthmani,
        text_clean: wordsData.map(w => w.text_clean).join(' '),
        words: wordsData.map((w, idx) => ({
          id: idx + 1,
          position: idx + 1,
          text_uthmani: w.text_uthmani,
          text_clean: w.text_clean,
          is_hidden: false,
          status: 'pending',
        })),
        page_number: pageNumber,
        juz_number: juzNumber,
        audio_url: getVerseAudioUrl(reciterId, surahId, ayahNumber),
      };
    });

    surahCache[surahId] = verses;
    return verses;
  } catch (err) {
    console.warn(`Failed to fetch from Quran.com API for surah ${surahId}, using fallback:`, err);
    if (PRELOADED_SURAHS_DATA[surahId]) {
      return PRELOADED_SURAHS_DATA[surahId].map(item => {
        const wordsData = extractCleanWords(item.text);
        return {
          surah_id: surahId,
          ayah_number: item.ayah,
          verse_key: `${surahId}:${item.ayah}`,
          text_uthmani: item.text,
          text_clean: wordsData.map(w => w.text_clean).join(' '),
          words: wordsData.map((w, idx) => ({
            id: idx + 1,
            position: idx + 1,
            text_uthmani: w.text_uthmani,
            text_clean: w.text_clean,
            is_hidden: false,
            status: 'pending',
          })),
          page_number: item.page,
          juz_number: SURAHS_LIST.find(s => s.id === surahId)?.juz || 1,
          audio_url: getVerseAudioUrl(reciterId, surahId, item.ayah),
        };
      });
    }
    throw err;
  }
}

/**
 * Fetch verses for a range of pages in King Fahd Mushaf (1 to 604)
 */
export async function fetchPagesVerses(
  startPage: number,
  endPage: number,
  reciterId: string = RECITERS[0].identifier
): Promise<QuranVerse[]> {
  const safeStart = Math.max(1, Math.min(startPage, 604));
  const safeEnd = Math.max(safeStart, Math.min(endPage, 604));
  const pageNumbers: number[] = [];
  for (let p = safeStart; p <= safeEnd; p++) {
    pageNumbers.push(p);
  }

  const allVerses: QuranVerse[] = [];

  for (const pageNum of pageNumbers) {
    if (pageCache[pageNum] && pageCache[pageNum].length > 0) {
      allVerses.push(...pageCache[pageNum].map(v => ({
        ...v,
        audio_url: getVerseAudioUrl(reciterId, v.surah_id, v.ayah_number),
      })));
      continue;
    }

    try {
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_page/${pageNum}?words=false&fields=text_uthmani,verse_key,page_number,juz_number`);
      if (!res.ok) throw new Error(`Page ${pageNum} API error: ${res.status}`);
      const data = await res.json();

      const pageVerses: QuranVerse[] = data.verses.map((v: { verse_key: string; text_uthmani: string; page_number?: number; juz_number?: number }) => {
        const [sStr, aStr] = v.verse_key.split(':');
        const sId = parseInt(sStr, 10);
        const aNum = parseInt(aStr, 10);
        const wordsData = extractCleanWords(v.text_uthmani);

        return {
          surah_id: sId,
          ayah_number: aNum,
          verse_key: v.verse_key,
          text_uthmani: v.text_uthmani,
          text_clean: wordsData.map(w => w.text_clean).join(' '),
          words: wordsData.map((w, idx) => ({
            id: idx + 1,
            position: idx + 1,
            text_uthmani: w.text_uthmani,
            text_clean: w.text_clean,
            is_hidden: false,
            status: 'pending',
          })),
          page_number: v.page_number || pageNum,
          juz_number: v.juz_number || 1,
          audio_url: getVerseAudioUrl(reciterId, sId, aNum),
        };
      });

      pageCache[pageNum] = pageVerses;
      allVerses.push(...pageVerses);
    } catch (err) {
      console.warn(`Failed to fetch page ${pageNum}:`, err);
    }
  }

  if (allVerses.length === 0) {
    // Fallback to Fatihah
    return fetchSurahVerses(1, reciterId);
  }

  return allVerses;
}

