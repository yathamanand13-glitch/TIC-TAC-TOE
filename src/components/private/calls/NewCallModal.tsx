import React, { useState } from 'react';
import { X, Phone, Video, Search, ShieldCheck, Users, Radio } from 'lucide-react';
import { CallPeer } from '../../../types/call';

interface NewCallModalProps {
  isOpen: boolean;
  onInitiateCall: (peer: CallPeer, type: 'audio' | 'video', isGroup?: boolean) => void;
  onClose: () => void;
}

const DIRECT_CONTACTS: CallPeer[] = [
  {
    id: 'usr_ghost_01',
    name: 'Ghost Sector Node',
    username: 'ghost_node',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'usr_cipher_02',
    name: 'Cipher Analyst V',
    username: 'cipher_analyst',
    avatarColor: 'from-violet-500 to-indigo-600',
  },
  {
    id: 'usr_recon_03',
    name: 'Recon Sentinel',
    username: 'recon_sentinel',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'usr_echo_04',
    name: 'Echo Vanguard',
    username: 'echo_vanguard',
    avatarColor: 'from-amber-500 to-orange-600',
  },
];

const TACTICAL_GROUPS = [
  {
    id: 'grp_blackwatch',
    name: 'Blackwatch Recon Mesh',
    memberCount: 5,
    avatarColor: 'from-indigo-600 to-violet-800',
  },
  {
    id: 'grp_cipher_cell',
    name: 'Cipher Intelligence Cell',
    memberCount: 4,
    avatarColor: 'from-cyan-600 to-blue-800',
  },
];

export const NewCallModal: React.FC<NewCallModalProps> = ({
  isOpen,
  onInitiateCall,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredContacts = DIRECT_CONTACTS.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = TACTICAL_GROUPS.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-display">
                Initiate Secure Call
              </h2>
              <p className="text-[10px] font-mono text-zinc-500">
                Peer-to-Peer End-to-End Encrypted WebRTC
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

        {/* Tab switch & Search */}
        <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-950/40">
          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                activeTab === 'direct'
                  ? 'bg-zinc-850 text-cyan-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Direct Peer Call
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                activeTab === 'group'
                  ? 'bg-zinc-850 text-cyan-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Group Mesh Call
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'direct' ? 'Search contacts by handle...' : 'Search tactical cells...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>
        </div>

        {/* List of Contacts / Groups */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2">
          {activeTab === 'direct' ? (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/60 hover:border-zinc-700/80 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${contact.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0`}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-100 truncate">{contact.name}</p>
                    <p className="text-[11px] font-mono text-zinc-500 truncate">@{contact.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onInitiateCall(contact, 'audio');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-cyan-400 border border-zinc-700 transition-all"
                    title="Start Voice Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInitiateCall(contact, 'video');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-cyan-400 border border-zinc-700 transition-all"
                    title="Start Video Call"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            filteredGroups.map(group => (
              <div
                key={group.id}
                className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/60 hover:border-zinc-700/80 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${group.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-100 truncate">{group.name}</p>
                    <p className="text-[11px] font-mono text-zinc-500 truncate">
                      {group.memberCount} nodes in mesh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onInitiateCall(
                        { id: group.id, name: group.name, username: 'group_mesh', avatarColor: group.avatarColor },
                        'audio',
                        true
                      );
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-cyan-400 border border-zinc-700 transition-all"
                    title="Start Group Audio Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInitiateCall(
                        { id: group.id, name: group.name, username: 'group_mesh', avatarColor: group.avatarColor },
                        'video',
                        true
                      );
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-cyan-400 border border-zinc-700 transition-all"
                    title="Start Group Video Call"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hardware mic/cam will request permission on connect</span>
          </div>
        </div>

      </div>
    </div>
  );
};
