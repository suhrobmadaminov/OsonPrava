import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-duo-green/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-duo-green" />
          </div>
          <h1 className="text-2xl font-extrabold">Check your email</h1>
          <p className="text-gray-500 dark:text-dark-muted">
            If an account exists with that email, we've sent a password reset link.
          </p>
          <Link to="/login" className="btn-primary inline-block px-8">
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm w-full">
        <div className="flex items-start">
          <Link to="/login" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft size={22} />
          </Link>
        </div>

        <div className="w-16 h-16 bg-duo-orange/20 rounded-full flex items-center justify-center mx-auto">
          <Mail size={28} className="text-duo-orange" />
        </div>

        <h1 className="text-2xl font-extrabold">Forgot Password?</h1>
        <p className="text-gray-500 dark:text-dark-muted text-sm">
          Enter your email and we'll send you a reset link
        </p>

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

          <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3.5 font-bold disabled:opacity-50">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
