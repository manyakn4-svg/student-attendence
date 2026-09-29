import React from 'react';
import { 
  LayoutDashboard, BookOpen, CheckSquare, History, BarChart3, 
  Calculator, Sparkles, User, Settings, LogOut, GraduationCap, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceBadge } from '../common/AttendanceBadge';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAIAssistant: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenAIAssistant,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { overallStats, logout, session } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calculator', label: 'Skip Calculator', icon: Calculator },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings & SQL', icon: Settings },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Attend<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
              Academic Suite
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-2">
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'calculator' && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Pro
                  </span>
                )}
              </button>
            );
          })}

          {/* AI Advisor Special Item */}
          <div className="pt-4">
            <button
              onClick={() => {
                onOpenAIAssistant();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-indigo-600/5 hover:from-violet-600/20 hover:to-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">AI Attendance Advisor</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                  Powered by Gemini 3.8
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Overall Attendance Summary in Sidebar */}
        <div className="p-4 mx-4 mb-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Status</span>
            <AttendanceBadge status={overallStats.overallStatus} size="sm" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {overallStats.overallPercentage}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ({overallStats.totalAttended}/{overallStats.totalConducted} classes)
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallStats.overallStatus === 'Good'
                  ? 'bg-emerald-500'
                  : overallStats.overallStatus === 'Warning'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, overallStats.overallPercentage))}%` }}
            />
          </div>
        </div>

        {/* User Card / Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950 shrink-0 ring-2 ring-indigo-500/20">
              <img
                src={session?.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Student Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {session?.profile?.full_name || 'CSE Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {session?.profile?.semester || '3rd Sem'} • {session?.profile?.branch || 'CSE'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-900/40 transition-colors shrink-0 cursor-pointer"
            title="Logout of Student Account"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
