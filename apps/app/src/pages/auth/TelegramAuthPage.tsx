import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function TelegramAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    if (data.hash) {
      authService.loginViaTelegram(data as never)
        .then((res) => {
          login(res.user as Parameters<typeof login>[0], res.accessToken, res.refreshToken);
          navigate('/', { replace: true });
        })
        .catch(() => navigate('/login', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, login]);

  return <LoadingSpinner className="min-h-screen" size="lg" />;
}
