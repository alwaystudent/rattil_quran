import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Moon, Sun, CheckCircle2, BookOpen } from 'lucide-react';
import { getKingFahdPageUrl, SURAHS_LIST } from '../data/surahs';

interface KingFahdPageViewerProps {
  initialPage?: number;
  highlightAyah?: number;
  currentSurahId?: number;
  onPageChange?: (newPage: number) => void;
}

export const KingFahdPageViewer: React.FC<KingFahdPageViewerProps> = ({
  initialPage = 1,
  highlightAyah,
  currentSurahId = 1,
  onPageChange,
}) => {
  const [page, setPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync if initialPage prop changes
  React.useEffect(() => {
    if (initialPage) {
      setPage(prev => (prev !== initialPage ? initialPage : prev));
    }
  }, [initialPage]);

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(604, newPage));
    setPage(clamped);
    setIsLoading(true);
    if (onPageChange) {
      onPageChange(clamped);
    }
  };

  const currentSurah = SURAHS_LIST.find(s => s.id === currentSurahId) || SURAHS_LIST[0];

  // Calculate approximate Juz for this page (approx 20 pages per Juz)
  const calculatedJuz = Math.min(30, Math.max(1, Math.ceil(page / 20)));

  return (
    <div className="flex flex-col bg-[#F7F5EE] dark:bg-[#1C201E] rounded-2xl border border-[#E7E2D5] dark:border-[#2D332F] overflow-hidden shadow-xs">
      {/* Top Header matching King Fahd Mushaf Margin */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#FFFFFF] dark:bg-[#1E2220] border-b border-[#E7E2D5] dark:border-[#2D332F] text-[#222A26] dark:text-[#E8E6DF] text-sm font-arabic">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2D5A42] dark:text-[#52B788]" />
          <span className="font-semibold text-[#1C2320] dark:text-[#F0EDE6]">
            سورة {currentSurah.name_ar}
          </span>
          <span className="text-[#8D968F] text-xs">·</span>
          <span className="text-[#556059] dark:text-[#A0A8A3] text-xs">
            الجزء {calculatedJuz}
          </span>
        </div>

        {/* Source citation */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#556059] dark:text-[#A0A8A3]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A42] dark:text-[#52B788]" />
          <span>مصحف المدينة النبوية (مجمع الملك فهد لطباعة المصحف الشريف)</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
            className="p-1.5 rounded-lg hover:bg-[#EFECE3] dark:hover:bg-[#2B312D] text-[#556059] dark:text-[#A0A8A3] transition-colors"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
            className="p-1.5 rounded-lg hover:bg-[#EFECE3] dark:hover:bg-[#2B312D] text-[#556059] dark:text-[#A0A8A3] transition-colors"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="p-1.5 rounded-lg hover:bg-[#EFECE3] dark:hover:bg-[#2B312D] text-[#556059] dark:text-[#A0A8A3] transition-colors"
            title={isNightMode ? 'الوضع النهاري' : 'الوضع المريح'}
          >
            {isNightMode ? <Sun className="w-4 h-4 text-[#D9A74A]" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Page Viewport */}
      <div className="relative overflow-auto flex items-center justify-center min-h-[480px] max-h-[720px] p-4 bg-[#EDE8DE]/60 dark:bg-[#141715]/90">
        <div
          className={`relative transition-transform duration-200 ease-out shadow-md rounded-xl overflow-hidden border border-[#D5CDBD]/60 ${
            isNightMode ? 'filter invert hue-rotate-180 brightness-90 contrast-125' : ''
          }`}
          style={{ width: `${zoomLevel}%`, maxWidth: '640px' }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-[#F7F5EE]/90 dark:bg-[#1E2220]/90 flex items-center justify-center z-10 backdrop-blur-xs">
              <span className="text-xs font-arabic text-[#556059] dark:text-[#A0A8A3] animate-pulse">
                جارٍ تحميل صفحة المصحف الشريف...
              </span>
            </div>
          )}

          <img
            src={getKingFahdPageUrl(page)}
            alt={`صفحة ${page} من مصحف مجمع الملك فهد`}
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="w-full h-auto block select-none"
          />
        </div>
      </div>

      {/* Bottom Page Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#FFFFFF] dark:bg-[#1E2220] border-t border-[#E7E2D5] dark:border-[#2D332F]">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#444E48] dark:text-[#C5CEC8] hover:bg-[#F2EEE5] dark:hover:bg-[#282E2A] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الصفحة السابقة</span>
        </button>

        {/* Page selector / counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6F7972]">صفحة</span>
          <input
            type="number"
            min={1}
            max={604}
            value={page}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) handlePageChange(val);
            }}
            className="w-16 px-2 py-1 text-center font-mono text-xs font-bold bg-[#FAF8F2] dark:bg-[#272C29] border border-[#D5CFBF] dark:border-[#38403B] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D5A42]"
          />
          <span className="text-xs text-[#6F7972] font-mono">/ 604</span>
        </div>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= 604}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#444E48] dark:text-[#C5CEC8] hover:bg-[#F2EEE5] dark:hover:bg-[#282E2A] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <span>الصفحة التالية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
