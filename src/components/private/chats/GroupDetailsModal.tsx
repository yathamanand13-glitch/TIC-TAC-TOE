import React, { useState } from 'react';
import {
  X,
  Users,
  Shield,
  UserPlus,
  Trash2,
  LogOut,
  Clock,
  Lock,
  Check,
} from 'lucide-react';
import { Conversation, ConversationMember } from '../../../types/chat';
import { INITIAL_MEMBERS } from '../../../services/chat/chatService';

interface GroupDetailsModalProps {
  isOpen: boolean;
  conversation: Conversation;
  onAddMember: (member: ConversationMember) => void;
  onRemoveMember: (userId: string) => void;
  onLeaveGroup: () => void;
  onClose: () => void;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  isOpen,
  conversation,
  onAddMember,
  onRemoveMember,
  onLeaveGroup,
  onClose,
}) => {
  const [isAddingMember, setIsAddingMember] = useState(false);

  if (!isOpen) return null;

  const currentMemberIds = conversation.members.map(m => m.userId);
  const eligibleContacts = INITIAL_MEMBERS.filter(
    m => !currentMemberIds.includes(m.userId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Cell Specifications</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Hero Insignia */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${conversation.avatarColor} flex items-center justify-center text-2xl font-bold text-white shadow-xl mb-3`}
            >
              {conversation.name.charAt(0)}
            </div>
            <h3 className="text-base font-bold text-zinc-100">{conversation.name}</h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">
              {conversation.description || 'Encrypted group channel with mutual key verification.'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-cyan-400">
              <Lock className="w-3 h-3" />
              <span>Double-Ratchet Group Tree Active</span>
            </div>
          </div>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Active Nodes ({conversation.members.length})
              </span>
              {eligibleContacts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingMember(prev => !prev)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAddingMember ? 'Close' : 'Add Node'}</span>
                </button>
              )}
            </div>

            {/* Add member sub-panel */}
            {isAddingMember && (
              <div className="mb-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block px-1 mb-1">
                  Select available operator to integrate:
                </span>
                {eligibleContacts.map(contact => (
                  <button
                    key={contact.userId}
                    type="button"
                    onClick={() => {
                      onAddMember(contact);
                      setIsAddingMember(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-850 text-xs text-zinc-200 transition-colors"
                  >
                    <span>{contact.displayName} (@{contact.username})</span>
                    <span className="text-cyan-400 text-[11px] font-mono">+ Add</span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1.5 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800 max-h-48 overflow-y-auto">
              {conversation.members.map(member => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${
                        member.avatarColor || 'from-cyan-500 to-blue-600'
                      } flex items-center justify-center text-xs font-bold text-white`}
                    >
                      {member.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <span>{member.displayName}</span>
                        {member.role === 'admin' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-bold">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        @{member.username}
                      </div>
                    </div>
                  </div>

                  {member.userId !== 'current_user' && (
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.userId)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Remove participant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Group Settings Overview */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Enclave Policy
            </span>
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Ephemeral Broadcast Dissolution:</span>
              </div>
              <span className="font-mono text-zinc-400">24 Hours</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onLeaveGroup();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-900/60 text-rose-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Tactical Cell</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
