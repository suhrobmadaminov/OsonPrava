import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, FileText, BookOpen, GraduationCap, Infinity, Brain,
  Swords, AlertCircle, BarChart3, User, Trophy, Medal, Crown, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { section: 'main', items: [
    { path: '/', icon: Home, labelKey: 'nav.dashboard' },
    { path: '/tickets', icon: FileText, labelKey: 'nav.tickets' },
    { path: '/topics', icon: BookOpen, labelKey: 'nav.topics' },
    { path: '/exam', icon: GraduationCap, labelKey: 'nav.exam' },
    { path: '/marathon', icon: Infinity, labelKey: 'nav.marathon' },
  ]},
  { section: 'practice', items: [
    { path: '/smart-test', icon: Brain, labelKey: 'nav.smartTest' },
    { path: '/octagon', icon: Swords, labelKey: 'nav.octagon' },
    { path: '/mistakes', icon: AlertCircle, labelKey: 'nav.mistakes' },
  ]},
  { section: 'progress', items: [
    { path: '/stats', icon: BarChart3, labelKey: 'nav.stats' },
    { path: '/leaderboard', icon: Trophy, labelKey: 'nav.leaderboard' },
    { path: '/achievements', icon: Medal, labelKey: 'nav.achievements' },
  ]},
  { section: 'account', items: [
    { path: '/profile', icon: User, labelKey: 'nav.profile' },
    { path: '/subscription', icon: Crown, labelKey: 'nav.subscription' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ]},
];

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 flex-col bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200 dark:border-dark-border">
        <div className="w-8 h-8 bg-duo-green rounded-lg flex items-center justify-center">
          <span className="text-white font-extrabold text-sm">O</span>
        </div>
        <span className="font-extrabold text-lg text-duo-green">OsonPrava</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((group) => (
          <div key={group.section} className="mb-4">
            {group.items.map(({ path, icon: Icon, labelKey }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1',
                    isActive
                      ? 'bg-duo-green/10 text-duo-green dark:bg-duo-green/20'
                      : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border',
                  )
                }
              >
                <Icon size={20} />
                <span>{t(labelKey)}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
