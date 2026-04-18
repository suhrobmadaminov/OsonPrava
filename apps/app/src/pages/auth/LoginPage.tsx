import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import AuthTabs from '@/components/auth/AuthTabs';

declare global {
  interface Window {
    onTelegramAuth: (user: Record<string, unknown>) => void;
  }
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Telegram WebApp auto-login attempt (with timeout)
    const tg = (window as any).Telegram;
    if (tg?.WebApp?.initData) {
      setIsSubmitting(true);
      const authTimeout = setTimeout(() => {
        setIsSubmitting(false);
        toast.info(t('auth.loginFailed'), { duration: 5000 });
      }, 8000); // 8 seconds for auto-login

      authService.loginViaTelegramBot(tg.WebApp.initData)
        .then((res) => {
          clearTimeout(authTimeout);
          login(res.user as any, res.accessToken, res.refreshToken);
          toast.success(t('auth.welcome'));
          navigate('/', { replace: true });
        })
        .catch((err) => {
          clearTimeout(authTimeout);
          setIsSubmitting(false);
          const message = err.response?.data?.message || t('auth.pleaseRegister');
          toast.info(message, { duration: 5000 });
        });
    }
  }, [isAuthenticated, navigate, login, t]);

  // Telegram Login Widget callback
  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      try {
        const res = await authService.loginViaTelegram(user as unknown as Parameters<typeof authService.loginViaTelegram>[0]);
        login(res.user as Parameters<typeof login>[0], res.accessToken, res.refreshToken);
        navigate('/', { replace: true });
      } catch {
        toast.error('Telegram authentication failed');
      }
    };
  }, [login, navigate]);

  const onEmailLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const res = await authService.loginWithEmail(data.email, data.password);
      login(res.user, res.accessToken, res.refreshToken);
      toast.success('Login successful!');
      navigate('/', { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadTelegramWidget = () => {
    const existing = document.getElementById('tg-widget');
    if (existing?.children?.length) return;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'EasyPrava_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    existing?.appendChild(script);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-sm w-full"
      >
        {/* Logo */}
        <div className="space-y-2">
          <div className="w-20 h-20 bg-duo-green rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white font-extrabold text-3xl">O</span>
          </div>
          <h1 className="text-3xl font-extrabold">
            <span className="text-duo-green">Oson</span>Prava
          </h1>
          <p className="text-gray-500 dark:text-dark-muted font-semibold">{t('app.tagline')}</p>
        </div>

        {/* Tabs */}
        <AuthTabs
          tabs={[
            { label: 'Email', key: 'email' },
            { label: 'Telegram', key: 'telegram' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'email' && (
          <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-4 text-left">
            <div>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-duo-green text-sm"
                />
              </div>
              {errors.email && <p className="text-duo-red text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-duo-green text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-duo-red text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3.5 font-bold text-base disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-duo-green font-semibold hover:underline">
                Forgot password?
              </Link>
              <Link to="/register" className="text-gray-500 dark:text-dark-muted hover:text-duo-green">
                Create account
              </Link>
            </div>
          </form>
        )}

        {activeTab === 'telegram' && (
          <div className="space-y-4">
            <button
              onClick={loadTelegramWidget}
              className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Send size={20} />
              {t('auth.loginWithTelegram')}
            </button>
            <div id="tg-widget" className="flex justify-center" />
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pt-2">
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
