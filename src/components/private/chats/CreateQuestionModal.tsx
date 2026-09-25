import React, { useState } from 'react';
import { X, HelpCircle, Send } from 'lucide-react';
import { QuestionData } from '../../../types/chat';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onCreateQuestion: (question: QuestionData) => void;
  onClose: () => void;
}

export const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  isOpen,
  onCreateQuestion,
  onClose,
}) => {
  const [questionText, setQuestionText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQuestion: QuestionData = {
      id: 'q_' + Date.now(),
      question: questionText.trim(),
      authorId: 'current_user',
      authorName: 'Commander Nova',
      authorAvatarColor: 'from-cyan-500 to-blue-600',
      isAnswered: false,
      responses: [],
      createdAt: Date.now(),
    };

    onCreateQuestion(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-display">
                Post Intel Inquiry
              </h2>
              <p className="text-[10px] font-mono text-zinc-500">
                Peer-to-Peer Question & Answer Dispatch
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Question or Tactical Query
            </label>
            <textarea
              rows={4}
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="e.g., Has any node confirmed perimeter clearance in Sector 4?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
              autoFocus
            />
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400">
            Inquiries will be highlighted with a distinctive resolution status badge in the chat thread. Nodes can submit answers and upvote intel.
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!questionText.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold transition-all shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Query</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
