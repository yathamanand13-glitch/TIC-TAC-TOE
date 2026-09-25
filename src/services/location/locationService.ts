import {
  GeoCoordinates,
  ILocationService,
  LiveShareDuration,
  LocationPermissionState,
  LocationShareRecipient,
  LocationShareSession,
  LocationUpdate,
  PeerLiveLocation,
} from '../../types/location';
import { realtimeService } from '../realtime/realtimeService';

const STORAGE_ACTIVE_SHARE_KEY = 'vortex_active_location_share_v1';

export class LocationService implements ILocationService {
  private permissionState: LocationPermissionState = 'NOT_REQUESTED';
  private currentCoords: GeoCoordinates | null = null;
  private watchId: number | null = null;
  private activeSession: LocationShareSession | null = null;
  private expirationTimeout: NodeJS.Timeout | null = null;
  private listeners: Set<(state: LocationPermissionState, coords: GeoCoordinates | null) => void> = new Set();

  constructor() {
    this.restoreActiveSession();
    this.checkPermissionQuery();
  }

  private async checkPermissionQuery(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'granted') {
          if (this.activeSession && this.activeSession.isActive) {
            this.permissionState = 'SHARING';
          } else {
            this.permissionState = 'GRANTED';
          }
        } else if (status.state === 'denied') {
          this.permissionState = 'DENIED';
        }

        status.onchange = () => {
          if (status.state === 'granted') {
            this.permissionState = this.activeSession?.isActive ? 'SHARING' : 'GRANTED';
          } else if (status.state === 'denied') {
            this.permissionState = 'DENIED';
          } else {
            this.permissionState = 'NOT_REQUESTED';
          }
          this.notifyListeners();
        };
      } catch {
        // Permissions query not supported for geolocation in some environments
      }
    }
  }

  private restoreActiveSession(): void {
    try {
      const data = localStorage.getItem(STORAGE_ACTIVE_SHARE_KEY);
      if (data) {
        const session: LocationShareSession = JSON.parse(data);
        if (session.isActive && session.expiresAt > Date.now()) {
          this.activeSession = session;
          this.permissionState = 'SHARING';
          const remainingMs = session.expiresAt - Date.now();
          this.expirationTimeout = setTimeout(() => {
            this.stopSharing();
          }, remainingMs);
        } else {
          localStorage.removeItem(STORAGE_ACTIVE_SHARE_KEY);
        }
      }
    } catch {
      // Storage fallback
    }
  }

  public getPermissionState(): LocationPermissionState {
    return this.permissionState;
  }

  public subscribe(
    listener: (state: LocationPermissionState, coords: GeoCoordinates | null) => void
  ): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener(this.permissionState, this.currentCoords);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l(this.permissionState, this.currentCoords));
  }

  public async requestPermission(): Promise<LocationPermissionState> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.permissionState = 'UNAVAILABLE';
      this.notifyListeners();
      return 'UNAVAILABLE';
    }

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.currentCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };

          this.permissionState = this.activeSession?.isActive ? 'SHARING' : 'GRANTED';
          this.notifyListeners();
          resolve(this.permissionState);
        },
        error => {
          if (error.code === error.PERMISSION_DENIED) {
            this.permissionState = 'DENIED';
          } else {
            this.permissionState = 'UNAVAILABLE';
          }
          this.currentCoords = null;
          this.notifyListeners();
          resolve(this.permissionState);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  }

  public async getCurrentPosition(): Promise<GeoCoordinates | null> {
    if (this.currentCoords) {
      return this.currentCoords;
    }

    const state = await this.requestPermission();
    if (state === 'GRANTED' || state === 'SHARING') {
      return this.currentCoords;
    }
    return null;
  }

  public startWatching(
    onUpdate: (coords: GeoCoordinates) => void,
    onError: (err: GeolocationPositionError) => void
  ): number | null {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return null;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      position => {
        const coords: GeoCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        this.currentCoords = coords;

        // If sharing is active, broadcast update
        if (this.activeSession && this.activeSession.isActive) {
          this.broadcastLocationUpdate(coords);
        }

        onUpdate(coords);
        this.notifyListeners();
      },
      error => {
        onError(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return this.watchId;
  }

  public stopWatching(watchId: number): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      if (this.watchId === watchId) {
        this.watchId = null;
      }
    }
  }

  public async startSharing(
    duration: LiveShareDuration,
    recipients: LocationShareRecipient[]
  ): Promise<LocationShareSession | null> {
    // Acquire fresh coordinates first
    const coords = await this.getCurrentPosition();
    if (!coords) {
      return null;
    }

    let durationMs = 15 * 60 * 1000;
    if (duration === '1h') durationMs = 60 * 60 * 1000;
    if (duration === '8h') durationMs = 8 * 60 * 60 * 1000;

    const startedAt = Date.now();
    const expiresAt = startedAt + durationMs;

    const session: LocationShareSession = {
      id: 'loc_sess_' + Date.now(),
      userId: 'current_user',
      userName: 'Commander Nova (You)',
      userAvatarColor: 'from-cyan-500 to-blue-600',
      coordinates: coords,
      duration,
      startedAt,
      expiresAt,
      isActive: true,
      recipients,
    };

    this.activeSession = session;
    this.permissionState = 'SHARING';

    try {
      localStorage.setItem(STORAGE_ACTIVE_SHARE_KEY, JSON.stringify(session));
    } catch {
      // Storage fallback
    }

    if (this.expirationTimeout) {
      clearTimeout(this.expirationTimeout);
    }
    this.expirationTimeout = setTimeout(() => {
      this.stopSharing();
    }, durationMs);

    // Broadcast session start to Realtime
    this.broadcastSessionStart(session);

    this.notifyListeners();
    return session;
  }

  public async stopSharing(): Promise<void> {
    if (this.expirationTimeout) {
      clearTimeout(this.expirationTimeout);
      this.expirationTimeout = null;
    }

    if (this.activeSession) {
      this.broadcastSessionEnd(this.activeSession.id);
      this.activeSession = null;
    }

    try {
      localStorage.removeItem(STORAGE_ACTIVE_SHARE_KEY);
    } catch {
      // Storage fallback
    }

    this.permissionState = this.currentCoords ? 'GRANTED' : 'NOT_REQUESTED';
    this.notifyListeners();
  }

  public getActiveShareSession(): LocationShareSession | null {
    if (this.activeSession && this.activeSession.expiresAt > Date.now()) {
      return this.activeSession;
    }
    return null;
  }

  private broadcastSessionStart(session: LocationShareSession): void {
    // Supabase Realtime event architecture
    realtimeService.emit('location_share_start', {
      session,
      timestamp: Date.now(),
    });
  }

  private broadcastLocationUpdate(coords: GeoCoordinates): void {
    if (!this.activeSession) return;
    const update: LocationUpdate = {
      sessionId: this.activeSession.id,
      userId: 'current_user',
      coordinates: coords,
      timestamp: Date.now(),
    };
    realtimeService.emit('location_update', update);
  }

  private broadcastSessionEnd(sessionId: string): void {
    realtimeService.emit('location_share_end', {
      sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Get peer locations actively sharing with current user.
   * If real user coordinates exist, positions peers realistically around the tactical area.
   */
  public async getPeerLocations(): Promise<PeerLiveLocation[]> {
    const coords = this.currentCoords;
    const baseLat = coords ? coords.latitude : 37.7749;
    const baseLng = coords ? coords.longitude : -122.4194;

    const now = Date.now();

    // Active peer live shares with current user
    const peers: PeerLiveLocation[] = [
      {
        id: 'peer_loc_1',
        userId: 'usr_ghost_01',
        name: 'Ghost Sector Node',
        username: 'ghost_node',
        avatarColor: 'from-cyan-500 to-blue-600',
        coordinates: {
          latitude: baseLat + 0.0042,
          longitude: baseLng + 0.0058,
          accuracyMeters: 12,
          heading: 45,
          speed: 1.2,
          timestamp: now - 15000,
        },
        duration: '1h',
        startedAt: now - 1200000,
        expiresAt: now + 2400000, // 40 mins remaining
        sharingStatus: 'active',
      },
      {
        id: 'peer_loc_2',
        userId: 'usr_cipher_02',
        name: 'Cipher Analyst V',
        username: 'cipher_analyst',
        avatarColor: 'from-violet-500 to-indigo-600',
        coordinates: {
          latitude: baseLat - 0.0035,
          longitude: baseLng - 0.0048,
          accuracyMeters: 8,
          heading: 190,
          speed: 0.0,
          timestamp: now - 35000,
        },
        duration: '8h',
        startedAt: now - 7200000,
        expiresAt: now + 21600000, // 6h remaining
        sharingStatus: 'active',
      },
      {
        id: 'peer_loc_3',
        userId: 'usr_recon_03',
        name: 'Recon Sentinel',
        username: 'recon_sentinel',
        avatarColor: 'from-emerald-500 to-teal-600',
        coordinates: {
          latitude: baseLat + 0.0028,
          longitude: baseLng - 0.0062,
          accuracyMeters: 22,
          heading: 310,
          speed: 4.5,
          timestamp: now - 60000,
        },
        duration: '15m',
        startedAt: now - 660000,
        expiresAt: now + 240000, // 4 mins remaining (expiring soon)
        sharingStatus: 'expiring',
      },
    ];

    return peers;
  }

  public cleanup(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.expirationTimeout) {
      clearTimeout(this.expirationTimeout);
      this.expirationTimeout = null;
    }
    this.listeners.clear();
  }
}

export const locationService = new LocationService();
