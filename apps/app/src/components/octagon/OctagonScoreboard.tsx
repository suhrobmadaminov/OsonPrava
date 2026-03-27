import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  name: string;
  photoUrl: string | null;
  score: number;
}

interface Props {
  me: Player;
  opponent: Player;
  questionIndex: number;
  totalQuestions: number;
}

function Avatar({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-border flex items-center justify-center">
      <User size={20} className="text-gray-400 dark:text-dark-muted" />
    </div>
  );
}

function PlayerSide({ player, align }: { player: Player; align: 'left' | 'right' }) {
  return (
    <div className={cn('flex items-center gap-2', align === 'right' && 'flex-row-reverse')}>
      <Avatar photoUrl={player.photoUrl} name={player.name} />
      <div className={cn('flex flex-col', align === 'right' && 'items-end')}>
        <span className="text-xs font-bold text-gray-500 dark:text-dark-muted truncate max-w-[80px]">
          {player.name}
        </span>
        <motion.span
          key={player.score}
          initial={{ scale: 1.4, color: '#58CC02' }}
          animate={{ scale: 1, color: undefined }}
          transition={{ duration: 0.4 }}
          className="text-lg font-extrabold"
        >
          {player.score}
        </motion.span>
      </div>
    </div>
  );
}

export default function OctagonScoreboard({ me, opponent, questionIndex, totalQuestions }: Props) {
  const { t } = useTranslation();

  return (
    <div className="card flex items-center justify-between px-4 py-3">
      <PlayerSide player={me} align="left" />

      {/* Center: question progress */}
      <div className="text-center">
        <span className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase">
          {t('octagon.vs')}
        </span>
        <div className="text-sm font-extrabold text-duo-blue">
          {questionIndex + 1}/{totalQuestions}
        </div>
      </div>

      <PlayerSide player={opponent} align="right" />
    </div>
  );
}
