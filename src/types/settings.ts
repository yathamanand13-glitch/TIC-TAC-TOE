export type ThemeOption = 'tactical-dark' | 'void-black' | 'cyber-violet';
export type AutoLockTimeout = 60 | 300 | 900 | 1800 | 0; // seconds (0 = never)
export type DisappearingMessageDefault = 'off' | '24h' | '7d' | '30d';

export interface PrivacyConfig {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  blockScreenshots: boolean;
  defaultDisappearingTimer: DisappearingMessageDefault;
  peerToPeerDirectIP: boolean;
}

export interface NotificationConfig {
  soundEnabled: boolean;
  stealthBanners: boolean; // disguise notifications as system or game events
  vibrate: boolean;
  showSenderPreview: boolean;
}

export interface AppearanceConfig {
  theme: ThemeOption;
  reducedMotion: boolean;
  compactDensity: boolean;
  fontSize: 'sm' | 'md' | 'lg';
}

export interface PrivateModeSecurityConfig {
  autoLockSeconds: AutoLockTimeout;
  panicKeybind: string; // e.g. "Escape"
  wipeStateOnPanic: boolean;
  hideInAppSwitcher: boolean;
  scrambleKeypadOnEntry: boolean;
}

export interface AppSettings {
  privacy: PrivacyConfig;
  notifications: NotificationConfig;
  appearance: AppearanceConfig;
  security: PrivateModeSecurityConfig;
  updatedAt: number;
}

export interface ISettingsService {
  getSettings(): Promise<AppSettings>;
  updateSettings(updates: Partial<AppSettings>): Promise<AppSettings>;
  updatePrivacy(updates: Partial<PrivacyConfig>): Promise<PrivacyConfig>;
  updateNotifications(updates: Partial<NotificationConfig>): Promise<NotificationConfig>;
  updateAppearance(updates: Partial<AppearanceConfig>): Promise<AppearanceConfig>;
  updateSecurity(updates: Partial<PrivateModeSecurityConfig>): Promise<PrivateModeSecurityConfig>;
}
