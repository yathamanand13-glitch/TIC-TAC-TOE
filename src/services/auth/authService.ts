import { User } from '../../types/app';
import { IAuthService } from '../../types/auth';

const STORAGE_KEY_AUTH_USER = 'vortex_auth_user_v1';

class AuthService implements IAuthService {
  private currentUser: User | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        // Authenticate as active local operator boundary
        this.authenticateAsGuest();
      }
    } catch {
      this.authenticateAsGuest();
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public authenticateAsGuest(): User {
    const operator: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      username: 'tactician_prime',
      displayName: 'Commander Nova',
      role: 'operator',
      authenticatedAt: Date.now(),
    };
    this.currentUser = operator;
    try {
      sessionStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(operator));
    } catch {
      // Storage unavailable fallback
    }
    return operator;
  }
}

export const authService = new AuthService();
