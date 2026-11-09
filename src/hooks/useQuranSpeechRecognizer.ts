import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { alignSpokenTextWithVerse, AlignmentResult } from '../utils/arabicMatcher';

interface TargetWordItem {
  text_clean: string;
  text_uthmani?: string;
  verse_ayah?: number;
}

interface UseQuranSpeechRecognizerProps {
  targetWords: TargetWordItem[];
  onPerfectMatch?: () => void;
  autoAdvanceOn100?: boolean;
}

export function useQuranSpeechRecognizer({
  targetWords,
  onPerfectMatch,
}: UseQuranSpeechRecognizerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const activeIntentRef = useRef(false);
  const matchedCallbackCalledRef = useRef(false);

  // Offset index in event.results for the current repetition to avoid aborting & restarting
  const baseResultIndexRef = useRef(0);
  const totalResultsLengthRef = useRef(0);

  // Persistent matched indices to guarantee once a word is recognized, it stays revealed
  const persistentMatchedRef = useRef<Set<number>>(new Set());

  // Stable references
  const targetWordsRef = useRef(targetWords);
  targetWordsRef.current = targetWords;

  const onPerfectMatchRef = useRef(onPerfectMatch);
  onPerfectMatchRef.current = onPerfectMatch;

  const [alignment, setAlignment] = useState<AlignmentResult>(() => ({
    accuracy: 0,
    matchedWordIndices: new Set(),
    wordStatuses: targetWords.map((_, i) => (i === 0 ? 'current' : 'pending')),
    activeWordIndex: 0,
    recognizedText: '',
    isPerfectMatch: false,
  }));

  // Create a stable string key representing target words
  const targetWordsKey = useMemo(() => {
    return targetWords.map((w, idx) => `${idx}:${w.text_clean}`).join(' ');
  }, [targetWords]);

  // Synchronous transcript & alignment processing for zero latency
  const processTranscript = useCallback((newTranscript: string) => {
    setTranscript(newTranscript);
    if (!newTranscript || newTranscript.trim() === '') return;

    const res = alignSpokenTextWithVerse(targetWordsRef.current, newTranscript);

    // Merge with persistent matches (forward-only accumulation)
    const combinedMatches = new Set(persistentMatchedRef.current);
    for (const idx of res.matchedWordIndices) {
      combinedMatches.add(idx);
    }
    persistentMatchedRef.current = combinedMatches;

    const totalWords = targetWordsRef.current.length;
    const correctCount = combinedMatches.size;
    const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
    const isPerfect = totalWords > 0 && correctCount === totalWords;

    // Recalculate word statuses with persistent matches
    const updatedStatuses: ('correct' | 'missed' | 'pending' | 'current')[] = targetWordsRef.current.map((_, i) => {
      if (combinedMatches.has(i)) return 'correct';
      return 'pending';
    });

    const nextPending = updatedStatuses.findIndex(st => st === 'pending');
    const activeIndex = nextPending !== -1 ? nextPending : Math.max(0, totalWords - 1);
    if (nextPending !== -1) {
      updatedStatuses[nextPending] = 'current';
    }

    setAlignment({
      accuracy,
      matchedWordIndices: combinedMatches,
      wordStatuses: updatedStatuses,
      activeWordIndex: activeIndex,
      recognizedText: newTranscript,
      isPerfectMatch: isPerfect,
    });

    if (isPerfect && !matchedCallbackCalledRef.current) {
      matchedCallbackCalledRef.current = true;
      if (onPerfectMatchRef.current) {
        onPerfectMatchRef.current();
      }
    }
  }, []);

  // Helper to instantiate a clean SpeechRecognition instance
  const createAndStartRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setErrorMessage('التعرف الصوتي غير مدعوم في هذا المتصفح. يمكنك استخدام كشف الكلمات أو التقييم اليدوي.');
      activeIntentRef.current = false;
      setIsListening(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      baseResultIndexRef.current = 0;
      totalResultsLengthRef.current = 0;

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'ar-SA';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        totalResultsLengthRef.current = event.results.length;

        let combined = '';
        const startIdx = Math.min(baseResultIndexRef.current, event.results.length);
        for (let i = startIdx; i < event.results.length; i++) {
          const resItem = event.results[i];
          if (resItem[0]) {
            combined += ' ' + resItem[0].transcript;
          }
        }
        const trimmed = combined.trim();
        processTranscript(trimmed);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        // Completely ignore benign pause/silence events - zero alerts
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('تم رفض الإذن للوصول إلى الميكروفون. يرجى تفعيل الإذن من شريط المتصفح.');
          activeIntentRef.current = false;
          setIsListening(false);
        } else if (event.error === 'network' && activeIntentRef.current) {
          // Silent retry without audio beeps
          setTimeout(() => {
            if (activeIntentRef.current) {
              createAndStartRecognition();
            }
          }, 500);
        }
      };

      recognition.onend = () => {
        // When browser pauses audio utterance naturally, smoothly restart without playing any sound
        if (activeIntentRef.current) {
          baseResultIndexRef.current = 0;
          totalResultsLengthRef.current = 0;
          setTimeout(() => {
            if (activeIntentRef.current) {
              createAndStartRecognition();
            }
          }, 60);
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      // Gentle fallback
      setTimeout(() => {
        if (activeIntentRef.current) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fallbackRec = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
            fallbackRec.lang = 'ar-SA';
            fallbackRec.continuous = true;
            fallbackRec.interimResults = true;
            fallbackRec.start();
            recognitionRef.current = fallbackRec;
            setIsListening(true);
          } catch {
            setIsListening(false);
          }
        }
      }, 150);
    }
  }, [processTranscript]);

  // When target words change (e.g. advance to next chunk/stage)
  const prevTargetWordsKeyRef = useRef(targetWordsKey);
  useEffect(() => {
    if (prevTargetWordsKeyRef.current !== targetWordsKey) {
      prevTargetWordsKeyRef.current = targetWordsKey;
      matchedCallbackCalledRef.current = false;
      persistentMatchedRef.current.clear();
      setTranscript('');

      // Move baseline forward without aborting recognition session (zero audio beeps)
      baseResultIndexRef.current = totalResultsLengthRef.current;

      setAlignment({
        accuracy: 0,
        matchedWordIndices: new Set(),
        wordStatuses: targetWordsRef.current.map((_, i) => (i === 0 ? 'current' : 'pending')),
        activeWordIndex: 0,
        recognizedText: '',
        isPerfectMatch: false,
      });
    }
  }, [targetWordsKey]);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    matchedCallbackCalledRef.current = false;
    activeIntentRef.current = true;

    // If already running, do not re-start (prevents browser mic tone)
    if (recognitionRef.current && isListening) {
      baseResultIndexRef.current = totalResultsLengthRef.current;
      return;
    }

    createAndStartRecognition();
  }, [createAndStartRecognition, isListening]);

  const stopListening = useCallback(() => {
    activeIntentRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Silent repetition reset without aborting recognition session - NO AUDIO ALERTS
  const resetRecognition = useCallback(() => {
    matchedCallbackCalledRef.current = false;
    persistentMatchedRef.current.clear();
    setTranscript('');
    // Advance baseline index to ignore past speech from prior repetitions
    baseResultIndexRef.current = totalResultsLengthRef.current;

    setAlignment({
      accuracy: 0,
      matchedWordIndices: new Set(),
      wordStatuses: targetWordsRef.current.map((_, i) => (i === 0 ? 'current' : 'pending')),
      activeWordIndex: 0,
      recognizedText: '',
      isPerfectMatch: false,
    });
  }, []);

  // Force reveal next word manually as a helpful fallback
  const revealNextWordManually = useCallback(() => {
    const nextIdx = targetWordsRef.current.findIndex((_, idx) => !persistentMatchedRef.current.has(idx));
    if (nextIdx !== -1) {
      persistentMatchedRef.current.add(nextIdx);
      const combinedMatches = new Set(persistentMatchedRef.current);
      const totalWords = targetWordsRef.current.length;
      const correctCount = combinedMatches.size;
      const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
      const isPerfect = totalWords > 0 && correctCount === totalWords;

      const updatedStatuses: ('correct' | 'missed' | 'pending' | 'current')[] = targetWordsRef.current.map((_, i) => {
        if (combinedMatches.has(i)) return 'correct';
        return 'pending';
      });

      const nextPending = updatedStatuses.findIndex(st => st === 'pending');
      if (nextPending !== -1) {
        updatedStatuses[nextPending] = 'current';
      }

      setAlignment({
        accuracy,
        matchedWordIndices: combinedMatches,
        wordStatuses: updatedStatuses,
        activeWordIndex: nextPending !== -1 ? nextPending : Math.max(0, totalWords - 1),
        recognizedText: transcript,
        isPerfectMatch: isPerfect,
      });

      if (isPerfect && !matchedCallbackCalledRef.current) {
        matchedCallbackCalledRef.current = true;
        if (onPerfectMatchRef.current) {
          onPerfectMatchRef.current();
        }
      }
    }
  }, [transcript]);

  useEffect(() => {
    return () => {
      activeIntentRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    alignment,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    resetRecognition,
    revealNextWordManually,
    setTranscript,
  };
}
