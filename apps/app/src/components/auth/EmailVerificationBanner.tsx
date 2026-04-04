import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { useState } from 'react';

export default function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [sending, setSending] = useState(false);

  if (user?.emailVerified) return null;

  const handleResend = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      await authService.resendVerifyEmail(user.email);
      toast.success('Verification email sent!');
    } catch {
      toast.error('Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-duo-yellow/10 border-b border-duo-yellow/20 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Mail size={18} />
          <span className="text-sm font-medium">Email not verified. Please check your inbox.</span>
        </div>
        <button
          onClick={handleResend}
          disabled={sending}
          className="text-sm font-semibold text-duo-yellow hover:underline disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Resend'}
        </button>
      </div>
    </div>
  );
}
