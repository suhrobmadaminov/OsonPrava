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
        <div className="space-y-2">
          <div className="w-16 h-16 bg-duo-green rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">Create Account</h1>
          <p className="text-gray-500 dark:text-dark-muted text-sm">
            Join OsonPrava and start learning
          </p>
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
