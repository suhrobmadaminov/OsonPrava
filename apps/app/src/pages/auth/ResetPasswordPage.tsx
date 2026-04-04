import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';

const resetSchema = z
  .object({
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

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const password = watch('password');

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-duo-red font-bold">Invalid reset link</p>
          <Link to="/forgot-password" className="btn-primary inline-block px-8">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-duo-green/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-duo-green" />
          </div>
          <h1 className="text-2xl font-extrabold">Password Reset!</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            Your password has been reset successfully.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full">
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  const onSubmit = async (data: ResetForm) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token!, data.password, data.confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm w-full">
        <div className="w-16 h-16 bg-duo-orange/20 rounded-full flex items-center justify-center mx-auto">
          <Lock size={28} className="text-duo-orange" />
        </div>
        <h1 className="text-2xl font-extrabold">Reset Password</h1>
        <p className="text-gray-500 dark:text-dark-muted text-sm">Enter your new password</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="New Password"
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
                placeholder="Confirm New Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-duo-green text-sm"
              />
            </div>
            {errors.confirmPassword && <p className="text-duo-red text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3.5 font-bold disabled:opacity-50">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
