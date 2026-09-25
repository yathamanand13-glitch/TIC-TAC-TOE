import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Send,
  RotateCcw,
} from 'lucide-react';
import { audioService } from '../../../services/audio/audioService';
import { AudioRecordingResult, AudioRecordingState } from '../../../types/audio';

interface VoiceRecordingHUDProps {
  onSendVoice: (result: AudioRecordingResult) => void;
  onCancel: () => void;
}

export const VoiceRecordingHUD: React.FC<VoiceRecordingHUDProps> = ({
  onSendVoice,
  onCancel,
}) => {
  const [recordState, setRecordState] = useState<AudioRecordingState>('recording');
  const [duration, setDuration] = useState(0);
  const [recordingResult, setRecordingResult] = useState<AudioRecordingResult | null>(null);

  // Playback state when reviewing
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0); // 0 - 100%
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const audioPlayerRef = useRef<{ stop: () => void; pause: () => void; resume: () => void } | null>(null);

  // Start recording on mount
  useEffect(() => {
    let timer: NodeJS.Timeout;
    audioService.startRecording().then(success => {
      if (success) {
        setRecordState('recording');
        timer = setInterval(() => {
          setDuration(d => d + 1);
        }, 1000);
      }
    });

    return () => {
      clearInterval(timer);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
      }
    };
  }, []);

  const handlePauseToggle = () => {
    if (recordState === 'recording') {
      audioService.pauseRecording();
      setRecordState('paused');
    } else if (recordState === 'paused') {
      audioService.resumeRecording();
      setRecordState('recording');
    }
  };

  const handleStopAndReview = async () => {
    const res = await audioService.stopRecording();
    if (res) {
      setRecordingResult(res);
      setRecordState('reviewing');
    } else {
      onCancel();
    }
  };

  const handleCancel = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
    audioService.cancelRecording();
    onCancel();
  };

  const handleTogglePreviewPlay = () => {
    if (!recordingResult) return;

    if (isPlayingPreview) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      audioPlayerRef.current = audioService.playAudioBlob(
        recordingResult.blob,
        (current, total) => {
          setPreviewCurrentTime(current);
          setPreviewProgress(Math.min(100, (current / (total || 1)) * 100));
        },
        () => {
          setIsPlayingPreview(false);
          setPreviewProgress(0);
          setPreviewCurrentTime(0);
        }
      );
    }
  };

  const handleSend = () => {
    if (recordingResult) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
      }
      onSendVoice(recordingResult);
    }
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in select-none">
      
      {/* State 1: Active Recording or Paused */}
      {recordState !== 'reviewing' ? (
        <>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span
              className={`w-3 h-3 rounded-full ${
                recordState === 'recording'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-amber-400'
              }`}
            />
            <div className="font-mono text-xs text-zinc-200">
              <span className="font-bold text-rose-300 uppercase">
                {recordState === 'recording' ? 'Recording Voice' : 'Paused'}:
              </span>{' '}
              <span className="text-zinc-100">{formatSecs(duration)}</span>
            </div>

            {/* Live Waveform Visualizer */}
            <div className="flex items-center gap-1 h-5 px-2">
              {[30, 65, 40, 80, 50, 90, 35, 75, 60, 45, 85, 30].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${recordState === 'recording' ? h : 15}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    recordState === 'recording' ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={handlePauseToggle}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono transition-colors"
              title={recordState === 'recording' ? 'Pause recording' : 'Resume recording'}
            >
              {recordState === 'recording' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Cancel Recording */}
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs font-mono transition-colors"
              title="Discard transmission"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Stop & Review */}
            <button
              type="button"
              onClick={handleStopAndReview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold shadow-md transition-all"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Review</span>
            </button>
          </div>
        </>
      ) : (
        /* State 2: Review / Preview Mode before sending */
        <>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Play / Pause Preview */}
            <button
              type="button"
              onClick={handleTogglePreviewPlay}
              className="w-8 h-8 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center shadow-md hover:bg-cyan-400 transition-colors shrink-0"
            >
              {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Progress bar and time */}
            <div className="flex flex-col gap-1 min-w-[140px] sm:min-w-[180px]">
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${previewProgress}%` }}
                  className="bg-cyan-400 h-full transition-all duration-100"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>{formatSecs(previewCurrentTime)}</span>
                <span>{formatSecs(recordingResult?.durationSeconds || duration)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Discard */}
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs transition-colors"
              title="Discard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Send */}
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Voice</span>
            </button>
          </div>
        </>
      )}

    </div>
  );
};
