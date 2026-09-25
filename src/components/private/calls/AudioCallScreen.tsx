import React, { useEffect, useRef, useState } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  ShieldCheck,
  Activity,
  ChevronDown,
} from 'lucide-react';
import {
  AudioOutputDevice,
  CallSession,
  WebRTCStatsReport,
} from '../../../types/call';

interface AudioCallScreenProps {
  session: CallSession;
  remoteStream: MediaStream | null;
  duration: number;
  stats: WebRTCStatsReport;
  isAudioMuted: boolean;
  isSpeakerOn: boolean;
  audioDevices: AudioOutputDevice[];
  selectedDeviceId: string;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onSwitchAudioDevice: (element: HTMLMediaElement, deviceId: string) => void;
  onEndCall: () => void;
}

export const AudioCallScreen: React.FC<AudioCallScreenProps> = ({
  session,
  remoteStream,
  duration,
  stats,
  isAudioMuted,
  isSpeakerOn,
  audioDevices,
  selectedDeviceId,
  onToggleMute,
  onToggleSpeaker,
  onSwitchAudioDevice,
  onEndCall,
}) => {
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const peer = session.remotePeer || {
    id: 'unknown',
    name: 'Ghost Sector Node',
    username: 'ghost_node',
    avatarColor: 'from-cyan-500 to-blue-600',
  };

  // Attach remote WebRTC audio stream to hidden HTMLAudioElement
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityBadge = () => {
    switch (stats.quality) {
      case 'excellent':
        return { label: 'Excellent', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' };
      case 'good':
        return { label: 'Good', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40' };
      case 'weak':
        return { label: 'Weak Signal', color: 'text-amber-400 bg-amber-950/60 border-amber-800/40' };
      case 'reconnecting':
        return { label: 'Reconnecting...', color: 'text-rose-400 bg-rose-950/60 border-rose-800/40' };
      default:
        return { label: 'Active Link', color: 'text-zinc-400 bg-zinc-900 border-zinc-800' };
    }
  };

  const qBadge = getQualityBadge();

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none animate-in fade-in">
      
      {/* Hidden WebRTC Remote Audio Element */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Top Header: Protocol and Stats */}
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>WebRTC P2P Audio Link</span>
        </div>

        {/* Realtime Connection Quality (WebRTC Stats) */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono border ${qBadge.color}`}
          title={
            stats.roundTripTimeMs
              ? `RTT: ${stats.roundTripTimeMs}ms | Lost: ${stats.packetsLost || 0}`
              : 'WebRTC Inbound Stream'
          }
        >
          <Activity className="w-3 h-3" />
          <span>{qBadge.label}</span>
          {stats.roundTripTimeMs !== undefined && (
            <span className="text-zinc-500">({stats.roundTripTimeMs}ms)</span>
          )}
        </div>
      </div>

      {/* Center Profile & Audio Wave Indicator */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          {/* Subtle audio presence pulse */}
          <div className="absolute inset-0 -m-3 rounded-full border border-cyan-500/20 animate-pulse [animation-duration:1.5s]" />
          <div
            className={`w-32 h-32 rounded-3xl bg-gradient-to-tr ${
              peer.avatarColor || 'from-cyan-500 to-blue-600'
            } flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-zinc-900`}
          >
            {peer.name.charAt(0)}
          </div>
        </div>

        <h1 className="text-2xl font-bold font-display text-zinc-100">{peer.name}</h1>
        <p className="text-xs font-mono text-zinc-400 mt-1">@{peer.username}</p>

        {/* Live Call Duration */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-sm font-mono font-semibold text-zinc-200">
          {formatSecs(duration)}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        
        {/* Audio Output Selector Dropdown (Bluetooth / Speaker) */}
        {audioDevices.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDeviceMenu(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[160px]">
                {audioDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Speaker'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {showDeviceMenu && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl space-y-1 z-50">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block px-2 py-1">
                  Audio Output Route
                </span>
                {audioDevices.map(device => (
                  <button
                    key={device.deviceId}
                    type="button"
                    onClick={() => {
                      if (audioRef.current) {
                        onSwitchAudioDevice(audioRef.current, device.deviceId);
                      }
                      setShowDeviceMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs font-mono truncate transition-colors ${
                      selectedDeviceId === device.deviceId
                        ? 'bg-zinc-800 text-cyan-300 font-semibold'
                        : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                    }`}
                  >
                    {device.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Primary Controls Row */}
        <div className="flex items-center gap-6 justify-center">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-4 rounded-full border transition-all ${
              isAudioMuted
                ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Toggle */}
          <button
            type="button"
            onClick={onToggleSpeaker}
            className={`p-4 rounded-full border transition-all ${
              isSpeakerOn
                ? 'bg-zinc-900 border-zinc-800 text-cyan-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* End Call */}
          <button
            type="button"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all"
            title="End Audio Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>

      </div>

    </div>
  );
};
