import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { updateEmailVerified } = useAuthStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
        updateEmailVerified(true);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Token may be expired.');
      }
    };

    verify();
  }, [token, updateEmailVerified]);

  const handleGoHome = () => navigate('/', { replace: true });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
              <Loader2 size={32} className="text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold">Verifying email...</h1>
            <p className="text-gray-500 dark:text-dark-muted">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-duo-green/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-duo-green" />
            </div>
            <h1 className="text-2xl font-extrabold text-duo-green">Email Verified!</h1>
            <p className="text-gray-500 dark:text-dark-muted">{message}</p>
            <button onClick={handleGoHome} className="btn-primary w-full">
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-duo-red/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-duo-red" />
            </div>
            <h1 className="text-2xl font-extrabold text-duo-red">Verification Failed</h1>
            <p className="text-gray-500 dark:text-dark-muted">{message}</p>
            <div className="space-y-3">
              <Link to="/login" className="btn-primary block w-full">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
