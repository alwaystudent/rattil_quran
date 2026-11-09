export interface SurahMeta {
  id: number;
  name_ar: string;
  name_en: string;
  verse_count: number;
  page_start: number;
  page_end: number;
  revelation_type: 'meccan' | 'medinan';
  juz: number;
}

export interface QuranWord {
  id: number;
  position: number;
  text_uthmani: string;
  text_clean: string;
  is_hidden?: boolean;
  status?: 'correct' | 'missed' | 'pending' | 'hinted' | 'current';
}

export interface QuranVerse {
  surah_id: number;
  ayah_number: number;
  verse_key: string; // e.g. "1:1"
  text_uthmani: string;
  text_clean: string;
  words: QuranWord[];
  page_number: number;
  juz_number: number;
  audio_url?: string;
}

export type StageType = 'visible' | 'gradual_mask' | 'full_mask' | 'alignment_test' | 'chaining';

export interface Reciter {
  id: string;
  name_ar: string;
  name_en: string;
  identifier: string; // folder name on everyayah
  style: string;
}

export type PlanMode = 'by_surah' | 'by_page';

export interface PlanConfig {
  mode?: PlanMode;
  surah_id: number;
  start_ayah: number;
  end_ayah: number;
  start_page?: number;
  end_page?: number;
  reciter_id: string;
  visible_target_reps: number;
  masked_target_reps: number;
  chain_target_reps: number;
  auto_advance_on_100: boolean;
}

export interface ChainingState {
  is_active: boolean;
  verses_in_chain: number[]; // array of ayah numbers in current cumulative chain
  current_chain_index: number;
  chain_reps_done: number;
}

export interface MemorizationSessionStats {
  total_verses: number;
  completed_verses: number;
  total_repetitions: number;
  average_accuracy: number;
  start_time: number;
  current_streak: number;
}

export type EvaluationRating = 'solid' | 'hesitant' | 'weak'; // مثبت، متردد، متفلت

export interface PausedSessionState {
  plan: PlanConfig;
  unitType: 'single_ayah' | 'multi_ayah_3' | 'multi_ayah_5' | 'half_page' | 'full_page';
  currentChunkIndex: number;
  currentStage: StageType;
  repsDone: number;
  targetRepsSetting: number;
  completedStages: {
    visible: boolean;
    gradual_mask: boolean;
    alignment_test: boolean;
  };
  chunkEvaluations?: Record<number, EvaluationRating>;
  pausedAt: string; // ISO string
  surahName: string;
  chunkLabel: string;
}
