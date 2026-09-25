import React, { useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, SwitchCamera, Radio } from 'lucide-react';
import { CallSession } from '../../../types/call';

interface OutgoingCallScreenProps {
  session: CallSession;
  localStream: MediaStream | null;
  isAudioMuted: boolean;
  onToggleMute: () => void;
  onSwitchCamera?: () => void;
  onEndCall: () => void;
}

export const OutgoingCallScreen: React.FC<OutgoingCallScreenProps> = ({
  session,
  localStream,
  isAudioMuted,
  onToggleMute,
  onSwitchCamera,
  onEndCall,
}) => {
  const isVideo = session.type.includes('video');
  const peer = session.remotePeer || {
    id: 'unknown',
    name: session.groupName || 'Tactical Group',
    username: 'cell_mesh',
    avatarColor: 'from-violet-500 to-indigo-700',
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream && isVideo) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideo]);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none animate-in fade-in">
      
      {/* Top Signaling Status */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>Signaling Handshake Dispatched</span>
      </div>

      {/* Main View Area */}
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* If video call and local stream is active, show small local camera preview */}
        {isVideo && localStream ? (
          <div className="relative w-44 h-56 rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-zinc-900 mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-zinc-950/80 text-[10px] font-mono text-zinc-300">
              Camera Preview
            </span>
          </div>
        ) : (
          <div className="relative mb-6">
            <div className="absolute inset-0 -m-3 rounded-full border border-cyan-500/20 animate-pulse" />
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${
                peer.avatarColor || 'from-cyan-500 to-blue-600'
              } flex items-center justify-center text-4xl font-bold text-white shadow-2xl ring-4 ring-zinc-900`}
            >
              {peer.name.charAt(0)}
            </div>
          </div>
        )}

        <h1 className="text-xl sm:text-2xl font-bold font-display text-zinc-100">{peer.name}</h1>
        <p className="text-xs font-mono text-zinc-400 mt-1">@{peer.username}</p>

        {/* State text */}
        <div className="mt-4 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>
            {session.state === 'calling' ? 'Initiating Offer SDP...' : 'Ringing Peer Node...'}
          </span>
        </div>

        {/* Explicit WebRTC Disclosure Notice */}
        <p className="mt-4 text-[10px] font-mono text-zinc-500 leading-relaxed max-w-xs">
          WebRTC media stream will instantiate upon peer session answer. No call is marked connected until ICE establishes.
        </p>
      </div>

      {/* Outgoing Controls */}
      <div className="flex items-center gap-4 sm:gap-6 justify-center mb-6">
        {/* Mute Mic */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`p-3.5 rounded-full border transition-colors ${
            isAudioMuted
              ? 'bg-rose-950/80 border-rose-800 text-rose-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100'
          }`}
          title={isAudioMuted ? 'Unmute' : 'Mute'}
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Switch Camera if video */}
        {isVideo && onSwitchCamera && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className="p-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
            title="Switch Camera (Front/Rear)"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        )}

        {/* End Call / Cancel */}
        <button
          type="button"
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all"
          title="Cancel Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
};
