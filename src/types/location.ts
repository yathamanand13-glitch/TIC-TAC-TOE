export type LocationPermissionState =
  | 'NOT_REQUESTED'
  | 'GRANTED'
  | 'DENIED'
  | 'UNAVAILABLE'
  | 'SHARING';

export type LiveShareDuration = '15m' | '1h' | '8h';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface LocationShareRecipient {
  id: string;
  name: string;
  username: string;
  avatarColor?: string;
  avatarUrl?: string;
}

export interface LocationShareSession {
  id: string;
  userId: string;
  userName: string;
  userAvatarColor?: string;
  coordinates: GeoCoordinates;
  duration: LiveShareDuration;
  startedAt: number;
  expiresAt: number;
  isActive: boolean;
  recipients: LocationShareRecipient[];
}

export interface LocationUpdate {
  sessionId: string;
  userId: string;
  coordinates: GeoCoordinates;
  timestamp: number;
}

export interface PeerLiveLocation {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatarColor: string;
  avatarUrl?: string;
  coordinates: GeoCoordinates;
  duration: LiveShareDuration;
  startedAt: number;
  expiresAt: number;
  sharingStatus: 'active' | 'expiring' | 'expired';
  isCurrentUser?: boolean;
}

export interface ILocationService {
  getPermissionState(): LocationPermissionState;
  requestPermission(): Promise<LocationPermissionState>;
  getCurrentPosition(): Promise<GeoCoordinates | null>;
  startWatching(onUpdate: (coords: GeoCoordinates) => void, onError: (err: GeolocationPositionError) => void): number | null;
  stopWatching(watchId: number): void;
  startSharing(duration: LiveShareDuration, recipients: LocationShareRecipient[]): Promise<LocationShareSession | null>;
  stopSharing(): Promise<void>;
  getActiveShareSession(): LocationShareSession | null;
  getPeerLocations(): Promise<PeerLiveLocation[]>;
  cleanup(): void;
}
