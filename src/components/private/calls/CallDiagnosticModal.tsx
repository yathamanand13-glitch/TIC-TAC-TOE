import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Radio,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Volume2,
  Server,
} from 'lucide-react';
import { WebRTCService } from '../../../services/webrtc/webrtcService';
import { WebRTCMediaService } from '../../../services/webrtc/mediaService';
import { getIceServersConfiguration } from '../../../services/webrtc/iceConfig';

interface CallDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallDiagnosticModal: React.FC<CallDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [iceState, setIceState] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [iceCandidatesFound, setIceCandidatesFound] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [loopbackActive, setLoopbackActive] = useState(false);
  const [rttMs, setRttMs] = useState<number | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const mediaServiceRef = useRef<WebRTCMediaService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaServiceRef.current) {
      mediaServiceRef.current.stopLocalStream();
      mediaServiceRef.current = null;
    }
    setMicActive(false);
    setCamActive(false);
    setLoopbackActive(false);
    setAudioLevel(0);
  };

  const handleTestHardware = async () => {
    cleanup();
    const media = new WebRTCMediaService();
    mediaServiceRef.current = media;

    try {
      const stream = await media.acquireLocalStream(true);
      if (stream) {
        setMicActive(stream.getAudioTracks().length > 0);
        setCamActive(stream.getVideoTracks().length > 0);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup audio level meter
        if (stream.getAudioTracks().length > 0 && typeof AudioContext !== 'undefined') {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      }
    } catch {
      // Permission denied or devices not found
    }
  };

  const handleTestIceServers = async () => {
    setIceState('testing');
    setIceCandidatesFound([]);

    if (typeof RTCPeerConnection === 'undefined') {
      setIceState('failed');
      return;
    }

    try {
      const config = getIceServersConfiguration();
      const pc = new RTCPeerConnection(config);
      const candidates: string[] = [];

      pc.onicecandidate = e => {
        if (e.candidate) {
          const type = e.candidate.type || 'host';
          const protocol = e.candidate.protocol || 'udp';
          const str = `${type.toUpperCase()} (${protocol.toUpperCase()} ${e.candidate.address || 'relay'})`;
          if (!candidates.includes(str)) {
            candidates.push(str);
            setIceCandidatesFound([...candidates]);
          }
        }
      };

      // Create a dummy data channel to trigger ICE gathering
      pc.createDataChannel('diagnostic_test');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setTimeout(() => {
        if (candidates.length > 0) {
          setIceState('success');
        } else {
          setIceState('failed');
        }
        pc.close();
      }, 3000);
    } catch {
      setIceState('failed');
    }
  };

  if (!isOpen) return null;

  const iceConfig = getIceServersConfiguration();

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-display">
                WebRTC Mesh & Hardware Diagnostics
              </h2>
              <p className="text-[10px] font-mono text-zinc-500">
                Peer-to-Peer Pipeline & Device Verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Sections */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono">
          
          {/* Section 1: Local Mic & Camera Hardware Test */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span className="text-zinc-200 font-bold">Local Media Hardware Test</span>
              </div>
              <button
                type="button"
                onClick={handleTestHardware}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-[11px] transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test Mic & Camera</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Camera Preview */}
              <div className="relative h-32 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center text-zinc-500">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover -scale-x-100 ${camActive ? 'block' : 'hidden'}`}
                />
                {!camActive && (
                  <div className="flex flex-col items-center gap-1 text-[11px]">
                    <VideoOff className="w-5 h-5 text-zinc-600" />
                    <span>Camera Inactive</span>
                  </div>
                )}
                {camActive && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-zinc-950/80 text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Video 720p Active
                  </span>
                )}
              </div>

              {/* Microphone Level */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Input Volume Meter</span>
                    <span>{audioLevel}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        audioLevel > 60
                          ? 'bg-rose-500'
                          : audioLevel > 20
                          ? 'bg-emerald-400'
                          : 'bg-cyan-400'
                      }`}
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/80 flex items-center gap-1.5">
                  {micActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-zinc-300">Microphone stream captured</span>
                    </>
                  ) : (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Click "Test Mic & Camera" above</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: STUN / TURN Server Configuration */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <span className="text-zinc-200 font-bold">ICE Servers (STUN / TURN)</span>
              </div>
              <button
                type="button"
                onClick={handleTestIceServers}
                disabled={iceState === 'testing'}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] transition-all disabled:opacity-50"
              >
                {iceState === 'testing' ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                ) : (
                  <Radio className="w-3 h-3 text-cyan-400" />
                )}
                <span>Probe ICE Gathering</span>
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {(iceConfig?.iceServers || []).map((srv, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-zinc-400"
                >
                  <span className="text-zinc-300">
                    {Array.isArray(srv.urls) ? srv.urls.join(', ') : srv.urls}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-cyan-400 border border-zinc-800">
                    {String(srv.urls).startsWith('turn') ? 'TURN Relay' : 'STUN Discovery'}
                  </span>
                </div>
              ))}
            </div>

            {/* Probe Results */}
            {iceState !== 'idle' && (
              <div className="pt-2">
                {iceState === 'testing' && (
                  <p className="text-cyan-400 flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    Gathering local and reflexive host/srflx candidates...
                  </p>
                )}
                {iceState === 'success' && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ICE Gathering Successful ({iceCandidatesFound.length} candidates found)
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {iceCandidatesFound.map((cand, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-900/60 text-[10px] text-emerald-200">
                          {cand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {iceState === 'failed' && (
                  <p className="text-rose-400 flex items-center gap-1.5 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    ICE Gathering timed out or network blocked STUN UDP traffic.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Signaling Architecture Notice */}
          <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800 text-[11px] text-zinc-500 space-y-1">
            <p className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Signaling Pipeline Isolation
            </p>
            <p>
              Peer-to-peer WebRTC calls establish direct SRTP audio/video tracks between clients. When a remote signaling server (e.g. Supabase Realtime broadcast) is connected via <code className="text-cyan-400 font-bold">VITE_SIGNALING_URL</code>, session SDP offers/answers are exchanged automatically.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
