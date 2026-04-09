import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { TELEGRAM_BOT } from '@/lib/constants';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const res = await authService.register(data.email, data.password, data.confirmPassword);
      login(res.user, res.accessToken, res.refreshToken);
      toast.success(res.message || 'Registration successful! Please verify your email.');
      navigate('/verify-email', { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-sm w-full"
      >
        {/* Back button */}
        <div className="flex items-start">
          <Link to="/login" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft size={22} />
          </Link>
        </div>

        {/* Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-[#2AABEE] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white translate-x-[-2px] translate-y-[2px]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.64-2.88 7.97-3.44 3.8-1.6 4.59-1.87 5.1-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Keling, ro'yxatdan o'tamiz!</h1>
          <p className="text-gray-500 dark:text-dark-muted text-sm">
            Telegram orqali ro'yxatdan o'tish uchun quyidagi tugmani bosing.
          </p>
        </div>

        {/* Telegram Login */}
        <div className="space-y-3">
          <a
            href={TELEGRAM_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.64-2.88 7.97-3.44 3.8-1.6 4.59-1.87 5.1-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
            </svg>
            Telegramda tasdiqlash
          </a>
          <p className="text-center text-[10px] text-gray-400 italic px-4">
            Meni bossangiz sizni Telegram botimizga yuboradi. Botimiz sizni tasdiqlagandan so'ng bu yerga qaytib keling.
          </p>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-100 dark:bg-dark-border" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">yoki email orqali</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-dark-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
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
            <div className="mt-2">
              <PasswordStrengthIndicator password={password || ''} />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-duo-green text-sm"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-duo-red text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3.5 font-bold text-base disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-dark-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-duo-green font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
