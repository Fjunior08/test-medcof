import { useAuthStore } from '@/store/authStore';

export { useAuthStore };

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.status === 'authenticated');
}
