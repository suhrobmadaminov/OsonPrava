import { useNavigate } from 'react-router-dom';
import { useOctagonStore } from '@/stores/octagonStore';
import { useAuthStore } from '@/stores/authStore';
import OctagonResult from '@/components/octagon/OctagonResult';
import { socketService } from '@/services/socketService';
import { useEffect } from 'react';

type Result = 'win' | 'lose' | 'draw';

function getResult(myScore: number, opponentScore: number): Result {
  if (myScore > opponentScore) return 'win';
  if (myScore < opponentScore) return 'lose';
  return 'draw';
}

export default function OctagonResultsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { myScore, opponentScore, opponent, reset } = useOctagonStore();

  useEffect(() => {
    // Disconnect socket when viewing results
    socketService.disconnect();
  }, []);

  const handlePlayAgain = () => {
    reset();
    navigate('/octagon', { replace: true });
  };

  // If no match data, redirect to lobby
  if (!opponent) {
    navigate('/octagon', { replace: true });
    return null;
  }

  const result = getResult(myScore, opponentScore);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <OctagonResult
        result={result}
        myScore={myScore}
        opponentScore={opponentScore}
        opponentName={opponent.firstName}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
