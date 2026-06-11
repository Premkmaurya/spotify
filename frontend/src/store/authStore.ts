import { create } from 'zustand';
import type { User } from '../types';
import { loginUser, registerUser, logoutUser, getMeUser } from '../services/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await loginUser(data);
      const { user } = await getMeUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Login failed. Please check your credentials.',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await registerUser(data);
      // Automatically log in after registration by calling getMe
      const { user } = await getMeUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Registration failed.',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUser();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Logout failed.', isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await getMeUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      // User is not logged in or token is invalid
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
