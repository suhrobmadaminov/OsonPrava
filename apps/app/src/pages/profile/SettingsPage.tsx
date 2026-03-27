import { useTranslation } from 'react-i18next';
import { Moon, Sun, Volume2, VolumeX, Globe } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { LANGUAGES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { language, darkMode, soundEnabled, setLanguage, toggleDarkMode, toggleSound } = useSettingsStore();

  const handleLanguageChange = (code: string) => {
    setLanguage(code as typeof language);
    i18n.changeLanguage(code);
    localStorage.setItem('osonprava-lang', code);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t('nav.settings')}</h1>

      {/* Language */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={20} className="text-duo-blue" />
          <h3 className="font-bold">{t('profile.language')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'py-3 rounded-xl text-sm font-bold transition-all',
                language === lang.code
                  ? 'bg-duo-green text-white'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-muted',
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dark mode */}
      <button
        onClick={toggleDarkMode}
        className="card w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {darkMode ? <Moon size={20} className="text-duo-purple" /> : <Sun size={20} className="text-duo-yellow" />}
          <span className="font-bold">{t('profile.darkMode')}</span>
        </div>
        <div className={cn(
          'w-12 h-7 rounded-full transition-colors flex items-center px-1',
          darkMode ? 'bg-duo-green' : 'bg-gray-300 dark:bg-dark-border',
        )}>
          <div className={cn(
            'w-5 h-5 rounded-full bg-white shadow transition-transform',
            darkMode ? 'translate-x-5' : 'translate-x-0',
          )} />
        </div>
      </button>

      {/* Sound */}
      <button
        onClick={toggleSound}
        className="card w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {soundEnabled ? <Volume2 size={20} className="text-duo-blue" /> : <VolumeX size={20} className="text-gray-400" />}
          <span className="font-bold">{t('profile.sound')}</span>
        </div>
        <div className={cn(
          'w-12 h-7 rounded-full transition-colors flex items-center px-1',
          soundEnabled ? 'bg-duo-green' : 'bg-gray-300 dark:bg-dark-border',
        )}>
          <div className={cn(
            'w-5 h-5 rounded-full bg-white shadow transition-transform',
            soundEnabled ? 'translate-x-5' : 'translate-x-0',
          )} />
        </div>
      </button>
    </div>
  );
}
