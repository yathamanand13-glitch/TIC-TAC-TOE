import React, { useState } from 'react';
import {
  X,
  Laptop,
  Smartphone,
  Terminal,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { DeviceSession } from '../../../types/profile';

interface SessionManagerModalProps {
  isOpen: boolean;
  sessions: DeviceSession[];
  onTerminateSession: (sessionId: string) => Promise<void>;
  onTerminateAllOthers: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export const SessionManagerModal: React.FC<SessionManagerModalProps> = ({
  isOpen,
  sessions,
  onTerminateSession,
  onTerminateAllOthers,
  onRefresh,
  onClose,
}) => {
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const getDeviceIcon = (type: DeviceSession['deviceType']) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'terminal':
        return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'desktop':
      default:
        return <Laptop className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleTerminateOne = async (id: string) => {
    setTerminatingId(id);
    try {
      await onTerminateSession(id);
    } finally {
      setTerminatingId(null);
    }
  };

  const handleTerminateAll = async () => {
    setIsTerminatingAll(true);
    try {
      await onTerminateAllOthers();
    } finally {
      setIsTerminatingAll(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const otherSessionsCount = sessions.filter(s => !s.isCurrent).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Authorized Nodes & Sessions</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className={`p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors ${
                isRefreshing ? 'animate-spin text-cyan-400' : ''
              }`}
              title="Refresh sessions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-zinc-400 mb-2">
            Review authorized cryptographic sessions connected to your identity. Terminating a session immediately revokes access and destroys stored local encryption tokens.
          </p>

          {sessions.map(session => (
            <div
              key={session.id}
              className={`p-3.5 rounded-xl border transition-all ${
                session.isCurrent
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        {session.deviceName}
                      </span>
                      {session.isCurrent && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{session.os}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span>{session.browser}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-zinc-600" />
                        {session.location} ({session.ipAddress})
                      </span>
                      <span aria-hidden="true" className="text-zinc-700">·</span>
                      <span>
                        {session.isCurrent
                          ? 'Active right now'
                          : `Last active ${Math.floor((Date.now() - session.lastActive) / 60000)}m ago`}
                      </span>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleTerminateOne(session.id)}
                    disabled={terminatingId === session.id}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                    title="Terminate this node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-3">
          {otherSessionsCount > 0 ? (
            <button
              type="button"
              onClick={handleTerminateAll}
              disabled={isTerminatingAll}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-900/70 text-rose-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {isTerminatingAll ? 'Terminating...' : `Terminate All Other Sessions (${otherSessionsCount})`}
              </span>
            </button>
          ) : (
            <span className="text-[11px] font-mono text-zinc-500">
              No other active sessions detected.
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
