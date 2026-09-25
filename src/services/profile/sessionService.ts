import { DeviceSession, ISessionService } from '../../types/profile';

const STORAGE_SESSIONS_KEY = 'vortex_private_sessions_v1';

const INITIAL_SESSIONS: DeviceSession[] = [
  {
    id: 'sess_cur_01',
    deviceName: 'Current Station (Linux Workstation)',
    deviceType: 'desktop',
    browser: 'Chrome 128 / Secure Container',
    os: 'Linux x86_64',
    ipAddress: '192.168.1.144 (Local Node)',
    location: 'Encrypted Routing',
    isCurrent: true,
    lastActive: Date.now(),
    created: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
  },
  {
    id: 'sess_mob_02',
    deviceName: 'Aegis Sentinel Mobile',
    deviceType: 'mobile',
    browser: 'Aegis Mobile Client v1.4',
    os: 'GrapheneOS 14',
    ipAddress: '10.8.0.42 (WireGuard)',
    location: 'Zürich, Switzerland',
    isCurrent: false,
    lastActive: Date.now() - 1000 * 60 * 45, // 45 min ago
    created: Date.now() - 86400000 * 6, // 6 days ago
  },
  {
    id: 'sess_lap_03',
    deviceName: 'Field Tactical Laptop',
    deviceType: 'terminal',
    browser: 'Chromium Encrypted Shell',
    os: 'Qubes OS 4.2',
    ipAddress: '172.16.4.12',
    location: 'Reykjavik, Iceland',
    isCurrent: false,
    lastActive: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    created: Date.now() - 86400000 * 14, // 14 days ago
  },
];

class LocalSessionService implements ISessionService {
  private sessions: DeviceSession[];

  constructor() {
    this.sessions = this.loadSessions();
  }

  private loadSessions(): DeviceSession[] {
    try {
      const data = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Storage fallback
    }
    return INITIAL_SESSIONS;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(this.sessions));
    } catch {
      // Storage fallback
    }
  }

  public async getActiveSessions(): Promise<DeviceSession[]> {
    // Refresh current session's lastActive timestamp
    this.sessions = this.sessions.map(s =>
      s.isCurrent ? { ...s, lastActive: Date.now() } : s
    );
    this.save();
    return [...this.sessions];
  }

  public async terminateSession(sessionId: string): Promise<boolean> {
    const target = this.sessions.find(s => s.id === sessionId);
    if (!target || target.isCurrent) {
      return false; // Cannot terminate current session through this method
    }
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    this.save();
    return true;
  }

  public async terminateAllOtherSessions(): Promise<boolean> {
    this.sessions = this.sessions.filter(s => s.isCurrent);
    this.save();
    return true;
  }
}

export const sessionService: ISessionService = new LocalSessionService();
