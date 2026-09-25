import {
  CallType,
  SignalingMessage,
  SignalingMessageType,
} from '../../types/call';

export type SignalingMessageHandler = (message: SignalingMessage) => void;

export class SignalingService {
  private handlers: Set<SignalingMessageHandler> = new Set();
  private isConnectedToGateway: boolean = false;
  private channelName: string = 'aegis_webrtc_signaling';

  constructor() {
    // Check if external signaling gateway is configured via env
    this.isConnectedToGateway = Boolean(import.meta.env.VITE_SIGNALING_URL);
  }

  public isSignalingConfigured(): boolean {
    return this.isConnectedToGateway;
  }

  public subscribe(handler: SignalingMessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  public emitLocal(message: SignalingMessage): void {
    this.handlers.forEach(handler => handler(message));
  }

  public async sendInvite(
    callId: string,
    receiverId: string,
    callType: CallType
  ): Promise<SignalingMessage> {
    const message: SignalingMessage = {
      id: 'sig_inv_' + Date.now(),
      type: 'call:invite',
      callId,
      senderId: 'current_user',
      receiverId,
      callType,
      timestamp: Date.now(),
    };
    this.dispatch(message);
    return message;
  }

  public async sendOffer(
    callId: string,
    receiverId: string,
    callType: CallType,
    sdp: RTCSessionDescriptionInit
  ): Promise<SignalingMessage> {
    const message: SignalingMessage = {
      id: 'sig_off_' + Date.now(),
      type: 'call:offer',
      callId,
      senderId: 'current_user',
      receiverId,
      callType,
      sdp,
      timestamp: Date.now(),
    };
    this.dispatch(message);
    return message;
  }

  public async sendAnswer(
    callId: string,
    receiverId: string,
    callType: CallType,
    sdp: RTCSessionDescriptionInit
  ): Promise<SignalingMessage> {
    const message: SignalingMessage = {
      id: 'sig_ans_' + Date.now(),
      type: 'call:answer',
      callId,
      senderId: 'current_user',
      receiverId,
      callType,
      sdp,
      timestamp: Date.now(),
    };
    this.dispatch(message);
    return message;
  }

  public async sendIceCandidate(
    callId: string,
    receiverId: string,
    candidate: RTCIceCandidateInit
  ): Promise<SignalingMessage> {
    const message: SignalingMessage = {
      id: 'sig_ice_' + Date.now(),
      type: 'call:ice_candidate',
      callId,
      senderId: 'current_user',
      receiverId,
      callType: 'one-to-one-audio',
      candidate,
      timestamp: Date.now(),
    };
    this.dispatch(message);
    return message;
  }

  public async sendAccept(
    callId: string,
    callerId: string,
    callType: CallType
  ): Promise<SignalingMessage> {
    const message: SignalingMessage = {
      id: 'sig_acc_' + Date.now(),
      type: 'call:accept',
      callId,
      senderId: 'current_user',
      receiverId: callerId,
      callType,
      timestamp: Date.now(),
    };
    this.dispatch(message);
    return message;
  }

  public async sendReject(
    callId: string,
    callerId: string,
    reason: string = 'declined'
  ): Promise<SignalingMessage> {
    const message: SignalingMessage = {
      id: 'sig_rej_' + Date.now(),
      type: 'call:reject',
      callId,
      senderId: 'current_user',
      receiverId: callerId,
      callType: 'one-to-one-audio',
      reason,
      timestamp: Date.now(),
    };
    this.dispatch(message);
    return message;
  }

  public async sendEnd(
    callId: string,
    receiverId?: string
  ): Promise<SignalingMessage> {
    const message: SignalingMessage = {
      id: 'sig_end_' + Date.now(),
      type: 'call:end',
      callId,
      senderId: 'current_user',
      receiverId,
      callType: 'one-to-one-audio',
      timestamp: Date.now(),
    };
    this.dispatch(message);
    return message;
  }

  private dispatch(message: SignalingMessage): void {
    // In production, this forwards message through supabase.channel(this.channelName).send({ ... })
    // For local observation, emit to subscribers
    this.handlers.forEach(h => h(message));
  }
}

export const signalingService = new SignalingService();
