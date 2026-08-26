import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, role: UserRole, name: string) => void;
  logout: () => void;
}

// For demo purposes we can persist it to localStorage
const getInitialState = (): { user: User | null; isAuthenticated: boolean } => {
  const stored = localStorage.getItem('sbs_auth');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      return { user, isAuthenticated: true };
    } catch (e) {
      return { user: null, isAuthenticated: false };
    }
  }
  return { user: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  login: (username, role, name) => {
    const user = { username, role, name };
    localStorage.setItem('sbs_auth', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('sbs_auth');
    set({ user: null, isAuthenticated: false });
  }
}));
