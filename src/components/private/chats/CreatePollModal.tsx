import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart2, Check, HelpCircle } from 'lucide-react';
import { PollData, PollOption } from '../../../types/chat';

interface CreatePollModalProps {
  isOpen: boolean;
  onCreatePoll: (poll: PollData) => void;
  onClose: () => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onCreatePoll,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) return;

    const pollOptions: PollOption[] = validOptions.map((text, idx) => ({
      id: 'opt_' + idx + '_' + Date.now(),
      text,
      voteCount: 0,
      voterIds: [],
    }));

    const poll: PollData = {
      id: 'poll_' + Date.now(),
      question: question.trim(),
      creatorId: 'current_user',
      creatorName: 'Commander Nova',
      options: pollOptions,
      isMultipleChoice,
      totalVotes: 0,
      createdAt: Date.now(),
    };

    onCreatePoll(poll);
    onClose();
  };

  const isValid = question.trim().length > 0 && options.filter(o => o.trim().length > 0).length >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-display">
                Create Tactical Poll
              </h2>
              <p className="text-[10px] font-mono text-zinc-500">
                Encrypted Consensus Voting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          
          {/* Question Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Poll Question
            </label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g., Tactical rendezvous location approval?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Options ({options.length}/8)</span>
              <span className="text-[10px] text-zinc-500">Min 2 required</span>
            </label>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center text-zinc-500 text-[11px] font-mono">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-2 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          {/* Multiple choice toggle */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label
              onClick={() => setIsMultipleChoice(prev => !prev)}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer group"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-200">Allow Multiple Choices</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Participants can select more than one option</p>
              </div>

              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  isMultipleChoice
                    ? 'bg-cyan-500 border-cyan-400 text-zinc-950'
                    : 'border-zinc-700 bg-zinc-900'
                }`}
              >
                {isMultipleChoice && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold transition-all shadow-md active:scale-95"
            >
              Create Poll
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
