import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function TelegramAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    if (data.hash) {
      // Set timeout for auth attempt
      const timeout = setTimeout(() => {
        setError(true);
        toast.error('Kirish juda uzoq davom etmoqda. Iltimos, qaytadan urinib ko\'ring.');
      }, 10000);

      authService.loginViaTelegram(data as never)
        .then((res) => {
          clearTimeout(timeout);
          login(res.user as Parameters<typeof login>[0], res.accessToken, res.refreshToken);
          toast.success('Xush kelibsiz!');
          navigate('/', { replace: true });
        })
        .catch(() => {
          clearTimeout(timeout);
          setError(true);
          toast.error('Telegram orqali kirish muvaffaqiyatsiz. Email bilan ro\'yxatdan o\'ting.');
          setTimeout(() => navigate('/register', { replace: true }), 3000);
        });
    } else {
      navigate('/register', { replace: true });
    }
  }, [navigate, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
        <div className="text-center space-y-6 max-w-sm">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold">Kirish muvaffaqiyatsiz</h2>
          <p className="text-gray-500">
            Telegram orqali kirishda xatolik yuz berdi. Email bilan ro'yxatdan o'ting.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary w-full py-3"
          >
            Ro'yxatdan o'tish
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-duo-green font-semibold hover:underline"
          >
            Kirish sahifasiga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-[#2AABEE] rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.64-2.88 7.97-3.44 3.8-1.6 4.59-1.87 5.1-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Telegram orqali kirish</h2>
        <p className="text-gray-500">Iltimos, biroz kuting...</p>
      </div>
    </div>
  );
}
