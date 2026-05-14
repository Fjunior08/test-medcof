import { useState, type ReactElement } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterPage(): ReactElement {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const register = useAuthStore((s) => s.register);
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
      await register(email.trim(), password);
      void navigate('/login', { replace: true, state: { registered: true } });
    } catch {
      /* store holds error */
    }
  }

  return (
    <PageShell title="Create account">
      <form
        className="stack"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <Input
          id="register-email"
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
          id="register-password"
          label="Password (min 8 characters)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          minLength={8}
          required
        />
        {error !== null ? <p className="form-error">{error}</p> : null}
        <Button type="submit" loading={status === 'loading'}>
          Register
        </Button>
        <p className="muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </PageShell>
  );
}
