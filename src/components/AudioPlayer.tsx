import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { Reciter } from '../types/quran';
import { RECITERS } from '../data/surahs';

interface AudioPlayerProps {
  audioUrl?: string;
  audioUrls?: string[];
  reciterId: string;
  onReciterChange: (reciterId: string) => void;
  verseLabel: string;
  targetReps?: number;
  currentRep?: number;
  onRepetitionComplete?: () => void;
  forcePause?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioUrls,
  reciterId,
  onReciterChange,
  verseLabel,
  targetReps = 3,
  currentRep = 1,
  onRepetitionComplete,
  forcePause = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [progress, setProgress] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Force pause when student uses mic or changes stage
  useEffect(() => {
    if (forcePause && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [forcePause]);

  // Normalize to playlist
  const playlist = audioUrls && audioUrls.length > 0 ? audioUrls : audioUrl ? [audioUrl] : [];
  const currentAudioSrc = playlist[currentTrackIndex] || playlist[0] || '';

  useEffect(() => {
    // Reset state when playlist changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      setLoopCount(0);
      setCurrentTrackIndex(0);
    }
  }, [audioUrl, JSON.stringify(audioUrls)]);

  const togglePlay = () => {
    if (!audioRef.current || !currentAudioSrc) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  const handleEnded = () => {
    if (!audioRef.current) return;

    // Check if more tracks exist in this chunk
    if (currentTrackIndex < playlist.length - 1) {
      const nextTrack = currentTrackIndex + 1;
      setCurrentTrackIndex(nextTrack);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }, 300);
      return;
    }

    // All tracks in chunk finished -> 1 repetition completed!
    const nextCount = loopCount + 1;
    setLoopCount(nextCount);
    setCurrentTrackIndex(0);

    if (onRepetitionComplete) {
      onRepetitionComplete();
    }

    // Audio ONLY repeats if the user explicitly clicked continuous loop (isLooping)
    if (isLooping) {
      setTimeout(() => {
        if (audioRef.current && isLooping && !forcePause) {
          audioRef.current.currentTime = 0;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }, 800);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [0.85, 1, 1.2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1E2220] text-[#222A26] dark:text-[#E6E4DC] rounded-2xl p-4 border border-[#E7E2D5] dark:border-[#2D332F] shadow-xs">
      <audio
        ref={audioRef}
        src={currentAudioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Reciter selection & verse label */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F3EC] dark:bg-[#1B2B22] border border-[#C5E1D1] dark:border-[#2B4737] flex items-center justify-center text-[#255038] dark:text-[#52B788] shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[#5C6660] dark:text-[#A3ADA6] flex items-center gap-2">
              <span className="truncate">تلاوة الآية {verseLabel}</span>
              <span className="text-[#255038] dark:text-[#68D391] font-mono text-[11px] font-semibold shrink-0">
                ({loopCount > 0 ? `تكررت ${loopCount} مرات` : 'التكرار بالصوت'})
              </span>
            </div>
            <select
              value={reciterId}
              onChange={(e) => onReciterChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#1C2320] dark:text-[#F0EDE6] focus:outline-none cursor-pointer py-0.5 max-w-[150px] sm:max-w-[220px] truncate"
            >
              {RECITERS.map((r) => (
                <option key={r.identifier} value={r.identifier} className="bg-white dark:bg-[#1E2220] text-[#1C2320] dark:text-[#ECE9E2]">
                  {r.name_ar}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Speed Button */}
          <button
            onClick={handleSpeedToggle}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-[#F4F1EA] dark:bg-[#272C29] hover:bg-[#EAE5DC] text-[#444E48] dark:text-[#C5CEC8] font-mono transition-colors"
            title="سرعة التلاوة"
          >
            {playbackRate}x
          </button>

          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
              isLooping
                ? 'bg-[#29503B] text-white shadow-2xs'
                : 'bg-[#F4F1EA] dark:bg-[#272C29] text-[#444E48] dark:text-[#C5CEC8] hover:bg-[#EAE5DC]'
            }`}
            title="تكرار مستمر للآية"
          >
            {isLooping ? 'تكرار مستمر (نشط)' : 'تكرار مستمر'}
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setLoopCount(0);
                if (!isPlaying) togglePlay();
              }
            }}
            className="p-2 rounded-xl bg-[#F4F1EA] dark:bg-[#272C29] hover:bg-[#EAE5DC] text-[#444E48] dark:text-[#C5CEC8] transition-colors"
            title="إعادة من البداية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause Main Button */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#29503B] hover:bg-[#203F2E] text-white font-medium text-xs transition-all shadow-xs active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>استماع للآية</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress track */}
      <div className="mt-3 w-full bg-[#EFECE3] dark:bg-[#292F2B] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#33634B] dark:bg-[#52B788] h-full transition-all duration-150 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
