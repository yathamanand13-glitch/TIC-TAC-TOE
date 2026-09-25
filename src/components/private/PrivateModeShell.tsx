import React, { useState, useEffect } from 'react';
import { PrivateSection } from '../../types/app';
import { UserProfile } from '../../types/profile';
import { CallPeer } from '../../types/call';
import { profileService } from '../../services/profile/profileService';
import { useWebRTCCall } from '../../hooks/useWebRTCCall';
import { PrivateSidebar } from './navigation/PrivateSidebar';
import { PrivateBottomNav } from './navigation/PrivateBottomNav';
import { ChatsViewShell } from './chats/ChatsViewShell';
import { CallsViewShell } from './calls/CallsViewShell';
import { MapViewShell } from './map/MapViewShell';
import { ProfileView } from './profile/ProfileView';
import { SettingsView } from './settings/SettingsView';
import { IncomingCallScreen } from './calls/IncomingCallScreen';
import { OutgoingCallScreen } from './calls/OutgoingCallScreen';
import { AudioCallScreen } from './calls/AudioCallScreen';
import { VideoCallScreen } from './calls/VideoCallScreen';
import { GroupCallScreen } from './calls/GroupCallScreen';
import { Clock } from 'lucide-react';

interface PrivateModeShellProps {
  onExit: () => void;
  onPanicExit: () => void;
}

export const PrivateModeShell: React.FC<PrivateModeShellProps> = ({
  onExit,
  onPanicExit,
}) => {
  const [activeSection, setActiveSection] = useState<PrivateSection>('chats');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [autoLockSeconds, setAutoLockSeconds] = useState(300); // 5 min auto-lock

  // WebRTC calling controller
  const call = useWebRTCCall();

  // Fetch initial profile
  useEffect(() => {
    profileService.getProfile().then(setProfile);
  }, [activeSection]);

  // Session duration timer & auto-lock countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
      setAutoLockSeconds(prev => {
        if (prev <= 1) {
          onExit(); // Inactivity auto-lock
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const resetTimer = () => setAutoLockSeconds(300);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [onExit]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = (peer: CallPeer, type: 'audio' | 'video', isGroup: boolean = false) => {
    if (isGroup) {
      call.startGroupCall([peer], peer.name, type === 'video' ? 'group-video' : 'group-audio');
    } else {
      call.startCall(peer, type === 'video' ? 'one-to-one-video' : 'one-to-one-audio');
    }
  };

  // Determine active call screen overlay state
  const isIncoming =
    call.session &&
    call.session.initiator.id !== 'current_user' &&
    (call.callState === 'ringing' || call.callState === 'calling');

  const isOutgoing =
    call.session &&
    call.session.initiator.id === 'current_user' &&
    (call.callState === 'calling' || call.callState === 'ringing' || call.callState === 'connecting');

  const isConnected =
    call.session && (call.callState === 'connected' || call.callState === 'reconnecting');

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-950">
      
      {/* Desktop Navigation Sidebar / Rail */}
      <PrivateSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        profile={profile}
        onLock={onExit}
        onPanicExit={onPanicExit}
        unreadCount={2}
        missedCallsCount={1}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-14 md:pb-0 relative bg-zinc-950/70">
        
        {/* Top Session Security Micro-Bar (Mobile / Tablet Quick Status) */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/90 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AEGIS ENCLAVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              {formatTimer(autoLockSeconds)}
            </span>
            <button
              type="button"
              onClick={onPanicExit}
              className="px-2 py-0.5 rounded bg-rose-950 border border-rose-900 text-rose-300 text-[10px] font-bold"
            >
              PANIC
            </button>
          </div>
        </div>

        {/* Dynamic Section Renderer */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeSection === 'chats' && <ChatsViewShell onStartCall={handleStartCall} />}
          {activeSection === 'calls' && (
            <CallsViewShell
              onStartCall={handleStartCall}
              onSimulateIncoming={call.simulateIncomingCall}
            />
          )}
          {activeSection === 'map' && (
            <MapViewShell
              onNavigateToChat={() => setActiveSection('chats')}
              onStartCall={peerId => {
                const peer: CallPeer = {
                  id: peerId,
                  name: 'Tactical Node',
                  username: 'tactical_peer',
                  avatarColor: 'from-cyan-500 to-blue-600',
                };
                handleStartCall(peer, 'audio');
              }}
            />
          )}
          {activeSection === 'profile' && (
            <ProfileView onNavigateToSection={setActiveSection} />
          )}
          {activeSection === 'settings' && (
            <SettingsView onNavigateToSection={setActiveSection} />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <PrivateBottomNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          unreadCount={2}
          missedCallsCount={1}
        />
      </div>

      {/* Fullscreen WebRTC Call Screens Overlay */}
      {isIncoming && call.session && (
        <IncomingCallScreen
          session={call.session}
          onAccept={call.acceptCall}
          onDecline={() => call.rejectCall('declined')}
        />
      )}

      {isOutgoing && call.session && (
        <OutgoingCallScreen
          session={call.session}
          localStream={call.localStream}
          isAudioMuted={call.isAudioMuted}
          onToggleMute={call.toggleMuteAudio}
          onSwitchCamera={call.switchCamera}
          onEndCall={call.endCall}
        />
      )}

      {isConnected && call.session && (
        <>
          {call.session.isGroup ? (
            <GroupCallScreen
              session={call.session}
              localStream={call.localStream}
              duration={call.duration}
              stats={call.stats}
              isAudioMuted={call.isAudioMuted}
              isVideoMuted={call.isVideoMuted}
              isSpeakerOn={call.isSpeakerOn}
              isScreenSharing={call.isScreenSharing}
              onToggleMute={call.toggleMuteAudio}
              onToggleVideo={call.toggleVideo}
              onToggleSpeaker={call.toggleSpeaker}
              onToggleScreenShare={call.toggleScreenShare}
              onEndCall={call.endCall}
            />
          ) : call.session.type.includes('video') ? (
            <VideoCallScreen
              session={call.session}
              localStream={call.localStream}
              remoteStream={call.remoteStream}
              screenStream={call.screenStream}
              duration={call.duration}
              stats={call.stats}
              isAudioMuted={call.isAudioMuted}
              isVideoMuted={call.isVideoMuted}
              isSpeakerOn={call.isSpeakerOn}
              isScreenSharing={call.isScreenSharing}
              onToggleMute={call.toggleMuteAudio}
              onToggleVideo={call.toggleVideo}
              onToggleSpeaker={call.toggleSpeaker}
              onSwitchCamera={call.switchCamera}
              onToggleScreenShare={call.toggleScreenShare}
              onEndCall={call.endCall}
            />
          ) : (
            <AudioCallScreen
              session={call.session}
              remoteStream={call.remoteStream}
              duration={call.duration}
              stats={call.stats}
              isAudioMuted={call.isAudioMuted}
              isSpeakerOn={call.isSpeakerOn}
              audioDevices={call.audioDevices}
              selectedDeviceId={call.selectedDeviceId}
              onToggleMute={call.toggleMuteAudio}
              onToggleSpeaker={call.toggleSpeaker}
              onSwitchAudioDevice={call.switchAudioOutputDevice}
              onEndCall={call.endCall}
            />
          )}
        </>
      )}

    </div>
  );
};
