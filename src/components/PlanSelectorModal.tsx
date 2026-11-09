import React, { useState } from 'react';
import { X, Search, Check, Sliders, Sparkles, BookOpen, Layers } from 'lucide-react';
import { SURAHS_LIST, RECITERS } from '../data/surahs';
import { PlanConfig, PlanMode } from '../types/quran';

interface PlanSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanConfig;
  onSavePlan: (newPlan: PlanConfig) => void;
}

export const PlanSelectorModal: React.FC<PlanSelectorModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSavePlan,
}) => {
  const [planMode, setPlanMode] = useState<PlanMode>(currentPlan.mode || 'by_surah');
  const [selectedSurahId, setSelectedSurahId] = useState<number>(currentPlan.surah_id || 1);
  const [startAyah, setStartAyah] = useState<number>(currentPlan.start_ayah || 1);
  const [endAyah, setEndAyah] = useState<number>(currentPlan.end_ayah || 7);

  // Pages mode state (1 to 604)
  const [startPage, setStartPage] = useState<number>(currentPlan.start_page || 1);
  const [endPage, setEndPage] = useState<number>(currentPlan.end_page || 1);

  const [reciterId, setReciterId] = useState<string>(currentPlan.reciter_id);
  const [visibleReps, setVisibleReps] = useState<number>(currentPlan.visible_target_reps || 3);
  const [maskedReps, setMaskedReps] = useState<number>(currentPlan.masked_target_reps || 3);
  const [chainReps, setChainReps] = useState<number>(currentPlan.chain_target_reps || 3);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(currentPlan.auto_advance_on_100 !== false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const currentSurah = SURAHS_LIST.find(s => s.id === selectedSurahId) || SURAHS_LIST[0];

  const filteredSurahs = SURAHS_LIST.filter(s =>
    s.name_ar.includes(searchQuery) ||
    s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.id).includes(searchQuery)
  );

  const handleSurahSelect = (surahId: number) => {
    setSelectedSurahId(surahId);
    const surah = SURAHS_LIST.find(s => s.id === surahId);
    setStartAyah(1);
    setEndAyah(surah ? Math.min(surah.verse_count, 5) : 1);
  };

  const handleApplySurahPreset = (surahId: number, start: number, end: number) => {
    setPlanMode('by_surah');
    setSelectedSurahId(surahId);
    setStartAyah(start);
    setEndAyah(end);
  };

  const handleApplyPagePreset = (pStart: number, pEnd: number) => {
    setPlanMode('by_page');
    setStartPage(pStart);
    setEndPage(pEnd);
  };

  // Find which surahs are covered in the chosen page range
  const coveredSurahs = SURAHS_LIST.filter(s =>
    (s.page_start <= endPage && s.page_end >= startPage)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (planMode === 'by_page') {
      const safeStartPage = Math.max(1, Math.min(startPage, 604));
      const safeEndPage = Math.max(safeStartPage, Math.min(endPage, 604));
      // Anchor surah to the first surah touching startPage
      const firstSurahOnPage = SURAHS_LIST.find(s => s.page_start <= safeStartPage && s.page_end >= safeStartPage) || SURAHS_LIST[0];

      onSavePlan({
        mode: 'by_page',
        surah_id: firstSurahOnPage.id,
        start_ayah: 1,
        end_ayah: firstSurahOnPage.verse_count,
        start_page: safeStartPage,
        end_page: safeEndPage,
        reciter_id: reciterId,
        visible_target_reps: visibleReps,
        masked_target_reps: maskedReps,
        chain_target_reps: chainReps,
        auto_advance_on_100: autoAdvance,
      });
    } else {
      onSavePlan({
        mode: 'by_surah',
        surah_id: selectedSurahId,
        start_ayah: Math.max(1, startAyah),
        end_ayah: Math.min(currentSurah.verse_count, Math.max(startAyah, endAyah)),
        start_page: currentSurah.page_start,
        end_page: currentSurah.page_end,
        reciter_id: reciterId,
        visible_target_reps: visibleReps,
        masked_target_reps: maskedReps,
        chain_target_reps: chainReps,
        auto_advance_on_100: autoAdvance,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#141715]/65 backdrop-blur-xs font-arabic">
      <div className="bg-[#FFFFFF] dark:bg-[#1E2220] border border-[#E7E2D5] dark:border-[#2D332F] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#E7E2D5] dark:border-[#2D332F]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2D5A42] dark:text-[#52B788]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1C2320] dark:text-[#ECE9E2]">
              تحديد خطة ومقرر الحفظ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#758079] hover:text-[#1C2320] dark:hover:text-[#ECE9E2] hover:bg-[#F4F1EA] dark:hover:bg-[#272C29] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: By Surah vs By Page */}
        <div className="px-5 sm:px-6 pt-3 pb-1 bg-[#F9F7F1] dark:bg-[#181C1A] border-b border-[#E7E2D5] dark:border-[#2D332F]">
          <div className="grid grid-cols-2 gap-2 bg-[#EBE7DD] dark:bg-[#232825] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPlanMode('by_surah')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                planMode === 'by_surah'
                  ? 'bg-white dark:bg-[#1E2220] text-[#1B3E2D] dark:text-[#68D391] shadow-2xs font-bold'
                  : 'text-[#5A6660] dark:text-[#9DA8A1]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>المقرر بالسورة والآيات (114 سورة)</span>
            </button>

            <button
              type="button"
              onClick={() => setPlanMode('by_page')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                planMode === 'by_page'
                  ? 'bg-white dark:bg-[#1E2220] text-[#1B3E2D] dark:text-[#68D391] shadow-2xs font-bold'
                  : 'text-[#5A6660] dark:text-[#9DA8A1]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>المقرر بالصفحات (مصحف المدينة 1-604)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {planMode === 'by_surah' ? (
            /* By Surah Configuration */
            <>
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-[#5C6660] dark:text-[#A3ADA6] mb-2">
                  مقررات مقترحة سريعة
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { s: 1, start: 1, end: 7, label: 'سورة الفاتحة كاملة', sub: 'السبع المثاني (7 آيات)' },
                    { s: 2, start: 1, end: 5, label: 'أوائل البقرة', sub: 'الآيات 1 إلى 5' },
                    { s: 36, start: 1, end: 12, label: 'سورة يس', sub: 'الآيات 1 إلى 12' },
                    { s: 67, start: 1, end: 5, label: 'سورة الملك', sub: 'الآيات 1 إلى 5' },
                    { s: 78, start: 1, end: 5, label: 'سورة النبأ', sub: 'الآيات 1 إلى 5' },
                    { s: 112, start: 1, end: 4, label: 'سورة الإخلاص', sub: 'كاملة (4 آيات)' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySurahPreset(p.s, p.start, p.end)}
                      className={`p-2 rounded-xl border text-right text-xs transition-all ${
                        selectedSurahId === p.s && startAyah === p.start && endAyah === p.end
                          ? 'border-[#2D5A42] bg-[#E7F3EC] dark:bg-[#1B2B22] text-[#1E4E38] dark:text-[#68D391] font-semibold'
                          : 'border-[#E7E2D5] dark:border-[#2D332F] hover:border-[#D5CFBF] text-[#2C342F] dark:text-[#D5DDD7]'
                      }`}
                    >
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-[11px] text-[#7A857F]">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Surah Search & Selection: ALL 114 SURAHS */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#5C6660] dark:text-[#A3ADA6]">
                    اختيار السورة من فهرس القرآن الكريم (جميع السور الـ 114)
                  </label>
                  <span className="text-[11px] text-[#7A857F]">
                    المحددة: سورة {currentSurah.name_ar} ({currentSurah.verse_count} آية)
                  </span>
                </div>

                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-[#7A857F] absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ابحث باسم السورة أو رقمها (مثال: الكهف، 18، الملك)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-[#FAF8F2] dark:bg-[#252A27] border border-[#E7E2D5] dark:border-[#2D332F] text-[#1C2320] dark:text-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D5A42]"
                  />
                </div>

                {/* All 114 Surahs fully scrollable without limitation */}
                <div className="max-h-44 overflow-y-auto border border-[#E7E2D5] dark:border-[#2D332F] rounded-xl divide-y divide-[#F0EDE5] dark:divide-[#2B312D]">
                  {filteredSurahs.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => handleSurahSelect(s.id)}
                      className={`w-full px-3.5 py-2 flex items-center justify-between text-xs transition-colors ${
                        s.id === selectedSurahId
                          ? 'bg-[#E8F3EC] dark:bg-[#1E3327] text-[#1E4E38] dark:text-[#68D391] font-bold'
                          : 'hover:bg-[#FAF8F2] dark:hover:bg-[#252A27] text-[#2C342F] dark:text-[#D5DDD7]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#8C9690] w-7 text-center">{s.id}</span>
                        <span>سورة {s.name_ar}</span>
                        <span className="text-[#8C9690] text-[11px]">({s.revelation_type === 'meccan' ? 'مكية' : 'مدنية'})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#7A857F] text-[11px]">
                        <span>{s.verse_count} آية</span>
                        <span>صفحة {s.page_start}</span>
                        {s.id === selectedSurahId && <Check className="w-3.5 h-3.5 text-[#2D5A42] dark:text-[#52B788]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ayah Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C6660] dark:text-[#A3ADA6] mb-1">
                    من الآية
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={currentSurah.verse_count}
                    value={startAyah}
                    onChange={(e) => setStartAyah(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono bg-[#FAF8F2] dark:bg-[#252A27] border border-[#E7E2D5] dark:border-[#2D332F] text-[#1C2320] dark:text-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D5A42]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5C6660] dark:text-[#A3ADA6] mb-1">
                    إلى الآية (أقصاها {currentSurah.verse_count})
                  </label>
                  <input
                    type="number"
                    min={startAyah}
                    max={currentSurah.verse_count}
                    value={endAyah}
                    onChange={(e) => setEndAyah(Math.min(currentSurah.verse_count, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono bg-[#FAF8F2] dark:bg-[#252A27] border border-[#E7E2D5] dark:border-[#2D332F] text-[#1C2320] dark:text-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D5A42]"
                  />
                </div>
              </div>
            </>
          ) : (
            /* By Pages Configuration (1 to 604) */
            <>
              {/* Page Presets */}
              <div>
                <label className="block text-xs font-semibold text-[#5C6660] dark:text-[#A3ADA6] mb-2">
                  مقررات صفحات مقترحة من مصحف مجمع الملك فهد
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { pStart: 1, pEnd: 1, label: 'صفحة 1 (الفاتحة)', sub: 'الصفحة الأولى' },
                    { pStart: 2, pEnd: 3, label: 'صفحتان (2 - 3)', sub: 'أول سورة البقرة' },
                    { pStart: 440, pEnd: 445, label: 'سورة يس كاملة', sub: 'صفحات 440 إلى 445' },
                    { pStart: 562, pEnd: 564, label: 'سورة الملك كاملة', sub: 'صفحات 562 إلى 564' },
                    { pStart: 582, pEnd: 585, label: 'أوائل جزء عم', sub: 'صفحات 582 إلى 585' },
                    { pStart: 602, pEnd: 604, label: 'قصار السور', sub: 'صفحات 602 إلى 604' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPagePreset(p.pStart, p.pEnd)}
                      className={`p-2 rounded-xl border text-right text-xs transition-all ${
                        startPage === p.pStart && endPage === p.pEnd
                          ? 'border-[#2D5A42] bg-[#E7F3EC] dark:bg-[#1B2B22] text-[#1E4E38] dark:text-[#68D391] font-semibold'
                          : 'border-[#E7E2D5] dark:border-[#2D332F] hover:border-[#D5CFBF] text-[#2C342F] dark:text-[#D5DDD7]'
                      }`}
                    >
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-[11px] text-[#7A857F]">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Range Inputs */}
              <div className="p-4 bg-[#FBF9F4] dark:bg-[#252A27] rounded-2xl border border-[#E7E2D5] dark:border-[#2D332F] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C2320] dark:text-[#ECE9E2]">
                    تحديد نطاق الصفحات (من 1 إلى 604)
                  </span>
                  <span className="text-[11px] text-[#2D5A42] dark:text-[#68D391] font-semibold">
                    المجموع: {endPage >= startPage ? endPage - startPage + 1 : 1} صفحة
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5C6660] dark:text-[#A3ADA6] mb-1">
                      من صفحة
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={startPage}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(604, parseInt(e.target.value, 10) || 1));
                        setStartPage(val);
                        if (val > endPage) setEndPage(val);
                      }}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono bg-white dark:bg-[#1E2220] border border-[#E7E2D5] dark:border-[#2D332F] text-[#1C2320] dark:text-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D5A42]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5C6660] dark:text-[#A3ADA6] mb-1">
                      إلى صفحة (أقصاها 604)
                    </label>
                    <input
                      type="number"
                      min={startPage}
                      max={604}
                      value={endPage}
                      onChange={(e) => {
                        const val = Math.max(startPage, Math.min(604, parseInt(e.target.value, 10) || 1));
                        setEndPage(val);
                      }}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono bg-white dark:bg-[#1E2220] border border-[#E7E2D5] dark:border-[#2D332F] text-[#1C2320] dark:text-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D5A42]"
                    />
                  </div>
                </div>

                {/* Covered Surahs preview */}
                <div className="pt-2 text-[11px] text-[#556059] dark:text-[#A0A8A3] flex flex-wrap gap-1 items-center">
                  <span className="font-semibold text-[#1C2320] dark:text-[#ECE9E2]">السور الواقعة في المقرر:</span>
                  {coveredSurahs.map((s, idx) => (
                    <span key={s.id} className="bg-white dark:bg-[#1E2220] px-2 py-0.5 rounded-md border border-[#E7E2D5] dark:border-[#2D332F]">
                      سورة {s.name_ar} (جزء {s.juz})
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Repetition Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-[#FAF8F2] dark:bg-[#252A27] p-2.5 rounded-xl border border-[#E7E2D5] dark:border-[#2D332F]">
              <label className="block text-[11px] font-medium text-[#444E48] dark:text-[#C5CEC8] mb-1">
                تكرار النظر مكشوفاً
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={visibleReps}
                  onChange={(e) => setVisibleReps(parseInt(e.target.value, 10) || 1)}
                  className="w-14 px-2 py-1 text-center font-mono text-xs bg-white dark:bg-[#1E2220] border border-[#D5CFBF] dark:border-[#38403B] rounded-lg"
                />
                <span className="text-[11px] text-[#7A857F]">مرات</span>
              </div>
            </div>

            <div className="bg-[#FAF8F2] dark:bg-[#252A27] p-2.5 rounded-xl border border-[#E7E2D5] dark:border-[#2D332F]">
              <label className="block text-[11px] font-medium text-[#444E48] dark:text-[#C5CEC8] mb-1">
                تكرار الإخفاء التدريجي
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maskedReps}
                  onChange={(e) => setMaskedReps(parseInt(e.target.value, 10) || 1)}
                  className="w-14 px-2 py-1 text-center font-mono text-xs bg-white dark:bg-[#1E2220] border border-[#D5CFBF] dark:border-[#38403B] rounded-lg"
                />
                <span className="text-[11px] text-[#7A857F]">مرات</span>
              </div>
            </div>

            <div className="bg-[#FAF8F2] dark:bg-[#252A27] p-2.5 rounded-xl border border-[#E7E2D5] dark:border-[#2D332F]">
              <label className="block text-[11px] font-medium text-[#444E48] dark:text-[#C5CEC8] mb-1">
                تكرار التسميع والمحاذاة
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={chainReps}
                  onChange={(e) => setChainReps(parseInt(e.target.value, 10) || 1)}
                  className="w-14 px-2 py-1 text-center font-mono text-xs bg-white dark:bg-[#1E2220] border border-[#D5CFBF] dark:border-[#38403B] rounded-lg"
                />
                <span className="text-[11px] text-[#7A857F]">مرات</span>
              </div>
            </div>
          </div>

          {/* Reciter: Only Al-Hudhaify & Al-Husary */}
          <div>
            <label className="block text-xs font-semibold text-[#5C6660] dark:text-[#A3ADA6] mb-1">
              القارئ المعتمد للتلاوة والترديد
            </label>
            <select
              value={reciterId}
              onChange={(e) => setReciterId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-[#FAF8F2] dark:bg-[#252A27] border border-[#E7E2D5] dark:border-[#2D332F] text-[#1C2320] dark:text-[#ECE9E2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D5A42]"
            >
              {RECITERS.map(r => (
                <option key={r.identifier} value={r.identifier}>
                  {r.name_ar} — {r.style}
                </option>
              ))}
            </select>
          </div>

          {/* Auto advance toggle */}
          <div className="flex items-center justify-between p-2.5 bg-[#EBF5EE] dark:bg-[#1B2B22] rounded-xl border border-[#CDE5D5] dark:border-[#2B4737]">
            <div className="flex items-center gap-2 text-xs text-[#1E4E38] dark:text-[#68D391]">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A42]" />
              <span>الانتقال التلقائي للآية التالية عند إتمام الحفظ بنسبة 100%</span>
            </div>
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="w-4 h-4 text-[#2D5A42] rounded-md focus:ring-[#2D5A42]"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7E2D5] dark:border-[#2D332F]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#5C6660] dark:text-[#A3ADA6] hover:text-[#1C2320] dark:hover:text-[#ECE9E2]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#284E3A] hover:bg-[#1E3B2C] rounded-xl shadow-2xs transition-colors"
            >
              اعتماد الخطة والبدء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
