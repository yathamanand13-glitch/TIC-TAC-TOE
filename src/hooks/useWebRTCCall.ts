import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AudioOutputDevice,
  CallPeer,
  CallSession,
  CallState,
  CallType,
  SignalingMessage,
  WebRTCStatsReport,
} from '../types/call';
import { webrtcService } from '../services/webrtc/webrtcService';
import { mediaService } from '../services/webrtc/mediaService';
import { signalingService } from '../services/webrtc/signalingService';
import { callHistoryService } from '../services/webrtc/callHistoryService';

export function useWebRTCCall() {
  const [session, setSession] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Audio/Video control states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Audio output devices
  const [audioDevices, setAudioDevices] = useState<AudioOutputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');

  // Connection Quality & Statistics
  const [stats, setStats] = useState<WebRTCStatsReport>({ quality: 'unknown' });

  // Call duration counter
  const [duration, setDuration] = useState(0);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active call ref for event listeners
  const sessionRef = useRef<CallSession | null>(null);
  sessionRef.current = session;

  // Enumerate audio devices on mount
  useEffect(() => {
    mediaService.getAudioOutputDevices().then(devs => {
      setAudioDevices(devs);
    });
  }, []);

  // WebRTC & Signaling event listeners
  useEffect(() => {
    // 1. Connection state changes
    const unsubConn = webrtcService.onConnectionStateChange(state => {
      setSession(prev => {
        if (!prev) return null;
        let nextCallState: CallState = prev.state;
        if (state === 'connected') {
          nextCallState = 'connected';
        } else if (state === 'disconnected') {
          nextCallState = 'reconnecting';
        } else if (state === 'failed') {
          nextCallState = 'failed';
        } else if (state === 'closed') {
          nextCallState = 'ended';
        }
        return { ...prev, state: nextCallState };
      });
    });

    // 2. Track handler
    const unsubTrack = webrtcService.onTrack(() => {
      setRemoteStream(webrtcService.getRemoteStream());
    });

    // 3. Stats handler
    const unsubStats = webrtcService.onStats(report => {
      setStats(report);
    });

    // 4. Signaling messages handler
    const unsubSig = signalingService.subscribe((msg: SignalingMessage) => {
      const cur = sessionRef.current;
      if (!cur) return;

      if (msg.callId !== cur.callId) return;

      if (msg.type === 'call:accept') {
        setSession(prev => (prev ? { ...prev, state: 'connecting' } : null));
      } else if (msg.type === 'call:reject') {
        setSession(prev => (prev ? { ...prev, state: 'declined', failureReason: msg.reason } : null));
        cleanup();
      } else if (msg.type === 'call:end') {
        setSession(prev => (prev ? { ...prev, state: 'ended' } : null));
        cleanup();
      } else if (msg.type === 'call:busy') {
        setSession(prev => (prev ? { ...prev, state: 'busy' } : null));
        cleanup();
      }
    });

    return () => {
      unsubConn();
      unsubTrack();
      unsubStats();
      unsubSig();
    };
  }, []);

  // Duration timer for connected calls
  useEffect(() => {
    if (session?.state === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [session?.state]);

  const cleanup = useCallback(() => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    mediaService.stopLocalStream();
    mediaService.stopScreenShare();
    webrtcService.cleanup();
    setLocalStream(null);
    setRemoteStream(null);
    setScreenStream(null);
    setIsScreenSharing(false);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setStats({ quality: 'unknown' });
  }, []);

  // End active call
  const endCall = useCallback(async () => {
    const cur = sessionRef.current;
    if (cur) {
      signalingService.sendEnd(cur.callId, cur.remotePeer?.id);

      // Record to call history
      if (cur.remotePeer) {
        callHistoryService.addRecord({
          caller: cur.initiator,
          receiver: cur.remotePeer,
          group: cur.isGroup ? { id: cur.callId, name: cur.groupName || 'Tactical Group' } : undefined,
          callType: cur.type.includes('video') ? 'video' : 'audio',
          direction: cur.initiator.id === 'current_user' ? 'outgoing' : 'incoming',
          status: cur.state === 'connected' ? 'completed' : 'missed',
          startTime: cur.startTime || Date.now(),
          endTime: Date.now(),
          durationSeconds: duration,
        });
      }

      setSession(prev => (prev ? { ...prev, state: 'ended', durationSeconds: duration } : null));
    }
    cleanup();
    setTimeout(() => {
      setSession(null);
      setDuration(0);
    }, 1500);
  }, [cleanup, duration]);

  // Start outgoing 1-on-1 call
  const startCall = useCallback(
    async (remotePeer: CallPeer, type: CallType) => {
      cleanup();

      const callId = 'call_' + Date.now();
      const isVideo = type === 'one-to-one-video' || type === 'group-video';

      const newSession: CallSession = {
        callId,
        type,
        state: 'calling',
        initiator: {
          id: 'current_user',
          name: 'Commander Nova',
          username: 'nova_spectre',
        },
        remotePeer,
        isGroup: false,
        startTime: Date.now(),
        durationSeconds: 0,
      };

      setSession(newSession);
      setDuration(0);

      // 1. Acquire local media stream
      const stream = await mediaService.acquireLocalStream(isVideo, 'user');
      setLocalStream(stream);

      // 2. Initialize RTCPeerConnection
      const pc = webrtcService.initializePeerConnection();
      if (stream && pc) {
        webrtcService.addLocalStreamTracks(stream);
      }

      // 3. Send signaling invitation
      await signalingService.sendInvite(callId, remotePeer.id, type);

      // 4. Update session to ringing state after invite dispatched
      setTimeout(() => {
        setSession(prev => (prev ? { ...prev, state: 'ringing' } : null));
      }, 800);
    },
    [cleanup]
  );

  // Start group call
  const startGroupCall = useCallback(
    async (groupMembers: CallPeer[], groupName: string, type: CallType) => {
      cleanup();

      const callId = 'grp_call_' + Date.now();
      const isVideo = type.includes('video');

      const newSession: CallSession = {
        callId,
        type,
        state: 'calling',
        initiator: {
          id: 'current_user',
          name: 'Commander Nova',
          username: 'nova_spectre',
        },
        groupMembers,
        isGroup: true,
        groupName,
        startTime: Date.now(),
        durationSeconds: 0,
      };

      setSession(newSession);
      setDuration(0);

      const stream = await mediaService.acquireLocalStream(isVideo, 'user');
      setLocalStream(stream);

      webrtcService.initializePeerConnection();
      if (stream) {
        webrtcService.addLocalStreamTracks(stream);
      }

      setTimeout(() => {
        setSession(prev => (prev ? { ...prev, state: 'ringing' } : null));
      }, 800);
    },
    [cleanup]
  );

  /**
   * Diagnostic Loopback Test Mode:
   * Sets up a real, genuine WebRTC RTCPeerConnection pair on the device
   * to test camera, microphone, WebRTC stats, and video playback with zero faking.
   */
  const startDiagnosticLoopback = useCallback(
    async (type: CallType = 'one-to-one-video') => {
      cleanup();

      const isVideo = type.includes('video');
      const callId = 'diag_loopback_' + Date.now();

      const newSession: CallSession = {
        callId,
        type,
        state: 'connecting',
        initiator: {
          id: 'current_user',
          name: 'Commander Nova (Local)',
          username: 'nova_spectre',
        },
        remotePeer: {
          id: 'peer_loopback',
          name: 'Encrypted Loopback Node',
          username: 'webrtc_loopback_node',
          avatarColor: 'from-emerald-500 to-teal-700',
        },
        isGroup: false,
        startTime: Date.now(),
        durationSeconds: 0,
      };

      setSession(newSession);
      setDuration(0);

      // Acquire media
      const stream = await mediaService.acquireLocalStream(isVideo, 'user');
      setLocalStream(stream);

      if (stream) {
        const success = await webrtcService.startDiagnosticLoopback(stream);
        if (success) {
          setRemoteStream(webrtcService.getRemoteStream());
          setSession(prev => (prev ? { ...prev, state: 'connected' } : null));
        } else {
          setSession(prev => (prev ? { ...prev, state: 'failed', failureReason: 'WebRTC loopback initialization failed' } : null));
        }
      } else {
        setSession(prev => (prev ? { ...prev, state: 'failed', failureReason: 'Could not access media stream' } : null));
      }
    },
    [cleanup]
  );

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    const cur = sessionRef.current;
    if (!cur) return;

    setSession(prev => (prev ? { ...prev, state: 'connecting' } : null));
    const isVideo = cur.type.includes('video');

    const stream = await mediaService.acquireLocalStream(isVideo, 'user');
    setLocalStream(stream);

    const pc = webrtcService.initializePeerConnection();
    if (stream && pc) {
      webrtcService.addLocalStreamTracks(stream);
    }

    if (cur.remotePeer) {
      signalingService.sendAccept(cur.callId, cur.remotePeer.id, cur.type);
    }
  }, []);

  // Reject incoming call
  const rejectCall = useCallback(
    (reason: string = 'declined') => {
      const cur = sessionRef.current;
      if (cur && cur.remotePeer) {
        signalingService.sendReject(cur.callId, cur.remotePeer.id, reason);
      }
      cleanup();
      setSession(null);
    },
    [cleanup]
  );

  // Audio mute toggle
  const toggleMuteAudio = useCallback(() => {
    const newState = !isAudioMuted;
    mediaService.toggleAudio(!newState);
    setIsAudioMuted(newState);
  }, [isAudioMuted]);

  // Video enable/disable toggle
  const toggleVideo = useCallback(() => {
    const newState = !isVideoMuted;
    mediaService.toggleVideo(!newState);
    setIsVideoMuted(newState);
  }, [isVideoMuted]);

  // Speaker toggle
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(prev => !prev);
  }, []);

  // Camera switch (front/rear)
  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    const newStream = await mediaService.switchCamera(nextMode);
    if (newStream) {
      setLocalStream(newStream);
      webrtcService.replaceVideoTrack(newStream.getVideoTracks()[0]);
    }
  }, [facingMode]);

  // Screen share toggle
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      mediaService.stopScreenShare();
      setScreenStream(null);
      setIsScreenSharing(false);
      // Revert track to camera
      if (localStream) {
        webrtcService.replaceVideoTrack(localStream.getVideoTracks()[0]);
      }
    } else {
      const scr = await mediaService.startScreenShare();
      if (scr) {
        setScreenStream(scr);
        setIsScreenSharing(true);
        webrtcService.replaceVideoTrack(scr.getVideoTracks()[0]);
      }
    }
  }, [isScreenSharing, localStream]);

  // Audio output device switch
  const switchAudioOutputDevice = useCallback(
    async (element: HTMLMediaElement, deviceId: string) => {
      const success = await mediaService.setAudioOutputDevice(element, deviceId);
      if (success) {
        setSelectedDeviceId(deviceId);
      }
    },
    []
  );

  // Simulate an incoming call for testing handshake, ringing, accept/decline flows
  const simulateIncomingCall = useCallback(
    (
      peer: CallPeer = {
        id: 'usr_ghost_01',
        name: 'Ghost Sector Node',
        username: 'ghost_node',
        avatarColor: 'from-cyan-500 to-blue-600',
      },
      type: CallType = 'one-to-one-audio'
    ) => {
      cleanup();
      const callId = 'call_inc_' + Date.now();
      const newSession: CallSession = {
        callId,
        type,
        state: 'ringing',
        initiator: peer,
        remotePeer: {
          id: 'current_user',
          name: 'Commander Nova',
          username: 'nova_spectre',
        },
        isGroup: type.startsWith('group'),
        startTime: Date.now(),
        durationSeconds: 0,
      };
      setSession(newSession);
      setDuration(0);
    },
    [cleanup]
  );

  return {
    session,
    callState: session?.state || 'idle',
    localStream,
    remoteStream,
    screenStream,
    duration,
    stats,
    isAudioMuted,
    isVideoMuted,
    isSpeakerOn,
    isScreenSharing,
    facingMode,
    audioDevices,
    selectedDeviceId,
    startCall,
    startGroupCall,
    startDiagnosticLoopback,
    simulateIncomingCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMuteAudio,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    toggleScreenShare,
    switchAudioOutputDevice,
  };
}
