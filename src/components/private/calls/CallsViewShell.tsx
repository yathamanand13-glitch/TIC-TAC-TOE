import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Video,
  ShieldCheck,
  Plus,
  Radio,
  Activity,
  PhoneIncoming,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { CallPeer, CallHistoryRecord } from '../../../types/call';
import { callHistoryService } from '../../../services/webrtc/callHistoryService';
import { CallHistoryScreen } from './CallHistoryScreen';
import { NewCallModal } from './NewCallModal';
import { CallDiagnosticModal } from './CallDiagnosticModal';

interface CallsViewShellProps {
  onStartCall: (peer: CallPeer, type: 'audio' | 'video', isGroup?: boolean) => void;
  onSimulateIncoming: () => void;
}

export const CallsViewShell: React.FC<CallsViewShellProps> = ({
  onStartCall,
  onSimulateIncoming,
}) => {
  const [historyRecords, setHistoryRecords] = useState<CallHistoryRecord[]>([]);
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Load history records
  const loadHistory = async () => {
    const list = await callHistoryService.getHistory();
    setHistoryRecords(list);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteRecord = async (id: string) => {
    await callHistoryService.deleteRecord(id);
    loadHistory();
  };

  const handleClearHistory = async () => {
    await callHistoryService.clearHistory();
    loadHistory();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full space-y-6 select-none animate-in fade-in">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-base font-bold font-display text-zinc-100 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-cyan-400" />
            <span>Encrypted WebRTC Calling</span>
          </h1>
          <p className="text-[11px] font-mono text-zinc-400">
            Peer-to-Peer End-to-End Encrypted SRTP Audio & Video Mesh
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hardware & ICE Diagnostics */}
          <button
            type="button"
            onClick={() => setIsDiagnosticOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-cyan-400 border border-zinc-800 text-xs font-semibold transition-all"
            title="Open WebRTC & Hardware Diagnostics"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Diagnostics</span>
          </button>

          {/* Test Incoming Call */}
          <button
            type="button"
            onClick={onSimulateIncoming}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-emerald-400 border border-zinc-800 text-xs font-semibold transition-all"
            title="Simulate an incoming encrypted transmission to test ringing and response"
          >
            <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Ring</span>
          </button>

          {/* New Call Button */}
          <button
            type="button"
            onClick={() => setIsNewCallOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Call</span>
          </button>
        </div>
      </div>

      {/* WebRTC Signaling & Mesh Gateway Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <span>Direct Media Mesh: Standby / Ready</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-cyan-400">
                P2P SRTP
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
              Hardware mic/camera access is sandboxed and inactive until a transmission begins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800">
            Opus / VP9
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800">
            Google STUN
          </span>
        </div>
      </div>

      {/* Quick Call Speed Dial Nodes */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 px-1">
          Authorized Nodes Speed Dial
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'usr_ghost_01',
              name: 'Ghost Sector Node',
              username: 'ghost_node',
              avatarColor: 'from-cyan-500 to-blue-600',
              role: 'Recon Node',
            },
            {
              id: 'usr_cipher_02',
              name: 'Cipher Analyst V',
              username: 'cipher_analyst',
              avatarColor: 'from-violet-500 to-indigo-600',
              role: 'SIGINT Node',
            },
            {
              id: 'usr_recon_03',
              name: 'Recon Sentinel',
              username: 'recon_sentinel',
              avatarColor: 'from-emerald-500 to-teal-600',
              role: 'Tactical Cell',
            },
          ].map(peer => (
            <div
              key={peer.id}
              className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${peer.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}
                >
                  {peer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-100 truncate">{peer.name}</p>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">{peer.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onStartCall(peer, 'audio')}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-cyan-400 border border-zinc-700 transition-colors"
                  title="Voice Call"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onStartCall(peer, 'video')}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-cyan-400 border border-zinc-700 transition-colors"
                  title="Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Call History Screen */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 px-1">
          Encrypted Transmission Log
        </h3>
        
        <CallHistoryScreen
          records={historyRecords}
          onInitiateCall={(peer, type) => onStartCall(peer, type)}
          onDeleteRecord={handleDeleteRecord}
          onClearHistory={handleClearHistory}
        />
      </div>

      {/* Modals */}
      <NewCallModal
        isOpen={isNewCallOpen}
        onInitiateCall={onStartCall}
        onClose={() => setIsNewCallOpen(false)}
      />

      <CallDiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />

    </div>
  );
};
