import React from 'react';
import {
  Reply,
  Forward,
  Edit2,
  Trash2,
  Copy,
  Pin,
  Star,
  Smile,
  X,
} from 'lucide-react';
import { Message } from '../../../types/chat';

interface MessageContextMenuProps {
  message: Message;
  position: { x: number; y: number } | null;
  isMine: boolean;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message, forEveryone: boolean) => void;
  onCopy: (content: string) => void;
  onPin: (message: Message) => void;
  onStar: (message: Message) => void;
  onReact: (message: Message, emoji: string) => void;
  onClose: () => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😮', '👏', '🔒'];

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  position,
  isMine,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onCopy,
  onPin,
  onStar,
  onReact,
  onClose,
}) => {
  // Mobile sheet vs Desktop positioned popover
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleAction = (cb: () => void) => {
    cb();
    onClose();
  };

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex flex-col justify-end p-3 animate-in fade-in"
        onClick={onClose}
      >
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-3 max-w-sm mx-auto w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Reaction Bar */}
          <div className="flex items-center justify-around pb-2 border-b border-zinc-800">
            {QUICK_REACTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAction(() => onReact(message, emoji))}
                className="text-xl p-1.5 hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Action List */}
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleAction(() => onReply(message))}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200"
            >
              <Reply className="w-4 h-4 text-cyan-400" />
              <span>Reply</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onForward(message))}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200"
            >
              <Forward className="w-4 h-4 text-indigo-400" />
              <span>Forward</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onCopy(message.content))}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200"
            >
              <Copy className="w-4 h-4 text-zinc-400" />
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onStar(message))}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200"
            >
              <Star className={`w-4 h-4 ${message.isStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
              <span>{message.isStarred ? 'Unstar' : 'Star'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onPin(message))}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200"
            >
              <Pin className={`w-4 h-4 ${message.isPinned ? 'fill-cyan-400 text-cyan-400' : 'text-cyan-400'}`} />
              <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>

            {isMine && message.type === 'text' && (
              <button
                type="button"
                onClick={() => handleAction(() => onEdit(message))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200"
              >
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* Delete options */}
          <div className="pt-2 border-t border-zinc-800 flex gap-2">
            <button
              type="button"
              onClick={() => handleAction(() => onDelete(message, false))}
              className="flex-1 py-2 rounded-xl bg-zinc-950 text-rose-300 text-xs font-semibold hover:bg-rose-950/50"
            >
              Delete For Me
            </button>
            {isMine && (
              <button
                type="button"
                onClick={() => handleAction(() => onDelete(message, true))}
                className="flex-1 py-2 rounded-xl bg-rose-950/80 text-rose-200 text-xs font-semibold hover:bg-rose-900"
              >
                Delete For All
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop floating popover
  const top = Math.min(position?.y || 100, window.innerHeight - 340);
  const left = Math.min(position?.x || 100, window.innerWidth - 220);

  return (
    <div className="fixed inset-0 z-50 select-none" onClick={onClose}>
      <div
        className="absolute bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-2 w-52 space-y-1 animate-in fade-in zoom-in-95 duration-100"
        style={{ top, left }}
        onClick={e => e.stopPropagation()}
      >
        {/* Quick Reaction Bar */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-950/80 rounded-xl mb-1 border border-zinc-800/80">
          {QUICK_REACTIONS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAction(() => onReact(message, emoji))}
              className="text-base hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Action items */}
        <button
          type="button"
          onClick={() => handleAction(() => onReply(message))}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <Reply className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reply</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction(() => onForward(message))}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <Forward className="w-3.5 h-3.5 text-indigo-400" />
          <span>Forward</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction(() => onCopy(message.content))}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
          <span>Copy Text</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction(() => onStar(message))}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <Star className={`w-3.5 h-3.5 ${message.isStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
          <span>{message.isStarred ? 'Remove Bookmark' : 'Bookmark / Star'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction(() => onPin(message))}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <Pin className={`w-3.5 h-3.5 ${message.isPinned ? 'fill-cyan-400 text-cyan-400' : 'text-cyan-400'}`} />
          <span>{message.isPinned ? 'Unpin Message' : 'Pin to Channel'}</span>
        </button>

        {isMine && message.type === 'text' && (
          <button
            type="button"
            onClick={() => handleAction(() => onEdit(message))}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edit Transmission</span>
          </button>
        )}

        <div className="pt-1 border-t border-zinc-800 my-1" />

        <button
          type="button"
          onClick={() => handleAction(() => onDelete(message, isMine))}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-rose-950/60 text-xs text-rose-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete Message</span>
        </button>
      </div>
    </div>
  );
};
