import { create } from 'zustand';
import { api, setAccessToken } from '../api/client';
import type { Organizer } from '../types';

type AuthState = {
  organizer: Organizer | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    instagramHandle?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  organizer: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const { data } = await api.get<Organizer>('/auth/me');
      set({ organizer: data, isHydrated: true });
    } catch {
      await setAccessToken(null);
      set({ organizer: null, isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{
        accessToken: string;
        organizer: Organizer;
      }>('/auth/login', { email, password });
      await setAccessToken(data.accessToken);
      set({ organizer: data.organizer });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password, instagramHandle) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{
        accessToken: string;
        organizer: Organizer;
      }>('/auth/register', { name, email, password, instagramHandle });
      await setAccessToken(data.accessToken);
      set({ organizer: data.organizer });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await setAccessToken(null);
    set({ organizer: null });
  },
}));
