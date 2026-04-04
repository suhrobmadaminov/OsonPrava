'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ResetPasswordContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: '', color: 'bg-gray-200', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: 'Zaif', color: 'bg-duo-red', width: 'w-1/3' };
    if (score <= 3) return { label: "O'rtacha", color: 'bg-duo-yellow', width: 'w-2/3' };
    return { label: 'Kuchli', color: 'bg-duo-green', width: 'w-full' };
  };

  const strength = passwordStrength(password);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Reset token topilmadi');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }

    if (password.length < 8) {
      setError('Parol kamida 8 belgi bo\'lishi kerak');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Parol katta harf, kichik harf va raqamni o\'z ichiga olishi kerak');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.osonprava.uz/api/v1'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password, confirmNewPassword: confirmPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Parolni tiklashda xatolik');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-green-50 via-white to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-10 text-center">
            <div className="w-20 h-20 bg-duo-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-duo-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Token topilmadi</h2>
            <p className="text-gray-500 mb-6">
              Parolni tiklash havolasini email orqali oling.
            </p>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="inline-flex items-center gap-2 bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Parolni tiklash
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-green-50 via-white to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-10">
            <div className="w-20 h-20 bg-duo-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-duo-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Parol tiklandi!</h2>
            <p className="text-gray-500 mb-6">
              Parolingiz muvaffaqiyatli tiklandi. Endi yangi parol bilan kirishingiz mumkin.
            </p>
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center gap-2 bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Kirish
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-green-50 via-white to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-duo-green">
                <span className="text-2xl font-extrabold text-white">E</span>
              </div>
              <span className="text-2xl font-extrabold text-gray-900">
                Easy<span className="text-duo-green">Prava</span>
              </span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900">Yangi parol o'rnating</h1>
            <p className="mt-2 text-gray-500">Kuchli parol tanlang</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-duo-red text-sm font-medium rounded-xl p-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Yangi parol</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-duo-green focus:outline-none focus:ring-2 focus:ring-duo-green/20 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
                </div>
              )}
              {/* Password requirements */}
              {password && (
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  <li className={password.length >= 8 ? 'text-duo-green' : ''}>✓ Kamida 8 belgi</li>
                  <li className={/[A-Z]/.test(password) ? 'text-duo-green' : ''}>✓ Katta harf</li>
                  <li className={/[a-z]/.test(password) ? 'text-duo-green' : ''}>✓ Kichik harf</li>
                  <li className={/\d/.test(password) ? 'text-duo-green' : ''}>✓ Raqam</li>
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Parolni tasdiqlang</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-duo-green focus:outline-none focus:ring-2 focus:ring-duo-green/20 text-sm"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-duo-red text-xs mt-1">Parollar mos kelmadi</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3.5 rounded-xl shadow-[0_4px_0_0_#4CAD01] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5 active:shadow-none"
            >
              {isLoading ? 'Saqlanmoqda...' : 'Parolni saqlash'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
