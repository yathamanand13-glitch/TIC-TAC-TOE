import { getIceServersConfiguration } from './iceConfig';
import { ConnectionQuality, WebRTCStatsReport } from '../../types/call';

export type TrackHandler = (event: RTCTrackEvent) => void;
export type ConnectionStateChangeHandler = (state: RTCPeerConnectionState) => void;
export type IceConnectionStateChangeHandler = (state: RTCIceConnectionState) => void;
export type IceCandidateHandler = (candidate: RTCIceCandidate) => void;
export type StatsHandler = (stats: WebRTCStatsReport) => void;

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private remoteStream: MediaStream = new MediaStream();
  private statsInterval: NodeJS.Timeout | null = null;

  // Loopback peer connection for local verified hardware / audio / video test
  private loopbackPeer: RTCPeerConnection | null = null;

  // Event handlers
  private onTrackHandlers: Set<TrackHandler> = new Set();
  private onConnectionStateHandlers: Set<ConnectionStateChangeHandler> = new Set();
  private onIceConnectionStateHandlers: Set<IceConnectionStateChangeHandler> = new Set();
  private onIceCandidateHandlers: Set<IceCandidateHandler> = new Set();
  private onStatsHandlers: Set<StatsHandler> = new Set();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.RTCPeerConnection);
  }

  public initializePeerConnection(): RTCPeerConnection | null {
    if (!this.isSupported()) return null;

    this.cleanup();

    const config = getIceServersConfiguration();
    this.peerConnection = new RTCPeerConnection(config);
    this.remoteStream = new MediaStream();

    // 1. ICE Candidate Handler
    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        this.onIceCandidateHandlers.forEach(h => h(event.candidate!));
      }
    };

    // 2. Track Handler
    this.peerConnection.ontrack = event => {
      event.streams[0]?.getTracks().forEach(track => {
        if (!this.remoteStream.getTracks().some(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
      this.onTrackHandlers.forEach(h => h(event));
    };

    // 3. Connection State Change Handler
    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return;
      const state = this.peerConnection.connectionState;
      this.onConnectionStateHandlers.forEach(h => h(state));

      if (state === 'connected') {
        this.startStatsMonitoring();
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.stopStatsMonitoring();
      }
    };

    // 4. ICE Connection State Handler
    this.peerConnection.oniceconnectionstatechange = () => {
      if (!this.peerConnection) return;
      const state = this.peerConnection.iceConnectionState;
      this.onIceConnectionStateHandlers.forEach(h => h(state));
    };

    return this.peerConnection;
  }

  public getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }

  public getRemoteStream(): MediaStream {
    return this.remoteStream;
  }

  public addLocalStreamTracks(stream: MediaStream): void {
    if (!this.peerConnection) return;
    stream.getTracks().forEach(track => {
      try {
        this.peerConnection?.addTrack(track, stream);
      } catch {
        // Track might already be added
      }
    });
  }

  public replaceVideoTrack(newTrack: MediaStreamTrack | null): void {
    if (!this.peerConnection) return;
    const senders = this.peerConnection.getSenders();
    const videoSender = senders.find(s => s.track?.kind === 'video');
    if (videoSender) {
      videoSender.replaceTrack(newTrack);
    }
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch {
      return null;
    }
  }

  public async handleRemoteOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch {
      return null;
    }
  }

  public async handleRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<boolean> {
    if (!this.peerConnection) return false;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      return true;
    } catch {
      return false;
    }
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<boolean> {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return false;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      return true;
    } catch {
      return false;
    }
  }

  public async restartIce(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    try {
      const offer = await this.peerConnection.createOffer({ iceRestart: true });
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch {
      return null;
    }
  }

  /**
   * Diagnostic Local Loopback Session:
   * Sets up a real, local RTCPeerConnection pair on the device to test local microphone,
   * camera, real WebRTC stats, and video playback with zero faking.
   */
  public async startDiagnosticLoopback(localStream: MediaStream): Promise<boolean> {
    if (!this.isSupported()) return false;

    this.cleanup();
    const config = getIceServersConfiguration();

    this.peerConnection = new RTCPeerConnection(config);
    this.loopbackPeer = new RTCPeerConnection(config);
    this.remoteStream = new MediaStream();

    // Exchange ICE candidates between local pair
    this.peerConnection.onicecandidate = e => {
      if (e.candidate) this.loopbackPeer?.addIceCandidate(e.candidate);
    };
    this.loopbackPeer.onicecandidate = e => {
      if (e.candidate) this.peerConnection?.addIceCandidate(e.candidate);
    };

    // Forward loopback tracks into remoteStream
    this.loopbackPeer.ontrack = e => {
      e.streams[0]?.getTracks().forEach(track => {
        if (!this.remoteStream.getTracks().some(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
      this.onTrackHandlers.forEach(h => h(e));
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.onConnectionStateHandlers.forEach(h => h(this.peerConnection!.connectionState));
        if (this.peerConnection.connectionState === 'connected') {
          this.startStatsMonitoring();
        }
      }
    };

    // Add tracks to sender
    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);
      await this.loopbackPeer.setRemoteDescription(offer);

      const answer = await this.loopbackPeer.createAnswer();
      await this.loopbackPeer.setLocalDescription(answer);
      await this.peerConnection.setRemoteDescription(answer);

      return true;
    } catch {
      return false;
    }
  }

  // --- Real Stats & Connection Quality ---
  private startStatsMonitoring(): void {
    if (this.statsInterval) clearInterval(this.statsInterval);

    this.statsInterval = setInterval(async () => {
      if (!this.peerConnection || this.peerConnection.connectionState !== 'connected') {
        return;
      }

      try {
        const stats = await this.peerConnection.getStats();
        let roundTripTimeMs: number | undefined;
        let packetsLost: number | undefined;
        let jitterMs: number | undefined;
        let bytesReceived: number | undefined;
        let bytesSent: number | undefined;

        stats.forEach(report => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            roundTripTimeMs = report.currentRoundTripTime ? Math.round(report.currentRoundTripTime * 1000) : undefined;
          }
          if (report.type === 'inbound-rtp') {
            if (report.packetsLost !== undefined) packetsLost = report.packetsLost;
            if (report.jitter !== undefined) jitterMs = Math.round(report.jitter * 1000);
            if (report.bytesReceived !== undefined) bytesReceived = report.bytesReceived;
          }
          if (report.type === 'outbound-rtp' && report.bytesSent !== undefined) {
            bytesSent = report.bytesSent;
          }
        });

        // Determine quality from real RTT and packet loss
        let quality: ConnectionQuality = 'excellent';
        if (roundTripTimeMs !== undefined) {
          if (roundTripTimeMs > 300 || (packetsLost && packetsLost > 20)) {
            quality = 'weak';
          } else if (roundTripTimeMs > 150 || (packetsLost && packetsLost > 5)) {
            quality = 'good';
          }
        }

        const report: WebRTCStatsReport = {
          quality,
          roundTripTimeMs,
          packetsLost,
          jitterMs,
          bytesReceived,
          bytesSent,
        };

        this.onStatsHandlers.forEach(h => h(report));
      } catch {
        // Stats query failed
      }
    }, 2000);
  }

  private stopStatsMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  // Subscriptions
  public onTrack(handler: TrackHandler): () => void {
    this.onTrackHandlers.add(handler);
    return () => this.onTrackHandlers.delete(handler);
  }

  public onConnectionStateChange(handler: ConnectionStateChangeHandler): () => void {
    this.onConnectionStateHandlers.add(handler);
    return () => this.onConnectionStateHandlers.delete(handler);
  }

  public onIceConnectionStateChange(handler: IceConnectionStateChangeHandler): () => void {
    this.onIceConnectionStateHandlers.add(handler);
    return () => this.onIceConnectionStateHandlers.delete(handler);
  }

  public onIceCandidate(handler: IceCandidateHandler): () => void {
    this.onIceCandidateHandlers.add(handler);
    return () => this.onIceCandidateHandlers.delete(handler);
  }

  public onStats(handler: StatsHandler): () => void {
    this.onStatsHandlers.add(handler);
    return () => this.onStatsHandlers.delete(handler);
  }

  public cleanup(): void {
    this.stopStatsMonitoring();

    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.loopbackPeer) {
      this.loopbackPeer.close();
      this.loopbackPeer = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = new MediaStream();
    }
  }
}

export const webrtcService = new WebRTCService();
