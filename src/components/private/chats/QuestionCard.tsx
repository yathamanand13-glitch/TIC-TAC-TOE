import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  Send,
  User,
  ShieldCheck,
} from 'lucide-react';
import { QuestionData, QuestionResponse } from '../../../types/chat';

interface QuestionCardProps {
  question: QuestionData;
  onAddResponse?: (text: string) => void;
  onUpvoteResponse?: (responseId: string) => void;
  onAcceptResponse?: (responseId: string) => void;
  currentUserId?: string;
  isSender: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAddResponse,
  onUpvoteResponse,
  onAcceptResponse,
  currentUserId = 'current_user',
  isSender,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const responses = question.responses || [];
  const isAnswered = question.isAnswered || Boolean(question.acceptedResponseId) || Boolean(question.answer);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !onAddResponse) return;
    onAddResponse(replyText.trim());
    setReplyText('');
    setIsReplying(false);
    setIsExpanded(true);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md p-4 rounded-2xl bg-zinc-900/90 border border-violet-500/40 shadow-xl space-y-3 font-mono select-none">
      
      {/* Question Header */}
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-violet-950/80 border border-violet-500/60 text-violet-400 shrink-0 mt-0.5 shadow-sm">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                Node Inquiry
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-[10px] text-zinc-400">
                {question.authorName || 'Tactical Node'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug break-words mt-0.5">
              {question.question}
            </h4>
          </div>
        </div>

        {/* Status Tag */}
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${
            isAnswered
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
              : 'bg-amber-950/60 border-amber-800/80 text-amber-400'
          }`}
        >
          {isAnswered ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span>Resolved</span>
            </>
          ) : (
            <span>Open Query</span>
          )}
        </span>
      </div>

      {/* Accepted / Direct Answer Highlight (if exists) */}
      {(question.answer || question.acceptedResponseId) && (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Intel Response</span>
            {question.answeredBy && (
              <span className="text-zinc-400 font-normal">by {question.answeredBy}</span>
            )}
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed break-words">
            {question.answer ||
              responses.find(r => r.id === question.acceptedResponseId)?.text}
          </p>
        </div>
      )}

      {/* Responses Drawer Toggle */}
      {responses.length > 0 && (
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-full flex items-center justify-between text-[11px] text-zinc-400 hover:text-zinc-200 py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>{responses.length} Participant Response{responses.length === 1 ? '' : 's'}</span>
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}

      {/* Expanded Responses List */}
      {isExpanded && responses.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-zinc-800/60 max-h-48 overflow-y-auto pr-1">
          {responses.map(resp => {
            const hasVoted = resp.votedUserIds?.includes(currentUserId);
            return (
              <div
                key={resp.id}
                className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="font-bold text-zinc-300">{resp.authorName}</span>
                  <div className="flex items-center gap-2">
                    {onUpvoteResponse && (
                      <button
                        type="button"
                        onClick={() => onUpvoteResponse(resp.id)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                          hasVoted
                            ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title="Upvote intel"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{resp.upvotes}</span>
                      </button>
                    )}

                    {isSender && !isAnswered && onAcceptResponse && (
                      <button
                        type="button"
                        onClick={() => onAcceptResponse(resp.id)}
                        className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition-colors"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-zinc-300 leading-relaxed break-words">{resp.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Answer Composer */}
      {onAddResponse && (
        <div className="pt-2 border-t border-zinc-800/60">
          {isReplying ? (
            <form onSubmit={handleSubmitReply} className="space-y-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your response to this query..."
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Submit Intel</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsReplying(true)}
              className="w-full py-1.5 text-center rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-400 hover:text-cyan-300 transition-colors"
            >
              + Answer or Add Intel Response
            </button>
          )}
        </div>
      )}

    </div>
  );
};
