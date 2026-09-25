import React, { useState } from 'react';
import { X, Forward, Check } from 'lucide-react';
import { Conversation, Message } from '../../../types/chat';

interface ForwardMessageModalProps {
  isOpen: boolean;
  message: Message | null;
  conversations: Conversation[];
  onForward: (targetConversationId: string, message: Message) => void;
  onClose: () => void;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  isOpen,
  message,
  conversations,
  onForward,
  onClose,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  if (!isOpen || !message) return null;

  const handleSend = () => {
    if (selectedConvId) {
      onForward(selectedConvId, message);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Forward className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Forward Transmission</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message snippet preview */}
        <div className="p-3 bg-zinc-950/60 border-b border-zinc-800 text-xs text-zinc-400 italic font-mono truncate">
          "{message.content}"
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
            Select Destination Channel
          </div>

          {conversations.map(conv => {
            const isSelected = selectedConvId === conv.id;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border border-cyan-500/50 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${conv.avatarColor} flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {conv.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-zinc-200">{conv.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedConvId}
            onClick={handleSend}
            className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold shadow-md transition-all disabled:opacity-40"
          >
            Forward Now
          </button>
        </div>
      </div>
    </div>
  );
};
