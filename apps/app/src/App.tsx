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
  const { setUser, setLoading, login } = useAuthStore();
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const init = async () => {
      // Check for tokens in URL params (from web app registration)
      const params = new URLSearchParams(window.location.search);
      const urlAccessToken = params.get('access_token');
      const urlRefreshToken = params.get('refresh_token');

      // If tokens are in URL, use them directly
      if (urlAccessToken && urlRefreshToken) {
        try {
          setAccessToken(urlAccessToken);
          localStorage.setItem('refreshToken', urlRefreshToken);

          // Clean URL (remove tokens from address bar)
          window.history.replaceState({}, document.title, window.location.pathname);

          const user = await authService.getMe();
          login(user, urlAccessToken, urlRefreshToken);
          setLoading(false);
          return;
        } catch {
          // URL tokens invalid, fall through to localStorage check
          localStorage.removeItem('refreshToken');
        }
      }

      // Check localStorage for existing tokens
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
  }, [setUser, setLoading, login]);

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
