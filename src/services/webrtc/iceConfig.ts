/**
 * WebRTC ICE Server Configuration
 * Reads from environment variables with public STUN fallback.
 * Strictly avoids hardcoding private TURN credentials.
 */

export function getIceServersConfiguration(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [];

  // 1. Primary STUN Server (from ENV or public Google STUN fallback)
  const envStun = import.meta.env.VITE_ICE_STUN_SERVER;
  iceServers.push({
    urls: envStun || ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
  });

  // 2. Optional TURN Relay Server (from ENV only, never hardcoded)
  const envTurnUrl = import.meta.env.VITE_ICE_TURN_SERVER;
  const envTurnUsername = import.meta.env.VITE_ICE_TURN_USERNAME;
  const envTurnCredential = import.meta.env.VITE_ICE_TURN_CREDENTIAL;

  if (envTurnUrl && envTurnUsername && envTurnCredential) {
    iceServers.push({
      urls: envTurnUrl,
      username: envTurnUsername,
      credential: envTurnCredential,
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };
}

export function isTurnConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_ICE_TURN_SERVER &&
    import.meta.env.VITE_ICE_TURN_USERNAME &&
    import.meta.env.VITE_ICE_TURN_CREDENTIAL
  );
}
