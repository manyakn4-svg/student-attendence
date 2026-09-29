import React from 'react';
import { LayoutDashboard, BookOpen, Plus, CalendarCheck, BarChart3, Menu } from 'lucide-react';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onQuickMark: () => void;
  onOpenMenu: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPage,
  onNavigate,
  onQuickMark,
  onOpenMenu,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'action', label: 'Mark', icon: Plus, isAction: true },
    { id: 'attendance', label: 'Record', icon: CalendarCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <button
                key="action-btn"
                onClick={onQuickMark}
                className="relative -top-3 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95"
                aria-label="Mark Attendance"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          aria-label="More options"
        >
          <Menu className="w-5 h-5 mb-1 stroke-[1.8]" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
};
