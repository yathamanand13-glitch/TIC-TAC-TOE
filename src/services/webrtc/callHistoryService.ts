import { CallHistoryRecord } from '../../types/call';

const STORAGE_CALL_HISTORY_KEY = 'vortex_call_history_v1';

const INITIAL_CALL_HISTORY: CallHistoryRecord[] = [
  {
    id: 'ch_rec_1',
    caller: {
      id: 'usr_ghost_01',
      name: 'Ghost Sector Node',
      username: 'ghost_node',
      avatarColor: 'from-cyan-500 to-blue-600',
    },
    receiver: {
      id: 'current_user',
      name: 'Commander Nova',
      username: 'nova_spectre',
    },
    callType: 'audio',
    direction: 'incoming',
    status: 'completed',
    startTime: Date.now() - 3600000 * 2.5,
    endTime: Date.now() - 3600000 * 2.5 + 252000,
    durationSeconds: 252, // 04:12
  },
  {
    id: 'ch_rec_2',
    caller: {
      id: 'current_user',
      name: 'Commander Nova',
      username: 'nova_spectre',
    },
    receiver: {
      id: 'usr_cipher_02',
      name: 'Cipher Analyst V',
      username: 'cipher_analyst',
      avatarColor: 'from-violet-500 to-indigo-600',
    },
    callType: 'video',
    direction: 'outgoing',
    status: 'completed',
    startTime: Date.now() - 3600000 * 18,
    endTime: Date.now() - 3600000 * 18 + 765000,
    durationSeconds: 765, // 12:45
  },
  {
    id: 'ch_rec_3',
    caller: {
      id: 'usr_recon_03',
      name: 'Recon Sentinel',
      username: 'recon_sentinel',
      avatarColor: 'from-emerald-500 to-teal-600',
    },
    receiver: {
      id: 'current_user',
      name: 'Commander Nova',
      username: 'nova_spectre',
    },
    callType: 'audio',
    direction: 'missed',
    status: 'missed',
    startTime: Date.now() - 86400000 * 2,
    durationSeconds: 0,
  },
];

export class CallHistoryService {
  private history: CallHistoryRecord[];

  constructor() {
    this.history = this.loadHistory();
  }

  private loadHistory(): CallHistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_CALL_HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Storage fallback
    }
    return INITIAL_CALL_HISTORY;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_CALL_HISTORY_KEY, JSON.stringify(this.history));
    } catch {
      // Storage fallback
    }
  }

  public async getHistory(): Promise<CallHistoryRecord[]> {
    return [...this.history].sort((a, b) => b.startTime - a.startTime);
  }

  public async addRecord(record: Omit<CallHistoryRecord, 'id'>): Promise<CallHistoryRecord> {
    const newRecord: CallHistoryRecord = {
      ...record,
      id: 'ch_rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    this.history = [newRecord, ...this.history];
    this.save();
    return newRecord;
  }

  public async deleteRecord(id: string): Promise<void> {
    this.history = this.history.filter(r => r.id !== id);
    this.save();
  }

  public async clearHistory(): Promise<void> {
    this.history = [];
    this.save();
  }
}

export const callHistoryService = new CallHistoryService();
