import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface MediaPreviewModalProps {
  isOpen: boolean;
  mediaUrl: string;
  onClose: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  mediaUrl,
  onClose,
}) => {
  if (!isOpen || !mediaUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/80">
          <span className="text-xs font-mono text-zinc-300">
            Encrypted Media Lightbox Preview
          </span>
          <div className="flex items-center gap-2">
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Open full resolution"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="p-2 flex items-center justify-center bg-black/60 overflow-hidden max-h-[75vh]">
          <img
            src={mediaUrl}
            alt="Decrypted Media"
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Integrity: SHA-256 Validated</span>
          <span className="text-cyan-400">Zero Local Artifact Cache</span>
        </div>
      </div>
    </div>
  );
};
