import { useState, type ReactElement } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = typeof location.state === 'object' && location.state !== null && 'registered' in location.state && (location.state as { registered?: unknown }).registered === true;
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const clearError = useAuthStore((s) => s.clearError);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (status === 'authenticated' && accessToken !== null) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: { preventDefault(): void }): Promise<void> {
    event.preventDefault();
    clearError();
    try {
      await login(email.trim(), password);
      void navigate('/', { replace: true });
    } catch {
      /* store holds error */
    }
  }

  return (
    <PageShell title="Sign in">
      <form
        className="stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        {registered ? <p className="banner banner--success">Account created. You can sign in now.</p> : null}
        <Input
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          required
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          required
        />
        {error !== null ? <p className="form-error">{error}</p> : null}
        <Button type="submit" loading={status === 'loading'}>
          Sign in
        </Button>
        <p className="muted">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </PageShell>
  );
}
