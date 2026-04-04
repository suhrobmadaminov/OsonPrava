'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { APP_URL } from '@/lib/constants';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (!token) {
      setError('Verification token topilmadi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.osonprava.uz/api/v1'}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Verification failed');
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
              Emailingizdagi tasdiqlash havolasini bosing yoki qayta urinib ko'ring.
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
            <h2 className="text-2xl font-black text-gray-900 mb-2">Email tasdiqlandi!</h2>
            <p className="text-gray-500 mb-6">
              Emailingiz muvaffaqiyatli tasdiqlandi. Endi to'liq foydalanishingiz mumkin.
            </p>
            <a
              href={APP_URL}
              className="inline-flex items-center gap-2 bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Ilovaga o'tish
            </a>
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
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-10 text-center">
          <div className="w-20 h-20 bg-duo-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-duo-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Emailni tasdiqlash</h2>
          <p className="text-gray-500 mb-6">
            Emailingizni tasdiqlash uchun quyidagi tugmani bosing.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-duo-red text-sm font-medium rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-3.5 rounded-xl shadow-[0_4px_0_0_#4CAD01] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5 active:shadow-none"
          >
            {isLoading ? 'Tasdiqlanmoqda...' : 'Emailni tasdiqlash'}
          </button>

          <Link
            href={`/${locale}/auth/login`}
            className="inline-block mt-4 text-duo-green font-semibold hover:underline"
          >
            Kirish sahifasiga qaytish
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
