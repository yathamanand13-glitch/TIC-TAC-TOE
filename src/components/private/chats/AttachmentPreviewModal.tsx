import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Film,
  Send,
} from 'lucide-react';
import { storageService } from '../../../services/storage/storageService';
import { UploadProgress, UploadTask } from '../../../types/storage';
import { Attachment } from '../../../types/chat';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  fileOrBlob: File | Blob | null;
  mediaType: 'image' | 'video' | 'file' | 'audio';
  onSendAttachment: (attachment: Attachment, caption: string) => void;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  isOpen,
  fileOrBlob,
  mediaType,
  onSendAttachment,
  onClose,
}) => {
  const [task, setTask] = useState<UploadTask | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [caption, setCaption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && fileOrBlob) {
      storageService.createUploadTask(fileOrBlob, mediaType).then(createdTask => {
        setTask(createdTask);
        // Automatically start encrypted staged upload
        handleStartUpload(createdTask.id);
      });
    } else {
      setTask(null);
      setProgress(null);
      setCaption('');
    }
  }, [isOpen, fileOrBlob, mediaType]);

  const handleStartUpload = async (taskId: string) => {
    setIsProcessing(true);
    await storageService.startUpload(taskId, p => {
      setProgress(p);
      setTask(prev => (prev ? { ...prev, state: p.state, progress: p.percentage, error: p.error } : null));
    });
    setIsProcessing(false);
  };

  const handleRetry = async () => {
    if (!task) return;
    setIsProcessing(true);
    await storageService.retryUpload(task.id, p => {
      setProgress(p);
      setTask(prev => (prev ? { ...prev, state: p.state, progress: p.percentage, error: p.error } : null));
    });
    setIsProcessing(false);
  };

  if (!isOpen || !task) return null;

  const handleSend = () => {
    if (task.state !== 'complete') return;

    const attachment: Attachment = {
      id: 'att_' + Date.now(),
      type: mediaType,
      url: task.uploadedUrl || task.localPreviewUrl,
      name: task.fileName,
      sizeBytes: task.fileSizeBytes,
      mimeType: task.mimeType,
      uploadState: task.state,
      uploadProgress: task.progress,
      uploadTaskId: task.id,
      localPreviewUrl: task.localPreviewUrl,
    };

    onSendAttachment(attachment, caption);
    onClose();
  };

  const formattedSize = (task.fileSizeBytes / 1024).toFixed(1) + ' KB';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Encrypted Payload Staging</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Viewport */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Media preview visual */}
          <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center min-h-[160px] max-h-[220px]">
            {mediaType === 'image' ? (
              <img
                src={task.localPreviewUrl}
                alt="Preview"
                className="max-h-[220px] w-full object-contain"
              />
            ) : mediaType === 'video' ? (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <Film className="w-12 h-12 text-cyan-400" />
                <span className="text-xs font-mono">{task.fileName}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400 p-4">
                <FileText className="w-12 h-12 text-cyan-400" />
                <span className="text-xs font-mono text-zinc-200 text-center">{task.fileName}</span>
                <span className="text-[10px] font-mono text-zinc-500">{formattedSize}</span>
              </div>
            )}
          </div>

          {/* Upload Status Card */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 truncate max-w-[200px]">{task.fileName}</span>
              {task.state === 'complete' ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Staged
                </span>
              ) : task.state === 'failed' ? (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Failed
                </span>
              ) : (
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  {task.state === 'preparing' ? 'Preparing...' : `Uploading (${task.progress}%)`}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${task.progress}%` }}
                className={`h-full transition-all duration-150 ${
                  task.state === 'complete'
                    ? 'bg-emerald-400'
                    : task.state === 'failed'
                    ? 'bg-rose-500'
                    : 'bg-cyan-400'
                }`}
              />
            </div>

            {task.error && (
              <p className="text-[11px] font-mono text-rose-400">{task.error}</p>
            )}
          </div>

          {/* Optional Caption */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              Transmission Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add encrypted context or note..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
          >
            Discard
          </button>

          {task.state === 'failed' ? (
            <button
              type="button"
              onClick={handleRetry}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Staging</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={task.state !== 'complete'}
              onClick={handleSend}
              className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold shadow-md transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Payload</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
