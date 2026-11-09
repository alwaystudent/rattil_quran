import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { PlanConfig, QuranVerse } from './types/quran';
import { fetchSurahVerses, fetchPagesVerses, SURAHS_LIST, RECITERS } from './data/surahs';
import { MemorizationStudio } from './components/MemorizationStudio';
import { PlanSelectorModal } from './components/PlanSelectorModal';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(true);
  const [verses, setVerses] = useState<QuranVerse[]>([]);

  // Default initial plan with Al-Hudhaify
  const [plan, setPlan] = useState<PlanConfig>({
    mode: 'by_surah',
    surah_id: 1, // Al-Fatihah
    start_ayah: 1,
    end_ayah: 7,
    start_page: 1,
    end_page: 1,
    reciter_id: RECITERS[0].identifier, // Sheikh Ali Al-Hudhaify
    visible_target_reps: 3,
    masked_target_reps: 3,
    chain_target_reps: 3,
    auto_advance_on_100: true,
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load verses whenever plan changes
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setIsLoadingVerses(true);
      try {
        if (plan.mode === 'by_page') {
          const pageVerses = await fetchPagesVerses(
            plan.start_page || 1,
            plan.end_page || 1,
            plan.reciter_id
          );
          if (!isCancelled) {
            setVerses(pageVerses);
          }
        } else {
          const fullVerses = await fetchSurahVerses(plan.surah_id, plan.reciter_id);
          if (!isCancelled) {
            const sliced = fullVerses.filter(
              v => v.ayah_number >= plan.start_ayah && v.ayah_number <= plan.end_ayah
            );
            setVerses(sliced.length > 0 ? sliced : fullVerses.slice(0, 7));
          }
        }
      } catch (err) {
        console.error('Failed to load verses:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingVerses(false);
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [plan.mode, plan.surah_id, plan.start_ayah, plan.end_ayah, plan.start_page, plan.end_page, plan.reciter_id]);

  const currentSurah = SURAHS_LIST.find(s => s.id === plan.surah_id) || SURAHS_LIST[0];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F2] dark:bg-[#141715] text-[#222A26] dark:text-[#E8E6DF] flex flex-col font-arabic transition-colors duration-200">
      {/* Top Bar (Compact & Sleek) */}
      <header className="w-full sticky top-0 z-40 bg-white/95 dark:bg-[#1C201E]/95 backdrop-blur-md border-b border-[#E7E2D5] dark:border-[#2D332F]">
        <div className="w-full max-w-7xl 2xl:max-w-[98vw] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-xl bg-[#2D5A42] flex items-center justify-center text-white font-bold text-base shadow-2xs">
              ر
            </span>
            <div className="flex items-baseline gap-1.5">
              <a href="/" className="text-lg font-bold tracking-tight text-[#1B3829] dark:text-[#52B788] whitespace-nowrap">
                رتّـل
              </a>
              <span className="hidden sm:inline-block text-[11px] text-[#7A857F]">
                التحفيظ بالمحاذاة اللحظية
              </span>
            </div>
          </div>

          {/* Current Plan Badge & Fast Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF4EE] dark:bg-[#1B2B22] border border-[#CDE5D5] dark:border-[#2D4D3A] text-[#1E4E38] dark:text-[#68D391] font-semibold hover:bg-[#DDF0E3] transition-colors"
              title="تعديل المقرر أو السورة أو أرقام الصفحات"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A42] dark:text-[#52B788]" />
              <span>
                {plan.mode === 'by_page'
                  ? `مقرر الصفحات: ${plan.start_page} إلى ${plan.end_page}`
                  : `سورة ${currentSurah.name_ar} (الآيات ${plan.start_ayah} - ${plan.end_ayah})`}
              </span>
            </button>
          </div>

          {/* Controls: Theme & Plan Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-xl text-[#505C55] dark:text-[#A3ADA6] hover:bg-[#F2EEE5] dark:hover:bg-[#252A27] transition-colors"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#D9A74A]" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#284E3A] hover:bg-[#1E3B2C] rounded-xl transition-all shadow-2xs whitespace-nowrap"
            >
              تغيير الخطة
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Height Viewport */}
      <main className="w-full flex-1 flex flex-col px-2 sm:px-4 md:px-6 py-2.5 max-w-7xl 2xl:max-w-[98vw] mx-auto">
        {isLoadingVerses ? (
          <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center bg-white dark:bg-[#1E2220] rounded-3xl p-8 text-center border border-[#E7E2D5] dark:border-[#2D332F] shadow-xs space-y-3">
            <RotateCw className="w-8 h-8 text-[#2D5A42] animate-spin" />
            <p className="text-[#556059] dark:text-[#A0A8A3] text-sm">
              جارٍ جلب الآيات المعتمدة بالرسم العثماني لمصحف مجمع الملك فهد...
            </p>
          </div>
        ) : (
          <MemorizationStudio
            verses={verses}
            plan={plan}
            onOpenPlanModal={() => setIsPlanModalOpen(true)}
            onResetSession={() => {
              setPlan(prev => ({ ...prev }));
            }}
          />
        )}
      </main>

        {/* King Fahd Complex Quran Source Citation Section */}
        <section id="king-fahd-source" className="w-full max-w-7xl 2xl:max-w-[96vw] mx-auto px-4 sm:px-6 md:px-8 mt-12">
          <div className="p-6 md:p-8 bg-white dark:bg-[#1E2220] rounded-3xl border border-[#E7E2D5] dark:border-[#2D332F] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A42] dark:text-[#52B788]">
                <ShieldCheck className="w-4 h-4" />
                <span>المصدر القرآني المعتمد</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#1C2320] dark:text-[#ECE9E2]">
                مصحف مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة
              </h3>
              <p className="text-xs text-[#556059] dark:text-[#A0A8A3] max-w-2xl leading-relaxed">
                تعتمد المنصة طبعة مصحف المدينة النبوية المعتمدة برواية حفص عن عاصم بالرسم العثماني الموثق، وتلاوات الشيخ علي الحذيفي والمصحف المعلم للشيخ محمود خليل الحصري.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#284E3A] hover:bg-[#1E3B2C] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                تخصيص المقرر الآن
              </button>
            </div>
          </div>
        </section>

      {/* Plan Selector Modal */}
      <PlanSelectorModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        currentPlan={plan}
        onSavePlan={(newPlan) => setPlan(newPlan)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-[#E7E2D5] dark:border-[#2D332F] py-6 text-center text-xs text-[#7A857F] font-arabic">
        <div className="w-full max-w-7xl 2xl:max-w-[96vw] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            منصة رتّل للتحفيظ بالمحاذاة اللحظية والتكرار التراكمي · وفق صفحات مجمع الملك فهد
          </span>
          <div className="flex items-center gap-4 text-[#8C9690]">
            <span>مصحف المدينة النبوية</span>
            <span>·</span>
            <span>الشيخ علي الحذيفي</span>
            <span>·</span>
            <span>المصحف المعلم للحصري</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
