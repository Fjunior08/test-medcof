import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import { registerAccessTokenResolver } from '@/services/http/auth-token';
import type { AuthUser } from '@/types/auth.types';
import { getErrorMessage } from '@/utils/error-message';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly register: (email: string, password: string) => Promise<void>;
  readonly logout: () => void;
  readonly bootstrap: () => Promise<void>;
  readonly clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      status: 'idle',
      error: null,
      clearError: () => {
        set({ error: null });
      },
      logout: () => {
        set({ accessToken: null, user: null, status: 'unauthenticated', error: null });
      },
      login: async (email, password) => {
        set({ status: 'loading', error: null });
        try {
          const data = await authService.login({ email, password });
          set({
            accessToken: data.accessToken,
            user: data.user,
            status: 'authenticated',
            error: null,
          });
        } catch (err: unknown) {
          set({ status: 'error', error: getErrorMessage(err, 'Login failed') });
          throw err;
        }
      },
      register: async (email, password) => {
        set({ status: 'loading', error: null });
        try {
          await authService.register({ email, password });
          set({ status: 'unauthenticated', error: null });
        } catch (err: unknown) {
          set({ status: 'error', error: getErrorMessage(err, 'Registration failed') });
          throw err;
        }
      },
      bootstrap: async () => {
        const token = get().accessToken;
        if (token === null) {
          set({ user: null, status: 'unauthenticated', error: null });
          return;
        }
        set({ status: 'loading', error: null });
        try {
          const user = await authService.fetchMe();
          set({ user, status: 'authenticated', error: null });
        } catch {
          set({ accessToken: null, user: null, status: 'unauthenticated', error: null });
        }
      },
    }),
    {
      name: 'medcof-auth-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);

registerAccessTokenResolver(() => useAuthStore.getState().accessToken);
