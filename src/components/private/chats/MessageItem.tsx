import React, { useState, memo } from 'react';
import {
  Check,
  CheckCheck,
  FileText,
  Download,
  Play,
  Pause,
  MapPin,
  HelpCircle,
  BarChart2,
  Pin,
  Star,
  Film,
  AlertCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { Message } from '../../../types/chat';
import { PollCard } from './PollCard';
import { QuestionCard } from './QuestionCard';

interface MessageItemProps {
  message: Message;
  isMine: boolean;
  searchQuery?: string;
  onContextMenu: (e: React.MouseEvent, message: Message) => void;
  onReact: (message: Message, emoji: string) => void;
  onVotePoll?: (messageId: string, optionId: string) => void;
  onAddQuestionResponse?: (messageId: string, text: string) => void;
  onUpvoteQuestionResponse?: (messageId: string, responseId: string) => void;
  onAcceptQuestionResponse?: (messageId: string, responseId: string) => void;
  onOpenAttachment?: (url: string) => void;
  onRetryMessage?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  isMine,
  searchQuery,
  onContextMenu,
  onReact,
  onVotePoll,
  onAddQuestionResponse,
  onUpvoteQuestionResponse,
  onAcceptQuestionResponse,
  onOpenAttachment,
  onRetryMessage,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackSecs, setAudioPlaybackSecs] = useState(0);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderStatusIcon = () => {
    if (!isMine) return null;
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-zinc-500 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-zinc-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-zinc-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-cyan-400" />;
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-rose-400 font-bold" title="Transmission failed">
            <AlertCircle className="w-3 h-3" />
          </span>
        );
    }
  };

  const handleAudioToggle = () => {
    setIsPlayingAudio(prev => !prev);
    if (!isPlayingAudio) {
      const dur = message.attachment?.durationSeconds || 14;
      const interval = setInterval(() => {
        setAudioPlaybackSecs(s => {
          if (s >= dur) {
            clearInterval(interval);
            setIsPlayingAudio(false);
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    }
  };

  // Helper to highlight matching search query in text
  const renderHighlightedText = (content: string) => {
    if (!searchQuery || !searchQuery.trim()) {
      return content;
    }
    const q = searchQuery.trim().toLowerCase();
    const parts = content.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q ? (
        <mark
          key={i}
          className="bg-cyan-500/40 text-cyan-200 px-0.5 rounded font-semibold"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={`group relative flex flex-col mb-3 select-none ${
        isMine ? 'items-end' : 'items-start'
      }`}
      onContextMenu={e => {
        e.preventDefault();
        onContextMenu(e, message);
      }}
    >
      {/* Outer Bubble Frame */}
      <div
        className={`relative max-w-[85%] sm:max-w-md rounded-2xl p-3 sm:p-3.5 transition-all shadow-sm ${
          isMine
            ? message.status === 'failed'
              ? 'bg-rose-950/30 border border-rose-800/60 text-zinc-100 rounded-tr-sm'
              : 'bg-cyan-950/30 border border-cyan-500/35 text-zinc-100 rounded-tr-sm shadow-[0_2px_12px_rgba(6,182,212,0.06)]'
            : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.2)]'
        }`}
      >
        {/* Pinned / Starred badge */}
        {(message.isPinned || message.isStarred) && (
          <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-zinc-800/60 text-[10px] font-mono text-zinc-400">
            {message.isPinned && (
              <span className="flex items-center gap-0.5 text-cyan-400">
                <Pin className="w-3 h-3 fill-cyan-400" /> Pinned
              </span>
            )}
            {message.isStarred && (
              <span className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" /> Starred
              </span>
            )}
          </div>
        )}

        {/* Sender name for group chats if not me */}
        {!isMine && (
          <div className="text-[11px] font-mono font-semibold text-cyan-400 mb-1 flex items-center justify-between gap-2">
            <span>{message.senderName}</span>
          </div>
        )}

        {/* Quoted Reply Preview */}
        {message.replyTo && (
          <div className="mb-2 p-2 rounded-lg bg-zinc-950/60 border-l-2 border-cyan-400 text-xs text-zinc-400 font-mono">
            <span className="text-[10px] text-cyan-300 font-bold block">
              {message.replyTo.senderName}
            </span>
            <p className="truncate text-[11px]">{message.replyTo.content}</p>
          </div>
        )}

        {/* 1. TEXT */}
        {message.type === 'text' && (
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {renderHighlightedText(message.content)}
          </p>
        )}

        {/* 2. EMOJI ONLY */}
        {message.type === 'emoji' && (
          <div className="text-4xl py-1 select-none">
            {message.content}
          </div>
        )}

        {/* 3. GIF / STICKER */}
        {(message.type === 'gif' || message.type === 'sticker') && (
          <div className="space-y-1.5">
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80 p-2 flex items-center justify-center">
              <span className="text-5xl">{message.content || '👾'}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              {message.type === 'gif' ? 'GIF Animation' : 'Tactical Sticker'}
            </span>
          </div>
        )}

        {/* 4. VOICE MESSAGE */}
        {message.type === 'voice' && (
          <div className="space-y-2 min-w-[220px]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAudioToggle}
                className="w-8 h-8 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center shadow-md hover:bg-cyan-400 transition-colors shrink-0"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Dynamic waveform visualization */}
              <div className="flex-1 flex items-center gap-1 h-6">
                {[12, 18, 8, 22, 16, 26, 14, 20, 10, 24, 18, 12, 22, 14, 8, 16].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`w-1 rounded-full transition-all ${
                      isPlayingAudio && i <= Math.floor((audioPlaybackSecs / (message.attachment?.durationSeconds || 14)) * 16)
                        ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                0:{message.attachment?.durationSeconds ? message.attachment.durationSeconds.toString().padStart(2, '0') : '14'}
              </span>
            </div>
          </div>
        )}

        {/* 5. IMAGE */}
        {message.type === 'image' && (
          <div className="space-y-1.5">
            <div
              className="rounded-xl overflow-hidden border border-zinc-800 cursor-pointer group/img relative"
              onClick={() => onOpenAttachment && onOpenAttachment(message.attachment?.url || '')}
            >
              <img
                src={message.attachment?.url}
                alt={message.content}
                className="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-zinc-950/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900/90 text-zinc-200 text-xs font-mono">
                  Inspect Image
                </span>
              </div>
            </div>
            {message.content && (
              <p className="text-xs text-zinc-300 mt-1">{renderHighlightedText(message.content)}</p>
            )}
          </div>
        )}

        {/* 6. VIDEO */}
        {message.type === 'video' && (
          <div className="space-y-1.5 min-w-[220px]">
            <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 h-40 flex items-center justify-center">
              <Film className="w-8 h-8 text-zinc-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/90 text-zinc-950 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-zinc-900/80 text-[10px] font-mono text-zinc-300">
                0:45
              </span>
            </div>
            {message.content && <p className="text-xs text-zinc-300">{renderHighlightedText(message.content)}</p>}
          </div>
        )}

        {/* 7. FILE / DOCUMENT */}
        {message.type === 'file' && (
          <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-200 truncate font-mono">
                  {message.attachment?.name || 'document.pdf'}
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  {message.attachment?.sizeBytes
                    ? `${(message.attachment.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                    : '2.4 MB'}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900 transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 8. CONTACT */}
        {message.type === 'contact' && message.contactData && (
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 min-w-[210px]">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                  message.contactData.avatarColor || 'from-amber-500 to-rose-600'
                } flex items-center justify-center text-xs font-bold text-white shadow-sm`}
              >
                {message.contactData.displayName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">
                  {message.contactData.displayName}
                </div>
                <div className="text-[10px] font-mono text-zinc-400">
                  @{message.contactData.username}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">{message.contactData.phone}</span>
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {/* 9. LOCATION */}
        {message.type === 'location' && message.locationData && (
          <div className="space-y-2 min-w-[240px]">
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 h-28 flex flex-col justify-end p-2.5">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-20 h-20 rounded-full border border-cyan-400" />
                <div className="w-36 h-36 rounded-full border border-cyan-400" />
              </div>
              <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                <MapPin className="w-3 h-3" />
                <span>Tactical GPS Coordinate</span>
              </div>
              <div className="relative z-10 text-[11px] font-mono text-zinc-200">
                {message.locationData.latitude.toFixed(4)}° N, {message.locationData.longitude.toFixed(4)}° E
              </div>
            </div>
            <p className="text-xs text-zinc-300 font-mono">
              {message.locationData.placeName}
            </p>
          </div>
        )}

        {/* 10. POLL */}
        {message.type === 'poll' && message.pollData && (
          <PollCard
            poll={message.pollData}
            currentUserId="current_user"
            onVote={optionId => onVotePoll && onVotePoll(message.id, optionId)}
            isSender={isMine}
          />
        )}

        {/* 11. QUESTION */}
        {message.type === 'question' && message.questionData && (
          <QuestionCard
            question={message.questionData}
            onAddResponse={text => onAddQuestionResponse && onAddQuestionResponse(message.id, text)}
            onUpvoteResponse={responseId => onUpvoteQuestionResponse && onUpvoteQuestionResponse(message.id, responseId)}
            onAcceptResponse={responseId => onAcceptQuestionResponse && onAcceptQuestionResponse(message.id, responseId)}
            currentUserId="current_user"
            isSender={isMine}
          />
        )}

        {/* Timestamp and delivery checkmarks */}
        <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] font-mono text-zinc-500 select-none">
          {message.isEdited && <span className="text-zinc-600">edited</span>}
          <span>{formattedTime}</span>
          {renderStatusIcon()}
        </div>
      </div>

      {/* Failed message retry bar */}
      {message.status === 'failed' && (
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[10px] font-mono text-rose-400">Delivery interrupted</span>
          {onRetryMessage && (
            <button
              type="button"
              onClick={() => onRetryMessage(message.id)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/80 text-[10px] font-mono font-semibold text-rose-300 hover:bg-rose-900 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Reaction Badges Row */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 px-1">
          {message.reactions.map(r => {
            const hasUser = r.userIds.includes('current_user');
            return (
              <button
                key={r.emoji}
                type="button"
                onClick={() => onReact(message, r.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                  hasUser
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

MessageItem.displayName = 'MessageItem';
