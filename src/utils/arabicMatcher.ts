/**
 * Enhanced Normalization & Alignment Engine for Quranic Arabic recitation and speech recognition.
 */

// Specific high-frequency Quranic spelling mappings to match speech recognition output
const QURANIC_NORMALIZED_EXCEPTIONS: Record<string, string> = {
  'ٱلرَّحْمَـٰنِ': 'الرحمن',
  'ٱلرَّحْمَـٰنُ': 'الرحمن',
  'الرَّحْمَـٰنِ': 'الرحمن',
  'مَـٰلِكِ': 'مالك',
  'أُو۟لَـٰٓئِكَ': 'اولئك',
  'ٱلصَّلَوٰةَ': 'الصلاة',
  'ٱلصَّلَوٰةِ': 'الصلاة',
  'ٱلصَّلَوٰةُ': 'الصلاة',
  'صَلَوٰةَ': 'صلاة',
  'صَلَوٰةٍ': 'صلاة',
  'ٱلزَّكَوٰةَ': 'الزكاة',
  'ٱلزَّكَوٰةِ': 'الزكاة',
  'زَكَوٰةً': 'زكاة',
  'ٱلْحَيَوٰةَ': 'الحياة',
  'ٱلْحَيَوٰةِ': 'الحياة',
  'ٱلرِّبَوٰا۟': 'الربا',
  'سَمَـٰوَٰتٍ': 'سماوات',
  'ٱلسَّمَـٰوَٰتِ': 'السماوات',
  'ٱلسَّمَـٰوَٰتُ': 'السماوات',
  'إِبْرَٰهِـۧمَ': 'ابراهيم',
  'إِبْرَٰهِيمَ': 'ابراهيم',
  'إِسْمَـٰعِيلَ': 'اسماعيل',
  'إِسْحَـٰقَ': 'اسحاق',
  'إِسْرَٰٓءِيلَ': 'اسرائيل',
  'هَـٰذَا': 'هذا',
  'هَـٰذِهِ': 'هذه',
  'هَـٰٓؤُلَآءِ': 'هؤلاء',
  'ذَٰلِكَ': 'ذلك',
  'لَـٰكِنِ': 'لكن',
  'لَـٰكِنَّا': 'لكنا',
  'عَلَىٰ': 'علي',
  'إِلَىٰ': 'الي',
  'حَتَّىٰ': 'حتي',
  'بَلَىٰ': 'بلي',
  'ٱللَّهِ': 'الله',
  'ٱللَّهُ': 'الله',
  'لِلَّهِ': 'لله',
  'دَاوُۥدَ': 'داود',
  'يَلْوُۥنَ': 'يلوون',
  'ءَامَنُوا۟': 'امنوا',
  'ءَامَنَ': 'امن',
  'قُرْءَانٌ': 'قران',
  'ٱلْقُرْءَانِ': 'القران',
  'يَـٰٓأَيُّهَا': 'يا ايها',
  'يَـٰأَيُّهَا': 'يا ايها',
};

/**
 * Clean general Arabic text: remove harakat, standardize hamzas, yaa, taa marbuta
 */
export function cleanGeneralArabic(text: string): string {
  if (!text) return '';

  let s = text
    // Replace Quranic special spellings where waw represents an alif (الصلاة، الزكاة، الحياة، الربا)
    .replace(/(ال)?صلو[\u0670]?ة/g, '$1صلاة')
    .replace(/(ال)?زكو[\u0670]?ة/g, '$1زكاة')
    .replace(/(ال)?حيو[\u0670]?ة/g, '$1حياة')
    .replace(/(ال)?ربو[\u0670]?ا/g, '$1ربا')
    .replace(/مشكو[\u0670]?ة/g, 'مشكاة')
    .replace(/نجو[\u0670]?ة/g, 'نجاة')
    .replace(/منو[\u0670]?ة/g, 'مناة')
    .replace(/غدو[\u0670]?ة/g, 'غداة')
    // Small waw / yaa elongation in Uthmani text
    .replace(/و[\u06E5]/g, 'و')
    .replace(/ى[\u06E6]/g, 'ي')
    // Replace dagger alef with alef
    .replace(/\u0670/g, 'ا')
    // Remove all diacritics, sukun, shaddah, tanween, Quranic marks
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08FE]/g, '')
    // Remove Quranic pause signs and symbols
    .replace(/[ۖ-۩ۙ-ۚ۞۝ۚۖۗۘۙۛۜ]/g, '')
    // Standardize Alef variations (أ, إ, آ, ٱ -> ا)
    .replace(/[إأآٱ]/g, 'ا')
    // Standardize Alef Maqsoora / Yaa (ى -> ي)
    .replace(/ى/g, 'ي')
    // Standardize Taa Marbuta / Haa (ة -> ه)
    .replace(/ة/g, 'ه')
    // Standardize Hamzas on carriers
    .replace(/[ؤئ]/g, 'ء')
    // Standardize Rahmaan spelling
    .replace(/الرحمان/g, 'الرحمن')
    // Remove tatweel / kashida (ـ)
    .replace(/ـ/g, '')
    // Remove punctuation, numbers, brackets, quotes
    .replace(/[،؛؟.,!?:;()[\]{}"'«»—–\d\u0660-\u0669]/g, '')
    // Remove zero-width spaces and non-breaking spaces
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    // Collapse spaces
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

/**
 * Normalize an individual Quranic word token to match standard Arabic speech recognition output
 */
export function normalizeQuranWord(token: string): string {
  if (!token) return '';
  const trimmed = token.trim();

  // Check known exceptions first
  if (QURANIC_NORMALIZED_EXCEPTIONS[trimmed]) {
    return cleanGeneralArabic(QURANIC_NORMALIZED_EXCEPTIONS[trimmed]);
  }

  return cleanGeneralArabic(trimmed);
}

/**
 * Normalize spoken speech transcript into clean word tokens
 */
export function normalizeSpeechTranscript(text: string): string[] {
  if (!text) return [];

  const rawTokens = cleanGeneralArabic(text).split(/\s+/).filter(Boolean);
  const result: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    // If speech recognition separated a single letter conjunction (e.g. 'و' or 'ف'), join it with the next word
    if ((token === 'و' || token === 'ف') && i + 1 < rawTokens.length) {
      result.push(token + rawTokens[i + 1]);
      i++;
    } else {
      result.push(token);
    }
  }

  return result;
}

/**
 * Extract clean words from Uthmani verse
 */
export function extractCleanWords(uthmaniText: string): { text_uthmani: string; text_clean: string }[] {
  const rawTokens = uthmaniText.trim().split(/\s+/);
  return rawTokens
    .map(token => {
      const cleanToken = normalizeQuranWord(token);
      return {
        text_uthmani: token,
        text_clean: cleanToken,
      };
    })
    .filter(item => item.text_clean.length > 0);
}

/**
 * Calculate Levenshtein Distance
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

/**
 * Word similarity ratio between 0 and 1 with phonetic Tajweed tolerance
 */
export function wordSimilarity(expected: string, spoken: string): number {
  const exp = cleanGeneralArabic(expected);
  const spk = cleanGeneralArabic(spoken);

  if (exp === spk) return 1.0;
  if (!exp || !spk) return 0.0;

  // Exact match without any hamzas
  const expNoHamza = exp.replace(/ء/g, '');
  const spkNoHamza = spk.replace(/ء/g, '');
  if (expNoHamza === spkNoHamza && expNoHamza.length > 0) return 0.98;

  // Handle common Arabic prefixes (و, ف, ب, ل, ك)
  if (spk.startsWith('و') && exp === spk.slice(1)) return 0.96;
  if (exp.startsWith('و') && spk === exp.slice(1)) return 0.96;
  if (spk.startsWith('ف') && exp === spk.slice(1)) return 0.96;
  if (exp.startsWith('ف') && spk === exp.slice(1)) return 0.96;
  if (spk.startsWith('ب') && exp === spk.slice(1)) return 0.94;
  if (exp.startsWith('ب') && spk === exp.slice(1)) return 0.94;
  if (spk.startsWith('ل') && exp === spk.slice(1)) return 0.94;
  if (exp.startsWith('ل') && spk === exp.slice(1)) return 0.94;
  if (spk.startsWith('ال') && exp === spk.slice(2)) return 0.92;
  if (exp.startsWith('ال') && spk === exp.slice(2)) return 0.92;

  // Sun letter / Lam assimilation in speech (e.g. والشمس -> واشمس)
  const expSun = exp.replace(/^وال([تثدذرزسشصضطظلن])/, 'وا$1');
  const spkSun = spk.replace(/^وال([تثدذرزسشصضطظلن])/, 'وا$1');
  if (expSun === spkSun) return 0.98;

  // Hamza drop after waw/faa (e.g. واحسن vs وحسن)
  if (exp.startsWith('وا') && spk === 'و' + exp.slice(2)) return 0.96;
  if (spk.startsWith('وا') && exp === 'و' + spk.slice(2)) return 0.96;
  if (exp.startsWith('فا') && spk === 'ف' + exp.slice(2)) return 0.96;
  if (spk.startsWith('فا') && exp === 'ف' + spk.slice(2)) return 0.96;

  // Hamza drop at end of word (e.g. شيء -> شي, جزاء -> جزا)
  if (exp.endsWith('ء') && spk === exp.slice(0, -1)) return 0.96;
  if (spk.endsWith('ء') && exp === spk.slice(0, -1)) return 0.96;

  // Handle phonetic variations common in speech recognition (ص vs س, ض vs ظ, ذ vs ز/ظ)
  const expPhonetic = exp
    .replace(/ص/g, 'س')
    .replace(/ظ/g, 'ض')
    .replace(/[ذز]/g, 'ذ');
  const spkPhonetic = spk
    .replace(/ص/g, 'س')
    .replace(/ظ/g, 'ض')
    .replace(/[ذز]/g, 'ذ');
  if (expPhonetic === spkPhonetic) return 0.97;

  const dist = levenshteinDistance(exp, spk);
  const maxLen = Math.max(exp.length, spk.length);
  return Math.max(0, 1 - dist / maxLen);
}

export interface AlignmentResult {
  accuracy: number; // 0 to 100
  matchedWordIndices: Set<number>;
  wordStatuses: ('correct' | 'missed' | 'pending' | 'current')[];
  activeWordIndex: number; // index of the word currently being pronounced
  recognizedText: string;
  isPerfectMatch: boolean;
}

/**
 * Align recognized speech stream with the expected target verse words in real-time.
 * Uses ordered monotonic sequence alignment with compound-word decomposition
 * and phonetic tolerance.
 */
export function alignSpokenTextWithVerse(
  expectedWords: { text_clean: string }[],
  recognizedTranscript: string
): AlignmentResult {
  if (!expectedWords || expectedWords.length === 0) {
    return {
      accuracy: 0,
      matchedWordIndices: new Set(),
      wordStatuses: [],
      activeWordIndex: 0,
      recognizedText: '',
      isPerfectMatch: false,
    };
  }

  if (!recognizedTranscript || recognizedTranscript.trim() === '') {
    const statuses: ('correct' | 'missed' | 'pending' | 'current')[] = expectedWords.map((_, i) =>
      i === 0 ? 'current' : 'pending'
    );
    return {
      accuracy: 0,
      matchedWordIndices: new Set(),
      wordStatuses: statuses,
      activeWordIndex: 0,
      recognizedText: '',
      isPerfectMatch: false,
    };
  }

  // 1. Tokenize spoken transcript into clean tokens
  const rawSpoken = normalizeSpeechTranscript(recognizedTranscript);

  // 2. Decompose compound tokens (e.g. "الحمدلله" -> "الحمد", "لله")
  const spokenTokens: string[] = [];
  for (const token of rawSpoken) {
    const cleaned = cleanGeneralArabic(token);
    let rem = cleaned;
    let decomposed = false;

    // Check if rem starts with any expected word
    for (const exp of expectedWords) {
      const expClean = cleanGeneralArabic(exp.text_clean);
      if (expClean.length >= 2 && rem.startsWith(expClean) && rem.length > expClean.length) {
        spokenTokens.push(expClean);
        rem = rem.slice(expClean.length);
        decomposed = true;
      }
    }
    if (rem.length > 0) {
      spokenTokens.push(rem);
    } else if (!decomposed) {
      spokenTokens.push(cleaned);
    }
  }

  const matchedWordIndices = new Set<number>();
  const wordStatuses: ('correct' | 'missed' | 'pending' | 'current')[] = expectedWords.map(() => 'pending');

  // 3. Monotonic Forward Alignment
  // We align expected words against the spoken tokens in order.
  let spokenCursor = 0;

  for (let expIdx = 0; expIdx < expectedWords.length; expIdx++) {
    if (spokenCursor >= spokenTokens.length) break;

    const expectedClean = cleanGeneralArabic(expectedWords[expIdx].text_clean);
    let foundSpokenIdx = -1;
    let tokensConsumed = 1;

    // Search forward across spoken tokens (generous search window up to 25 spoken tokens)
    const searchLimit = Math.min(spokenTokens.length, spokenCursor + 25);
    for (let sIdx = spokenCursor; sIdx < searchLimit; sIdx++) {
      // 1) Single token similarity
      const sim = wordSimilarity(expectedClean, spokenTokens[sIdx]);
      if (sim >= 0.60) {
        foundSpokenIdx = sIdx;
        tokensConsumed = 1;
        break;
      }

      // 2) Two spoken tokens joined (e.g. "و" + "قال" = "وقال")
      if (sIdx + 1 < spokenTokens.length) {
        const joinedSpoken = spokenTokens[sIdx] + spokenTokens[sIdx + 1];
        if (wordSimilarity(expectedClean, joinedSpoken) >= 0.65) {
          foundSpokenIdx = sIdx;
          tokensConsumed = 2;
          break;
        }
      }
    }

    // 3) Single spoken token matching TWO expected words (e.g. "يا" + "ايها" = "ياايها")
    if (foundSpokenIdx === -1 && expIdx + 1 < expectedWords.length) {
      const nextClean = cleanGeneralArabic(expectedWords[expIdx + 1].text_clean);
      const combinedExpected = expectedClean + nextClean;
      for (let sIdx = spokenCursor; sIdx < searchLimit; sIdx++) {
        if (wordSimilarity(combinedExpected, spokenTokens[sIdx]) >= 0.65) {
          matchedWordIndices.add(expIdx);
          wordStatuses[expIdx] = 'correct';
          matchedWordIndices.add(expIdx + 1);
          wordStatuses[expIdx + 1] = 'correct';
          spokenCursor = sIdx + 1;
          expIdx++; // skip next expected word
          foundSpokenIdx = sIdx;
          break;
        }
      }
    }

    if (foundSpokenIdx !== -1 && !matchedWordIndices.has(expIdx)) {
      matchedWordIndices.add(expIdx);
      wordStatuses[expIdx] = 'correct';
      spokenCursor = foundSpokenIdx + tokensConsumed;
    }
  }

  // 4. Substring stream pass for any remaining un-matched words in continuous speech
  const fullSpokenStream = cleanGeneralArabic(recognizedTranscript).replace(/\s+/g, '');
  let streamSearchPos = 0;

  for (let expIdx = 0; expIdx < expectedWords.length; expIdx++) {
    const expectedClean = cleanGeneralArabic(expectedWords[expIdx].text_clean);
    if (!expectedClean) continue;

    // If already matched, advance streamSearchPos
    if (matchedWordIndices.has(expIdx)) {
      const pos = fullSpokenStream.indexOf(expectedClean, streamSearchPos);
      if (pos !== -1) {
        streamSearchPos = pos + expectedClean.length;
      }
      continue;
    }

    // If not matched yet, check if this word appears in the continuous stream in order
    const pos = fullSpokenStream.indexOf(expectedClean, streamSearchPos);
    if (pos !== -1) {
      matchedWordIndices.add(expIdx);
      wordStatuses[expIdx] = 'correct';
      streamSearchPos = pos + expectedClean.length;
    } else {
      // Check phonetic variant (س vs ص)
      const phoneticWord = expectedClean.replace(/ص/g, 'س');
      const phoneticStream = fullSpokenStream.replace(/ص/g, 'س');
      const pPos = phoneticStream.indexOf(phoneticWord, streamSearchPos);
      if (pPos !== -1) {
        matchedWordIndices.add(expIdx);
        wordStatuses[expIdx] = 'correct';
        streamSearchPos = pPos + phoneticWord.length;
      }
    }
  }

  // Next active word is the first non-matched word in sequence
  let activeIndex = 0;
  for (let i = 0; i < expectedWords.length; i++) {
    if (!matchedWordIndices.has(i)) {
      activeIndex = i;
      wordStatuses[i] = 'current';
      break;
    }
  }
  if (matchedWordIndices.size === expectedWords.length) {
    activeIndex = Math.max(0, expectedWords.length - 1);
  }

  const totalWords = expectedWords.length;
  const correctCount = matchedWordIndices.size;
  const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
  const isPerfectMatch = totalWords > 0 && correctCount === totalWords;

  return {
    accuracy,
    matchedWordIndices,
    wordStatuses,
    activeWordIndex: activeIndex,
    recognizedText: recognizedTranscript,
    isPerfectMatch,
  };
}
