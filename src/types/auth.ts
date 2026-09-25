import { User } from './app';

export interface CredentialVerificationResult {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
  lockoutSeconds?: number;
  sessionToken?: string;
}

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
}

export interface IPrivateCredentialVerifier {
  isInitialized(): Promise<boolean>;
  initializeCredential(passcode: string): Promise<{ success: boolean; error?: string }>;
  verifyCredential(passcode: string): Promise<CredentialVerificationResult>;
  hasActiveSession(): boolean;
  clearSession(): void;
  getLockoutStatus(): LockoutStatus;
}

export interface IAuthService {
  getCurrentUser(): User | null;
  isAuthenticated(): boolean;
  authenticateAsGuest(): User;
}
