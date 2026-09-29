import React from 'react';
import { 
  GraduationCap, CheckCircle2, TrendingUp, AlertTriangle, Calculator, 
  Database, ShieldCheck, ArrowRight, Sparkles, BarChart3, Users, Zap, BookOpen 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  onTryDemo,
}) => {
  const { theme, toggleTheme } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <nav aria-label="Main Navigation" className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Attend<span className="text-indigo-600 dark:text-indigo-400">Wise</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onTryDemo}
              className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3.5 py-2 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              Demo Preview
            </button>
            <button
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-8 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Academic Management for Engineering &amp; College Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none mb-6">
            Track Your Attendance.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600">
              Stay Ahead.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Manage your classes, monitor attendance, and know exactly where you stand academically. Never fall below the 75% examination threshold again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Explore Instant Demo</span>
            </button>
          </div>

          {/* Interactive UI Mockup Card Preview */}
          <div className="mt-14 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Live Dashboard Preview</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Overall Attendance: 82.4%</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Safe Standing
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Java Programming</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">90%</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">36 of 40 attended</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[90%]" />
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-2">
                  ✓ Can miss 8 classes safely
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Data Structures</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">80%</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">28 of 35 attended</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[80%]" />
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-2">
                  ✓ Can miss 2 classes safely
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">DBMS</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">70%</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">21 of 30 attended (Target 75%)</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[70%]" />
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-2">
                  ⚠ Must attend next 6 consecutive classes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              Everything You Need
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Built Specifically for University Academic Life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Smart Attendance Tracking
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Log classroom sessions in 1-click with lecture topics, dates, and faculty details. Never lose count of conducted classes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Automatic Percentage Calculation
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Mathematically accurate overall and subject-level calculations using total attended classes divided by total conducted classes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Attendance Analytics
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Visual interactive charts comparing subject performance, semester monthly breakdown, and historical attendance trends over time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Low Attendance Alerts
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Instant warnings before you enter attendance detention, with immediate guidance on how many consecutive classes you must attend.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Class-Skip Calculator
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Know with mathematical certainty how many classes you can skip for events or rest while preserving your mandatory attendance score.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Secure Supabase Cloud Storage
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Protected by PostgreSQL Row Level Security (RLS). Your academic records are encrypted, private, and accessible across any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Simple 4-Step Process
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            How AttendWise Works
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
              1
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Create Account</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign up with your college email and set your semester profile.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
              2
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Add Subjects</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define courses with faculty names and custom target percentages.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
              3
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Record Attendance</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mark Present or Absent in 1 tap after every daily lecture.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
              4
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Track Progress</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Know your margins, avoid detention, and ace your semester exams.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              AttendWise
            </span>
            <span className="text-xs text-slate-400">© 2026 Academic Suite</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span>Powered by Supabase &amp; PostgreSQL</span>
            <span>•</span>
            <span>Gemini AI Advisor</span>
            <span>•</span>
            <span>Enterprise RLS Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
