import { useEffect, useState, type ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import { UiProvider } from '@/contexts/ui-context';
import { Spinner } from '@/components/ui/Spinner';
import { AppRouter } from '@/routes/AppRouter';

export function App(): ReactElement {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void useAuthStore
      .getState()
      .bootstrap()
      .finally(() => {
        setReady(true);
      });
  }, []);

  if (!ready) {
    return <Spinner label="Starting" />;
  }

  return (
    <UiProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </UiProvider>
  );
}
