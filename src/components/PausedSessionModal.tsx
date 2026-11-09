import React from 'react';
import { Play, RotateCcw, Clock, BookOpen, Eye, EyeOff, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { StageType } from '../types/quran';

interface PausedSessionModalProps {
  isOpen: boolean;
  surahName: string;
  chunkLabel: string;
  currentStage: StageType;
  repsDone: number;
  targetReps: number;
  pausedAt?: string;
  onResume: () => void;
  onRestartChunk: () => void;
  onChangePlan: () => void;
}

const STAGE_NAMES: Record<StageType, { label: string; icon: React.ReactNode; color: string }> = {
  visible: {
    label: '١. النظر والتكرار',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  gradual_mask: {
    label: '٢. الإخفاء التدريجي',
    icon: <EyeOff className="w-4 h-4" />,
    color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
  },
  alignment_test: {
    label: '٣. التسميع والمحاذاة اللحظية',
    icon: <Mic className="w-4 h-4" />,
    color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
  },
  full_mask: {
    label: 'الإخفاء الكامل',
    icon: <EyeOff className="w-4 h-4" />,
    color: 'text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400',
  },
  chaining: {
    label: 'الربط التراكمي',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400',
  },
};

export const PausedSessionModal: React.FC<PausedSessionModalProps> = ({
  isOpen,
  surahName,
  chunkLabel,
  currentStage,
  repsDone,
  targetReps,
  pausedAt,
  onResume,
  onRestartChunk,
  onChangePlan,
}) => {
  if (!isOpen) return null;

  const stageInfo = STAGE_NAMES[currentStage] || STAGE_NAMES.visible;
  const formattedDate = pausedAt
    ? new Date(pausedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    : 'الآن';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E2220] w-full max-w-md rounded-3xl p-6 border border-[#E7E2D5] dark:border-[#2D332F] shadow-2xl text-center space-y-5">
        {/* Top Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAF4EE] dark:bg-[#1B2B22] border border-[#CDE5D5] dark:border-[#2D4D3A] flex items-center justify-center text-[#284E3A] dark:text-[#52B788] shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#1C2320] dark:text-[#ECE9E2]">
            الجلسة موقوفة مؤقتاً
          </h2>
          <p className="text-xs text-[#5C6660] dark:text-[#A3ADA6]">
            تم حفظ موضعك وتكراراتك بدقة للرجوع والمتابعة لاحقاً
          </p>
        </div>

        {/* Saved Session Details Card */}
        <div className="bg-[#FAF8F2] dark:bg-[#252A27] rounded-2xl p-4 border border-[#E7E2D5] dark:border-[#2D332F] text-right space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE7DA] dark:border-[#2F3631]">
            <span className="text-[#647069] dark:text-[#9DA7A1]">المقرر والسورة:</span>
            <span className="font-bold text-[#1C2320] dark:text-[#ECE9E2] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#284E3A] dark:text-[#52B788]" />
              سورة {surahName} ({chunkLabel})
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#ECE7DA] dark:border-[#2F3631]">
            <span className="text-[#647069] dark:text-[#9DA7A1]">المرحلة عند الإيقاف:</span>
            <span className={`font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] ${stageInfo.color}`}>
              {stageInfo.icon}
              {stageInfo.label}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#ECE7DA] dark:border-[#2F3631]">
            <span className="text-[#647069] dark:text-[#9DA7A1]">التكرارات المنجزة:</span>
            <span className="font-bold font-mono text-[#284E3A] dark:text-[#52B788]">
              {repsDone} من {targetReps} تكرار
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#647069] dark:text-[#9DA7A1]">وقت الإيقاف:</span>
            <span className="font-mono text-[#636E67] dark:text-[#9DA7A1]">{formattedDate}</span>
          </div>
        </div>

        {/* Guidance tip */}
        <div className="p-2.5 rounded-xl bg-[#EAF4EE] dark:bg-[#1B2B22] text-[#245037] dark:text-[#52B788] text-[11px] flex items-center gap-2 text-right">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D5A42] dark:text-[#52B788]" />
          <span>يمكنك إغلاق الصفحة والعودة في أي وقت، وسيتم الاحتفاظ بموضعك تلقائياً.</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary Resume CTA */}
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#284E3A] hover:bg-[#1E3B2C] text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>استئناف الحفظ والمتابعة</span>
          </button>

          {/* Secondary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRestartChunk}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FAF8F2] dark:bg-[#252A27] hover:bg-[#EAE5DC] text-[#444E48] dark:text-[#C5CEC8] border border-[#E7E2D5] dark:border-[#2D332F] text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة هذا المقطع</span>
            </button>
            <button
              onClick={onChangePlan}
              className="flex-1 py-2 px-3 rounded-xl bg-[#FAF8F2] dark:bg-[#252A27] hover:bg-[#EAE5DC] text-[#444E48] dark:text-[#C5CEC8] border border-[#E7E2D5] dark:border-[#2D332F] text-xs font-medium transition-colors"
            >
              <span>تغيير الخطة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
