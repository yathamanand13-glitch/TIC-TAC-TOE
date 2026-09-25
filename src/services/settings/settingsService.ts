import {
  AppSettings,
  PrivacyConfig,
  NotificationConfig,
  AppearanceConfig,
  PrivateModeSecurityConfig,
  ISettingsService,
} from '../../types/settings';

const STORAGE_SETTINGS_KEY = 'vortex_app_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  privacy: {
    lastSeen: 'contacts',
    readReceipts: true,
    blockScreenshots: true,
    defaultDisappearingTimer: '24h',
    peerToPeerDirectIP: false, // forces TURN relay to conceal real IP
  },
  notifications: {
    soundEnabled: true,
    stealthBanners: true,
    vibrate: true,
    showSenderPreview: false,
  },
  appearance: {
    theme: 'tactical-dark',
    reducedMotion: false,
    compactDensity: false,
    fontSize: 'md',
  },
  security: {
    autoLockSeconds: 300,
    panicKeybind: 'Escape',
    wipeStateOnPanic: true,
    hideInAppSwitcher: true,
    scrambleKeypadOnEntry: false,
  },
  updatedAt: Date.now(),
};

class LocalSettingsService implements ISettingsService {
  private settings: AppSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Storage fallback
    }
    return { ...DEFAULT_SETTINGS };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage fallback
    }
  }

  public async getSettings(): Promise<AppSettings> {
    return { ...this.settings };
  }

  public async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: Date.now(),
    };
    this.save();
    return { ...this.settings };
  }

  public async updatePrivacy(updates: Partial<PrivacyConfig>): Promise<PrivacyConfig> {
    this.settings.privacy = { ...this.settings.privacy, ...updates };
    this.settings.updatedAt = Date.now();
    this.save();
    return { ...this.settings.privacy };
  }

  public async updateNotifications(updates: Partial<NotificationConfig>): Promise<NotificationConfig> {
    this.settings.notifications = { ...this.settings.notifications, ...updates };
    this.settings.updatedAt = Date.now();
    this.save();
    return { ...this.settings.notifications };
  }

  public async updateAppearance(updates: Partial<AppearanceConfig>): Promise<AppearanceConfig> {
    this.settings.appearance = { ...this.settings.appearance, ...updates };
    this.settings.updatedAt = Date.now();
    this.save();
    return { ...this.settings.appearance };
  }

  public async updateSecurity(
    updates: Partial<PrivateModeSecurityConfig>
  ): Promise<PrivateModeSecurityConfig> {
    this.settings.security = { ...this.settings.security, ...updates };
    this.settings.updatedAt = Date.now();
    this.save();
    return { ...this.settings.security };
  }
}

export const settingsService: ISettingsService = new LocalSettingsService();
