import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  ShieldAlert,
  Crosshair,
  Users,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Plus,
  Compass,
  X,
  Radio,
} from 'lucide-react';
import {
  GeoCoordinates,
  LiveShareDuration,
  LocationPermissionState,
  LocationShareRecipient,
  LocationShareSession,
  PeerLiveLocation,
} from '../../../types/location';
import { locationService } from '../../../services/location/locationService';
import { LeafletMapContainer } from './LeafletMapContainer';
import { StartLiveShareModal } from './StartLiveShareModal';
import { ActiveShareBanner } from './ActiveShareBanner';
import { MarkerDetailCard } from './MarkerDetailCard';

interface MapViewShellProps {
  onNavigateToChat?: () => void;
  onStartCall?: (peerId: string) => void;
}

export const MapViewShell: React.FC<MapViewShellProps> = ({
  onNavigateToChat,
  onStartCall,
}) => {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>(
    locationService.getPermissionState()
  );
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(null);
  const [activeSession, setActiveSession] = useState<LocationShareSession | null>(
    locationService.getActiveShareSession()
  );
  const [peers, setPeers] = useState<PeerLiveLocation[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<{
    type: 'user' | 'peer';
    peer?: PeerLiveLocation;
  } | null>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);
  const [isPermissionBannerDismissed, setIsPermissionBannerDismissed] = useState(false);

  // Subscribe to location updates
  useEffect(() => {
    const unsub = locationService.subscribe((state, coords) => {
      setPermissionState(state);
      setUserCoords(coords);
      setActiveSession(locationService.getActiveShareSession());
    });

    return () => unsub();
  }, []);

  // Fetch peer locations actively sharing with the user
  useEffect(() => {
    locationService.getPeerLocations().then(setPeers);
  }, [permissionState, userCoords]);

  // Request location permission
  const handleRequestPermission = async () => {
    setIsLoadingPosition(true);
    setIsPermissionBannerDismissed(false);
    try {
      const state = await locationService.requestPermission();
      setPermissionState(state);
      if (state === 'GRANTED' || state === 'SHARING') {
        const coords = await locationService.getCurrentPosition();
        setUserCoords(coords);
      }
    } finally {
      setIsLoadingPosition(false);
    }
  };

  // Start live location share
  const handleStartShare = async (
    duration: LiveShareDuration,
    recipients: LocationShareRecipient[]
  ) => {
    const session = await locationService.startSharing(duration, recipients);
    if (session) {
      setActiveSession(session);
      setPermissionState('SHARING');
    }
  };

  // Stop live location share
  const handleStopShare = async () => {
    await locationService.stopSharing();
    setActiveSession(null);
    setPermissionState(userCoords ? 'GRANTED' : 'NOT_REQUESTED');
  };

  const isSharing = permissionState === 'SHARING' && activeSession !== null;
  const hasRealGPS = (permissionState === 'GRANTED' || permissionState === 'SHARING') && userCoords !== null;

  return (
    <div className="flex-1 w-full h-full min-h-0 flex flex-col overflow-hidden select-none relative bg-zinc-950">
      
      {/* Top Map Control Bar */}
      <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 z-20">
        <div>
          <h1 className="text-sm sm:text-base font-bold font-display text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Tactical Mesh Radar</span>
          </h1>
          <p className="text-[11px] font-mono text-zinc-400">
            Ephemeral Peer-to-Peer Geolocation Mesh · Zero Server Storage
          </p>
        </div>

        {/* Location Status & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasRealGPS && userCoords && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {userCoords.latitude.toFixed(4)}°, {userCoords.longitude.toFixed(4)}°
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-emerald-400">±{Math.round(userCoords.accuracyMeters)}m</span>
            </div>
          )}

          {isSharing ? (
            <button
              type="button"
              onClick={handleStopShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Stop Sharing</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (hasRealGPS) {
                  setIsShareModalOpen(true);
                } else {
                  handleRequestPermission();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Share Live Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Sharing Status Banner */}
      {isSharing && activeSession && (
        <div className="shrink-0 z-20">
          <ActiveShareBanner session={activeSession} onStopSharing={handleStopShare} />
        </div>
      )}

      {/* Main Map Viewport (Fills remaining height) */}
      <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden">
        
        {/* Real Interactive Leaflet Map Engine */}
        <LeafletMapContainer
          userCoords={hasRealGPS ? userCoords : null}
          peers={peers}
          selectedMarkerId={selectedMarker?.peer?.id || null}
          onSelectMarker={m => setSelectedMarker(m)}
          isSharing={isSharing}
          onLocateMe={handleRequestPermission}
          hasLocationPermission={hasRealGPS}
        />

        {/* Tactical Status Pill: Peer Count */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono text-zinc-300 shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-auto">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{peers.length} Active Nodes in Area</span>
          </div>
        </div>

        {/* Non-blocking Permission Prompt Overlay: NOT_REQUESTED */}
        {permissionState === 'NOT_REQUESTED' && !isPermissionBannerDismissed && (
          <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-20 p-4 rounded-3xl bg-zinc-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl font-mono text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Navigation className="w-4 h-4" />
                <span>Enable Real Location</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPermissionBannerDismissed(true)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
              Grant browser location access to place your real station on this tactical radar and enable live location sharing.
            </p>
            <button
              type="button"
              onClick={handleRequestPermission}
              disabled={isLoadingPosition}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              {isLoadingPosition ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Acquiring GPS Fix...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Grant Location Access</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Explicit Requirement: Location Permission Denied State */}
        {permissionState === 'DENIED' && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-16 sm:max-w-sm z-20 p-3.5 rounded-2xl bg-zinc-950/95 border border-rose-900/80 shadow-2xl backdrop-blur-xl font-mono text-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-rose-300 text-xs">Location permission not granted.</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                  Browser location access has been declined. Map operates in passive mode without your real coordinates.
                </p>
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Permission</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hardware Unavailable State */}
        {permissionState === 'UNAVAILABLE' && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-16 sm:max-w-sm z-20 p-3.5 rounded-2xl bg-zinc-950/95 border border-amber-900/80 shadow-2xl backdrop-blur-xl font-mono text-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-amber-300 text-xs">Hardware Location Unavailable</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                  GPS sensor or device coordinates are currently unreachable.
                </p>
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Marker Detail Card (Bottom Sheet on mobile / floating card on desktop) */}
        {selectedMarker && (
          <MarkerDetailCard
            type={selectedMarker.type}
            peer={selectedMarker.peer}
            userCoords={hasRealGPS ? userCoords : undefined}
            isUserSharing={isSharing}
            remainingUserShareSecs={
              activeSession
                ? Math.max(0, Math.floor((activeSession.expiresAt - Date.now()) / 1000))
                : 0
            }
            onClose={() => setSelectedMarker(null)}
            onMessagePeer={() => {
              if (onNavigateToChat) onNavigateToChat();
            }}
            onCallPeer={peerId => {
              if (onStartCall) onStartCall(peerId);
            }}
          />
        )}

      </div>

      {/* Start Live Share Modal */}
      <StartLiveShareModal
        isOpen={isShareModalOpen}
        onStartShare={handleStartShare}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
};
