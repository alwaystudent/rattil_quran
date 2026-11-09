import { useState, useRef, useCallback, useEffect } from 'react';

export interface RamAudioRecorderState {
  isRecording: boolean;
  recordingTime: number; // in seconds
  audioUrl: string | null;
  audioBlob: Blob | null;
  isPlaying: boolean;
  playbackProgress: number; // 0 to 100
  duration: number;
  currentTime: number;
  errorMessage: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  playRecordedAudio: () => void;
  pauseRecordedAudio: () => void;
  togglePlayback: () => void;
  seekRecordedAudio: (percent: number) => void;
}

export function useRamAudioRecorder(): RamAudioRecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up object URLs to free RAM when new audio is recorded or component unmounts
  const currentUrlRef = useRef<string | null>(null);
  currentUrlRef.current = audioUrl;

  const clearBlobUrl = useCallback(() => {
    if (currentUrlRef.current) {
      try {
        URL.revokeObjectURL(currentUrlRef.current);
      } catch {
        // ignore
      }
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current.currentTime = 0;
    }
    clearBlobUrl();
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setPlaybackProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setRecordingTime(0);
  }, [clearBlobUrl]);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    resetRecording();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('تسجيل الصوت غير مدعوم في هذا المتصفح');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Determine best supported in-memory audio mimeType
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        const types = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          'audio/aac',
        ];
        for (const t of types) {
          if (MediaRecorder.isTypeSupported(t)) {
            mimeType = t;
            break;
          }
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        // Pure RAM object URL
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Preload audio for playback and duration calculation
        const audio = new Audio(url);
        playbackAudioRef.current = audio;

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            setDuration(audio.duration);
          }
        };

        audio.ontimeupdate = () => {
          if (audio.duration) {
            setCurrentTime(audio.currentTime);
            setPlaybackProgress((audio.currentTime / audio.duration) * 100);
          }
        };

        audio.onended = () => {
          setIsPlaying(false);
          setPlaybackProgress(0);
          setCurrentTime(0);
        };

        // Stop microphone tracks so device mic indicator closes
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(250); // Record chunks every 250ms
      setIsRecording(true);
      setRecordingTime(0);

      // Increment recording timer every second
      const timer = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      timerIntervalRef.current = timer;
    } catch (err: unknown) {
      console.warn('RAM audio recording error:', err);
      const msg = err instanceof Error ? err.message : 'تعذر تشغيل التسجيل الصوتي';
      setErrorMessage(msg);
      setIsRecording(false);
    }
  }, [resetRecording]);

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    setIsRecording(false);
  }, []);

  const playRecordedAudio = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Playback error:', e);
          setIsPlaying(false);
        });
    }
  }, []);

  const pauseRecordedAudio = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pauseRecordedAudio();
    } else {
      playRecordedAudio();
    }
  }, [isPlaying, pauseRecordedAudio, playRecordedAudio]);

  const seekRecordedAudio = useCallback((percent: number) => {
    if (playbackAudioRef.current && playbackAudioRef.current.duration) {
      const newTime = (percent / 100) * playbackAudioRef.current.duration;
      playbackAudioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setPlaybackProgress(percent);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
      }
      clearBlobUrl();
    };
  }, [clearBlobUrl]);

  return {
    isRecording,
    recordingTime,
    audioUrl,
    audioBlob,
    isPlaying,
    playbackProgress,
    duration,
    currentTime,
    errorMessage,
    startRecording,
    stopRecording,
    resetRecording,
    playRecordedAudio,
    pauseRecordedAudio,
    togglePlayback,
    seekRecordedAudio,
  };
}
