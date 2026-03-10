import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  grade: string | null;
  subjects: string[] | null;
  display_name?: string | null;
  avatar_url?: string | null;
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setAuth: (user: User | null, profile: Profile | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuth: (user, profile) => set({ user, profile, isLoading: false }),
  clearAuth: () => set({ user: null, profile: null, isLoading: false }),
}));
