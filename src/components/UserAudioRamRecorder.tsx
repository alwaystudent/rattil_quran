import React from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Sparkles, Check } from 'lucide-react';
import { RamAudioRecorderState } from '../hooks/useRamAudioRecorder';

interface UserAudioRamRecorderProps {
  recorder: RamAudioRecorderState;
  verseLabel: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const UserAudioRamRecorder: React.FC<UserAudioRamRecorderProps> = ({
  recorder,
  verseLabel,
}) => {
  const {
    isRecording,
    recordingTime,
    audioUrl,
    isPlaying,
    playbackProgress,
    duration,
    currentTime,
    errorMessage,
    startRecording,
    stopRecording,
    resetRecording,
    togglePlayback,
    seekRecordedAudio,
  } = recorder;

  return (
    <div className="bg-[#FAF8F2] dark:bg-[#252A27] rounded-2xl p-3 sm:p-4 border border-[#E7E2D5] dark:border-[#2D332F] shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Title & Status */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isRecording
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : audioUrl
                ? 'bg-[#EAF4EE] dark:bg-[#1B2B22] text-[#245037] dark:text-[#52B788] border-[#CDE5D5] dark:border-[#2D4D3A]'
                : 'bg-[#F4F1EA] dark:bg-[#292F2B] text-[#556059] dark:text-[#A0A8A3] border-[#E2DDD3] dark:border-[#38413B]'
            }`}
          >
            {isRecording ? (
              <Mic className="w-4 h-4 animate-bounce" />
            ) : audioUrl ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1C2320] dark:text-[#ECE9E2]">
                تسجيل قراءتك (في الذاكرة العشوائية RAM)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E5ECE8] dark:bg-[#1E2E25] text-[#284E3A] dark:text-[#52B788] font-mono">
                مؤقت
              </span>
            </div>
            <p className="text-[11px] text-[#5C6660] dark:text-[#A3ADA6]">
              {isRecording
                ? `جاري التسجيل الصوتي لقراءتك... (${formatTime(recordingTime)})`
                : audioUrl
                ? `تم تسجيل قراءتك لـ ${verseLabel} بنجاح. استمع إليها لتقييم حفظك.`
                : 'سجّل قراءتك الغيبية في الذاكرة لتستمع لنفسك وتتحقق من إتقانك.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition-all shadow-xs active:scale-95"
              title="بدء تسجيل صوتك لقراءة هذا المقطع"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>تسجيل قراءتي</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 animate-pulse"
              title="إيقاف التسجيل والاستماع"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>إيقاف التسجيل ({formatTime(recordingTime)})</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <div className="flex items-center gap-2">
              {/* Play / Pause user audio */}
              <button
                onClick={togglePlayback}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#284E3A] hover:bg-[#1E3B2C] text-white font-bold text-xs transition-all shadow-xs active:scale-95"
                title={isPlaying ? 'إيقاف مؤقت' : 'الاستماع لتسجيلك'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>إيقاف</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>استمع لقراءتك</span>
                  </>
                )}
              </button>

              {/* Re-record button */}
              <button
                onClick={resetRecording}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F0EDE5] dark:bg-[#2C332E] hover:bg-[#E5E0D5] text-[#3E4742] dark:text-[#CED6D0] text-xs font-medium transition-colors"
                title="حذف هذا التسجيل من الذاكرة والبدء من جديد"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة التسجيل</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audio Playback Seek Bar when recorded */}
      {audioUrl && !isRecording && (
        <div className="mt-2.5 pt-2 border-t border-[#EAE5DA] dark:border-[#2F3631]">
          <div className="flex items-center justify-between text-[11px] text-[#636E67] dark:text-[#9DA7A1] font-mono mb-1">
            <span>{formatTime(currentTime)}</span>
            <span className="text-[10px] text-[#284E3A] dark:text-[#52B788] font-sans font-medium flex items-center gap-1">
              <Check className="w-3 h-3 text-[#284E3A] dark:text-[#52B788]" />
              تسجيل محفوظ في الذاكرة المؤقتة (RAM)
            </span>
            <span>{formatTime(duration)}</span>
          </div>

          <div
            className="w-full bg-[#E8E4DA] dark:bg-[#343B36] h-2 rounded-full cursor-pointer relative overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              // Calculate percent taking RTL into account
              const isRtl = document.dir === 'rtl' || true;
              const clickX = e.clientX - rect.left;
              const percent = isRtl
                ? ((rect.width - clickX) / rect.width) * 100
                : (clickX / rect.width) * 100;
              seekRecordedAudio(Math.max(0, Math.min(100, percent)));
            }}
          >
            <div
              className="bg-[#284E3A] dark:bg-[#52B788] h-full transition-all duration-100 rounded-full"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/50">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
