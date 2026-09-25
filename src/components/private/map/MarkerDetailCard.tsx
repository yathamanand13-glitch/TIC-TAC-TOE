import React from 'react';
import {
  X,
  Clock,
  Navigation,
  MapPin,
  Crosshair,
  ShieldCheck,
  MessageSquare,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { GeoCoordinates, PeerLiveLocation } from '../../../types/location';

interface MarkerDetailCardProps {
  type: 'user' | 'peer';
  peer?: PeerLiveLocation;
  userCoords?: GeoCoordinates;
  isUserSharing?: boolean;
  remainingUserShareSecs?: number;
  onClose: () => void;
  onMessagePeer?: (peerId: string) => void;
  onCallPeer?: (peerId: string) => void;
}

export const MarkerDetailCard: React.FC<MarkerDetailCardProps> = ({
  type,
  peer,
  userCoords,
  isUserSharing,
  remainingUserShareSecs = 0,
  onClose,
  onMessagePeer,
  onCallPeer,
}) => {
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m remaining`;
    return `${m}m ${s}s remaining`;
  };

  if (type === 'user') {
    return (
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 p-4 rounded-3xl bg-zinc-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl font-mono text-xs animate-in slide-in-from-bottom-3">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              YOU
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-zinc-100 text-sm">You (Current Station)</h3>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[10px] text-cyan-400">@nova_spectre · Operator Node</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Sharing Status:</span>
            <span
              className={`font-bold flex items-center gap-1 ${
                isUserSharing ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isUserSharing ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
              {isUserSharing ? 'Broadcasting Coordinates' : 'Standby / Private'}
            </span>
          </div>

          {isUserSharing && remainingUserShareSecs > 0 && (
            <div className="flex items-center justify-between text-zinc-400">
              <span>Remaining Broadcast Time:</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(remainingUserShareSecs)}
              </span>
            </div>
          )}

          {userCoords && (
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Lat: {userCoords.latitude.toFixed(6)}°</span>
                <span>Lng: {userCoords.longitude.toFixed(6)}°</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Precision: ±{Math.round(userCoords.accuracyMeters)}m</span>
                <span>Hardware GPS Sensor</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!peer) return null;

  const remainingSecs = Math.max(0, Math.floor((peer.expiresAt - Date.now()) / 1000));

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 p-4 rounded-3xl bg-zinc-950/95 border border-zinc-700/80 shadow-2xl backdrop-blur-xl font-mono text-xs animate-in slide-in-from-bottom-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${peer.avatarColor} flex items-center justify-center font-bold text-white shadow-md text-sm`}
          >
            {peer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-zinc-100 text-sm">{peer.name}</h3>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-[10px] text-zinc-400">@{peer.username}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="py-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Sharing Status:</span>
          <span
            className={`font-bold flex items-center gap-1 ${
              peer.sharingStatus === 'expiring'
                ? 'text-amber-400'
                : peer.sharingStatus === 'active'
                ? 'text-emerald-400'
                : 'text-zinc-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                peer.sharingStatus === 'expiring'
                  ? 'bg-amber-400'
                  : peer.sharingStatus === 'active'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-zinc-600'
              }`}
            />
            {peer.sharingStatus === 'expiring'
              ? 'Expiring Soon'
              : peer.sharingStatus === 'active'
              ? 'Actively Sharing With You'
              : 'Expired'}
          </span>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span>Remaining Sharing Time:</span>
          <span className="text-cyan-300 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(remainingSecs)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Lat: {peer.coordinates.latitude.toFixed(6)}°</span>
            <span>Lng: {peer.coordinates.longitude.toFixed(6)}°</span>
          </div>
          <div className="flex items-center justify-between text-zinc-500">
            <span>Accuracy: ±{Math.round(peer.coordinates.accuracyMeters)}m</span>
            <span>Speed: {peer.coordinates.speed ? `${peer.coordinates.speed} m/s` : 'Stationary'}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
        {onMessagePeer && (
          <button
            type="button"
            onClick={() => onMessagePeer(peer.userId)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Message Node</span>
          </button>
        )}

        {onCallPeer && (
          <button
            type="button"
            onClick={() => onCallPeer(peer.userId)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-bold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
            <span>Call Node</span>
          </button>
        )}
      </div>

    </div>
  );
};
