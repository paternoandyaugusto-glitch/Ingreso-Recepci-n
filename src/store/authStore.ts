import { create } from 'zustand';

const AUTH_KEY = 'northfield-vms-admin-session';
const SESSION_LENGTH_MS = 15 * 60 * 1000;

interface AuthSession {
  authenticatedAt: number;
  lastActivityAt: number;
}

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  touchSession: () => void;
  validateSession: () => boolean;
}

const readSession = (): AuthSession | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

const writeSession = (session: AuthSession): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

const isSessionValid = (session: AuthSession | null): boolean =>
  Boolean(session && Date.now() - session.lastActivityAt < SESSION_LENGTH_MS);

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: isSessionValid(readSession()),
  login: (password) => {
    const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!configuredPassword || password !== configuredPassword) {
      return false;
    }

    const now = Date.now();
    writeSession({ authenticatedAt: now, lastActivityAt: now });
    set({ isAuthenticated: true });
    return true;
  },
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ isAuthenticated: false });
  },
  touchSession: () => {
    const session = readSession();
    if (!isSessionValid(session)) {
      localStorage.removeItem(AUTH_KEY);
      set({ isAuthenticated: false });
      return;
    }

    writeSession({ authenticatedAt: session!.authenticatedAt, lastActivityAt: Date.now() });
    set({ isAuthenticated: true });
  },
  validateSession: () => {
    const valid = isSessionValid(readSession());
    if (!valid) localStorage.removeItem(AUTH_KEY);
    set({ isAuthenticated: valid });
    return valid;
  },
}));
