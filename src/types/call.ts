export type CallType = 'one-to-one-audio' | 'one-to-one-video' | 'group-audio' | 'group-video';

export type CallState =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'declined'
  | 'busy'
  | 'failed'
  | 'ended'
  | 'missed';

export type ConnectionQuality = 'excellent' | 'good' | 'weak' | 'reconnecting' | 'unknown';

export interface CallPeer {
  id: string;
  name: string;
  username: string;
  avatarColor?: string;
  avatarUrl?: string;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
  isScreenSharing?: boolean;
}

export interface CallSession {
  callId: string;
  type: CallType;
  state: CallState;
  initiator: CallPeer;
  remotePeer?: CallPeer;
  groupMembers?: CallPeer[];
  startTime?: number;
  connectedTime?: number;
  endTime?: number;
  durationSeconds: number;
  isGroup: boolean;
  groupName?: string;
  failureReason?: string;
}

export type SignalingMessageType =
  | 'call:invite'
  | 'call:offer'
  | 'call:answer'
  | 'call:ice_candidate'
  | 'call:accept'
  | 'call:reject'
  | 'call:end'
  | 'call:busy';

export interface SignalingMessage {
  id: string;
  type: SignalingMessageType;
  callId: string;
  senderId: string;
  receiverId?: string;
  callType: CallType;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  reason?: string;
  timestamp: number;
}

export interface CallHistoryRecord {
  id: string;
  caller: CallPeer;
  receiver: CallPeer;
  group?: {
    id: string;
    name: string;
    avatarColor?: string;
  };
  callType: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  status: 'completed' | 'missed' | 'declined' | 'failed' | 'busy';
  startTime: number;
  endTime?: number;
  durationSeconds: number;
}

export interface WebRTCStatsReport {
  quality: ConnectionQuality;
  roundTripTimeMs?: number;
  packetsLost?: number;
  jitterMs?: number;
  bytesReceived?: number;
  bytesSent?: number;
  frameRate?: number;
  resolution?: string;
}

export interface AudioOutputDevice {
  deviceId: string;
  label: string;
  groupId: string;
}
