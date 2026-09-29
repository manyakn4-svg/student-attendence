import React, { useState } from 'react';
import { 
  GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, 
  AlertCircle, ShieldCheck, School, BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
  onBackToLanding?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignUp,
  onNavigateToForgot,
  onBackToLanding,
  onLoginSuccess,
}) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      // Clear, readable error message directly from Supabase
      const message = err?.message || 'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      {/* Background Decorative Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* College Crest & Identity Badge */}
        <div className="flex flex-col items-center text-center">
          <div 
            onClick={onBackToLanding}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 mb-3.5 hover:scale-105 transition-transform cursor-pointer"
            title="CIT Gubbi Attendance Portal"
          >
            <GraduationCap className="w-8 h-8" />
          </div>

          {/* College Name */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <School className="w-3.5 h-3.5 shrink-0" />
            <span>Channabasaveshwara Institute of Technology, Gubbi</span>
          </div>

          {/* Department */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Computer Science and Engineering</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">3rd Semester</span>
          </div>

          {/* Heading */}
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Login
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Sign in with your student credentials to monitor subject attendance, attendance thresholds &amp; analytics.
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-9 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs">
          {/* Error Message Banner */}
          {error && (
            <div 
              role="alert"
              className="mb-5 flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in zoom-in-95 duration-150"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <p className="font-bold">Authentication Failed</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 text-xs font-bold px-1"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="student-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Student Email / College Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="student-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. 1cg24cs001@cittumkur.ac.in or email"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="student-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="student-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
                />
                {/* Show/Hide Password Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-hidden focus:text-indigo-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Student Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Create Account / Sign Up link */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New 3rd Semester CSE student?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
              >
                Create Account / Sign Up
              </button>
            </p>
          </div>

          {/* Security & Project Info Badge */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Supabase Auth Protected</span>
            </span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              8 Subjects Ready
            </span>
          </div>
        </div>

        {/* Back to Homepage / Overview Link */}
        {onBackToLanding && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              ← Back to Portal Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
