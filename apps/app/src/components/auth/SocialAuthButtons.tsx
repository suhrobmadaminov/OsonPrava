import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SocialAuthButtonsProps {
  onTelegramLogin: () => void;
  className?: string;
}

export default function SocialAuthButtons({ onTelegramLogin, className }: SocialAuthButtonsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onTelegramLogin}
        className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
      >
        <Send size={20} />
        Login with Telegram
      </motion.button>
    </div>
  );
}
