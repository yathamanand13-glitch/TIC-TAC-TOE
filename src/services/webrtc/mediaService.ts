import { AudioOutputDevice } from '../../types/call';

export class WebRTCMediaService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private currentFacingMode: 'user' | 'environment' = 'user';

  public isGetUserMediaSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(navigator?.mediaDevices?.getUserMedia);
  }

  public isScreenShareSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(navigator?.mediaDevices?.getDisplayMedia);
  }

  public async acquireLocalStream(
    withVideo: boolean = false,
    facingMode: 'user' | 'environment' = 'user'
  ): Promise<MediaStream | null> {
    this.currentFacingMode = facingMode;

    if (!this.isGetUserMediaSupported()) {
      return null;
    }

    try {
      // Release any previously held tracks before requesting new
      this.stopLocalStream();

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: withVideo
          ? {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch {
      // If video failed (e.g. no camera), try audio only as fallback
      if (withVideo) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          return this.localStream;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    this.stopScreenShare();
  }

  public toggleAudio(enabled: boolean): boolean {
    if (!this.localStream) return false;
    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = enabled;
    });
    return audioTracks.length > 0 ? audioTracks[0].enabled : false;
  }

  public toggleVideo(enabled: boolean): boolean {
    if (!this.localStream) return false;
    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = enabled;
    });
    return videoTracks.length > 0 ? videoTracks[0].enabled : false;
  }

  public async switchCamera(
    facingMode: 'user' | 'environment'
  ): Promise<MediaStream | null> {
    if (!this.localStream) return null;
    return this.acquireLocalStream(true, facingMode);
  }

  public async startScreenShare(): Promise<MediaStream | null> {
    if (!this.isScreenShareSupported()) return null;

    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      return this.screenStream;
    } catch {
      return null;
    }
  }

  public stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
  }

  public getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  public async getAudioOutputDevices(): Promise<AudioOutputDevice[]> {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.enumerateDevices
    ) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(d => d.kind === 'audiooutput')
        .map(d => ({
          deviceId: d.deviceId,
          label: d.label || `Speaker/Headset (${d.deviceId.slice(0, 5)})`,
          groupId: d.groupId,
        }));
    } catch {
      return [];
    }
  }

  public async setAudioOutputDevice(
    element: HTMLMediaElement,
    deviceId: string
  ): Promise<boolean> {
    if (typeof (element as any).setSinkId === 'function') {
      try {
        await (element as any).setSinkId(deviceId);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const mediaService = new WebRTCMediaService();
