export type AudioRecordingState = 'idle' | 'recording' | 'paused' | 'reviewing';

export interface AudioRecordingResult {
  blob: Blob;
  durationSeconds: number;
  waveforms: number[]; // 0 - 100 relative amplitude bars
  mimeType: string;
}

export interface IAudioService {
  isSupported(): boolean;
  startRecording(): Promise<boolean>;
  pauseRecording(): void;
  resumeRecording(): void;
  stopRecording(): Promise<AudioRecordingResult | null>;
  cancelRecording(): void;
  getRecordingState(): AudioRecordingState;
  playAudioBlob(
    blob: Blob,
    onProgress?: (currentTime: number, totalDuration: number) => void,
    onEnded?: () => void
  ): { stop: () => void; pause: () => void; resume: () => void };
}
