import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

declare global {
  interface Window {
    onTelegramAuth: (user: Record<string, unknown>) => void;
  }
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Telegram WebApp check
    const tg = (window as Record<string, unknown>).Telegram as Record<string, Record<string, string>> | undefined;
    if (tg?.WebApp?.initData) {
      authService.loginViaTelegramBot(tg.WebApp.initData).then((res) => {
        login(res.user as Parameters<typeof login>[0], res.accessToken, res.refreshToken);
        navigate('/', { replace: true });
      });
    }
  }, [isAuthenticated, navigate, login]);

  // Telegram Login Widget callback
  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      try {
        const res = await authService.loginViaTelegram(user as Parameters<typeof authService.loginViaTelegram>[0]);
        login(res.user as Parameters<typeof login>[0], res.accessToken, res.refreshToken);
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Telegram auth failed:', err);
      }
    };
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-sm w-full"
      >
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-duo-green rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white font-extrabold text-3xl">O</span>
          </div>
          <h1 className="text-3xl font-extrabold">
            <span className="text-duo-green">Oson</span>Prava
          </h1>
          <p className="text-gray-500 dark:text-dark-muted font-semibold">
            {t('app.tagline')}
          </p>
        </div>

        {/* Telegram Login Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Load Telegram widget script
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', 'EasyPrava_bot');
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.setAttribute('data-request-access', 'write');
            document.getElementById('tg-widget')?.appendChild(script);
          }}
          className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
        >
          <Send size={22} />
          {t('auth.loginWithTelegram')}
        </motion.button>

        <div id="tg-widget" className="flex justify-center" />

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          {[
            { emoji: '📝', label: '1210+' },
            { emoji: '🎮', label: 'Oktagon' },
            { emoji: '🧠', label: 'SM-2' },
          ].map((item) => (
            <div key={item.label} className="card text-center py-3">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-xs font-bold text-gray-500 dark:text-dark-muted">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
