import {
  generateSalt,
  hashPasswordWithSalt,
  timingSafeEqual,
  generateSessionToken,
} from '../../lib/crypto';
import {
  IPrivateCredentialVerifier,
  CredentialVerificationResult,
  LockoutStatus,
} from '../../types/auth';

const STORAGE_VAULT_SALT = 'vortex_pv_salt_v1';
const STORAGE_VAULT_HASH = 'vortex_pv_hash_v1';
const STORAGE_LOCKOUT_UNTIL = 'vortex_pv_lockout_v1';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds lockout

class PrivateCredentialVerifier implements IPrivateCredentialVerifier {
  // In-memory sensitive session token (never kept in React state or visible DOM)
  private activeSessionToken: string | null = null;
  private failedAttempts: number = 0;
  private lockoutUntil: number = 0;

  constructor() {
    this.restoreLockout();
  }

  private restoreLockout(): void {
    try {
      const storedLockout = sessionStorage.getItem(STORAGE_LOCKOUT_UNTIL);
      if (storedLockout) {
        const until = parseInt(storedLockout, 10);
        if (until > Date.now()) {
          this.lockoutUntil = until;
        } else {
          sessionStorage.removeItem(STORAGE_LOCKOUT_UNTIL);
        }
      }
    } catch {
      // Fallback
    }
  }

  public async isInitialized(): Promise<boolean> {
    try {
      const hash = localStorage.getItem(STORAGE_VAULT_HASH);
      const salt = localStorage.getItem(STORAGE_VAULT_SALT);
      return Boolean(hash && salt);
    } catch {
      return false;
    }
  }

  /**
   * Initializes the private passcode credential.
   * Generates a cryptographic salt and one-way PBKDF2 hash.
   * Never stores plaintext. No hardcoded credentials.
   */
  public async initializeCredential(
    passcode: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!passcode || passcode.trim().length < 4) {
      return { success: false, error: 'Passcode must be at least 4 characters.' };
    }

    try {
      const salt = await generateSalt();
      const hash = await hashPasswordWithSalt(passcode, salt);

      localStorage.setItem(STORAGE_VAULT_SALT, salt);
      localStorage.setItem(STORAGE_VAULT_HASH, hash);

      // Auto-session on fresh creation
      this.activeSessionToken = generateSessionToken();
      this.failedAttempts = 0;
      this.lockoutUntil = 0;

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Cryptographic failure during initialization: ' + (err as Error).message,
      };
    }
  }

  public getLockoutStatus(): LockoutStatus {
    const now = Date.now();
    if (this.lockoutUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((this.lockoutUntil - now) / 1000),
      };
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  /**
   * Verifies the provided private passcode against the salted PBKDF2 hash.
   * Employs constant-time string comparison, brute-force rate-limiting and session generation.
   */
  public async verifyCredential(passcode: string): Promise<CredentialVerificationResult> {
    const lockout = this.getLockoutStatus();
    if (lockout.isLocked) {
      return {
        success: false,
        error: `Security threshold exceeded. Locked out for ${lockout.remainingSeconds}s.`,
        lockoutSeconds: lockout.remainingSeconds,
      };
    }

    const salt = localStorage.getItem(STORAGE_VAULT_SALT);
    const storedHash = localStorage.getItem(STORAGE_VAULT_HASH);

    if (!salt || !storedHash) {
      return {
        success: false,
        error: 'Private credentials not initialized.',
      };
    }

    try {
      // Artificially simulate secure KDF derivation time to prevent timing analysis
      const candidateHash = await hashPasswordWithSalt(passcode, salt);
      const isMatch = timingSafeEqual(candidateHash, storedHash);

      if (isMatch) {
        // Successful verification
        this.failedAttempts = 0;
        this.lockoutUntil = 0;
        sessionStorage.removeItem(STORAGE_LOCKOUT_UNTIL);
        this.activeSessionToken = generateSessionToken();

        return {
          success: true,
          sessionToken: this.activeSessionToken,
        };
      } else {
        // Failed attempt
        this.failedAttempts += 1;
        const attemptsRemaining = Math.max(0, MAX_FAILED_ATTEMPTS - this.failedAttempts);

        if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          this.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
          try {
            sessionStorage.setItem(STORAGE_LOCKOUT_UNTIL, this.lockoutUntil.toString());
          } catch {
            // ignore
          }
          this.failedAttempts = 0; // reset for next round after lockout
          return {
            success: false,
            error: 'Authentication failed. Maximum attempts exceeded. Lockout active.',
            attemptsRemaining: 0,
            lockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
          };
        }

        return {
          success: false,
          error: 'Invalid private credential.',
          attemptsRemaining,
        };
      }
    } catch (err) {
      return {
        success: false,
        error: 'Verification engine error: ' + (err as Error).message,
      };
    }
  }

  public hasActiveSession(): boolean {
    return Boolean(this.activeSessionToken);
  }

  public clearSession(): void {
    // Explicitly zero and drop in-memory token
    this.activeSessionToken = null;
  }
}

export const credentialVerifier = new PrivateCredentialVerifier();
