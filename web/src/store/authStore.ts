import { create } from 'zustand';
import { User, AuthTokens } from '../types';
import { connectSocket, disconnectSocket } from '../services/socket';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuth: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,

  setAuth: (tokens) => {
    localStorage.setItem('family_circle_access_token', tokens.accessToken);
    localStorage.setItem('family_circle_refresh_token', tokens.refreshToken);
    localStorage.setItem('family_circle_user', JSON.stringify(tokens.user));

    set({
      user: tokens.user,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
    });

    connectSocket();
  },

  setUser: (user) => {
    localStorage.setItem('family_circle_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    const refreshToken = localStorage.getItem('family_circle_refresh_token');
    if (refreshToken) {
      import('../services/api').then(({ api }) => {
        api.post('/auth/logout', { refreshToken }).catch(() => {});
      });
    }

    localStorage.removeItem('family_circle_access_token');
    localStorage.removeItem('family_circle_refresh_token');
    localStorage.removeItem('family_circle_user');

    disconnectSocket();

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  initialize: () => {
    const token = localStorage.getItem('family_circle_access_token');
    const userStr = localStorage.getItem('family_circle_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
        connectSocket();
      } catch {
        localStorage.clear();
      }
    }
  },
}));

