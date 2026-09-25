import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  Camera,
  X,
  Image,
  FileText,
  MapPin,
  User,
  BarChart2,
  Film,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Attachment, Message, MessageType, PollData, QuestionData } from '../../../types/chat';
import { VoiceRecordingHUD } from './VoiceRecordingHUD';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { CreatePollModal } from './CreatePollModal';
import { CreateQuestionModal } from './CreateQuestionModal';
import { AudioRecordingResult } from '../../../types/audio';
import { realtimeService } from '../../../services/realtime/realtimeService';

interface MessageComposerProps {
  conversationId: string;
  replyingTo: Message | null;
  editingMessage: Message | null;
  onSendMessage: (content: string, type: MessageType, extra?: Partial<Message>) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '🛡️', '🔒', '👀', '⚡', '🚀', '🎯', '🫡'];

const TACTICAL_GIFS = [
  { label: 'Signal Verified', url: '🛰️' },
  { label: 'Radar Sweep', url: '📡' },
  { label: 'Cyber Shield', url: '🛡️' },
  { label: 'Cyber Glitch', url: '👾' },
  { label: 'Target Acquired', url: '🎯' },
];

const TACTICAL_STICKERS = [
  { label: 'Omega Protocol', text: '⚡ OMEGA' },
  { label: 'Stealth Active', text: '🕶️ STEALTH' },
  { label: 'Secured Enclave', text: '🔒 SEALED' },
  { label: 'Alpha Beacon', text: '🚨 BEACON' },
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  replyingTo,
  editingMessage,
  onSendMessage,
  onEditMessage,
  onCancelReply,
  onCancelEdit,
}) => {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);

  // Staged File Upload for AttachmentPreviewModal
  const [stagedFile, setStagedFile] = useState<{ file: File | Blob; mediaType: 'image' | 'video' | 'file' | 'audio' } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync text if editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Broadcast typing event (conversation-specific)
    realtimeService.broadcastTyping(conversationId, true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      realtimeService.broadcastTyping(conversationId, false);
    }, 2000);
  };

  const handleSend = () => {
    const clean = text.trim();
    if (!clean && !editingMessage) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    realtimeService.broadcastTyping(conversationId, false);

    if (editingMessage) {
      onEditMessage(editingMessage.id, clean);
      setText('');
      onCancelEdit();
      return;
    }

    let extra: Partial<Message> = {};
    if (replyingTo) {
      extra.replyTo = {
        messageId: replyingTo.id,
        senderName: replyingTo.senderName,
        senderId: replyingTo.senderId,
        content: replyingTo.content,
        type: replyingTo.type,
      };
    }

    const isSingleEmoji = /^\p{Extended_Pictographic}$/u.test(clean);
    const msgType: MessageType = isSingleEmoji ? 'emoji' : 'text';

    onSendMessage(clean, msgType, extra);
    setText('');
    onCancelReply();
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Trigger real file input
  const triggerFileInput = (mediaType: 'image' | 'video' | 'file') => {
    setShowAttachMenu(false);
    if (fileInputRef.current) {
      if (mediaType === 'image') {
        fileInputRef.current.accept = 'image/*';
      } else if (mediaType === 'video') {
        fileInputRef.current.accept = 'video/*';
      } else {
        fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.zip,.json';
      }
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      let mediaType: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) mediaType = 'image';
      else if (file.type.startsWith('video/')) mediaType = 'video';

      setStagedFile({ file, mediaType });
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  // Structured Attachment Shortcuts
  const handleSelectShortcut = (type: MessageType) => {
    setShowAttachMenu(false);
    switch (type) {
      case 'location':
        onSendMessage('Live tactical coordinate beacon', 'location', {
          locationData: {
            latitude: 47.3769 + (Math.random() - 0.5) * 0.05,
            longitude: 8.5417 + (Math.random() - 0.5) * 0.05,
            placeName: 'Rendezvous Coordinate Sector ' + Math.floor(Math.random() * 9 + 1),
            accuracyMeters: 4,
          },
        });
        break;
      case 'contact':
        onSendMessage('Operator Node Card', 'contact', {
          contactData: {
            displayName: 'Delta Sentinel Operator',
            username: 'delta_sentinel',
            phone: '+41 79 120 4455',
            avatarColor: 'from-emerald-500 to-teal-600',
          },
        });
        break;
      case 'poll':
        onSendMessage('Tactical Cell Vote', 'poll', {
          pollData: {
            question: 'Confirm status for Phase 2 deployment:',
            options: [
              { id: 'opt_1', text: 'All nodes green / proceed', voteCount: 1, voterIds: ['current_user'] },
              { id: 'opt_2', text: 'Hold position / verify perimeter', voteCount: 0, voterIds: [] },
            ],
            totalVotes: 1,
          },
        });
        break;
    }
  };

  // Send completed attachment from AttachmentPreviewModal
  const handleSendStagedAttachment = (attachment: Attachment, caption: string) => {
    const msgType: MessageType =
      attachment.type === 'image'
        ? 'image'
        : attachment.type === 'video'
        ? 'video'
        : 'file';

    onSendMessage(caption || attachment.name, msgType, {
      attachment,
    });
    setStagedFile(null);
  };

  // Voice recording finish handler
  const handleSendVoiceRecording = (result: AudioRecordingResult) => {
    setIsRecordingVoice(false);
    const audioUrl = URL.createObjectURL(result.blob);

    const attachment: Attachment = {
      id: 'att_v_' + Date.now(),
      type: 'audio',
      name: `voice_${Date.now()}.opus`,
      durationSeconds: result.durationSeconds,
      url: audioUrl,
      localPreviewUrl: audioUrl,
      uploadState: 'complete',
      uploadProgress: 100,
    };

    onSendMessage(`Encrypted voice transmission (0:${result.durationSeconds.toString().padStart(2, '0')})`, 'voice', {
      attachment,
    });
  };

  return (
    <div className="relative border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl p-3 z-30 select-none">
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Quoted Reply Preview Bar */}
      {replyingTo && (
        <div className="mb-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-1 h-6 bg-cyan-400 rounded-full shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-cyan-300 font-bold block">
                Replying to {replyingTo.senderName}
              </span>
              <span className="text-zinc-400 text-[11px] truncate block">
                {replyingTo.content}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Mode Banner */}
      {editingMessage && (
        <div className="mb-2 p-2 rounded-xl bg-amber-950/40 border border-amber-900/60 flex items-center justify-between text-xs font-mono text-amber-300">
          <span>Editing Message</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode A: Voice Recording HUD */}
      {isRecordingVoice ? (
        <VoiceRecordingHUD
          onSendVoice={handleSendVoiceRecording}
          onCancel={() => setIsRecordingVoice(false)}
        />
      ) : (
        /* Mode B: Standard Input Bar */
        <div className="flex items-end gap-2">
          
          {/* Attachment Toggle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(prev => !prev);
                setShowEmojiPicker(false);
                setShowGifPicker(false);
              }}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-cyan-300 border border-zinc-800 transition-colors"
              title="Add Encrypted Attachment"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Attachment Dropup Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 w-56 p-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl space-y-1 animate-in fade-in zoom-in-95 z-50">
                <button
                  type="button"
                  onClick={() => triggerFileInput('image')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <Image className="w-4 h-4 text-cyan-400" />
                  <span>Image / Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerFileInput('video')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <Film className="w-4 h-4 text-violet-400" />
                  <span>Video Clip</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerFileInput('file')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Document / File</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectShortcut('location')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>GPS Coordinate Beacon</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectShortcut('contact')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Operator Contact</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    setIsCreatePollOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <span>Tactical Poll</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    setIsCreateQuestionOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <HelpCircle className="w-4 h-4 text-violet-400" />
                  <span>Intel Query / Question</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    setShowGifPicker(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>GIFs & Stickers</span>
                </button>
              </div>
            )}
          </div>

          {/* Text Area & Emoji Container */}
          <div className="flex-1 relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl focus-within:ring-1 focus-within:ring-cyan-500/50 focus-within:border-cyan-500 transition-all">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type encrypted message (Enter to send)..."
              rows={1}
              className="w-full pl-3.5 pr-10 py-2.5 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-32"
            />

            {/* Quick Emoji toggle */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(prev => !prev);
                setShowAttachMenu(false);
                setShowGifPicker(false);
              }}
              className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Emoji Quick Bar Dropup */}
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 p-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 z-50">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setText(t => t + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-lg p-1 hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* GIF / Sticker Quick Dropup */}
            {showGifPicker && (
              <div className="absolute bottom-12 right-0 w-64 p-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl space-y-2 animate-in fade-in zoom-in-95 z-50">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Tactical GIFs
                </div>
                <div className="flex gap-2">
                  {TACTICAL_GIFS.map(g => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => {
                        onSendMessage(g.url, 'gif');
                        setShowGifPicker(false);
                      }}
                      className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xl hover:scale-110 transition-transform"
                      title={g.label}
                    >
                      {g.url}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider pt-1 border-t border-zinc-800">
                  Quick Insignia Stickers
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TACTICAL_STICKERS.map(s => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        onSendMessage(s.text, 'sticker');
                        setShowGifPicker(false);
                      }}
                      className="py-1 px-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-cyan-300 hover:border-cyan-500/50 transition-colors text-left"
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voice Record or Send Action Button */}
          {text.trim() || editingMessage ? (
            <button
              type="button"
              onClick={handleSend}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all shadow-md shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecordingVoice(true)}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-cyan-300 border border-zinc-800 transition-colors shrink-0"
              title="Record Voice Transmission"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

        </div>
      )}

      {/* Attachment Staging & Upload Modal */}
      {stagedFile && (
        <AttachmentPreviewModal
          isOpen={Boolean(stagedFile)}
          fileOrBlob={stagedFile.file}
          mediaType={stagedFile.mediaType}
          onSendAttachment={handleSendStagedAttachment}
          onClose={() => setStagedFile(null)}
        />
      )}

      {/* Create Tactical Poll Modal */}
      <CreatePollModal
        isOpen={isCreatePollOpen}
        onCreatePoll={poll => {
          onSendMessage(poll.question, 'poll', { pollData: poll });
        }}
        onClose={() => setIsCreatePollOpen(false)}
      />

      {/* Create Intel Query / Question Modal */}
      <CreateQuestionModal
        isOpen={isCreateQuestionOpen}
        onCreateQuestion={question => {
          onSendMessage(question.question, 'question', { questionData: question });
        }}
        onClose={() => setIsCreateQuestionOpen(false)}
      />

    </div>
  );
};
