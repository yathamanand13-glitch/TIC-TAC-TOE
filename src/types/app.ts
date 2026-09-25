export type ApplicationMode = 'GAME_MODE' | 'PRIVATE_MODE_LOCKED' | 'PRIVATE_MODE';

export type PrivateSection = 'chats' | 'calls' | 'map' | 'profile' | 'settings';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'operator' | 'guest';
  authenticatedAt: number;
}
