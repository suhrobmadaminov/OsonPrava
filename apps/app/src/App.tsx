import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AppRouter from './router';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { authService } from './services/authService';
import { setAccessToken } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const init = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await import('./services/api').then((m) =>
          m.default.post('/auth/refresh', { refreshToken }),
        );
        setAccessToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        const user = await authService.getMe();
        setUser(user);
      } catch {
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <AppRouter />
        <Toaster position="top-center" richColors />
      </AuthInitializer>
    </QueryClientProvider>
  );
}
