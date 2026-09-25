import {
  DeliveryStatePayload,
  IRealtimeService,
  PresenceEventPayload,
  ReactionEventPayload,
  RealtimeCallback,
  TypingEventPayload,
} from '../../types/realtime';
import { Message, MessageDeliveryStatus, MessageReaction } from '../../types/chat';
import { PresenceState } from '../../types/profile';

class LocalRealtimeService implements IRealtimeService {
  // Map of conversationId -> Set of event listeners
  private conversationListeners: Map<string, Map<string, Set<RealtimeCallback>>> = new Map();
  private presenceListeners: Set<RealtimeCallback<PresenceEventPayload>> = new Set();
  private currentPresence: PresenceState = 'online';

  private getConversationEventSet(conversationId: string, event: string): Set<RealtimeCallback> {
    if (!this.conversationListeners.has(conversationId)) {
      this.conversationListeners.set(conversationId, new Map());
    }
    const convEvents = this.conversationListeners.get(conversationId)!;
    if (!convEvents.has(event)) {
      convEvents.set(event, new Set());
    }
    return convEvents.get(event)!;
  }

  public subscribeToConversation(
    conversationId: string,
    event: any,
    callback: RealtimeCallback
  ): () => void {
    const set = this.getConversationEventSet(conversationId, event);
    set.add(callback);
    return () => {
      set.delete(callback);
    };
  }

  public broadcastTyping(conversationId: string, isTyping: boolean): void {
    const payload: TypingEventPayload = {
      conversationId,
      userId: 'current_user',
      username: 'nova_spectre',
      displayName: 'Commander Nova',
      isTyping,
      timestamp: Date.now(),
    };
    const set = this.getConversationEventSet(conversationId, 'typing');
    set.forEach(cb => cb(payload));
  }

  public broadcastNewMessage(message: Message): void {
    const set = this.getConversationEventSet(message.conversationId, 'new_message');
    set.forEach(cb => cb(message));
  }

  public broadcastMessageEdit(message: Message): void {
    const set = this.getConversationEventSet(message.conversationId, 'message_edit');
    set.forEach(cb => cb(message));
  }

  public broadcastMessageDelete(conversationId: string, messageId: string): void {
    const set = this.getConversationEventSet(conversationId, 'message_delete');
    set.forEach(cb => cb({ conversationId, messageId }));
  }

  public broadcastReaction(
    conversationId: string,
    messageId: string,
    reactions: MessageReaction[]
  ): void {
    const payload: ReactionEventPayload = {
      conversationId,
      messageId,
      reactions,
    };
    const set = this.getConversationEventSet(conversationId, 'reaction');
    set.forEach(cb => cb(payload));
  }

  public broadcastDeliveryState(
    conversationId: string,
    messageId: string,
    status: MessageDeliveryStatus
  ): void {
    const payload: DeliveryStatePayload = {
      conversationId,
      messageId,
      status,
      timestamp: Date.now(),
    };
    const set = this.getConversationEventSet(conversationId, 'delivery_state');
    set.forEach(cb => cb(payload));
  }

  public subscribeToPresence(callback: RealtimeCallback<PresenceEventPayload>): () => void {
    this.presenceListeners.add(callback);
    return () => {
      this.presenceListeners.delete(callback);
    };
  }

  public broadcastPresence(presence: PresenceState): void {
    this.currentPresence = presence;
    const payload: PresenceEventPayload = {
      userId: 'current_user',
      presence,
      lastSeen: Date.now(),
    };
    this.presenceListeners.forEach(cb => cb(payload));
  }

  private genericListeners: Map<string, Set<RealtimeCallback>> = new Map();

  public emit(event: string, payload: any): void {
    const listeners = this.genericListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(payload));
    }
  }

  public on(event: string, callback: RealtimeCallback): () => void {
    if (!this.genericListeners.has(event)) {
      this.genericListeners.set(event, new Set());
    }
    this.genericListeners.get(event)!.add(callback);
    return () => {
      this.genericListeners.get(event)?.delete(callback);
    };
  }
}

export const realtimeService: IRealtimeService = new LocalRealtimeService();
