import { Message, MessageDeliveryStatus, MessageReaction } from './chat';
import { PresenceState } from './profile';

export type RealtimeEventType =
  | 'new_message'
  | 'message_edit'
  | 'message_delete'
  | 'reaction'
  | 'typing'
  | 'presence'
  | 'delivery_state'
  | 'read_state';

export interface TypingEventPayload {
  conversationId: string;
  userId: string;
  username: string;
  displayName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface PresenceEventPayload {
  userId: string;
  presence: PresenceState;
  lastSeen: number;
}

export interface DeliveryStatePayload {
  conversationId: string;
  messageId: string;
  status: MessageDeliveryStatus;
  timestamp: number;
}

export interface ReactionEventPayload {
  conversationId: string;
  messageId: string;
  reactions: MessageReaction[];
}

export type RealtimeCallback<T = any> = (data: T) => void;

export interface IRealtimeService {
  subscribeToConversation(
    conversationId: string,
    event: 'new_message',
    callback: RealtimeCallback<Message>
  ): () => void;
  subscribeToConversation(
    conversationId: string,
    event: 'message_edit',
    callback: RealtimeCallback<Message>
  ): () => void;
  subscribeToConversation(
    conversationId: string,
    event: 'message_delete',
    callback: RealtimeCallback<{ conversationId: string; messageId: string }>
  ): () => void;
  subscribeToConversation(
    conversationId: string,
    event: 'reaction',
    callback: RealtimeCallback<ReactionEventPayload>
  ): () => void;
  subscribeToConversation(
    conversationId: string,
    event: 'delivery_state',
    callback: RealtimeCallback<DeliveryStatePayload>
  ): () => void;
  subscribeToConversation(
    conversationId: string,
    event: 'typing',
    callback: RealtimeCallback<TypingEventPayload>
  ): () => void;

  broadcastTyping(conversationId: string, isTyping: boolean): void;
  broadcastNewMessage(message: Message): void;
  broadcastMessageEdit(message: Message): void;
  broadcastMessageDelete(conversationId: string, messageId: string): void;
  broadcastReaction(conversationId: string, messageId: string, reactions: MessageReaction[]): void;
  broadcastDeliveryState(conversationId: string, messageId: string, status: MessageDeliveryStatus): void;

  subscribeToPresence(callback: RealtimeCallback<PresenceEventPayload>): () => void;
  broadcastPresence(presence: PresenceState): void;

  emit(event: string, payload: any): void;
  on(event: string, callback: RealtimeCallback): () => void;
}
