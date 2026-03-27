import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { useOctagonStore } from '@/stores/octagonStore';
import { socketService } from '@/services/socketService';
import MatchmakingSpinner from '@/components/octagon/MatchmakingSpinner';

export default function OctagonLobbyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { status, setSearching, setMatched, reset } = useOctagonStore();

  useEffect(() => {
    // Reset state when entering the lobby
    reset();
  }, [reset]);

  useEffect(() => {
    if (status !== 'searching') return;

    const socket = socketService.connect();

    socketService.onMatchFound((data) => {
      setMatched(data.matchId, data.opponent);
      navigate(`/octagon/match/${data.matchId}`);
    });

    // Cleanup listeners on unmount
    return () => {
      if (status === 'searching') {
        socketService.cancelSearch();
      }
      socketService.offAll();
    };
  }, [status, navigate, setMatched]);

  const handleFindMatch = () => {
    setSearching();
    socketService.connect();
    socketService.findMatch();
  };

  const handleCancel = () => {
    socketService.cancelSearch();
    socketService.disconnect();
    reset();
  };

  if (status === 'searching') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <MatchmakingSpinner onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-sm w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-duo-blue/10 rounded-full flex items-center justify-center mx-auto"
        >
          <Swords size={48} className="text-duo-blue" />
        </motion.div>

        {/* Title & description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold">{t('octagon.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted font-semibold leading-relaxed">
            {t('octagon.description')}
          </p>
        </div>

        {/* Find opponent button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFindMatch}
          className="w-full bg-duo-blue hover:bg-duo-blue/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
        >
          <Swords size={22} />
          {t('octagon.findOpponent')}
        </motion.button>
      </motion.div>
    </div>
  );
}
