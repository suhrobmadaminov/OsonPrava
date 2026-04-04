'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { APP_URL, TELEGRAM_BOT } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'email' | 'telegram'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tgWidgetReady, setTgWidgetReady] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.osonprava.uz/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = APP_URL;
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTelegramWidget = () => {
    if (tgWidgetReady) return;
    const existing = document.getElementById('tg-widget-login');
    if (!existing) return;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'OsonPravaBot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    existing.appendChild(script);
    setTgWidgetReady(true);
  };

  useEffect(() => {
    if (activeTab === 'telegram') {
      loadTelegramWidget();
    }
  }, [activeTab]);

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
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-duo-green">
                <span className="text-2xl font-extrabold text-white">O</span>
              </div>
              <span className="text-2xl font-extrabold text-gray-900">
                Oson<span className="text-duo-green">Prava</span>
              </span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900">Kirish</h1>
            <p className="mt-2 text-gray-500">Akkauntingizga kiring</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-duo-green shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setActiveTab('telegram')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'telegram'
                  ? 'bg-white text-duo-green shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Telegram
            </button>
          </div>

          {/* Email Form */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3.5 rounded-xl shadow-[0_4px_0_0_#4CAD01] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5 active:shadow-none"
              >
                {isLoading ? 'Kirish...' : 'Kirish'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <a href={`${APP_URL}/forgot-password`} className="text-duo-green font-semibold hover:underline">
                  Parolni unutdingizmi?
                </a>
                <Link href={`/${locale}/auth/register`} className="text-gray-500 hover:text-duo-green font-semibold">
                  Ro'yxatdan o'tish
                </Link>
              </div>
            </form>
          )}

          {/* Telegram Login */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div
                id="tg-widget-login"
                className="flex justify-center min-h-[48px]"
              />
              <div className="text-center">
                <a
                  href={TELEGRAM_BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Bot orqali kirish
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          App-ga o'tish: <a href={APP_URL} className="text-duo-green font-semibold hover:underline">app.osonprava.uz</a>
        </p>
      </motion.div>
    </div>
  );
}
