import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Crown, Flame } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t('profile.title')}</h1>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card text-center space-y-4 py-6">
        <div className="w-20 h-20 rounded-full bg-duo-green/20 flex items-center justify-center mx-auto overflow-hidden">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-extrabold text-duo-green">{user.firstName[0]}</span>
          )}
        </div>

        <div>
          <h2 className="text-xl font-extrabold">
            {user.firstName} {user.lastName || ''}
          </h2>
          {user.username && (
            <p className="text-gray-500 dark:text-dark-muted text-sm">@{user.username}</p>
          )}
        </div>

        <div className="flex justify-center gap-6">
          <div className="text-center">
            <Flame size={20} className="text-duo-orange mx-auto mb-1" />
            <div className="font-bold">{user.streak}</div>
            <div className="text-[10px] text-gray-500 dark:text-dark-muted">Streak</div>
          </div>
          {user.isPremium && (
            <div className="text-center">
              <Crown size={20} className="text-duo-yellow mx-auto mb-1" />
              <div className="font-bold">{t('profile.premium')}</div>
              <div className="text-[10px] text-gray-500 dark:text-dark-muted">{t('subscription.active')}</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/settings')}
          className="card w-full flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <Settings size={20} className="text-gray-500" />
          <span className="font-semibold">{t('nav.settings')}</span>
        </button>

        <button
          onClick={() => navigate('/subscription')}
          className="card w-full flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <Crown size={20} className="text-duo-yellow" />
          <span className="font-semibold">{t('nav.subscription')}</span>
        </button>

        <button
          onClick={handleLogout}
          className="card w-full flex items-center gap-3 hover:shadow-md transition-shadow text-duo-red"
        >
          <LogOut size={20} />
          <span className="font-semibold">{t('auth.logout')}</span>
        </button>
      </div>
    </div>
  );
}
