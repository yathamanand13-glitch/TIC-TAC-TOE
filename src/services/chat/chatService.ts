import { Conversation, ConversationMember, IChatService } from '../../types/chat';

const STORAGE_CONVERSATIONS_KEY = 'vortex_conversations_v1';

export const INITIAL_MEMBERS: ConversationMember[] = [
  {
    userId: 'current_user',
    displayName: 'Commander Nova',
    username: 'nova_spectre',
    role: 'admin',
    joinedAt: Date.now() - 86400000 * 30,
    isOnline: true,
  },
  {
    userId: 'usr_ghost_01',
    displayName: 'Ghost Sector Node',
    username: 'ghost_node',
    avatarColor: 'from-cyan-500 to-blue-600',
    role: 'member',
    joinedAt: Date.now() - 86400000 * 25,
    isOnline: true,
  },
  {
    userId: 'usr_cipher_02',
    displayName: 'Cipher Analyst V',
    username: 'cipher_analyst',
    avatarColor: 'from-violet-500 to-indigo-600',
    role: 'admin',
    joinedAt: Date.now() - 86400000 * 20,
    isOnline: true,
    lastSeen: Date.now() - 60000 * 18,
  },
  {
    userId: 'usr_recon_03',
    displayName: 'Recon Sentinel',
    username: 'recon_sentinel',
    avatarColor: 'from-emerald-500 to-teal-600',
    role: 'member',
    joinedAt: Date.now() - 86400000 * 15,
    isOnline: false,
    lastSeen: Date.now() - 3600000 * 4,
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_direct_1',
    type: 'direct',
    name: 'Ghost Sector Node',
    avatarColor: 'from-cyan-500 to-blue-600',
    description: 'Direct secure link with Ghost Sector Node.',
    isPinned: true,
    unreadCount: 0,
    members: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[1]],
    lastMessage: {
      id: 'm_107',
      senderId: 'usr_ghost_01',
      senderName: 'Ghost Sector Node',
      content: 'Coordinates locked. The ephemeral broadcast will auto-expire in 24 hours.',
      type: 'text',
      timestamp: Date.now() - 60000 * 5,
      status: 'delivered',
    },
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 60000 * 5,
  },
  {
    id: 'conv_group_1',
    type: 'group',
    name: 'Vanguard Tactical Cell',
    avatarColor: 'from-violet-500 to-indigo-700',
    description: 'Rapid response tactical coordination grid for Sector 4 operations.',
    isPinned: true,
    unreadCount: 1,
    members: INITIAL_MEMBERS,
    lastMessage: {
      id: 'm_204',
      senderId: 'usr_cipher_02',
      senderName: 'Cipher Analyst V',
      content: 'Operator Dispatch Contact',
      type: 'contact',
      timestamp: Date.now() - 60000 * 25,
      status: 'read',
    },
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 60000 * 25,
  },
  {
    id: 'conv_direct_2',
    type: 'direct',
    name: 'Cipher Analyst V',
    avatarColor: 'from-violet-500 to-indigo-600',
    description: 'ECC-521 cryptographic key verification analyst.',
    isPinned: false,
    unreadCount: 0,
    members: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[2]],
    lastMessage: {
      id: 'm_301',
      senderId: 'usr_cipher_02',
      senderName: 'Cipher Analyst V',
      content: 'All cryptographic entropy checks validated successfully.',
      type: 'text',
      timestamp: Date.now() - 3600000 * 18,
      status: 'read',
    },
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 3600000 * 18,
  },
  {
    id: 'conv_direct_3',
    type: 'direct',
    name: 'Recon Sentinel',
    avatarColor: 'from-emerald-500 to-teal-600',
    description: 'Long-range optical and radio reconnaissance node.',
    isPinned: false,
    unreadCount: 0,
    members: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[3]],
    lastMessage: {
      id: 'm_401',
      senderId: 'current_user',
      senderName: 'Commander Nova',
      type: 'text',
      content: 'Maintain passive radio silence until next sync cycle.',
      timestamp: Date.now() - 86400000 * 2,
      status: 'read',
    },
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

class LocalChatService implements IChatService {
  private conversations: Conversation[];

  constructor() {
    this.conversations = this.loadFromStorage();
  }

  private loadFromStorage(): Conversation[] {
    try {
      const stored = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Storage fallback
    }
    return INITIAL_CONVERSATIONS;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(this.conversations));
    } catch {
      // Storage fallback
    }
  }

  public async getConversations(): Promise<Conversation[]> {
    // Sort: Pinned first, then newest updatedAt
    return [...this.conversations].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }

  public async getConversationById(id: string): Promise<Conversation | null> {
    const conv = this.conversations.find(c => c.id === id);
    return conv ? { ...conv } : null;
  }

  public async createDirectConversation(targetUser: ConversationMember): Promise<Conversation> {
    // Check if one already exists
    const existing = this.conversations.find(
      c => c.type === 'direct' && c.members.some(m => m.userId === targetUser.userId)
    );
    if (existing) {
      return existing;
    }

    const newConv: Conversation = {
      id: 'conv_dir_' + Date.now(),
      type: 'direct',
      name: targetUser.displayName,
      avatarColor: targetUser.avatarColor || 'from-cyan-500 to-blue-600',
      description: `Encrypted direct channel with @${targetUser.username}`,
      unreadCount: 0,
      members: [INITIAL_MEMBERS[0], targetUser],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations = [newConv, ...this.conversations];
    this.save();
    return newConv;
  }

  public async createGroupConversation(
    name: string,
    description: string,
    avatarColor: string,
    memberUserIds: string[]
  ): Promise<Conversation> {
    const selectedMembers = INITIAL_MEMBERS.filter(m =>
      memberUserIds.includes(m.userId) || m.userId === 'current_user'
    );

    const newGroup: Conversation = {
      id: 'conv_grp_' + Date.now(),
      type: 'group',
      name,
      description,
      avatarColor: avatarColor || 'from-violet-500 to-indigo-700',
      unreadCount: 0,
      members: selectedMembers,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations = [newGroup, ...this.conversations];
    this.save();
    return newGroup;
  }

  public async togglePinConversation(conversationId: string): Promise<boolean> {
    const idx = this.conversations.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      this.conversations[idx] = {
        ...this.conversations[idx],
        isPinned: !this.conversations[idx].isPinned,
      };
      this.save();
      return Boolean(this.conversations[idx].isPinned);
    }
    return false;
  }

  public async toggleMuteConversation(conversationId: string): Promise<boolean> {
    const idx = this.conversations.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      this.conversations[idx] = {
        ...this.conversations[idx],
        isMuted: !this.conversations[idx].isMuted,
      };
      this.save();
      return Boolean(this.conversations[idx].isMuted);
    }
    return false;
  }

  public async addMemberToGroup(
    conversationId: string,
    member: ConversationMember
  ): Promise<boolean> {
    const idx = this.conversations.findIndex(c => c.id === conversationId);
    if (idx !== -1 && this.conversations[idx].type === 'group') {
      const current = this.conversations[idx];
      if (current.members.some(m => m.userId === member.userId)) {
        return true;
      }
      this.conversations[idx] = {
        ...current,
        members: [...current.members, member],
        updatedAt: Date.now(),
      };
      this.save();
      return true;
    }
    return false;
  }

  public async removeMemberFromGroup(conversationId: string, userId: string): Promise<boolean> {
    const idx = this.conversations.findIndex(c => c.id === conversationId);
    if (idx !== -1 && this.conversations[idx].type === 'group') {
      const current = this.conversations[idx];
      this.conversations[idx] = {
        ...current,
        members: current.members.filter(m => m.userId !== userId),
        updatedAt: Date.now(),
      };
      this.save();
      return true;
    }
    return false;
  }

  public async leaveGroup(conversationId: string, userId: string): Promise<boolean> {
    return this.removeMemberFromGroup(conversationId, userId);
  }

  public async updateGroupSettings(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<boolean> {
    const idx = this.conversations.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      this.conversations[idx] = {
        ...this.conversations[idx],
        ...updates,
        updatedAt: Date.now(),
      };
      this.save();
      return true;
    }
    return false;
  }
}

export const chatService: IChatService = new LocalChatService();
