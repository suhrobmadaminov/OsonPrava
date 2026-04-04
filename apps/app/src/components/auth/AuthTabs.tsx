import { cn } from '@/lib/utils';

interface AuthTabsProps {
  tabs: { label: string; key: string }[];
  activeTab: string;
  onChange: (key: string) => void;
}

export default function AuthTabs({ tabs, activeTab, onChange }: AuthTabsProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-dark-border rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all',
            activeTab === tab.key
              ? 'bg-white dark:bg-dark-card text-duo-green shadow-sm'
              : 'text-gray-500 dark:text-dark-muted hover:text-gray-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
