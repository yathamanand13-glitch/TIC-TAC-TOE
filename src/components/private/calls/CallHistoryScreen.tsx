import React, { useState } from 'react';
import {
  Phone,
  Video,
  ArrowDownLeft,
  ArrowUpRight,
  PhoneMissed,
  Trash2,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  PhoneForwarded,
} from 'lucide-react';
import { CallHistoryRecord, CallPeer } from '../../../types/call';

interface CallHistoryScreenProps {
  records: CallHistoryRecord[];
  onInitiateCall: (peer: CallPeer, type: 'audio' | 'video') => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

export const CallHistoryScreen: React.FC<CallHistoryScreenProps> = ({
  records,
  onInitiateCall,
  onDeleteRecord,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState<'all' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatTimestamp = (ms: number) => {
    const date = new Date(ms);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today, ${timeStr}`;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  const formatDuration = (secs: number) => {
    if (secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    if (filter === 'missed' && record.direction !== 'missed' && record.status !== 'missed') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const peer = record.direction === 'outgoing' ? record.receiver : record.caller;
      const matchesPeer =
        peer.name.toLowerCase().includes(q) || peer.username.toLowerCase().includes(q);
      const matchesGroup = record.group?.name.toLowerCase().includes(q) || false;
      return matchesPeer || matchesGroup;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-zinc-800 text-cyan-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Calls ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('missed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'missed'
                ? 'bg-zinc-800 text-rose-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Missed ({records.filter(r => r.direction === 'missed' || r.status === 'missed').length})
          </button>
        </div>

        {/* Search input and clear action */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search call logs..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {records.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800 transition-colors"
              title="Purge Call History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Prompt */}
      {showClearConfirm && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <span className="text-rose-300 font-mono">
            Permanently purge all peer-to-peer call records?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onClearHistory();
                setShowClearConfirm(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              Purge Records
            </button>
          </div>
        </div>
      )}

      {/* List of Call Records */}
      {filteredRecords.length === 0 ? (
        <div className="p-10 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center font-mono space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-600 mb-2">
            {filter === 'missed' ? (
              <PhoneMissed className="w-6 h-6 text-zinc-500" />
            ) : (
              <Phone className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <p className="text-xs font-semibold text-zinc-300">
            {filter === 'missed' ? 'No Missed Transmissions' : 'No Call Records Logged'}
          </p>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
            {filter === 'missed'
              ? 'No missed peer invitations were detected in your enclave history.'
              : 'Direct audio and video WebRTC transmissions will appear here upon completion.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRecords.map(record => {
            const isOutgoing = record.direction === 'outgoing';
            const isMissed = record.direction === 'missed' || record.status === 'missed';
            const peer = isOutgoing ? record.receiver : record.caller;

            return (
              <div
                key={record.id}
                className="p-3.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 flex items-center justify-between gap-3 sm:gap-4 transition-all group"
              >
                {/* Left Peer Avatar & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                      peer.avatarColor || 'from-cyan-500 to-blue-600'
                    } flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0`}
                  >
                    {peer.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-100 truncate">{peer.name}</p>
                      <span className="text-[10px] font-mono text-zinc-500">@{peer.username}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                      {/* Direction Icon & Label */}
                      <span className="flex items-center gap-1">
                        {isMissed ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
                        ) : isOutgoing ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span
                          className={
                            isMissed
                              ? 'text-rose-400 font-semibold'
                              : isOutgoing
                              ? 'text-cyan-400'
                              : 'text-emerald-400'
                          }
                        >
                          {isMissed ? 'Missed' : isOutgoing ? 'Outgoing' : 'Incoming'}
                        </span>
                      </span>

                      <span className="text-zinc-600">·</span>

                      {/* Timestamp */}
                      <span className="text-zinc-400">{formatTimestamp(record.startTime)}</span>

                      {/* Duration (if not missed) */}
                      {!isMissed && record.durationSeconds > 0 && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {formatDuration(record.durationSeconds)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Call-Back Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Call Back Audio */}
                  <button
                    type="button"
                    onClick={() => onInitiateCall(peer, 'audio')}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-cyan-400 border border-zinc-700/80 transition-colors"
                    title={`Call back ${peer.name} (Audio)`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>

                  {/* Call Back Video */}
                  <button
                    type="button"
                    onClick={() => onInitiateCall(peer, 'video')}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-cyan-400 border border-zinc-700/80 transition-colors"
                    title={`Call back ${peer.name} (Video)`}
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete record */}
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(record.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove from log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
