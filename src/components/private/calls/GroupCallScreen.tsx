import React, { useState } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Volume2,
  VolumeX,
  Users,
  Grid,
  Maximize2,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { CallSession, CallPeer, WebRTCStatsReport } from '../../../types/call';

interface GroupCallScreenProps {
  session: CallSession;
  localStream: MediaStream | null;
  remoteStreams?: Map<string, MediaStream>;
  duration: number;
  stats: WebRTCStatsReport;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export const GroupCallScreen: React.FC<GroupCallScreenProps> = ({
  session,
  localStream,
  duration,
  stats,
  isAudioMuted,
  isVideoMuted,
  isSpeakerOn,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onToggleScreenShare,
  onEndCall,
}) => {
  const isVideo = session.type.includes('video');
  const [selectedSpotlightId, setSelectedSpotlightId] = useState<string | null>(null);

  // Group members list
  const members: CallPeer[] = session.groupMembers || [
    {
      id: 'usr_ghost_01',
      name: 'Ghost Sector Node',
      username: 'ghost_node',
      avatarColor: 'from-cyan-500 to-blue-600',
      isAudioMuted: false,
      isVideoMuted: false,
    },
    {
      id: 'usr_cipher_02',
      name: 'Cipher Analyst V',
      username: 'cipher_analyst',
      avatarColor: 'from-violet-500 to-indigo-600',
      isAudioMuted: true,
      isVideoMuted: true,
    },
    {
      id: 'usr_recon_03',
      name: 'Recon Sentinel',
      username: 'recon_sentinel',
      avatarColor: 'from-emerald-500 to-teal-600',
      isAudioMuted: false,
      isVideoMuted: false,
    },
  ];

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const spotlightPeer = members.find(m => m.id === selectedSpotlightId);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between overflow-hidden select-none animate-in fade-in">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-violet-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-display text-zinc-100">
                {session.groupName || 'Tactical Mesh Conference'}
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-[10px] font-mono text-cyan-300">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>SRTP Mesh</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              {members.length + 1} Connected Nodes · {formatSecs(duration)}
            </p>
          </div>
        </div>

        {/* Quality stats & mode switch */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Quality: {stats.quality.toUpperCase()}</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedSpotlightId(prev => (prev ? null : members[0]?.id || null))}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs flex items-center gap-1.5 transition-colors"
            title="Toggle Grid / Spotlight View"
          >
            {selectedSpotlightId ? <Grid className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{selectedSpotlightId ? 'Grid View' : 'Spotlight'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid / Spotlight Canvas */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto flex items-center justify-center">
        {selectedSpotlightId && spotlightPeer ? (
          /* Spotlight Mode */
          <div className="w-full h-full flex flex-col md:flex-row gap-4 max-w-6xl mx-auto">
            {/* Spotlighted Main View */}
            <div className="flex-1 rounded-3xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-2xl">
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${spotlightPeer.avatarColor || 'from-cyan-500 to-blue-600'} flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl mb-4`}
              >
                {spotlightPeer.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-zinc-100">{spotlightPeer.name}</h3>
              <p className="text-xs font-mono text-zinc-400">@{spotlightPeer.username}</p>

              {/* Status tags */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-cyan-400">
                  Spotlight Focused
                </span>
                {spotlightPeer.isAudioMuted && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-900 text-[10px] font-mono text-rose-300 flex items-center gap-1">
                    <MicOff className="w-3 h-3" /> Muted
                  </span>
                )}
              </div>
            </div>

            {/* Side participant thumbnails */}
            <div className="w-full md:w-56 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0">
              {/* Local Tile */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-cyan-500/30 shrink-0 md:w-full flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                  YOU
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">You (Host)</p>
                  <p className="text-[10px] font-mono text-cyan-400">{isAudioMuted ? 'Muted' : 'Speaking'}</p>
                </div>
              </div>

              {members.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedSpotlightId(member.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all shrink-0 md:w-full flex items-center gap-3 ${
                    member.id === selectedSpotlightId
                      ? 'bg-zinc-800 border-cyan-400'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${member.avatarColor || 'from-violet-500 to-indigo-600'} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{member.name}</p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {member.isAudioMuted ? 'Muted' : 'Active'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-4xl w-full">
            {/* Local Host Node */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border-2 border-cyan-500/40 relative overflow-hidden flex flex-col items-center justify-center shadow-xl min-h-[180px]">
              <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center text-xl font-bold text-white shadow-lg mb-2">
                YOU
              </div>
              <p className="text-sm font-bold text-zinc-100">You (Host Node)</p>
              <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                {isAudioMuted ? 'Microphone Muted' : 'Transmitting Audio'}
              </p>

              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300">
                HOST
              </div>
              <div className="absolute top-3 right-3">
                {isAudioMuted ? (
                  <span className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-900 text-rose-300 inline-block">
                    <MicOff className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-900 text-emerald-300 inline-block">
                    <Mic className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>

            {/* Remote Group Members */}
            {members.map(member => (
              <div
                key={member.id}
                onClick={() => setSelectedSpotlightId(member.id)}
                className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 relative overflow-hidden flex flex-col items-center justify-center shadow-xl cursor-pointer group transition-all min-h-[180px]"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${member.avatarColor || 'from-violet-500 to-indigo-600'} flex items-center justify-center text-xl font-bold text-white shadow-lg mb-2 group-hover:scale-105 transition-transform`}
                >
                  {member.name.charAt(0)}
                </div>
                <p className="text-sm font-bold text-zinc-100">{member.name}</p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">@{member.username}</p>

                <div className="absolute top-3 right-3">
                  {member.isAudioMuted ? (
                    <span className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 inline-block">
                      <MicOff className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-900 text-emerald-300 inline-block animate-pulse">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" /> Spotlight
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 flex items-center justify-center gap-3 sm:gap-6 z-20">
        {/* Mute Mic */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isAudioMuted
              ? 'bg-rose-950 border border-rose-800 text-rose-300'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
          }`}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video / Camera Toggle (if video call) */}
        {isVideo && (
          <button
            type="button"
            onClick={onToggleVideo}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isVideoMuted
                ? 'bg-rose-950 border border-rose-800 text-rose-300'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
            title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}

        {/* Screen Share (if video call) */}
        {isVideo && (
          <button
            type="button"
            onClick={onToggleScreenShare}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isScreenSharing
                ? 'bg-cyan-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>
        )}

        {/* Speaker Output Toggle */}
        <button
          type="button"
          onClick={onToggleSpeaker}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isSpeakerOn
              ? 'bg-cyan-950 border border-cyan-700 text-cyan-300'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
          }`}
          title={isSpeakerOn ? 'Speakerphone Active' : 'Earpiece Active'}
        >
          {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* End Group Call */}
        <button
          type="button"
          onClick={onEndCall}
          className="w-14 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all"
          title="Leave / End Group Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
