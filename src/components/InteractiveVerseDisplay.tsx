import React, { useState } from 'react';
import { QuranVerse, StageType } from '../types/quran';
import { Check, Mic } from 'lucide-react';

interface InteractiveVerseDisplayProps {
  verse?: QuranVerse;
  verses?: QuranVerse[];
  stage: StageType;
  maskLevel: number; // 0 to 100 percentage of words masked
  matchedWordIndices: Set<number>;
  wordStatuses: ('correct' | 'missed' | 'pending' | 'current')[];
  isTestActive: boolean;
  isListening?: boolean;
  strictSpeechReveal?: boolean; // When true: word ONLY appears if matched by user's speech!
  showFullVerse?: boolean;
  onWordClick?: (index: number) => void;
  showAyahNumber?: boolean;
  onManualNextWord?: () => void;
}

export const InteractiveVerseDisplay: React.FC<InteractiveVerseDisplayProps> = ({
  verse,
  verses,
  stage,
  maskLevel,
  matchedWordIndices,
  wordStatuses,
  isTestActive,
  isListening = false,
  strictSpeechReveal = true,
  showFullVerse = false,
  onWordClick,
  showAyahNumber = true,
  onManualNextWord,
}) => {
  // Normalize to an array of verses
  const displayVerses: QuranVerse[] = verses && verses.length > 0 ? verses : verse ? [verse] : [];

  // Track temporarily revealed hinted words by user click
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  const handleWordHintClick = (globalIndex: number) => {
    setRevealedIndices(prev => {
      const next = new Set(prev);
      next.add(globalIndex);
      return next;
    });

    // Auto re-hide hint after 3.5 seconds
    setTimeout(() => {
      setRevealedIndices(prev => {
        const next = new Set(prev);
        next.delete(globalIndex);
        return next;
      });
    }, 3500);

    if (onWordClick) {
      onWordClick(globalIndex);
    }
  };

  const toArabicNumerals = (num: number) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(d => arabicDigits[parseInt(d, 10)] || d).join('');
  };

  // Determine if a word should be hidden:
  const isWordVisible = (globalIndex: number): boolean => {
    if (showFullVerse || stage === 'visible') return true;
    if (revealedIndices.has(globalIndex)) return true;
    if (matchedWordIndices.has(globalIndex)) return true;

    if (stage === 'gradual_mask') {
      const threshold = maskLevel / 100;
      const positionHash = ((globalIndex * 7 + 3) % 10) / 10;
      return positionHash >= threshold;
    }

    if (strictSpeechReveal && (stage === 'alignment_test' || stage === 'chaining' || isListening)) {
      return false; // strictly invisible until spoken correctly!
    }

    if (stage === 'full_mask') return false;

    return true;
  };

  let globalWordCounter = 0;

  return (
    <div className="w-full relative py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-10 bg-[#FFFFFF] dark:bg-[#1A1D1B] rounded-3xl border border-[#E7E2D5] dark:border-[#2B312D] text-center select-none shadow-xs transition-all flex flex-col items-center justify-center flex-1 min-h-[48vh] lg:min-h-[56vh] overflow-visible">
      {/* Listening Status Tag */}
      {isListening && (
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF4EE] dark:bg-[#1B2B22] border border-[#CDE5D5] dark:border-[#2D4D3A] text-[#1E4E38] dark:text-[#68D391] text-xs font-semibold animate-pulse">
          <Mic className="w-3.5 h-3.5 text-[#2D5A42]" />
          <span>المحاذاة اللفظية نشطة: اقرأ بصوتك وستظهر الكلمات بالتزامن مع نطقك</span>
        </div>
      )}

      {/* Quranic Text Display: Supports 1 Ayah, Multi-Ayah, Half-Page or Full Page */}
      <div
        className="w-full max-w-7xl font-quran text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[2.6] sm:leading-[2.9] md:leading-[3.3] tracking-wide flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-4 md:gap-x-5 gap-y-4 sm:gap-y-6 text-[#17201C] dark:text-[#F3F1EC] overflow-visible"
        dir="rtl"
      >
        {displayVerses.map((v) => {
          return (
            <React.Fragment key={v.verse_key || v.ayah_number}>
              {v.words.map((w) => {
                const currentGlobalIndex = globalWordCounter;
                globalWordCounter++;

                const visible = isWordVisible(currentGlobalIndex);
                const isHinted = revealedIndices.has(currentGlobalIndex);
                const isMatched = matchedWordIndices.has(currentGlobalIndex);
                const status = wordStatuses[currentGlobalIndex];
                const isCurrentActive = isListening && status === 'current' && !isMatched;

                if (!visible) {
                  // Hidden word slot until the user pronounces it correctly
                  return (
                    <button
                      key={`word-${currentGlobalIndex}`}
                      onClick={() => handleWordHintClick(currentGlobalIndex)}
                      title="انقر لإظهار الكلمة مؤقتاً كـ تلميح"
                      className={`relative inline-flex items-center justify-center min-w-[65px] sm:min-w-[85px] md:min-w-[100px] h-11 sm:h-13 md:h-15 px-3 rounded-2xl border transition-all cursor-pointer ${
                        isCurrentActive
                          ? 'border-[#D9A74A] bg-[#FDF8EE] dark:bg-[#2B2414] shadow-sm animate-pulse'
                          : 'border-[#E5DFD1] dark:border-[#353D38] bg-[#F7F4EB] dark:bg-[#222724] hover:border-[#D9A74A]/70'
                      }`}
                    >
                      <span className="text-[#A59D8E] dark:text-[#7A837E] font-mono tracking-widest text-xs sm:text-sm">
                        ••••
                      </span>
                      {isCurrentActive && (
                        <span className="absolute -bottom-2 text-[10px] font-sans font-semibold text-[#8C5E13] dark:text-[#ECC94B] px-1.5 py-0.2 bg-white dark:bg-[#1E2220] rounded-md shadow-2xs border border-[#ECD9B5]">
                          انطق هنا
                        </span>
                      )}
                    </button>
                  );
                }

                // Visible Word Styling with ample vertical clearance to preserve full glyph ascenders
                let wordClasses = 'text-[#17201C] dark:text-[#F3F1EC]';
                if (isMatched) {
                  // Matched word: Beautiful soothing sage emerald highlight with checkmark
                  wordClasses =
                    'text-[#1B4D36] dark:text-[#52B788] bg-[#E7F3EC] dark:bg-[#1C3125] border border-[#C5E2D1] dark:border-[#2C4D38] rounded-xl px-2 sm:px-3 py-1 font-semibold shadow-2xs scale-102 transition-all duration-150 overflow-visible';
                } else if (isHinted) {
                  // Hinted temporary reveal
                  wordClasses =
                    'bg-[#FDF3DE] dark:bg-[#342915] text-[#8C5E13] dark:text-[#ECC94B] border-b-2 border-[#D99B26] rounded-xl px-2 py-1 overflow-visible';
                }

                return (
                  <span
                    key={`word-${currentGlobalIndex}`}
                    onClick={() => handleWordHintClick(currentGlobalIndex)}
                    className={`relative inline-block overflow-visible pt-1.5 pb-2 px-1 sm:px-1.5 transition-all duration-150 cursor-pointer ${wordClasses}`}
                  >
                    {w.text_uthmani}

                    {/* Matched Checkmark */}
                    {isMatched && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#245A40] dark:text-[#52B788] opacity-95">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </span>
                );
              })}

              {/* Traditional Quranic Ayah End Ornament for this verse */}
              {showAyahNumber && (
                <span className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 mx-1 sm:mx-1.5 rounded-full border border-[#D5A344]/60 text-[#8C5E13] dark:text-[#ECC94B] text-xs sm:text-base font-arabic font-bold bg-[#FBF5E9] dark:bg-[#2C2414] select-none shadow-2xs shrink-0 self-center">
                  {toArabicNumerals(v.ayah_number)}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
