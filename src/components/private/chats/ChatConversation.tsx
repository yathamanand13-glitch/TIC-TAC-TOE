import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneCall,
  Video,
  Search,
  MoreVertical,
  ShieldCheck,
  ChevronLeft,
  X,
  Lock,
  Filter,
  Shield,
} from 'lucide-react';
import { Conversation, Message, MessageType, SearchFilterType } from '../../../types/chat';
import { CallPeer } from '../../../types/call';
import { messageService } from '../../../services/messages/messageService';
import { realtimeService } from '../../../services/realtime/realtimeService';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { MessageContextMenu } from './MessageContextMenu';
import { ForwardMessageModal } from './ForwardMessageModal';
import { GroupDetailsModal } from './GroupDetailsModal';
import { MediaPreviewModal } from './MediaPreviewModal';
import { ChatPrivacyModal } from './ChatPrivacyModal';

interface ChatConversationProps {
  conversation: Conversation;
  allConversations: Conversation[];
  onBack: () => void;
  onUpdateConversation: (conv: Conversation) => void;
  onStartCall?: (peer: CallPeer, type: 'audio' | 'video', isGroup?: boolean) => void;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  conversation,
  allConversations,
  onBack,
  onUpdateConversation,
  onStartCall,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  // Search state & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState<SearchFilterType>('all');

  // Modals & Panels
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [callAlert, setCallAlert] = useState<{ type: 'audio' | 'video'; active: boolean } | null>(null);

  // Context Menu State
  const [contextMenuMsg, setContextMenuMsg] = useState<Message | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Conversation-specific typing indicator state
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load conversation messages
  const loadMessages = useCallback(async () => {
    const list = await messageService.getMessages(conversation.id);
    setMessages(list);
  }, [conversation.id]);

  useEffect(() => {
    loadMessages();
    setReplyingTo(null);
    setEditingMessage(null);
    setIsSearching(false);
    setSearchQuery('');
    setSearchFilter('all');
    setTypingUsers(new Set());
  }, [conversation.id, loadMessages]);

  // Subscribe to Realtime events for this conversation
  useEffect(() => {
    // 1. New message
    const unsubNew = realtimeService.subscribeToConversation(
      conversation.id,
      'new_message',
      (newMsg: Message) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    );

    // 2. Message edit
    const unsubEdit = realtimeService.subscribeToConversation(
      conversation.id,
      'message_edit',
      (editedMsg: Message) => {
        setMessages(prev => prev.map(m => (m.id === editedMsg.id ? editedMsg : m)));
      }
    );

    // 3. Message delete
    const unsubDelete = realtimeService.subscribeToConversation(
      conversation.id,
      'message_delete',
      ({ messageId }) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    );

    // 4. Reactions
    const unsubReaction = realtimeService.subscribeToConversation(
      conversation.id,
      'reaction',
      ({ messageId, reactions }) => {
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, reactions } : m))
        );
      }
    );

    // 5. Typing indicator (strictly scoped to this conversation)
    const unsubTyping = realtimeService.subscribeToConversation(
      conversation.id,
      'typing',
      payload => {
        if (payload.userId === 'current_user') return; // ignore self
        setTypingUsers(prev => {
          const next = new Set(prev);
          if (payload.isTyping) {
            next.add(payload.displayName);
          } else {
            next.delete(payload.displayName);
          }
          return next;
        });
      }
    );

    // 6. Delivery state
    const unsubDelivery = realtimeService.subscribeToConversation(
      conversation.id,
      'delivery_state',
      ({ messageId, status }) => {
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, status } : m))
        );
      }
    );

    return () => {
      unsubNew();
      unsubEdit();
      unsubDelete();
      unsubReaction();
      unsubTyping();
      unsubDelivery();
    };
  }, [conversation.id]);

  useEffect(() => {
    // Smooth scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handler for sending messages
  const handleSendMessage = async (
    content: string,
    type: MessageType = 'text',
    extra: Partial<Message> = {}
  ) => {
    const newMsg = await messageService.sendMessage(conversation.id, content, type, extra);
    setMessages(prev => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    onUpdateConversation({
      ...conversation,
      lastMessage: {
        id: newMsg.id,
        senderId: newMsg.senderId,
        senderName: newMsg.senderName,
        content: newMsg.content,
        type: newMsg.type,
        timestamp: newMsg.timestamp,
        status: newMsg.status,
      },
      updatedAt: Date.now(),
    });
  };

  // Handler for editing message
  const handleEditMessage = async (messageId: string, content: string) => {
    const updated = await messageService.editMessage(messageId, content);
    if (updated) {
      setMessages(prev => prev.map(m => (m.id === messageId ? updated : m)));
    }
  };

  // Handler for deleting message
  const handleDeleteMessage = async (message: Message, forEveryone: boolean) => {
    await messageService.deleteMessage(message.id, forEveryone);
    setMessages(prev => prev.filter(m => m.id !== message.id));
  };

  // Handler for message reactions
  const handleReact = async (message: Message, emoji: string) => {
    const updated = await messageService.reactToMessage(message.id, emoji, 'current_user');
    if (updated) {
      setMessages(prev => prev.map(m => (m.id === message.id ? updated : m)));
    }
  };

  // Handler for retry failed transmission
  const handleRetryMessage = async (messageId: string) => {
    const updated = await messageService.retryFailedMessage(messageId);
    if (updated) {
      setMessages(prev => prev.map(m => (m.id === messageId ? updated : m)));
    }
  };

  const handleToggleStar = async (message: Message) => {
    const isStarred = await messageService.toggleStarMessage(message.id);
    setMessages(prev =>
      prev.map(m => (m.id === message.id ? { ...m, isStarred } : m))
    );
  };

  const handleTogglePin = async (message: Message) => {
    const isPinned = await messageService.togglePinMessage(message.id);
    setMessages(prev =>
      prev.map(m => (m.id === message.id ? { ...m, isPinned } : m))
    );
  };

  const handleVotePoll = async (messageId: string, optionId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.pollData) return m;
        const options = m.pollData.options.map(opt => {
          if (opt.id === optionId) {
            const hasVoted = opt.voterIds.includes('current_user');
            const newVoters = hasVoted
              ? opt.voterIds.filter(id => id !== 'current_user')
              : [...opt.voterIds, 'current_user'];
            return {
              ...opt,
              voteCount: newVoters.length,
              voterIds: newVoters,
            };
          }
          return opt;
        });
        const totalVotes = options.reduce((sum, o) => sum + o.voteCount, 0);
        return {
          ...m,
          pollData: {
            ...m.pollData,
            options,
            totalVotes,
          },
        };
      })
    );
  };

  const handleAddQuestionResponse = (messageId: string, text: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.questionData) return m;
        const newResponse = {
          id: 'qresp_' + Date.now(),
          authorId: 'current_user',
          authorName: 'Commander Nova (You)',
          authorAvatarColor: 'from-cyan-500 to-blue-600',
          text,
          timestamp: Date.now(),
          upvotes: 0,
          votedUserIds: [],
        };
        const responses = [...(m.questionData.responses || []), newResponse];
        return {
          ...m,
          questionData: {
            ...m.questionData,
            responses,
          },
        };
      })
    );
  };

  const handleUpvoteQuestionResponse = (messageId: string, responseId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.questionData || !m.questionData.responses) return m;
        const responses = m.questionData.responses.map(r => {
          if (r.id === responseId) {
            const hasVoted = r.votedUserIds?.includes('current_user');
            const newVoters = hasVoted
              ? (r.votedUserIds || []).filter(u => u !== 'current_user')
              : [...(r.votedUserIds || []), 'current_user'];
            return {
              ...r,
              upvotes: newVoters.length,
              votedUserIds: newVoters,
            };
          }
          return r;
        });
        return {
          ...m,
          questionData: {
            ...m.questionData,
            responses,
          },
        };
      })
    );
  };

  const handleAcceptQuestionResponse = (messageId: string, responseId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId || !m.questionData) return m;
        return {
          ...m,
          questionData: {
            ...m.questionData,
            isAnswered: true,
            acceptedResponseId: responseId,
          },
        };
      })
    );
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    setContextMenuMsg(message);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const startCall = (type: 'audio' | 'video') => {
    if (onStartCall) {
      if (conversation.type === 'group') {
        onStartCall(
          {
            id: conversation.id,
            name: conversation.name,
            username: 'group_mesh',
            avatarColor: conversation.avatarColor,
          },
          type,
          true
        );
      } else {
        const otherMember = conversation.members.find(m => m.userId !== 'current_user');
        onStartCall(
          {
            id: otherMember?.userId || conversation.id,
            name: otherMember?.displayName || conversation.name,
            username: otherMember?.username || 'peer_node',
            avatarColor: conversation.avatarColor,
          },
          type,
          false
        );
      }
    } else {
      setCallAlert({ type, active: true });
    }
  };

  const otherMember = conversation.members.find(m => m.userId !== 'current_user');
  const isOnline = conversation.type === 'direct' ? otherMember?.isOnline : true;

  // Filter messages based on search query and search filter type
  const filteredMessages = messages.filter(msg => {
    // Query search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (!msg.content.toLowerCase().includes(q)) return false;
    }

    // Filter category
    if (searchFilter === 'all') return true;
    if (searchFilter === 'media') return msg.type === 'image' || msg.type === 'video';
    if (searchFilter === 'files') return msg.type === 'file';
    if (searchFilter === 'voice') return msg.type === 'voice';
    if (searchFilter === 'pinned') return Boolean(msg.isPinned);
    if (searchFilter === 'links') return msg.type === 'location' || msg.content.includes('http');
    return true;
  });

  const getDateLabel = (timestamp: number) => {
    const d = new Date(timestamp);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/40 relative select-none">
      
      {/* Header Bar */}
      <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Left: Contact Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 rounded-lg transition-colors"
            title="Return to channel list"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => conversation.type === 'group' && setIsGroupDetailsOpen(true)}
          >
            <div className="relative shrink-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${conversation.avatarColor} flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-sm`}
              >
                {conversation.name.charAt(0)}
              </div>
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400 shadow-sm" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-zinc-100 truncate group-hover:text-cyan-300 transition-colors">
                  {conversation.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </div>

              <div className="text-[10px] font-mono text-zinc-400 truncate">
                {conversation.type === 'group' ? (
                  <span>{conversation.members.length} participating nodes</span>
                ) : isOnline ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                  </span>
                ) : (
                  <span>Last active 4h ago</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Call & Search Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearching(prev => !prev)}
            className={`p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors ${
              isSearching ? 'bg-zinc-800 text-cyan-400' : ''
            }`}
            title="Search Messages In Thread"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => startCall('audio')}
            className="p-2 rounded-xl text-zinc-400 hover:text-cyan-400 hover:bg-zinc-850 transition-colors"
            title="Start Encrypted Voice Call"
          >
            <PhoneCall className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => startCall('video')}
            className="p-2 rounded-xl text-zinc-400 hover:text-cyan-400 hover:bg-zinc-850 transition-colors"
            title="Start Encrypted Video Mesh"
          >
            <Video className="w-4 h-4" />
          </button>

          {conversation.type === 'group' && (
            <button
              type="button"
              onClick={() => setIsGroupDetailsOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors"
              title="Group Cell Info"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Message Search Bar with Filters */}
      {isSearching && (
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/95 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages, files, transcripts in this thread..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSearching(false);
                setSearchQuery('');
                setSearchFilter('all');
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono pb-0.5">
            <span className="text-zinc-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {(['all', 'media', 'files', 'voice', 'pinned', 'links'] as SearchFilterType[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setSearchFilter(f)}
                className={`px-2 py-0.5 rounded-lg uppercase transition-all ${
                  searchFilter === f
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {f}
              </button>
            ))}
            {searchQuery && (
              <span className="ml-auto text-zinc-500">
                {filteredMessages.length} match{filteredMessages.length === 1 ? '' : 'es'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active Call Handshake Simulation Alert */}
      {callAlert && (
        <div className="p-3 bg-indigo-950/80 border-b border-indigo-800 text-xs font-mono text-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Initiating E2EE {callAlert.type.toUpperCase()} Transmission Handshake with {conversation.name}...
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCallAlert(null)}
            className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-semibold"
          >
            End Signal
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
      >
        {/* End-to-end security badge header */}
        <div className="mx-auto max-w-xs p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>End-to-End Cryptographic Enclave</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
            Transmissions are protected with ephemeral session ratchets.
          </p>
        </div>

        {/* Render filtered messages with date separators */}
        {filteredMessages.map((msg, index) => {
          const prevMsg = filteredMessages[index - 1];
          const isNewDate =
            !prevMsg ||
            new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
          const isMine = msg.senderId === 'current_user';

          return (
            <React.Fragment key={msg.id}>
              {isNewDate && (
                <div className="flex items-center justify-center my-3">
                  <span className="px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider shadow-sm">
                    {getDateLabel(msg.timestamp)}
                  </span>
                </div>
              )}

              <MessageItem
                message={msg}
                isMine={isMine}
                searchQuery={searchQuery}
                onContextMenu={handleContextMenu}
                onReact={handleReact}
                onVotePoll={handleVotePoll}
                onAddQuestionResponse={handleAddQuestionResponse}
                onUpvoteQuestionResponse={handleUpvoteQuestionResponse}
                onAcceptQuestionResponse={handleAcceptQuestionResponse}
                onOpenAttachment={url => setLightboxUrl(url)}
                onRetryMessage={handleRetryMessage}
              />
            </React.Fragment>
          );
        })}

        {/* Conversation-Specific Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 p-2 max-w-[220px] rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 animate-in fade-in">
            <span className="font-mono text-[10px] text-cyan-400 font-semibold truncate">
              {Array.from(typingUsers).join(', ')} is typing
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer */}
      <MessageComposer
        conversationId={conversation.id}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        onSendMessage={handleSendMessage}
        onEditMessage={handleEditMessage}
        onCancelReply={() => setReplyingTo(null)}
        onCancelEdit={() => setEditingMessage(null)}
      />

      {/* Context Menu Modal / Popover */}
      {contextMenuMsg && (
        <MessageContextMenu
          message={contextMenuMsg}
          position={contextMenuPos}
          isMine={contextMenuMsg.senderId === 'current_user'}
          onReply={msg => setReplyingTo(msg)}
          onForward={msg => setForwardingMessage(msg)}
          onEdit={msg => setEditingMessage(msg)}
          onDelete={handleDeleteMessage}
          onCopy={content => navigator.clipboard.writeText(content)}
          onPin={handleTogglePin}
          onStar={handleToggleStar}
          onReact={handleReact}
          onClose={() => {
            setContextMenuMsg(null);
            setContextMenuPos(null);
          }}
        />
      )}

      {/* Forward Message Modal */}
      <ForwardMessageModal
        isOpen={Boolean(forwardingMessage)}
        message={forwardingMessage}
        conversations={allConversations}
        onForward={(targetId, msg) => {
          messageService.sendMessage(targetId, msg.content, msg.type, {
            attachment: msg.attachment,
            locationData: msg.locationData,
            contactData: msg.contactData,
            pollData: msg.pollData,
          });
        }}
        onClose={() => setForwardingMessage(null)}
      />

      {/* Group Details Modal */}
      {conversation.type === 'group' && (
        <GroupDetailsModal
          isOpen={isGroupDetailsOpen}
          conversation={conversation}
          onAddMember={member => {
            onUpdateConversation({
              ...conversation,
              members: [...conversation.members, member],
            });
          }}
          onRemoveMember={userId => {
            onUpdateConversation({
              ...conversation,
              members: conversation.members.filter(m => m.userId !== userId),
            });
          }}
          onLeaveGroup={() => {
            onBack();
          }}
          onClose={() => setIsGroupDetailsOpen(false)}
        />
      )}

      {/* Lightbox Media Modal */}
      <MediaPreviewModal
        isOpen={Boolean(lightboxUrl)}
        mediaUrl={lightboxUrl || ''}
        onClose={() => setLightboxUrl(null)}
      />

    </div>
  );
};
