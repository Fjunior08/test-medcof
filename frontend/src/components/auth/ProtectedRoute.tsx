import type { ReactElement, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export function ProtectedRoute({ children }: { readonly children: ReactNode }): ReactElement {
  const accessToken = useAuthStore((s) => s.accessToken);
  const status = useAuthStore((s) => s.status);

  if (status === 'loading') {
    return <Spinner label="Checking session" />;
  }

  if (accessToken === null || status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return <Spinner label="Checking session" />;
}
