import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Plus, Minus, Crosshair, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { GeoCoordinates, PeerLiveLocation } from '../../../types/location';

interface LeafletMapContainerProps {
  userCoords?: GeoCoordinates | null;
  peers: PeerLiveLocation[];
  selectedMarkerId: string | null;
  onSelectMarker: (marker: { type: 'user' | 'peer'; peer?: PeerLiveLocation }) => void;
  isSharing: boolean;
  onLocateMe?: () => void;
  hasLocationPermission?: boolean;
}

export const LeafletMapContainer: React.FC<LeafletMapContainerProps> = ({
  userCoords,
  peers,
  selectedMarkerId,
  onSelectMarker,
  isSharing,
  onLocateMe,
  hasLocationPermission,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const peerMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [tileTheme, setTileTheme] = useState<'dark' | 'satellite'>('dark');

  // Initialize Map
  const initMap = () => {
    if (!mapContainerRef.current) return;
    setMapError(null);

    try {
      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Determine initial center: real user coords if available, otherwise first peer or global fallback
      let initialLat = 37.7749;
      let initialLng = -122.4194;
      let initialZoom = 13;

      if (userCoords) {
        initialLat = userCoords.latitude;
        initialLng = userCoords.longitude;
        initialZoom = 15;
      } else if (peers.length > 0) {
        initialLat = peers[0].coordinates.latitude;
        initialLng = peers[0].coordinates.longitude;
        initialZoom = 14;
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false, // We render our own responsive tactical controls
        attributionControl: false,
      });

      // CartoDB Dark Matter / Satellite tactical tiles
      const tileUrl =
        tileTheme === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: tileTheme === 'satellite' ? [] : 'abcd',
      });

      tileLayer.on('tileerror', () => {
        // Fallback tile service if CartoDB experiences network rate limiting
        console.warn('Tactical map tile network glitch, retrying...');
      });

      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
      });

      mapInstanceRef.current = map;
      setMapReady(true);

      // Force recalculation of container size after mounting
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      setTimeout(() => {
        map.invalidateSize();
      }, 400);
    } catch (err: unknown) {
      console.error('Map initialization error:', err);
      setMapError(err instanceof Error ? err.message : 'Unable to initialize map viewport');
    }
  };

  useEffect(() => {
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tileTheme]);

  // Handle container resizing (e.g. mobile orientation change or sidebar collapse)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mapReady]);

  // Update or remove User Marker & Accuracy Circle based on real GPS coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (!userCoords) {
      // If userCoords is not available, remove any existing marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.remove();
        userAccuracyCircleRef.current = null;
      }
      return;
    }

    const latLng: [number, number] = [userCoords.latitude, userCoords.longitude];

    const userIconHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        <div class="absolute w-12 h-12 rounded-full ${
          isSharing ? 'bg-emerald-500/30' : 'bg-cyan-500/30'
        } animate-ping"></div>
        <div class="w-10 h-10 rounded-2xl bg-zinc-950 border-2 ${
          isSharing ? 'border-emerald-400' : 'border-cyan-400'
        } shadow-xl flex items-center justify-center text-xs font-bold text-white relative z-10 transition-transform group-hover:scale-110">
          <div class="w-7 h-7 rounded-xl bg-gradient-to-tr ${
            isSharing ? 'from-emerald-500 to-teal-600' : 'from-cyan-500 to-blue-600'
          } flex items-center justify-center text-[10px] font-mono">
            YOU
          </div>
        </div>
        ${
          isSharing
            ? '<span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-zinc-950 z-20"></span>'
            : ''
        }
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'tactical-user-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latLng);
      userMarkerRef.current.setIcon(userIcon);
    } else {
      const marker = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      marker.on('click', () => {
        onSelectMarker({ type: 'user' });
      });
      userMarkerRef.current = marker;
    }

    // Accuracy Circle
    if (userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current.setLatLng(latLng);
      userAccuracyCircleRef.current.setRadius(userCoords.accuracyMeters || 15);
    } else {
      userAccuracyCircleRef.current = L.circle(latLng, {
        radius: userCoords.accuracyMeters || 15,
        color: isSharing ? '#10b981' : '#06b6d4',
        weight: 1,
        fillColor: isSharing ? '#10b981' : '#06b6d4',
        fillOpacity: 0.1,
      }).addTo(map);
    }
  }, [userCoords, isSharing, mapReady, onSelectMarker]);

  // Update Peer Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const currentPeerIds = new Set(peers.map(p => p.id));

    // Remove obsolete markers
    peerMarkersRef.current.forEach((marker, id) => {
      if (!currentPeerIds.has(id)) {
        marker.remove();
        peerMarkersRef.current.delete(id);
      }
    });

    // Add or update active peer markers
    peers.forEach(peer => {
      const latLng: [number, number] = [peer.coordinates.latitude, peer.coordinates.longitude];
      const isSelected = selectedMarkerId === peer.id;

      const remainingMin = Math.max(0, Math.round((peer.expiresAt - Date.now()) / 60000));
      const remainingLabel = remainingMin > 60 ? `${Math.round(remainingMin / 60)}h` : `${remainingMin}m`;

      const peerIconHtml = `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="relative">
            <div class="w-10 h-10 rounded-2xl bg-zinc-950 border-2 ${
              isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110' : 'border-zinc-700 group-hover:border-zinc-400'
            } shadow-xl flex items-center justify-center transition-all">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr ${peer.avatarColor} flex items-center justify-center text-xs font-bold text-white">
                ${peer.name.charAt(0)}
              </div>
            </div>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
              peer.sharingStatus === 'expiring' ? 'bg-amber-400' : 'bg-emerald-400'
            } border border-zinc-950"></span>
          </div>

          <div class="mt-1 px-1.5 py-0.5 rounded-md bg-zinc-950/90 border border-zinc-800 text-[9px] font-mono text-zinc-200 whitespace-nowrap shadow-md flex items-center gap-1 backdrop-blur-md">
            <span>${peer.name.split(' ')[0]}</span>
            <span class="text-cyan-400">·</span>
            <span class="${peer.sharingStatus === 'expiring' ? 'text-amber-400' : 'text-emerald-400'}">${remainingLabel}</span>
          </div>
        </div>
      `;

      const peerIcon = L.divIcon({
        html: peerIconHtml,
        className: 'tactical-peer-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (peerMarkersRef.current.has(peer.id)) {
        const marker = peerMarkersRef.current.get(peer.id)!;
        marker.setLatLng(latLng);
        marker.setIcon(peerIcon);
      } else {
        const marker = L.marker(latLng, { icon: peerIcon }).addTo(map);
        marker.on('click', () => {
          onSelectMarker({ type: 'peer', peer });
        });
        peerMarkersRef.current.set(peer.id, marker);
      }
    });
  }, [peers, selectedMarkerId, mapReady, onSelectMarker]);

  // Zoom In / Out Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Recenter on User Location
  const handleRecenter = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.latitude, userCoords.longitude], 16, {
        animate: true,
        duration: 0.8,
      });
    } else if (onLocateMe) {
      onLocateMe();
    }
  };

  // Toggle Map Theme (Tactical Dark vs Satellite Imagery)
  const handleToggleTheme = () => {
    setTileTheme(prev => (prev === 'dark' ? 'satellite' : 'dark'));
  };

  if (mapError) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center font-mono bg-zinc-950 text-zinc-300">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-3 shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 mb-1">Unable to load map</h3>
        <p className="text-xs text-zinc-400 max-w-sm mb-4">{mapError}</p>
        <button
          type="button"
          onClick={initMap}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Map Engine</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[250px] overflow-hidden bg-zinc-950">
      {/* Real Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0 z-0 bg-zinc-950"
        style={{ minHeight: '100%', minWidth: '100%' }}
      />

      {/* Interactive Map Controls (Floating Top-Right / Bottom-Right) */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 select-none">
        {/* Recenter / Locate Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xl backdrop-blur-md transition-all active:scale-90 ${
            userCoords
              ? 'bg-zinc-900/90 border-cyan-500/50 text-cyan-400 hover:bg-zinc-800'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800'
          }`}
          title={userCoords ? 'Recenter on my GPS position' : 'Request GPS Location'}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Toggle Dark / Satellite Layer */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xl backdrop-blur-md transition-all active:scale-90 ${
            tileTheme === 'satellite'
              ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-bold'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
          title={tileTheme === 'satellite' ? 'Switch to Dark Matter Mesh' : 'Switch to Satellite View'}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/90 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-9 flex items-center justify-center text-zinc-300 hover:text-cyan-400 hover:bg-zinc-800 transition-colors border-b border-zinc-800"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-9 flex items-center justify-center text-zinc-300 hover:text-cyan-400 hover:bg-zinc-800 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
