export type PresenceState = 'online' | 'stealth' | 'away' | 'busy';

export type LastSeenPrivacy = 'everyone' | 'contacts' | 'nobody';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  avatarColor: string;
  about: string;
  statusMessage?: string;
  presence: PresenceState;
  lastSeenPrivacy: LastSeenPrivacy;
  lastSeenTimestamp: number;
  publicKeyFingerprint: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'terminal';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  lastActive: number;
  created: number;
}

export interface IProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<UserProfile>;
  updatePresence(presence: PresenceState): Promise<void>;
  updateLastSeenPrivacy(privacy: LastSeenPrivacy): Promise<void>;
}

export interface ISessionService {
  getActiveSessions(): Promise<DeviceSession[]>;
  terminateSession(sessionId: string): Promise<boolean>;
  terminateAllOtherSessions(): Promise<boolean>;
}
