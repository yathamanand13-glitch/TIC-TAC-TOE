import React, { useState } from 'react';
import { X, Search, Shield, UserPlus } from 'lucide-react';
import { ConversationMember } from '../../../types/chat';
import { INITIAL_MEMBERS } from '../../../services/chat/chatService';

interface NewChatModalProps {
  isOpen: boolean;
  onSelectUser: (user: ConversationMember) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onSelectUser,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Filter out current user
  const contacts = INITIAL_MEMBERS.filter(m => m.userId !== 'current_user');
  const filtered = contacts.filter(
    c =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Initiate Secure Channel</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search authenticated nodes or handles..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              autoFocus
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
            Registered Mesh Nodes ({filtered.length})
          </div>

          {filtered.map(contact => (
            <button
              key={contact.userId}
              type="button"
              onClick={() => {
                onSelectUser(contact);
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors text-left group border border-transparent hover:border-zinc-700/60"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                      contact.avatarColor || 'from-cyan-500 to-blue-600'
                    } flex items-center justify-center text-xs font-bold text-white shadow-sm`}
                  >
                    {contact.displayName.charAt(0)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${
                      contact.isOnline ? 'bg-emerald-400' : 'bg-zinc-600'
                    }`}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    <span>{contact.displayName}</span>
                    <Shield className="w-3 h-3 text-cyan-400/80" />
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500">
                    @{contact.username}
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Connect →
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No matching verified nodes found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
