import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, Moon, Bell, Sparkles, User, Settings, LogOut, 
  Menu, PlusCircle, CheckCircle2, ChevronDown 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenMobileMenu: () => void;
  onOpenAIAssistant: () => void;
  onQuickMark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileMenu,
  onOpenAIAssistant,
  onQuickMark,
}) => {
  const { session, logout, theme, toggleTheme, overallStats } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Academic Dashboard', subtitle: 'Overview of your subject attendance and milestones' },
    subjects: { title: 'Subject Management', subtitle: 'Configure course modules, faculties and target percentages' },
    attendance: { title: 'Mark Attendance', subtitle: 'Record daily lecture sessions and lecture notes' },
    history: { title: 'Attendance History', subtitle: 'Search, filter and manage all logged classroom records' },
    analytics: { title: 'Attendance Analytics', subtitle: 'Interactive trends, subject comparisons and patterns' },
    calculator: { title: 'Class-Skip & Target Calculator', subtitle: 'Calculate safe class skips and recovery requirements' },
    profile: { title: 'Student Profile', subtitle: 'Personal academic identity and enrollment details' },
    settings: { title: 'Settings & Supabase Config', subtitle: 'Database setup, preferences and sample data' },
  };

  const currentInfo = pageTitles[currentPage] || { title: 'AttendWise', subtitle: 'Smart Student Attendance' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Mark Button */}
        <button
          onClick={onQuickMark}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mark Class</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIAssistant}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Open AI Attendance Advisor"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          )}
        </button>

        {/* Dedicated Logout Button */}
        <button
          onClick={logout}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors cursor-pointer"
          title="Sign out of student account"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        {/* Student Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center ring-2 ring-indigo-500/20">
              {session?.profile?.avatar_url ? (
                <img
                  src={session.profile.avatar_url}
                  alt={session.profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                {session?.profile?.full_name || 'Student'}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] truncate max-w-[110px]">
                {session?.profile?.student_id || 'USN Student'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {session?.profile?.full_name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {session?.user?.email}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-500">Overall Attendance:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {overallStats.overallPercentage}%
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings &amp; Database</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
