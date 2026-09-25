import { UploadState } from './storage';

export type MessageType =
  | 'text'
  | 'emoji'
  | 'gif'
  | 'sticker'
  | 'voice'
  | 'image'
  | 'video'
  | 'file'
  | 'contact'
  | 'location'
  | 'poll'
  | 'question';

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type SearchFilterType = 'all' | 'media' | 'files' | 'voice' | 'links' | 'pinned';

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio';
  url: string;
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  uploadState?: UploadState;
  uploadProgress?: number;
  uploadTaskId?: string;
  localPreviewUrl?: string;
  errorMessage?: string;
}

export interface ContactData {
  displayName: string;
  username: string;
  phone?: string;
  publicKeyFingerprint?: string;
  avatarColor?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  placeName: string;
  accuracyMeters?: number;
}

export interface PollVote {
  userId: string;
  userName: string;
  optionId: string;
  timestamp: number;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  voterIds: string[];
}

export interface Poll {
  id?: string;
  question: string;
  creatorId?: string;
  creatorName?: string;
  options: PollOption[];
  isMultipleChoice?: boolean;
  isClosed?: boolean;
  totalVotes: number;
  votes?: PollVote[];
  createdAt?: number;
}

export type PollData = Poll;

export interface QuestionResponse {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarColor?: string;
  text: string;
  timestamp: number;
  isAccepted?: boolean;
  upvotes: number;
  votedUserIds?: string[];
}

export interface QuestionData {
  id?: string;
  question: string;
  authorId?: string;
  authorName?: string;
  authorAvatarColor?: string;
  answer?: string;
  isAnswered?: boolean;
  answeredBy?: string;
  acceptedResponseId?: string;
  responses?: QuestionResponse[];
  createdAt?: number;
}

export interface ReplyReference {
  messageId: string;
  senderName: string;
  senderId: string;
  content: string;
  type: MessageType;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  timestamp: number;
  status: MessageDeliveryStatus;
  isEdited?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  replyTo?: ReplyReference;
  reactions: MessageReaction[];
  attachment?: Attachment;
  contactData?: ContactData;
  locationData?: LocationData;
  pollData?: PollData;
  questionData?: QuestionData;
  failureReason?: string;
}

export type ConversationType = 'direct' | 'group';

export interface ConversationMember {
  userId: string;
  displayName: string;
  username: string;
  avatarColor?: string;
  avatarUrl?: string;
  role: 'admin' | 'member';
  joinedAt: number;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  avatarColor: string;
  avatarUrl?: string;
  description?: string;
  members: ConversationMember[];
  isPinned?: boolean;
  isMuted?: boolean;
  unreadCount: number;
  lastMessage?: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    type: MessageType;
    timestamp: number;
    status: MessageDeliveryStatus;
  };
  createdAt: number;
  updatedAt: number;
}

export interface IChatService {
  getConversations(): Promise<Conversation[]>;
  getConversationById(id: string): Promise<Conversation | null>;
  createDirectConversation(targetUser: ConversationMember): Promise<Conversation>;
  createGroupConversation(
    name: string,
    description: string,
    avatarColor: string,
    memberUserIds: string[]
  ): Promise<Conversation>;
  togglePinConversation(conversationId: string): Promise<boolean>;
  toggleMuteConversation(conversationId: string): Promise<boolean>;
  addMemberToGroup(conversationId: string, member: ConversationMember): Promise<boolean>;
  removeMemberFromGroup(conversationId: string, userId: string): Promise<boolean>;
  leaveGroup(conversationId: string, userId: string): Promise<boolean>;
  updateGroupSettings(conversationId: string, updates: Partial<Conversation>): Promise<boolean>;
}

export interface IMessageService {
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(
    conversationId: string,
    content: string,
    type?: MessageType,
    extra?: Partial<Message>
  ): Promise<Message>;
  editMessage(messageId: string, newContent: string): Promise<Message | null>;
  deleteMessage(messageId: string, forEveryone: boolean): Promise<boolean>;
  reactToMessage(messageId: string, emoji: string, userId: string): Promise<Message | null>;
  toggleStarMessage(messageId: string): Promise<boolean>;
  togglePinMessage(messageId: string): Promise<boolean>;
  retryFailedMessage(messageId: string): Promise<Message | null>;
  searchMessages(
    conversationId: string,
    query: string,
    filter?: SearchFilterType
  ): Promise<Message[]>;
}
