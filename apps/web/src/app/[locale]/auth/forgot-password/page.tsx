'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_URL } from '@/lib/constants';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Xatolik yuz berdi');
      }

      setSuccess(true);
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
            <div className="w-20 h-20 bg-duo-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-duo-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Xabar yuborildi!</h2>
            <p className="text-gray-500 mb-6">
              Agar bu email tizimda mavjud bo'lsa, parolni tiklash havolasi yuborildi.
            </p>
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center gap-2 bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Kirish sahifasiga qaytish
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
            <h1 className="text-3xl font-black text-gray-900">Parolni tiklash</h1>
            <p className="mt-2 text-gray-500">Emailingizni kiriting, parolni tiklash havolasini yuboramiz</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3.5 rounded-xl shadow-[0_4px_0_0_#4CAD01] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5 active:shadow-none"
            >
              {isLoading ? 'Yuborilmoqda...' : 'Tiklash havolasini yuborish'}
            </button>

            <div className="text-center text-sm">
              <Link href={`/${locale}/auth/login`} className="text-duo-green font-semibold hover:underline">
                ← Kirish sahifasiga qaytish
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
