import React, { useState, useEffect } from 'react';
import { Conversation, ConversationMember } from '../../../types/chat';
import { CallPeer } from '../../../types/call';
import { chatService } from '../../../services/chat/chatService';
import { ChatList } from './ChatList';
import { ChatConversation } from './ChatConversation';
import { NewChatModal } from './NewChatModal';
import { NewGroupModal } from './NewGroupModal';
import { MessageSquare } from 'lucide-react';

interface ChatsViewShellProps {
  onStartCall?: (peer: CallPeer, type: 'audio' | 'video', isGroup?: boolean) => void;
}

export const ChatsViewShell: React.FC<ChatsViewShellProps> = ({ onStartCall }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  // Load conversations on mount
  const loadConversations = async () => {
    const list = await chatService.getConversations();
    setConversations(list);
    // On desktop, auto-select first conversation if none selected
    if (!selectedConversationId && list.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSelectedConversationId(list[0].id);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // Mark unread as read in local state
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleCreateDirectChat = async (user: ConversationMember) => {
    const newConv = await chatService.createDirectConversation(user);
    await loadConversations();
    setSelectedConversationId(newConv.id);
  };

  const handleCreateGroup = async (
    name: string,
    description: string,
    avatarColor: string,
    memberUserIds: string[]
  ) => {
    const newGroup = await chatService.createGroupConversation(
      name,
      description,
      avatarColor,
      memberUserIds
    );
    await loadConversations();
    setSelectedConversationId(newGroup.id);
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations(prev =>
      prev.map(c => (c.id === updated.id ? updated : c))
    );
  };

  const activeConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      
      {/* Column 1: Conversations List (Hidden on mobile if a chat is active) */}
      <div
        className={`${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 flex-col h-full shrink-0`}
      >
        <ChatList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={handleSelectConversation}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
        />
      </div>

      {/* Column 2: Active Conversation or Empty State (Visible on mobile if active, always on desktop) */}
      <div
        className={`${
          !selectedConversationId ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col h-full overflow-hidden bg-zinc-950/60`}
      >
        {activeConversation ? (
          <ChatConversation
            conversation={activeConversation}
            allConversations={conversations}
            onBack={() => setSelectedConversationId(null)}
            onUpdateConversation={handleUpdateConversation}
            onStartCall={onStartCall}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 font-mono">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3 shadow-inner">
              <MessageSquare className="w-7 h-7 text-cyan-500/50" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">
              Select an Encrypted Channel
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              Choose an authorized peer node or tactical group to review sealed communications.
            </p>
          </div>
        )}
      </div>

      {/* New Direct Chat Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onSelectUser={handleCreateDirectChat}
        onClose={() => setIsNewChatOpen(false)}
      />

      {/* New Group Modal */}
      <NewGroupModal
        isOpen={isNewGroupOpen}
        onCreateGroup={handleCreateGroup}
        onClose={() => setIsNewGroupOpen(false)}
      />

    </div>
  );
};
