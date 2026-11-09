import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Mic,
  MicOff,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  Star,
  ThumbsUp,
  RefreshCw,
  Bot,
  Plus,
  Minus,
  Lock,
  Check,
  Pause,
  Clock,
  ShieldCheck,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { QuranVerse, PlanConfig, StageType, EvaluationRating, PausedSessionState } from '../types/quran';
import { SURAHS_LIST, getVerseAudioUrl, RECITERS } from '../data/surahs';
import { InteractiveVerseDisplay } from './InteractiveVerseDisplay';
import { AudioPlayer } from './AudioPlayer';
import { KingFahdPageViewer } from './KingFahdPageViewer';
import { useQuranSpeechRecognizer } from '../hooks/useQuranSpeechRecognizer';
import { useRamAudioRecorder } from '../hooks/useRamAudioRecorder';
import { UserAudioRamRecorder } from './UserAudioRamRecorder';
import { PausedSessionModal } from './PausedSessionModal';

export type MemorizationUnitType = 'single_ayah' | 'multi_ayah_3' | 'multi_ayah_5' | 'half_page' | 'full_page';

interface MemorizationStudioProps {
  verses: QuranVerse[];
  plan: PlanConfig;
  onOpenPlanModal: () => void;
  onResetSession: () => void;
}

/**
 * Group verses into units: single verse, 3 verses, 5 verses, half-page, or full page
 */
function groupVersesIntoChunks(allVerses: QuranVerse[], unitType: MemorizationUnitType): QuranVerse[][] {
  if (!allVerses || allVerses.length === 0) return [];

  if (unitType === 'single_ayah') {
    return allVerses.map(v => [v]);
  }

  if (unitType === 'multi_ayah_3') {
    const chunks: QuranVerse[][] = [];
    for (let i = 0; i < allVerses.length; i += 3) {
      chunks.push(allVerses.slice(i, i + 3));
    }
    return chunks;
  }

  if (unitType === 'multi_ayah_5') {
    const chunks: QuranVerse[][] = [];
    for (let i = 0; i < allVerses.length; i += 5) {
      chunks.push(allVerses.slice(i, i + 5));
    }
    return chunks;
  }

  if (unitType === 'half_page') {
    const pageMap: Record<number, QuranVerse[]> = {};
    for (const v of allVerses) {
      const p = v.page_number || 1;
      if (!pageMap[p]) pageMap[p] = [];
      pageMap[p].push(v);
    }
    const chunks: QuranVerse[][] = [];
    for (const p of Object.keys(pageMap).map(Number)) {
      const pVerses = pageMap[p];
      if (pVerses.length <= 4) {
        chunks.push(pVerses);
      } else {
        const mid = Math.ceil(pVerses.length / 2);
        chunks.push(pVerses.slice(0, mid));
        chunks.push(pVerses.slice(mid));
      }
    }
    return chunks;
  }

  if (unitType === 'full_page') {
    const pageMap: Record<number, QuranVerse[]> = {};
    for (const v of allVerses) {
      const p = v.page_number || 1;
      if (!pageMap[p]) pageMap[p] = [];
      pageMap[p].push(v);
    }
    return Object.values(pageMap);
  }

  return allVerses.map(v => [v]);
}

export const MemorizationStudio: React.FC<MemorizationStudioProps> = ({
  verses,
  plan,
  onOpenPlanModal,
}) => {
  // Memorization Unit Selection: Single Ayah, 3 Ayahs, 5 Ayahs, Half Page, or Full Page
  const [unitType, setUnitType] = useState<MemorizationUnitType>('single_ayah');
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);

  // Authoritative Stage Control: 'visible' -> 'gradual_mask' -> 'alignment_test'
  const [currentStage, setCurrentStage] = useState<StageType>('visible');
  const [targetRepsSetting, setTargetRepsSetting] = useState<number>(plan.visible_target_reps || 3);
  const [repsDone, setRepsDone] = useState<number>(0);
  const [showFullVerse, setShowFullVerse] = useState<boolean>(true);

  // Stage completion locks: Cannot proceed to next stage without finishing current
  const [completedStages, setCompletedStages] = useState<{
    visible: boolean;
    gradual_mask: boolean;
    alignment_test: boolean;
  }>({
    visible: false,
    gradual_mask: false,
    alignment_test: false,
  });

  // Track overall session completion & view mode
  const [isPlanCompleted, setIsPlanCompleted] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'mushaf_page'>('interactive');

  // Reciter: Al-Hudhaify or Husary Muallim
  const [reciterId, setReciterId] = useState<string>(
    RECITERS.some(r => r.identifier === plan.reciter_id) ? plan.reciter_id : RECITERS[0].identifier
  );

  // Evaluation & AI Feedback state
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);
  const [isAiChecking, setIsAiChecking] = useState<boolean>(false);

  // In-memory RAM Audio Recorder for Stage 3 (التسميع الغيبي)
  const ramRecorder = useRamAudioRecorder();

  // Session Pause & Resume state across all stages
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pausedAt, setPausedAt] = useState<string | undefined>(undefined);
  const [savedSessionPrompt, setSavedSessionPrompt] = useState<PausedSessionState | null>(null);

  // Three-tier chunk evaluations for Stage 3: 'solid' | 'hesitant' | 'weak' (مثبت، متردد، متفلت)
  const [chunkEvaluations, setChunkEvaluations] = useState<Record<number, EvaluationRating>>({});

  // Detect saved paused session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ratel_paused_session_v1');
      if (saved) {
        const parsed: PausedSessionState = JSON.parse(saved);
        if (parsed.plan?.surah_id === plan.surah_id) {
          setSavedSessionPrompt(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [plan.surah_id]);

  // Generate chunks based on unitType
  const chunks = useMemo(() => groupVersesIntoChunks(verses, unitType), [verses, unitType]);
  const currentChunk = chunks[currentChunkIndex] || chunks[0] || [];

  const chunkLabel = useMemo(() => {
    if (currentChunk.length === 1) {
      return `الآية ${currentChunk[0]?.ayah_number}`;
    }
    if (currentChunk.length > 1) {
      const first = currentChunk[0]?.ayah_number;
      const last = currentChunk[currentChunk.length - 1]?.ayah_number;
      return `الآيات (${first} إلى ${last}) [${currentChunk.length} آيات]`;
    }
    return '';
  }, [currentChunk]);

  // Reset chunk index when unit type changes
  const handleUnitTypeChange = (newUnit: MemorizationUnitType) => {
    setUnitType(newUnit);
    setCurrentChunkIndex(0);
    setCurrentStage('visible');
    setRepsDone(0);
    setShowFullVerse(true);
    setCompletedStages({ visible: false, gradual_mask: false, alignment_test: false });
    setEvaluationFeedback(null);
    ramRecorder.resetRecording();
  };

  const currentSurah = SURAHS_LIST.find(s => s.id === plan.surah_id) || SURAHS_LIST[0];

  // Flatten words for current chunk
  const currentChunkWords = useMemo(() => {
    return currentChunk.flatMap(v =>
      v.words.map(w => ({
        ...w,
        verse_ayah: v.ayah_number,
      }))
    );
  }, [currentChunk]);

  // Audio URLs for all verses in chunk
  const chunkAudioUrls = useMemo(() => {
    return currentChunk.map(v => getVerseAudioUrl(reciterId, v.surah_id, v.ayah_number));
  }, [currentChunk, reciterId]);

  // Audio URL for first verse in chunk
  const primaryAudioUrl = useMemo(() => {
    if (!currentChunk[0]) return '';
    return getVerseAudioUrl(reciterId, currentChunk[0].surah_id, currentChunk[0].ayah_number);
  }, [currentChunk, reciterId]);

  // Trigger celebratory confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#2D5A42', '#347552', '#DFAD47', '#C28424'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handlePerfectMatchRef = useRef<() => void>(() => {});

  // Speech Recognition Hook with target words of current chunk
  const {
    isListening,
    transcript,
    alignment,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    resetRecognition,
    revealNextWordManually,
  } = useQuranSpeechRecognizer({
    targetWords: currentChunkWords,
    onPerfectMatch: () => handlePerfectMatchRef.current(),
    autoAdvanceOn100: plan.auto_advance_on_100,
  });

  // Advance to next chunk or finish plan
  const advanceToNextChunk = useCallback(() => {
    ramRecorder.resetRecording();
    if (currentChunkIndex < chunks.length - 1) {
      setCurrentChunkIndex(prev => prev + 1);
      setCurrentStage('visible');
      setRepsDone(0);
      setShowFullVerse(true);
      setCompletedStages({ visible: false, gradual_mask: false, alignment_test: false });
      resetRecognition();
      stopListening();
      setEvaluationFeedback(null);
    } else {
      setIsPlanCompleted(true);
      triggerConfetti();
    }
  }, [currentChunkIndex, chunks.length, resetRecognition, stopListening, triggerConfetti, ramRecorder]);

  // Unified Automatic Repetition Progressor across all stages
  const handleIncrementRep = useCallback(() => {
    setRepsDone(prevReps => {
      const nextRep = prevReps + 1;

      if (nextRep >= targetRepsSetting) {
        if (currentStage === 'visible') {
          // Stage 1 completed! Automatically advance to Stage 2 and turn on the microphone
          setCompletedStages(prev => ({ ...prev, visible: true }));
          triggerConfetti();
          setEvaluationFeedback('✓ أتممت مرحلة النظر والتكرار! تم الانتقال تلقائياً لمرحلة الإخفاء وتشغيل الميكروفون 🎙️');
          setTimeout(() => {
            setCurrentStage('gradual_mask');
            setRepsDone(0);
            setShowFullVerse(false);
            setTargetRepsSetting(plan.masked_target_reps || 3);
            resetRecognition();
            startListening(); // Auto-start microphone
          }, 1200);
        } else if (currentStage === 'gradual_mask') {
          // Stage 2 completed! Automatically advance to Stage 3 with mic ON
          setCompletedStages(prev => ({ ...prev, gradual_mask: true }));
          triggerConfetti();
          setEvaluationFeedback('✓ أتممت تكرارات الإخفاء التدريجي! تم الانتقال تلقائياً للتسميع الغيبي والمحاذاة بالصوت 🎙️');
          setTimeout(() => {
            setCurrentStage('alignment_test');
            setRepsDone(0);
            setShowFullVerse(false);
            setTargetRepsSetting(plan.chain_target_reps || 3);
            resetRecognition();
            startListening(); // Keep mic active
          }, 1200);
        } else if (currentStage === 'alignment_test') {
          // Stage 3 completed! Automatically advance to the next chunk
          setCompletedStages(prev => ({ ...prev, alignment_test: true }));
          triggerConfetti();
          setEvaluationFeedback(`ما شاء الله تبارك الله! أتممت كافة تكرارات التسميع الغيبي بنجاح (${nextRep}/${targetRepsSetting}) 🎉 تم إتقان المقطع!`);
          setTimeout(() => {
            advanceToNextChunk();
          }, 1600);
        }
        return nextRep;
      } else {
        // Next repetition within the current stage
        if (currentStage === 'visible') {
          setEvaluationFeedback(`✓ تكرار النظر (${nextRep} من ${targetRepsSetting}) 📖 - استمر في التكرار`);
          setTimeout(() => {
            resetRecognition();
          }, 800);
        } else if (currentStage === 'gradual_mask') {
          setEvaluationFeedback(`✓ تكرار إخفاء متقن (${nextRep} من ${targetRepsSetting})! تم زيادة نسبة الإخفاء تلقائياً للتكرار التالي... 🎭`);
          setTimeout(() => {
            resetRecognition();
            startListening(); // Keep listening for next repetition
          }, 1000);
        } else {
          setEvaluationFeedback(`ما شاء الله! تلاوة متقنة 100% (تكرار التسميع ${nextRep} من ${targetRepsSetting}). كرّر التسميع لتثبيت الحفظ 🔁`);
          setTimeout(() => {
            resetRecognition();
            startListening(); // Keep listening for next repetition
          }, 1000);
        }
        return nextRep;
      }
    });
  }, [currentStage, targetRepsSetting, plan, triggerConfetti, resetRecognition, startListening, advanceToNextChunk]);

  useEffect(() => {
    handlePerfectMatchRef.current = handleIncrementRep;
  }, [handleIncrementRep]);

  // Guided Authoritative Stage Switcher: User can only select stages that are unlocked
  const handleStageSelect = (stage: StageType) => {
    if (stage === 'gradual_mask' && !completedStages.visible && currentStage !== 'gradual_mask') {
      setEvaluationFeedback('🔒 المرحلة مقفلة: يرجى إتمام تكرار مرحلة النظر أولاً.');
      return;
    }
    if (stage === 'alignment_test' && !completedStages.gradual_mask && currentStage !== 'alignment_test') {
      setEvaluationFeedback('🔒 المرحلة مقفلة: يرجى إتمام مرحلة الإخفاء التدريجي أولاً.');
      return;
    }

    setCurrentStage(stage);
    setRepsDone(0);
    resetRecognition();

    if (stage === 'visible') {
      setShowFullVerse(true);
      setTargetRepsSetting(plan.visible_target_reps || 3);
      stopListening();
    } else if (stage === 'gradual_mask') {
      setShowFullVerse(false);
      setTargetRepsSetting(plan.masked_target_reps || 3);
      // Automatically activate microphone as soon as stage 1 ends / stage 2 starts
      startListening();
    } else if (stage === 'alignment_test') {
      setShowFullVerse(false);
      setTargetRepsSetting(plan.chain_target_reps || 3);
      // Automatically activate microphone in alignment test
      startListening();
    }
  };

  const handleDecrementRep = () => {
    setRepsDone(prev => Math.max(0, prev - 1));
  };

  const handleResetReps = () => {
    setRepsDone(0);
    resetRecognition();
    setEvaluationFeedback('تمت إعادة ضبط عداد التكرار.');
  };

  // Pause & Resume Session Handlers across all stages
  const handlePauseSession = useCallback(() => {
    stopListening();
    if (ramRecorder.isRecording) {
      ramRecorder.stopRecording();
    }
    const now = new Date().toISOString();
    setPausedAt(now);
    const sessionData: PausedSessionState = {
      plan,
      unitType,
      currentChunkIndex,
      currentStage,
      repsDone,
      targetRepsSetting,
      completedStages,
      chunkEvaluations,
      pausedAt: now,
      surahName: currentSurah.name_ar,
      chunkLabel,
    };
    try {
      localStorage.setItem('ratel_paused_session_v1', JSON.stringify(sessionData));
    } catch {
      // ignore
    }
    setIsPaused(true);
  }, [plan, unitType, currentChunkIndex, currentStage, repsDone, targetRepsSetting, completedStages, chunkEvaluations, currentSurah.name_ar, chunkLabel, stopListening, ramRecorder]);

  const handleResumeSession = useCallback(() => {
    setIsPaused(false);
    if (currentStage === 'gradual_mask' || currentStage === 'alignment_test') {
      startListening();
    }
  }, [currentStage, startListening]);

  const handleRestoreSavedSession = useCallback(() => {
    if (!savedSessionPrompt) return;
    setUnitType(savedSessionPrompt.unitType || 'single_ayah');
    setCurrentChunkIndex(savedSessionPrompt.currentChunkIndex || 0);
    setCurrentStage(savedSessionPrompt.currentStage || 'visible');
    setRepsDone(savedSessionPrompt.repsDone || 0);
    setTargetRepsSetting(savedSessionPrompt.targetRepsSetting || 3);
    if (savedSessionPrompt.completedStages) {
      setCompletedStages(savedSessionPrompt.completedStages);
    }
    if (savedSessionPrompt.chunkEvaluations) {
      setChunkEvaluations(savedSessionPrompt.chunkEvaluations);
    }
    setSavedSessionPrompt(null);
    setEvaluationFeedback(`تم استئناف جلستك المحفوظة (${savedSessionPrompt.chunkLabel}) بنجاح!`);
  }, [savedSessionPrompt]);

  const handleDismissSavedSession = useCallback(() => {
    setSavedSessionPrompt(null);
  }, []);

  const handleRestartChunk = useCallback(() => {
    setRepsDone(0);
    resetRecognition();
    ramRecorder.resetRecording();
    setCurrentStage('visible');
    setShowFullVerse(true);
    setCompletedStages({ visible: false, gradual_mask: false, alignment_test: false });
    setIsPaused(false);
    setEvaluationFeedback('تمت إعادة المقطع إلى مرحلة النظر والتكرار لتثبيت الحفظ.');
  }, [resetRecognition, ramRecorder]);

  // Three-tier Stage 3 Evaluation: مُثبَّت، مُتردِّد، مُتفلِّت
  // 1. مثبت (Solid / Mastered)
  const handleRateSolid = useCallback(() => {
    setChunkEvaluations(prev => ({ ...prev, [currentChunkIndex]: 'solid' }));
    triggerConfetti();
    setCompletedStages(prev => ({ ...prev, alignment_test: true }));
    setEvaluationFeedback('ما شاء الله تبارك الله! الحفظ مُثبَّت ومتقن بجدارة (100%) 🎉');
    setTimeout(() => {
      advanceToNextChunk();
    }, 1200);
  }, [currentChunkIndex, triggerConfetti, advanceToNextChunk]);

  // 2. متردد (Hesitant / Needs Practice)
  const handleRateHesitant = useCallback(() => {
    setChunkEvaluations(prev => ({ ...prev, [currentChunkIndex]: 'hesitant' }));
    setTargetRepsSetting(prev => prev + 2);
    resetRecognition();
    setEvaluationFeedback('✓ الحفظ يحتاج تمكيناً وتثبيتاً؛ أضفنا تكرارين إضافيين لتثبيت المقطع 🔁 كرّر التسميع الآن');
    setTimeout(() => {
      startListening();
    }, 600);
  }, [currentChunkIndex, resetRecognition, startListening]);

  // 3. متفلت (Weak / Needs Re-memorization)
  const handleRateWeak = useCallback(() => {
    setChunkEvaluations(prev => ({ ...prev, [currentChunkIndex]: 'weak' }));
    setRepsDone(0);
    resetRecognition();
    ramRecorder.resetRecording();
    setCurrentStage('visible');
    setShowFullVerse(true);
    setCompletedStages({ visible: false, gradual_mask: false, alignment_test: false });
    stopListening();
    setEvaluationFeedback('المقطع متفلّت ويحتاج إعادة ضبط؛ تمت إعادته إلى مرحلة النظر والتكرار لتثبيته من جديد 📖');
  }, [currentChunkIndex, resetRecognition, ramRecorder, stopListening]);

  // AI Recitation Check via Gemini
  const handleAiCheck = async () => {
    if (!transcript) {
      setEvaluationFeedback('يرجى القراءة عبر الميكروفون أولاً ليتمكن الذكاء الاصطناعي من فحص التلاوة.');
      return;
    }
    setIsAiChecking(true);
    try {
      const fullUthmani = currentChunk.map(v => v.text_uthmani).join(' ');
      const res = await fetch('/api/gemini-recitation-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedVerse: fullUthmani,
          spokenTranscript: transcript,
          ayahNumber: currentChunk[0]?.ayah_number || 1,
          surahName: currentSurah.name_ar,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluationFeedback(data.feedback || 'أحسنت! القراءة صحيحة ومطابقة.');
        if (data.isPerfect || data.accuracy >= 95) {
          handleIncrementRep();
        }
      } else {
        setEvaluationFeedback('تم التقييم اللحظي عبر المحلل المدمج.');
      }
    } catch {
      setEvaluationFeedback('تم التقييم اللحظي عبر المحلل المدمج.');
    } finally {
      setIsAiChecking(false);
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[96vw] mx-auto space-y-4">
      {/* Saved Paused Session Resume Notification Banner */}
      {savedSessionPrompt && (
        <div className="bg-[#EAF4EE] dark:bg-[#1B2B22] border border-[#CDE5D5] dark:border-[#2D4D3A] rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between text-xs gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-[#245037] dark:text-[#68D391]">
            <Clock className="w-4 h-4 text-[#284E3A] dark:text-[#52B788] shrink-0" />
            <span>
              لديك جلسة سابقة موقوفة مؤقتاً: <strong>سورة {savedSessionPrompt.surahName}</strong> ({savedSessionPrompt.chunkLabel}) - أتممت فيها {savedSessionPrompt.repsDone} تكرارات.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreSavedSession}
              className="px-3.5 py-1.5 rounded-xl bg-[#284E3A] hover:bg-[#1E3B2C] text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
            >
              استئناف من حيث توقفت ▶
            </button>
            <button
              onClick={handleDismissSavedSession}
              className="text-[#647069] dark:text-[#9DA7A1] hover:text-[#1C2320] text-xs px-2 py-1 rounded-lg hover:bg-black/5"
            >
              تجاهل
            </button>
          </div>
        </div>
      )}

      {/* Top Header Strip: Scope, Unit selection, & Plan Settings */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E2220] rounded-2xl p-3 sm:p-4 border border-[#E7E2D5] dark:border-[#2D332F] shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Plan Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A42] dark:text-[#52B788]">
              <span>سورة {currentSurah.name_ar}</span>
              <span className="text-[#D8D2C4] dark:text-[#3B433E]">|</span>
              <span className="text-[#556059] dark:text-[#A0A8A3]">
                {chunkLabel} (مقطع {currentChunkIndex + 1} من {chunks.length})
              </span>
            </div>
          </div>

          {/* Unit Scope Selector */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF8F2] dark:bg-[#252A27] rounded-xl border border-[#E7E2D5] dark:border-[#2D332F]">
            {[
              { id: 'single_ayah', label: 'آية بآية' },
              { id: 'multi_ayah_3', label: '٣ آيات' },
              { id: 'multi_ayah_5', label: '٥ آيات' },
              { id: 'half_page', label: 'نصف وجه' },
              { id: 'full_page', label: 'صفحة كاملة' },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => handleUnitTypeChange(u.id as MemorizationUnitType)}
                className={`px-2 py-1 text-xs rounded-lg transition-all ${
                  unitType === u.id
                    ? 'bg-[#284E3A] text-white font-bold shadow-2xs'
                    : 'text-[#444E48] dark:text-[#C5CEC8] hover:bg-[#EAE5DC]'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          {/* View Toggles, Mic Quick Button, Pause & Change Plan */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Quick Prominent Mic Button in Header */}
            <button
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                isListening
                  ? 'bg-[#C2410C] hover:bg-[#9A3412] text-white animate-pulse'
                  : 'bg-[#284E3A] hover:bg-[#1E3B2C] text-white'
              }`}
              title="تفعيل الميكروفون للمحاذاة اللحظية مع نطقك"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>اللاقط نشط (إيقاف)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>الميكروفون والمحاذاة</span>
                </>
              )}
            </button>

            <div className="flex items-center bg-[#F4F1EA] dark:bg-[#252A27] p-0.5 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewMode('interactive')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'interactive'
                    ? 'bg-white dark:bg-[#1E2220] text-[#1C2320] dark:text-[#ECE9E2] shadow-2xs font-semibold'
                    : 'text-[#5C6660] dark:text-[#A3ADA6]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#2D5A42] dark:text-[#52B788]" />
                <span>لوحة الحفظ</span>
              </button>
              <button
                onClick={() => setViewMode('mushaf_page')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'mushaf_page'
                    ? 'bg-white dark:bg-[#1E2220] text-[#1C2320] dark:text-[#ECE9E2] shadow-2xs font-semibold'
                    : 'text-[#5C6660] dark:text-[#A3ADA6]'
                }`}
              >
                <BookOpen className="w-3 h-3 text-[#C28424]" />
                <span>مصحف المدينة</span>
              </button>
            </div>

            {/* Quick Pause Button in Header */}
            <button
              onClick={handlePauseSession}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#8C5E14] dark:text-[#ECC94B] bg-[#FEF8EC] dark:bg-[#2D2619] border border-[#F2DEB5] dark:border-[#4D3F25] rounded-xl hover:bg-[#FDF0D5] transition-colors shadow-2xs active:scale-95"
              title="إيقاف الجلسة مؤقتاً للرجوع إليها لاحقاً"
            >
              <Pause className="w-3 h-3 fill-current" />
              <span>إيقاف مؤقت</span>
            </button>

            <button
              onClick={onOpenPlanModal}
              className="px-2.5 py-1 text-xs font-medium text-[#245037] dark:text-[#68D391] bg-[#EAF4EE] dark:bg-[#1B2B22] border border-[#CDE5D5] dark:border-[#2D4D3A] rounded-xl hover:bg-[#DDF0E3] transition-colors"
            >
              تغيير الخطة
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      {viewMode === 'mushaf_page' ? (
        <div className="space-y-3">
          <div className="bg-[#FBF6ED] dark:bg-[#262116] border border-[#EADBBE] dark:border-[#3D3320] rounded-xl p-2.5 text-xs text-[#8A5A12] dark:text-[#ECC94B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#C28424]" />
              <span>مصحف المدينة النبوية (مجمع الملك فهد لطباعة المصحف الشريف)</span>
            </div>
            <button
              onClick={() => setViewMode('interactive')}
              className="text-xs font-semibold underline hover:text-[#5E3C06]"
            >
              العودة للوحة الحفظ
            </button>
          </div>
          <KingFahdPageViewer
            initialPage={currentChunk[0]?.page_number || currentSurah.page_start}
            currentSurahId={currentSurah.id}
            highlightAyah={currentChunk[0]?.ayah_number}
          />
        </div>
      ) : isPlanCompleted ? (
        /* Completion Celebration Card */
        <div className="bg-white dark:bg-[#1E2220] rounded-3xl p-8 border border-[#C5E1D1] dark:border-[#2B4737] text-center shadow-xs space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF4EE] dark:bg-[#1B2B22] border border-[#CDE5D5] dark:border-[#2D4D3A] flex items-center justify-center text-[#245037] dark:text-[#52B788]">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A42] dark:text-[#52B788]">
              ما شاء الله تبارك الله
            </span>
            <h2 className="text-2xl font-bold text-[#1C2320] dark:text-[#ECE9E2]">
              تم إتمام حفظ المقرر المحدد بنجاح وإتقان!
            </h2>
            <p className="text-[#556059] dark:text-[#A0A8A3] max-w-lg mx-auto text-xs leading-relaxed">
              أتممت قراءة وتكرار آيات سورة {currentSurah.name_ar} عبر المسار التعليمي المتقن بالمحاذاة اللحظية.
            </p>
          </div>

          {/* Evaluation Breakdown Summary */}
          {Object.keys(chunkEvaluations).length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF4EE] dark:bg-[#1B2B22] border border-[#CDE5D5] dark:border-[#2D4D3A] text-xs font-bold text-[#1E4E38] dark:text-[#68D391]">
                <CheckCircle className="w-4 h-4 text-[#284E3A] dark:text-[#52B788]" />
                <span>{Object.values(chunkEvaluations).filter(v => v === 'solid').length} مقاطع مُثبَّتة</span>
              </div>
              {Object.values(chunkEvaluations).filter(v => v === 'hesitant').length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF8EC] dark:bg-[#2D2619] border border-[#F2DEB5] dark:border-[#4D3F25] text-xs font-bold text-[#8C5E14] dark:text-[#ECC94B]">
                  <RefreshCw className="w-4 h-4 text-[#C28424]" />
                  <span>{Object.values(chunkEvaluations).filter(v => v === 'hesitant').length} مقاطع مترددة</span>
                </div>
              )}
              {Object.values(chunkEvaluations).filter(v => v === 'weak').length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] dark:bg-[#2D1B1B] border border-[#FECACA] dark:border-[#522929] text-xs font-bold text-[#991B1B] dark:text-[#F87171]">
                  <RotateCcw className="w-4 h-4 text-[#DC2626]" />
                  <span>{Object.values(chunkEvaluations).filter(v => v === 'weak').length} مقاطع متفلتة</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                setIsPlanCompleted(false);
                setCurrentChunkIndex(0);
                setCurrentStage('visible');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#284E3A] hover:bg-[#1E3B2C] text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة مراجعة هذا المقرر</span>
            </button>
            <button
              onClick={onOpenPlanModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F1ECE2] dark:bg-[#252A27] hover:bg-[#E8E2D6] text-[#2C342F] dark:text-[#D5DDD7] font-medium text-xs transition-colors"
            >
              <span>اختيار سورة جديدة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* The Guided Memorization Studio */
        <div className="space-y-3.5">
          {/* The Authoritative Guided Step Bar: Cannot advance until previous stage completes */}
          <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#1E2220] rounded-2xl border border-[#E7E2D5] dark:border-[#2D332F] shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
              {/* Stepper with Lock Icons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {/* Step 1: Visible */}
                <button
                  onClick={() => handleStageSelect('visible')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    currentStage === 'visible'
                      ? 'bg-[#284E3A] text-white shadow-xs'
                      : completedStages.visible
                      ? 'bg-[#EAF4EE] text-[#1E4E38] dark:bg-[#1B2B22] dark:text-[#68D391]'
                      : 'bg-[#FAF8F2] dark:bg-[#252A27] text-[#444E48] dark:text-[#C5CEC8]'
                  }`}
                >
                  {completedStages.visible ? (
                    <Check className="w-3.5 h-3.5 text-[#2D5A42] dark:text-[#52B788]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>١. النظر والتكرار</span>
                </button>

                {/* Step 2: Gradual Mask */}
                <button
                  onClick={() => handleStageSelect('gradual_mask')}
                  disabled={!completedStages.visible && currentStage !== 'gradual_mask'}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    currentStage === 'gradual_mask'
                      ? 'bg-[#284E3A] text-white shadow-xs'
                      : completedStages.gradual_mask
                      ? 'bg-[#EAF4EE] text-[#1E4E38] dark:bg-[#1B2B22] dark:text-[#68D391]'
                      : 'bg-[#FAF8F2] dark:bg-[#252A27] text-[#444E48] dark:text-[#C5CEC8] opacity-60'
                  }`}
                  title={!completedStages.visible ? 'أكمل تكرارات مرحلة النظر أولاً لفتح هذه المرحلة' : ''}
                >
                  {completedStages.gradual_mask ? (
                    <Check className="w-3.5 h-3.5 text-[#2D5A42] dark:text-[#52B788]" />
                  ) : !completedStages.visible ? (
                    <Lock className="w-3 h-3 text-[#A59D8E]" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  <span>٢. الإخفاء التدريجي</span>
                </button>

                {/* Step 3: Strict Speech Test */}
                <button
                  onClick={() => handleStageSelect('alignment_test')}
                  disabled={!completedStages.gradual_mask && currentStage !== 'alignment_test'}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    currentStage === 'alignment_test'
                      ? 'bg-[#284E3A] text-white shadow-xs'
                      : completedStages.alignment_test
                      ? 'bg-[#EAF4EE] text-[#1E4E38] dark:bg-[#1B2B22] dark:text-[#68D391]'
                      : 'bg-[#FAF8F2] dark:bg-[#252A27] text-[#444E48] dark:text-[#C5CEC8] opacity-60'
                  }`}
                  title={!completedStages.gradual_mask ? 'أكمل مرحلة الإخفاء التدريجي أولاً لفتح التسميع الغيبي' : ''}
                >
                  {completedStages.alignment_test ? (
                    <Check className="w-3.5 h-3.5 text-[#2D5A42] dark:text-[#52B788]" />
                  ) : !completedStages.gradual_mask ? (
                    <Lock className="w-3 h-3 text-[#A59D8E]" />
                  ) : (
                    <Mic className="w-3.5 h-3.5" />
                  )}
                  <span>٣. التسميع والمحاذاة</span>
                </button>
              </div>

              {/* Authoritative Instruction Guide for Current Step */}
              <div className="text-xs font-medium text-[#2D5A42] dark:text-[#52B788] flex items-center gap-1.5">
                {currentStage === 'visible' && (
                  <span>📖 اقرأ الآيات مكشوفة مع القارئ ({repsDone} من {targetRepsSetting} تكرارات)</span>
                )}
                {currentStage === 'gradual_mask' && (
                  <span>🎭 اللاقط يعمل تلقائياً: اقرأ واستحضر الكلمات المخفية ({repsDone} من {targetRepsSetting} تكرارات)</span>
                )}
                {currentStage === 'alignment_test' && (
                  <span>🎙️ سمّع غيباً بالصوت حتى تتقن 100% ({repsDone} من {targetRepsSetting} تكرارات)</span>
                )}
              </div>
            </div>
          </div>

          {/* Main Verse Canvas: Dominating the screen area */}
          {currentChunk.length > 0 && (
            <InteractiveVerseDisplay
              verses={currentChunk}
              stage={currentStage}
              maskLevel={
                currentStage === 'gradual_mask'
                  ? Math.min(90, Math.max(30, Math.round(((repsDone + 1) / Math.max(1, targetRepsSetting)) * 100)))
                  : 50
              }
              matchedWordIndices={alignment.matchedWordIndices}
              wordStatuses={alignment.wordStatuses}
              isTestActive={true}
              isListening={isListening}
              strictSpeechReveal={currentStage === 'alignment_test' && !showFullVerse}
              showFullVerse={currentStage === 'visible' || showFullVerse}
              showAyahNumber={true}
            />
          )}

          {/* User Audio In-Memory RAM Recorder specifically for Stage 3 (التسميع الغيبي) */}
          {currentStage === 'alignment_test' && (
            <UserAudioRamRecorder
              recorder={ramRecorder}
              verseLabel={`${currentSurah.name_ar} : ${chunkLabel}`}
            />
          )}

          {/* Compact Control Deck: Repetition / Mic / Audio / Next */}
          <div className="p-3 bg-[#FFFFFF] dark:bg-[#1E2220] rounded-2xl border border-[#E7E2D5] dark:border-[#2D332F] shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Left: Core Actions - Mic ALWAYS Visible + Repetitions in ALL Stages + Hints */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Primary Mic Button: Always accessible across all stages */}
                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                    isListening
                      ? 'bg-[#C2410C] hover:bg-[#9A3412] text-white animate-pulse'
                      : 'bg-[#284E3A] hover:bg-[#1E3B2C] text-white'
                  }`}
                  title="تفعيل الميكروفون للتعرف على الصوت والمحاذاة اللحظية"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>اللاقط نشط (إيقاف)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>الميكروفون والمحاذاة</span>
                    </>
                  )}
                </button>

                {/* 2. Repetition Counter: Available across ALL stages */}
                <div className="flex items-center gap-1.5 bg-[#FAF8F2] dark:bg-[#252A27] p-1 rounded-xl border border-[#E7E2D5] dark:border-[#2D332F]">
                  <button
                    onClick={handleIncrementRep}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#284E3A] hover:bg-[#1E3B2C] text-white text-xs font-bold transition-all active:scale-95 shadow-2xs"
                    title="تسجيل تكرار جديد"
                  >
                    <Plus className="w-3 h-3" />
                    <span>
                      {currentStage === 'visible' && 'تكرار النظر'}
                      {currentStage === 'gradual_mask' && 'تكرار الإخفاء'}
                      {currentStage === 'alignment_test' && 'تكرار التسميع'} ({repsDone}/{targetRepsSetting})
                    </span>
                  </button>

                  <button
                    onClick={handleDecrementRep}
                    disabled={repsDone <= 0}
                    className="w-6 h-6 rounded-md text-[#444E48] dark:text-[#C5CEC8] hover:bg-[#EAE5DC] flex items-center justify-center disabled:opacity-30"
                    title="إنقاص تكرار"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-0.5 text-[10px] text-[#7A857F] px-1">
                    <span>الهدف:</span>
                    {[3, 5, 7, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setTargetRepsSetting(num)}
                        className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
                          targetRepsSetting === num
                            ? 'bg-[#284E3A] text-white font-bold'
                            : 'text-[#444E48] dark:text-[#C5CEC8] hover:bg-[#EAE5DC]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleResetReps}
                    className="p-1 rounded text-[#758079] hover:text-[#1C2320]"
                    title="تصفير العداد"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* 3. Hint Button */}
                <button
                  onClick={revealNextWordManually}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FAF8F2] dark:bg-[#252A27] hover:bg-[#EAE5DC] text-[#444E48] dark:text-[#C5CEC8] border border-[#E7E2D5] dark:border-[#2D332F] text-xs font-medium transition-colors"
                  title="كشف الكلمة التالية كتلميح مساعد"
                >
                  <Sparkles className="w-3 h-3 text-[#C28424]" />
                  <span>تلميح</span>
                </button>

                {/* 4. Reveal/Hide toggle */}
                <button
                  onClick={() => setShowFullVerse(!showFullVerse)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F2] dark:bg-[#252A27] text-[#444E48] dark:text-[#C5CEC8] border border-[#E7E2D5] dark:border-[#2D332F] text-xs font-medium"
                  title="كشف أو إخفاء الآية مؤقتاً"
                >
                  {showFullVerse ? 'إخفاء' : 'كشف الآية'}
                </button>
              </div>

              {/* Center / Right: Evaluation & Chunk Navigation */}
              <div className="flex items-center gap-2">
                {/* Previous Chunk */}
                {currentChunkIndex > 0 && (
                  <button
                    onClick={() => {
                      setCurrentChunkIndex(prev => Math.max(0, prev - 1));
                      setCurrentStage('visible');
                      setRepsDone(0);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FAF8F2] dark:bg-[#252A27] hover:bg-[#EAE5DC] text-[#444E48] dark:text-[#C5CEC8] border border-[#E7E2D5] dark:border-[#2D332F] text-xs font-medium"
                    title="الرجوع للمقطع السابق"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>السابق</span>
                  </button>
                )}

                {/* Stage 3 Evaluation: مثبت، متردد، متفلت */}
                {currentStage === 'alignment_test' ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* 1. مثبت */}
                    <button
                      onClick={handleRateSolid}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EAF4EE] hover:bg-[#D8EDE0] text-[#1E4E38] dark:bg-[#1B2B22] dark:text-[#68D391] border border-[#C5E1D1] dark:border-[#2B4737] text-xs font-bold shadow-2xs transition-all active:scale-95"
                      title="قراءة متقنة وطلاقة دون تردد (100%)"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#2D5A42] dark:text-[#52B788]" />
                      <span>مُثبَّـت</span>
                    </button>

                    {/* 2. متردد */}
                    <button
                      onClick={handleRateHesitant}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FEF8EC] hover:bg-[#FDF0D5] text-[#8C5E14] dark:bg-[#2D2619] dark:text-[#ECC94B] border border-[#F2DEB5] dark:border-[#4D3F25] text-xs font-bold shadow-2xs transition-all active:scale-95"
                      title="يحتاج تثبيتاً وتمكيناً (+2 تكرار للتسميع)"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#C28424]" />
                      <span>مُتردِّد</span>
                    </button>

                    {/* 3. متفلت */}
                    <button
                      onClick={handleRateWeak}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] dark:bg-[#2D1B1B] dark:text-[#F87171] border border-[#FECACA] dark:border-[#522929] text-xs font-bold shadow-2xs transition-all active:scale-95"
                      title="المقطع متفلت ويحتاج إعادة للنظر والتكرار"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>مُتفلِّت</span>
                    </button>

                    {/* Pause button in Stage 3 */}
                    <button
                      onClick={handlePauseSession}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FAF8F2] dark:bg-[#252A27] hover:bg-[#EAE5DC] text-[#647069] dark:text-[#9DA7A1] border border-[#E7E2D5] dark:border-[#2D332F] text-xs font-medium transition-colors"
                      title="إيقاف مؤقت للرجوع لاحقاً"
                    >
                      <Pause className="w-3 h-3" />
                      <span>إيقاف</span>
                    </button>
                  </div>
                ) : (
                  /* Pause button for Stage 1 & Stage 2 */
                  <button
                    onClick={handlePauseSession}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FEF8EC] hover:bg-[#FDF0D5] text-[#8C5E14] dark:bg-[#2D2619] dark:text-[#ECC94B] border border-[#F2DEB5] dark:border-[#4D3F25] text-xs font-semibold transition-colors shadow-2xs active:scale-95"
                    title="إيقاف الجلسة مؤقتاً للرجوع إليها لاحقاً"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف مؤقت</span>
                  </button>
                )}

                {/* Next Chunk Advance: Locked until completed or verified */}
                <button
                  onClick={advanceToNextChunk}
                  disabled={!completedStages.alignment_test && currentStage === 'alignment_test' && alignment.accuracy < 100}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#284E3A] hover:bg-[#1E3B2C] text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-2xs"
                  title={alignment.accuracy < 100 && currentStage === 'alignment_test' ? 'أكمل تسميع الآيات بنسبة 100% للمتابعة' : ''}
                >
                  <span>المقطع التالي</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Real-time Match & Spoken transcript tag: Always visible when listening or transcript exists */}
            {(isListening || transcript || alignment.accuracy > 0) && (
              <div className="pt-2 border-t border-[#F0EDE5] dark:border-[#2B312D] flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#5C6660] dark:text-[#A3ADA6]">المطابقة اللفظية:</span>
                  <span className="font-mono font-bold text-[#2D5A42] dark:text-[#52B788]">{alignment.accuracy}%</span>
                  <span className="text-[11px] text-[#7A857F]">
                    ({alignment.matchedWordIndices.size} من {currentChunkWords.length} كلمات مطابقة)
                  </span>
                </div>
                {transcript && (
                  <div className="text-[11px] text-[#556059] dark:text-[#A0A8A3] truncate max-w-md">
                    <span className="font-semibold">الصوت الملتقط:</span> «{transcript}»
                  </div>
                )}
              </div>
            )}

            {/* Evaluation & guidance feedback message */}
            {evaluationFeedback && (
              <div className="p-2 bg-[#FAF8F2] dark:bg-[#252A27] rounded-xl text-xs text-[#2D5A42] dark:text-[#68D391] border border-[#E7E2D5] dark:border-[#2D332F] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C28424] shrink-0" />
                <span className="font-semibold">{evaluationFeedback}</span>
              </div>
            )}

            {/* Compact Audio Player - only plays when explicitly requested, paused during mic recitation */}
            {primaryAudioUrl && (
              <div className="pt-1">
                <AudioPlayer
                  audioUrl={primaryAudioUrl}
                  audioUrls={chunkAudioUrls}
                  reciterId={reciterId}
                  onReciterChange={setReciterId}
                  verseLabel={`${currentSurah.name_ar} : ${chunkLabel}`}
                  targetReps={targetRepsSetting}
                  currentRep={repsDone + 1}
                  onRepetitionComplete={handleIncrementRep}
                  forcePause={isListening || currentStage !== 'visible'}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paused Session Modal */}
      <PausedSessionModal
        isOpen={isPaused}
        surahName={currentSurah.name_ar}
        chunkLabel={chunkLabel}
        currentStage={currentStage}
        repsDone={repsDone}
        targetReps={targetRepsSetting}
        pausedAt={pausedAt}
        onResume={handleResumeSession}
        onRestartChunk={handleRestartChunk}
        onChangePlan={onOpenPlanModal}
      />
    </div>
  );
};
