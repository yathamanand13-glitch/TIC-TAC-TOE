import React from 'react';
import {
  Search,
  MessageSquare,
  Users,
  Pin,
  VolumeX,
  Plus,
  Lock,
} from 'lucide-react';
import { Conversation } from '../../../types/chat';

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  selectedConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
}) => {
  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-zinc-800/80 flex flex-col h-full bg-zinc-950/70 shrink-0 select-none">
      
      {/* Top Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Encrypted Chats</span>
          </h1>
          <p className="text-[11px] font-mono text-zinc-500">Zero-Leakage Transits</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenNewGroup}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Create New Group / Cell"
          >
            <Users className="w-4 h-4 text-violet-400" />
          </button>
          <button
            type="button"
            onClick={onOpenNewChat}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Start Direct Encrypted Chat"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-zinc-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search channels or message snippets..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Conversation Scroll List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(conv => {
          const isSelected = selectedConversationId === conv.id;
          const otherMember = conv.members.find(m => m.userId !== 'current_user');
          const isOnline = conv.type === 'direct' ? otherMember?.isOnline : true;

          const timeStr = conv.lastMessage
            ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                isSelected
                  ? 'bg-zinc-900/90 border-zinc-700/80 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800/60'
              }`}
            >
              {/* Avatar + Online Indicator */}
              <div className="relative shrink-0">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${conv.avatarColor} flex items-center justify-center font-bold text-xs text-white shadow-sm`}
                >
                  {conv.type === 'group' ? (
                    <Users className="w-5 h-5 text-white/90" />
                  ) : (
                    conv.name.charAt(0)
                  )}
                </div>
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400 shadow-sm" />
                )}
              </div>

              {/* Information Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {conv.name}
                    </span>
                    {conv.isPinned && (
                      <Pin className="w-3 h-3 text-cyan-400 fill-cyan-400 shrink-0" />
                    )}
                    {conv.isMuted && (
                      <VolumeX className="w-3 h-3 text-zinc-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {timeStr}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {conv.lastMessage?.content || 'No transmissions yet'}
                </p>

                <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-cyan-500/80">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{conv.type === 'group' ? 'Multi-Node E2EE' : 'Direct E2EE'}</span>
                  </span>

                  {conv.unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full font-bold bg-cyan-500 text-zinc-950 shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No matching channels found.
          </div>
        )}
      </div>

    </div>
  );
};
