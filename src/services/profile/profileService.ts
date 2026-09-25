import { UserProfile, PresenceState, LastSeenPrivacy, IProfileService } from '../../types/profile';

const STORAGE_PROFILE_KEY = 'vortex_private_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_nova_982',
  username: 'nova_spectre',
  displayName: 'Commander Nova',
  avatarUrl: '',
  avatarColor: 'from-cyan-500 to-blue-600',
  about: 'Tactical comms operator. Minimal digital footprint. Verifiable GPG/ECC keys.',
  statusMessage: 'Signal encrypted · High integrity',
  presence: 'online',
  lastSeenPrivacy: 'contacts',
  lastSeenTimestamp: Date.now(),
  publicKeyFingerprint: '4F89 2A1C 90B4 ED77 319C 8F10 A92C EF43',
  createdAt: Date.now() - 86400000 * 30, // 30 days ago
  updatedAt: Date.now(),
};

class LocalProfileService implements IProfileService {
  private profile: UserProfile;

  constructor() {
    this.profile = this.loadInitialProfile();
  }

  private loadInitialProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch {
      // Storage unavailable fallback
    }
    return { ...DEFAULT_PROFILE };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(this.profile));
    } catch {
      // Storage unavailable fallback
    }
  }

  public async getProfile(): Promise<UserProfile> {
    return { ...this.profile };
  }

  public async updateProfile(
    updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
  ): Promise<UserProfile> {
    this.profile = {
      ...this.profile,
      ...updates,
      updatedAt: Date.now(),
    };
    this.save();
    return { ...this.profile };
  }

  public async updatePresence(presence: PresenceState): Promise<void> {
    this.profile.presence = presence;
    this.profile.updatedAt = Date.now();
    this.save();
  }

  public async updateLastSeenPrivacy(privacy: LastSeenPrivacy): Promise<void> {
    this.profile.lastSeenPrivacy = privacy;
    this.profile.updatedAt = Date.now();
    this.save();
  }
}

export const profileService: IProfileService = new LocalProfileService();
