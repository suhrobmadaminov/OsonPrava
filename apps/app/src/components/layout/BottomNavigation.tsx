import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, FileText, Brain, Swords, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.dashboard' },
  { path: '/tickets', icon: FileText, labelKey: 'nav.tickets' },
  { path: '/smart-test', icon: Brain, labelKey: 'nav.smartTest' },
  { path: '/octagon', icon: Swords, labelKey: 'nav.octagon' },
  { path: '/stats', icon: BarChart3, labelKey: 'nav.stats' },
];

export default function BottomNavigation() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border lg:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-duo-green'
                  : 'text-gray-400 dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text',
              )
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-semibold">{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
