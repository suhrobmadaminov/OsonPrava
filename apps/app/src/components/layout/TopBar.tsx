import { useTranslation } from 'react-i18next';
import { Bell, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function TopBar() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useSettingsStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto w-full lg:px-6">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 bg-duo-green rounded-lg flex items-center justify-center">
            <span className="text-white font-extrabold text-xs">O</span>
          </div>
          <span className="font-extrabold text-duo-green">{t('app.name')}</span>
        </div>

        {/* Streak badge */}
        <div className="hidden lg:flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1.5 bg-duo-yellow/10 text-duo-yellow px-3 py-1.5 rounded-full text-sm font-bold">
              🔥 {user.streak}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-duo-red rounded-full" />
          </button>

          {user?.photoUrl && (
            <img src={user.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          )}
        </div>
      </div>
    </header>
  );
}
