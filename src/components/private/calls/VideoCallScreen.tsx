import React, { useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
  Monitor,
  Volume2,
  VolumeX,
  Activity,
  ShieldCheck,
  User,
} from 'lucide-react';
import { CallSession, WebRTCStatsReport } from '../../../types/call';

interface VideoCallScreenProps {
  session: CallSession;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  screenStream: MediaStream | null;
  duration: number;
  stats: WebRTCStatsReport;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onSwitchCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  session,
  localStream,
  remoteStream,
  screenStream,
  duration,
  stats,
  isAudioMuted,
  isVideoMuted,
  isSpeakerOn,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onSwitchCamera,
  onToggleScreenShare,
  onEndCall,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peer = session.remotePeer || {
    id: 'unknown',
    name: 'Ghost Sector Node',
    username: 'ghost_node',
    avatarColor: 'from-cyan-500 to-blue-600',
  };

  // Bind local stream (or screen share) to local video preview
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream || localStream;
    }
  }, [localStream, screenStream]);

  // Bind remote stream to main remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityBadge = () => {
    switch (stats.quality) {
      case 'excellent':
        return { label: 'Excellent', color: 'text-emerald-400 bg-emerald-950/70 border-emerald-800/50' };
      case 'good':
        return { label: 'Good', color: 'text-cyan-400 bg-cyan-950/70 border-cyan-800/50' };
      case 'weak':
        return { label: 'Weak Signal', color: 'text-amber-400 bg-amber-950/70 border-amber-800/50' };
      case 'reconnecting':
        return { label: 'Reconnecting...', color: 'text-rose-400 bg-rose-950/70 border-rose-800/50' };
      default:
        return { label: 'Active WebRTC', color: 'text-zinc-400 bg-zinc-900 border-zinc-800' };
    }
  };

  const qBadge = getQualityBadge();
  const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-in fade-in overflow-hidden">
      
      {/* 1. Main Remote Video Viewport */}
      <div className="absolute inset-0 w-full h-full bg-zinc-950 flex items-center justify-center">
        {hasRemoteVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Avatar fallback if remote camera is disabled or audio-only */
          <div className="flex flex-col items-center text-center p-6">
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${
                peer.avatarColor || 'from-cyan-500 to-blue-600'
              } flex items-center justify-center text-4xl font-bold text-white shadow-2xl mb-4`}
            >
              {peer.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-zinc-200">{peer.name}</h2>
            <span className="text-xs font-mono text-zinc-500 mt-1">
              Remote video stream paused
            </span>
          </div>
        )}
      </div>

      {/* 2. Top Status Overlay Bar */}
      <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{peer.name}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </span>
            <span className="text-xs font-mono text-cyan-300">{formatSecs(duration)}</span>
          </div>
        </div>

        {/* Real WebRTC Statistics Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono border backdrop-blur-md ${qBadge.color}`}
          title={
            stats.roundTripTimeMs
              ? `RTT: ${stats.roundTripTimeMs}ms | Lost: ${stats.packetsLost || 0}`
              : 'WebRTC P2P Video Mesh'
          }
        >
          <Activity className="w-3 h-3" />
          <span>{qBadge.label}</span>
          {stats.roundTripTimeMs !== undefined && (
            <span className="text-zinc-400">({stats.roundTripTimeMs}ms)</span>
          )}
        </div>
      </div>

      {/* 3. Picture-in-Picture Local Camera View */}
      <div className="absolute top-20 right-4 sm:right-6 z-20 w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-zinc-700/80 shadow-2xl bg-zinc-900 group">
        {!isVideoMuted && (localStream || screenStream) ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isScreenSharing ? '' : '-scale-x-100'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-950">
            <User className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-mono">Camera Off</span>
          </div>
        )}

        <span className="absolute bottom-2 left-2 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-mono text-zinc-300">
          {isScreenSharing ? 'Screen Share' : 'You'}
        </span>
      </div>

      {/* 4. Bottom Floating Controls Bar */}
      <div className="relative z-20 pb-8 px-4 flex items-center justify-center">
        <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-3xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/90 shadow-2xl">
          
          {/* Mute Mic */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-3 sm:p-3.5 rounded-full transition-colors ${
              isAudioMuted
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera On / Off */}
          <button
            type="button"
            onClick={onToggleVideo}
            className={`p-3 sm:p-3.5 rounded-full transition-colors ${
              isVideoMuted
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
            title={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Switch Camera (Front/Rear) */}
          <button
            type="button"
            onClick={onSwitchCamera}
            className="p-3 sm:p-3.5 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
            title="Switch front/rear camera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>

          {/* Screen Sharing Toggle */}
          <button
            type="button"
            onClick={onToggleScreenShare}
            className={`p-3 sm:p-3.5 rounded-full transition-colors ${
              isScreenSharing
                ? 'bg-cyan-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Speaker Toggle */}
          <button
            type="button"
            onClick={onToggleSpeaker}
            className={`p-3 sm:p-3.5 rounded-full transition-colors ${
              isSpeakerOn
                ? 'bg-zinc-800 text-cyan-300'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={onEndCall}
            className="p-3.5 sm:p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50 hover:scale-105 active:scale-95 transition-all"
            title="End Video Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

        </div>
      </div>

    </div>
  );
};
