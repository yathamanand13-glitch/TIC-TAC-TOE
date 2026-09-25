import { Message, MessageType, IMessageService, SearchFilterType } from '../../types/chat';
import { realtimeService } from '../realtime/realtimeService';

const STORAGE_MESSAGES_PREFIX = 'vortex_msgs_v1_';

const INITIAL_MESSAGES_MAP: Record<string, Message[]> = {
  conv_direct_1: [
    {
      id: 'm_101',
      conversationId: 'conv_direct_1',
      senderId: 'usr_ghost_01',
      senderName: 'Ghost Sector Node',
      type: 'text',
      content: 'Key exchange ratified. E2EE channel established with 256-bit elliptic curve.',
      timestamp: Date.now() - 3600000 * 2.5,
      status: 'read',
      reactions: [{ emoji: '🔒', count: 1, userIds: ['current_user'] }],
    },
    {
      id: 'm_102',
      conversationId: 'conv_direct_1',
      senderId: 'current_user',
      senderName: 'Commander Nova',
      type: 'text',
      content: 'Understood. Reviewing the latest cryptographic signature for the payload.',
      timestamp: Date.now() - 3600000 * 2.2,
      status: 'read',
      reactions: [],
    },
    {
      id: 'm_103',
      conversationId: 'conv_direct_1',
      senderId: 'usr_ghost_01',
      senderName: 'Ghost Sector Node',
      type: 'voice',
      content: 'Encrypted voice packet (0:14)',
      timestamp: Date.now() - 3600000 * 1.5,
      status: 'read',
      reactions: [{ emoji: '👍', count: 1, userIds: ['current_user'] }],
      attachment: {
        id: 'att_v1',
        type: 'audio',
        name: 'voice_sig_01.opus',
        url: '',
        durationSeconds: 14,
      },
    },
    {
      id: 'm_104',
      conversationId: 'conv_direct_1',
      senderId: 'usr_ghost_01',
      senderName: 'Ghost Sector Node',
      type: 'image',
      content: 'Tactical schematic for Sector 4 relay perimeter.',
      timestamp: Date.now() - 3600000 * 0.8,
      status: 'read',
      reactions: [{ emoji: '🔥', count: 1, userIds: ['current_user'] }],
      attachment: {
        id: 'att_img1',
        type: 'image',
        name: 'grid_sector_4_schematic.png',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        sizeBytes: 1024 * 720,
      },
    },
    {
      id: 'm_105',
      conversationId: 'conv_direct_1',
      senderId: 'current_user',
      senderName: 'Commander Nova',
      type: 'text',
      content: 'Perimeter analysis verified. Have you dispatched the secondary rendezvous marker?',
      timestamp: Date.now() - 3600000 * 0.4,
      status: 'read',
      reactions: [],
      replyTo: {
        messageId: 'm_104',
        senderName: 'Ghost Sector Node',
        senderId: 'usr_ghost_01',
        content: 'Tactical schematic for Sector 4 relay perimeter.',
        type: 'image',
      },
    },
    {
      id: 'm_106',
      conversationId: 'conv_direct_1',
      senderId: 'usr_ghost_01',
      senderName: 'Ghost Sector Node',
      type: 'location',
      content: 'Tactical Rendezvous Beacon Alpha',
      timestamp: Date.now() - 60000 * 15,
      status: 'delivered',
      reactions: [],
      locationData: {
        latitude: 47.3769,
        longitude: 8.5417,
        placeName: 'Rendezvous Point: Zurich Prime (Encrypted Geo-hash)',
        accuracyMeters: 5,
      },
    },
    {
      id: 'm_107',
      conversationId: 'conv_direct_1',
      senderId: 'usr_ghost_01',
      senderName: 'Ghost Sector Node',
      type: 'text',
      content: 'Coordinates locked. The ephemeral broadcast will auto-expire in 24 hours.',
      timestamp: Date.now() - 60000 * 5,
      status: 'delivered',
      reactions: [],
    },
  ],
  conv_group_1: [
    {
      id: 'm_201',
      conversationId: 'conv_group_1',
      senderId: 'usr_cipher_02',
      senderName: 'Cipher Analyst V',
      type: 'text',
      content: 'Welcome to the Vanguard Tactical Cell. All participants authenticated via ECC-521.',
      timestamp: Date.now() - 3600000 * 12,
      status: 'read',
      reactions: [{ emoji: '🛡️', count: 2, userIds: ['current_user', 'usr_recon_03'] }],
      isPinned: true,
    },
    {
      id: 'm_202',
      conversationId: 'conv_group_1',
      senderId: 'usr_recon_03',
      senderName: 'Recon Sentinel',
      type: 'file',
      content: 'Transmission protocol v3.2 briefing notes.',
      timestamp: Date.now() - 3600000 * 6,
      status: 'read',
      reactions: [],
      attachment: {
        id: 'att_f1',
        type: 'file',
        name: 'aegis_protocol_v3.pdf',
        sizeBytes: 1024 * 1024 * 2.4,
        url: '#',
      },
    },
    {
      id: 'm_203',
      conversationId: 'conv_group_1',
      senderId: 'current_user',
      senderName: 'Commander Nova',
      type: 'poll',
      content: 'Primary frequency channel vote for upcoming deployment',
      timestamp: Date.now() - 3600000 * 2,
      status: 'read',
      reactions: [],
      pollData: {
        question: 'Select primary encrypted hopping frequency:',
        options: [
          { id: 'opt_1', text: 'Channel Alpha (433.05 MHz / Mesh)', voteCount: 2, voterIds: ['usr_cipher_02', 'current_user'] },
          { id: 'opt_2', text: 'Channel Bravo (868.10 MHz / Sub-GHz)', voteCount: 1, voterIds: ['usr_recon_03'] },
          { id: 'opt_3', text: 'Direct P2P Laser Link (LOS Optical)', voteCount: 0, voterIds: [] },
        ],
        totalVotes: 3,
      },
    },
    {
      id: 'm_204',
      conversationId: 'conv_group_1',
      senderId: 'usr_cipher_02',
      senderName: 'Cipher Analyst V',
      type: 'contact',
      content: 'Operator Dispatch Contact',
      timestamp: Date.now() - 60000 * 25,
      status: 'read',
      reactions: [],
      contactData: {
        displayName: 'Aegis Central Dispatch',
        username: 'dispatch_central',
        phone: '+41 44 800 9900',
        publicKeyFingerprint: '9920 441B CC81 772A 1190',
        avatarColor: 'from-amber-500 to-rose-600',
      },
    },
  ],
};

class LocalMessageService implements IMessageService {
  private messagesMap: Map<string, Message[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // Load defaults or stored
    Object.keys(INITIAL_MESSAGES_MAP).forEach(convId => {
      try {
        const stored = localStorage.getItem(STORAGE_MESSAGES_PREFIX + convId);
        if (stored) {
          this.messagesMap.set(convId, JSON.parse(stored));
        } else {
          this.messagesMap.set(convId, [...INITIAL_MESSAGES_MAP[convId]]);
        }
      } catch {
        this.messagesMap.set(convId, [...INITIAL_MESSAGES_MAP[convId]]);
      }
    });
  }

  private saveToStorage(convId: string): void {
    try {
      const msgs = this.messagesMap.get(convId) || [];
      localStorage.setItem(STORAGE_MESSAGES_PREFIX + convId, JSON.stringify(msgs));
    } catch {
      // Storage unavailable fallback
    }
  }

  public async getMessages(conversationId: string): Promise<Message[]> {
    if (!this.messagesMap.has(conversationId)) {
      try {
        const stored = localStorage.getItem(STORAGE_MESSAGES_PREFIX + conversationId);
        if (stored) {
          this.messagesMap.set(conversationId, JSON.parse(stored));
        } else {
          this.messagesMap.set(conversationId, []);
        }
      } catch {
        this.messagesMap.set(conversationId, []);
      }
    }
    return [...(this.messagesMap.get(conversationId) || [])];
  }

  public async sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = 'text',
    extra: Partial<Message> = {}
  ): Promise<Message> {
    const list = this.messagesMap.get(conversationId) || [];
    const newMessage: Message = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      conversationId,
      senderId: 'current_user',
      senderName: 'Commander Nova',
      type,
      content,
      timestamp: Date.now(),
      status: 'delivered', // simulated delivered state
      reactions: [],
      ...extra,
    };

    const updated = [...list, newMessage];
    this.messagesMap.set(conversationId, updated);
    this.saveToStorage(conversationId);
    realtimeService.broadcastNewMessage(newMessage);
    return newMessage;
  }

  public async editMessage(messageId: string, newContent: string): Promise<Message | null> {
    for (const [convId, list] of this.messagesMap.entries()) {
      const idx = list.findIndex(m => m.id === messageId);
      if (idx !== -1) {
        const updatedMsg: Message = {
          ...list[idx],
          content: newContent,
          isEdited: true,
        };
        const newList = [...list];
        newList[idx] = updatedMsg;
        this.messagesMap.set(convId, newList);
        this.saveToStorage(convId);
        realtimeService.broadcastMessageEdit(updatedMsg);
        return updatedMsg;
      }
    }
    return null;
  }

  public async deleteMessage(messageId: string, forEveryone: boolean): Promise<boolean> {
    for (const [convId, list] of this.messagesMap.entries()) {
      const idx = list.findIndex(m => m.id === messageId);
      if (idx !== -1) {
        if (forEveryone) {
          const newList = list.filter(m => m.id !== messageId);
          this.messagesMap.set(convId, newList);
        } else {
          // Soft delete or remove from local view
          const newList = list.filter(m => m.id !== messageId);
          this.messagesMap.set(convId, newList);
        }
        this.saveToStorage(convId);
        realtimeService.broadcastMessageDelete(convId, messageId);
        return true;
      }
    }
    return false;
  }

  public async reactToMessage(
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<Message | null> {
    for (const [convId, list] of this.messagesMap.entries()) {
      const idx = list.findIndex(m => m.id === messageId);
      if (idx !== -1) {
        const msg = list[idx];
        const existingReactions = [...msg.reactions];
        const reactionIdx = existingReactions.findIndex(r => r.emoji === emoji);

        if (reactionIdx !== -1) {
          const existing = existingReactions[reactionIdx];
          const hasUser = existing.userIds.includes(userId);
          if (hasUser) {
            // Remove user reaction
            const newUserIds = existing.userIds.filter(id => id !== userId);
            if (newUserIds.length === 0) {
              existingReactions.splice(reactionIdx, 1);
            } else {
              existingReactions[reactionIdx] = {
                ...existing,
                count: newUserIds.length,
                userIds: newUserIds,
              };
            }
          } else {
            // Add user reaction
            existingReactions[reactionIdx] = {
              ...existing,
              count: existing.count + 1,
              userIds: [...existing.userIds, userId],
            };
          }
        } else {
          // New reaction emoji
          existingReactions.push({
            emoji,
            count: 1,
            userIds: [userId],
          });
        }

        const updatedMsg: Message = { ...msg, reactions: existingReactions };
        const newList = [...list];
        newList[idx] = updatedMsg;
        this.messagesMap.set(convId, newList);
        this.saveToStorage(convId);
        realtimeService.broadcastReaction(convId, messageId, existingReactions);
        return updatedMsg;
      }
    }
    return null;
  }

  public async toggleStarMessage(messageId: string): Promise<boolean> {
    for (const [convId, list] of this.messagesMap.entries()) {
      const idx = list.findIndex(m => m.id === messageId);
      if (idx !== -1) {
        const updatedMsg: Message = {
          ...list[idx],
          isStarred: !list[idx].isStarred,
        };
        const newList = [...list];
        newList[idx] = updatedMsg;
        this.messagesMap.set(convId, newList);
        this.saveToStorage(convId);
        return Boolean(updatedMsg.isStarred);
      }
    }
    return false;
  }

  public async togglePinMessage(messageId: string): Promise<boolean> {
    for (const [convId, list] of this.messagesMap.entries()) {
      const idx = list.findIndex(m => m.id === messageId);
      if (idx !== -1) {
        const updatedMsg: Message = {
          ...list[idx],
          isPinned: !list[idx].isPinned,
        };
        const newList = [...list];
        newList[idx] = updatedMsg;
        this.messagesMap.set(convId, newList);
        this.saveToStorage(convId);
        return Boolean(updatedMsg.isPinned);
      }
    }
    return false;
  }

  public async retryFailedMessage(messageId: string): Promise<Message | null> {
    for (const [convId, list] of this.messagesMap.entries()) {
      const idx = list.findIndex(m => m.id === messageId);
      if (idx !== -1) {
        const target = list[idx];
        const updated: Message = {
          ...target,
          status: 'delivered',
          failureReason: undefined,
        };
        if (updated.attachment) {
          updated.attachment.uploadState = 'complete';
          updated.attachment.uploadProgress = 100;
        }
        const newList = [...list];
        newList[idx] = updated;
        this.messagesMap.set(convId, newList);
        this.saveToStorage(convId);
        realtimeService.broadcastDeliveryState(convId, messageId, 'delivered');
        return updated;
      }
    }
    return null;
  }

  public async searchMessages(
    conversationId: string,
    query: string,
    filter: SearchFilterType = 'all'
  ): Promise<Message[]> {
    const list = await this.getMessages(conversationId);
    const q = query.trim().toLowerCase();

    return list.filter(msg => {
      // 1. Text filter
      if (q && !msg.content.toLowerCase().includes(q)) {
        return false;
      }

      // 2. Type filter
      if (filter === 'all') return true;
      if (filter === 'media') return msg.type === 'image' || msg.type === 'video';
      if (filter === 'files') return msg.type === 'file';
      if (filter === 'voice') return msg.type === 'voice';
      if (filter === 'pinned') return Boolean(msg.isPinned);
      if (filter === 'links') return msg.type === 'location' || msg.content.includes('http');

      return true;
    });
  }
}

export const messageService: IMessageService = new LocalMessageService();
