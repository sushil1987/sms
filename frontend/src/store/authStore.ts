import { create } from 'zustand';
import api from '../lib/api';

export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('sms_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem('sms_token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('sms_token');
      set({ user: null, token: null });
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem('sms_token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get('/me');
      set({ user: data, token, isLoading: false });
    } catch {
      localStorage.removeItem('sms_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
