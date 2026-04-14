'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { APP_URL, TELEGRAM_BOT } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Parol kamida 8 belgi bo\'lishi kerak');
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Parol katta harf, kichik harf va raqamni o\'z ichiga olishi kerak');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.osonprava.uz/api/v1'}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors from Django backend
        let errorMessage = 'Ro\'yxatdan o\'tishda xatolik';

        if (typeof data === 'object' && data !== null) {
          if (data.message) {
            if (typeof data.message === 'object') {
              // Extract first error from the errors object
              const fieldErrors = Object.values(data.message);
              errorMessage = fieldErrors.length > 0 ? String(fieldErrors[0]) : errorMessage;
            } else {
              errorMessage = data.message;
            }
          } else if (data.detail) {
            errorMessage = data.detail;
          } else if (data.email) {
            errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
          } else if (data.password) {
            errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
          } else if (data.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }

        throw new Error(String(errorMessage));
      }

      setSuccess(true);

      // Store tokens
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

      // Redirect with tokens in URL params (cross-domain auth)
      setTimeout(() => {
        const url = new URL(APP_URL);
        url.searchParams.set('access_token', data.accessToken);
        url.searchParams.set('refresh_token', data.refreshToken);
        window.location.href = url.toString();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h2 className="text-2xl font-black text-gray-900 mb-2">Muvaffaqiyatli ro'yxatdan o'tdingiz!</h2>
            <p className="text-gray-500">Ilovaga yo'naltirilmoqda...</p>
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
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={`/${locale}`} className="inline-flex flex-col items-center gap-4 mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-[#2AABEE] shadow-xl shadow-blue-500/30">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white translate-x-[-2px] translate-y-[2px]">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.64-2.88 7.97-3.44 3.8-1.6 4.59-1.87 5.1-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-gray-900">
                Oson<span className="text-duo-green">Prava</span>
              </span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900">Keling, ro'yxatdan o'tamiz!</h1>
            <p className="mt-2 text-gray-500">Telegram orqali ro'yxatdan o'tish uchun quyidagi tugmani bosing. So'ng shu joyga qaytib keling.</p>
          </div>

          <div className="mb-8">
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
            <p className="text-center text-xs text-gray-400 mt-3 italic">
              Meni bossangiz sizni Telegram botimizga yuboradi. Botimiz sizni tasdiqlagandan so'ng bu yerga qaytib keling.
            </p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">yoki email orqali</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-duo-red text-sm font-medium rounded-xl p-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-duo-green focus:outline-none focus:ring-2 focus:ring-duo-green/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Parol</label>
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
              {isLoading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Akkauntingiz bormi? </span>
              <Link href={`/${locale}/auth/login`} className="text-duo-green font-semibold hover:underline">
                Kirish
              </Link>
            </div>
          </form>

        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          App-ga o'tish: <a href={APP_URL} className="text-duo-green font-semibold hover:underline">app.osonprava.uz</a>
        </p>
      </motion.div>
    </div>
  );
}
