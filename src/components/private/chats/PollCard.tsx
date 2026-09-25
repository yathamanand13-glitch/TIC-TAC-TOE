import React from 'react';
import { Check, BarChart2, Users, CheckCircle2, Circle } from 'lucide-react';
import { PollData } from '../../../types/chat';

interface PollCardProps {
  poll: PollData;
  currentUserId?: string;
  onVote: (optionId: string) => void;
  isSender: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  currentUserId = 'current_user',
  onVote,
  isSender,
}) => {
  const isMultiple = Boolean(poll.isMultipleChoice);
  const totalVotes = poll.totalVotes || 0;

  // Check if current user has voted on any option
  const hasUserVoted = poll.options.some(opt => opt.voterIds.includes(currentUserId));

  return (
    <div className="w-full max-w-sm sm:max-w-md p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3 font-mono select-none">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-start gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 shrink-0 mt-0.5">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug break-words">
              {poll.question}
            </h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {isMultiple ? 'Multiple-choice tactical vote' : 'Single-choice tactical vote'}
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 shrink-0">
          {poll.isClosed ? 'Closed' : 'Active'}
        </span>
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {poll.options.map(option => {
          const isVotedByMe = option.voterIds.includes(currentUserId);
          const percent = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;

          return (
            <button
              key={option.id}
              type="button"
              disabled={poll.isClosed}
              onClick={() => onVote(option.id)}
              className={`w-full p-2.5 rounded-xl border text-left relative overflow-hidden transition-all group ${
                isVotedByMe
                  ? 'border-cyan-500/80 bg-cyan-950/20'
                  : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
              }`}
            >
              {/* Animated Progress Bar Fill */}
              {totalVotes > 0 && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isVotedByMe ? 'bg-cyan-500/20' : 'bg-zinc-800/40'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              )}

              {/* Option Content */}
              <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-${
                      isMultiple ? 'md' : 'full'
                    } border flex items-center justify-center shrink-0 transition-colors ${
                      isVotedByMe
                        ? 'border-cyan-400 bg-cyan-500 text-zinc-950'
                        : 'border-zinc-600 bg-zinc-900 group-hover:border-zinc-400'
                    }`}
                  >
                    {isVotedByMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span
                    className={`font-semibold truncate ${
                      isVotedByMe ? 'text-cyan-200' : 'text-zinc-200'
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                {/* Vote stats */}
                <div className="flex items-center gap-2 text-[11px] shrink-0 font-mono">
                  {totalVotes > 0 && (
                    <span className="text-zinc-400 font-bold">{percent}%</span>
                  )}
                  <span className="text-[10px] text-zinc-500">
                    ({option.voteCount})
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 border-t border-zinc-800/60">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-zinc-400" />
          <span>{totalVotes} total node votes</span>
        </span>

        {hasUserVoted && (
          <span className="text-cyan-400 font-bold">
            Vote registered
          </span>
        )}
      </div>

    </div>
  );
};
