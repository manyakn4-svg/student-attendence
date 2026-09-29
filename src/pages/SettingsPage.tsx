import React, { useState } from 'react';
import { 
  Settings, Sun, Moon, Database, ShieldCheck, Key, 
  Copy, Check, RefreshCw, Trash2, Sparkles, ExternalLink, CheckCircle2, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSupabaseConfig, saveSupabaseConfig, clearCustomSupabaseConfig } from '../lib/supabase';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';

export const SettingsPage: React.FC = () => {
  const { 
    theme, toggleTheme, loadSampleData, clearUserData, 
    supabaseHealth, checkHealth, syncToSupabase, showToast 
  } = useApp();

  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [isCopied, setIsCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [defaultTarget, setDefaultTarget] = useState<number>(75);
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationLowAlert, setNotificationLowAlert] = useState(true);

  // Complete SQL Schema string for user to copy directly into Supabase
  const sqlSchema = `-- =========================================================================
-- ATTENDWISE: SUPABASE POSTGRESQL SCHEMA FOR PROJECT: ymyyzpomofoslazjjriu
-- =========================================================================
-- 1. Go to: https://supabase.com/dashboard/project/ymyyzpomofoslazjjriu/sql/new
-- 2. Paste this entire script into the SQL editor
-- 3. Click "RUN" to create the 3 tables and security policies.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  student_id TEXT DEFAULT '1CG24CS001',
  college_name TEXT DEFAULT 'Channabasaveshwara Institute of Technology, Gubbi',
  course TEXT DEFAULT 'Computer Science and Engineering (CSE)',
  branch TEXT DEFAULT 'CSE',
  semester TEXT DEFAULT '3rd Semester',
  section TEXT DEFAULT 'A',
  academic_year TEXT DEFAULT '2026-2027',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  faculty_name TEXT DEFAULT '',
  semester TEXT DEFAULT '3rd Semester',
  course TEXT DEFAULT 'Computer Science and Engineering (CSE)',
  target_percentage NUMERIC(5, 2) NOT NULL DEFAULT 75.00 CHECK (target_percentage >= 0 AND target_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
  topic TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_subject_date UNIQUE (user_id, subject_id, attendance_date)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON public.attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(attendance_date);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "subjects_select_policy" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "subjects_insert_policy" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "subjects_update_policy" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "subjects_delete_policy" ON public.subjects FOR DELETE USING (true);

CREATE POLICY "attendance_select_policy" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "attendance_insert_policy" ON public.attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "attendance_update_policy" ON public.attendance_records FOR UPDATE USING (true);
CREATE POLICY "attendance_delete_policy" ON public.attendance_records FOR DELETE USING (true);`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchema);
    setIsCopied(true);
    showToast('success', 'SQL Copied!', 'Paste into Supabase SQL Editor and click Run.');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      clearCustomSupabaseConfig();
      showToast('info', 'Reset to Environment Default', 'Using standard application configuration.');
      return;
    }

    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    showToast('success', 'Supabase Config Saved', 'Application will use your custom Supabase database endpoint.');
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await syncToSupabase();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRecheckHealth = async () => {
    try {
      setIsChecking(true);
      await checkHealth();
      showToast('info', 'Status Refreshed', 'Checked connection to Supabase project.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Settings &amp; Infrastructure
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Theme preferences, Supabase credentials, PostgreSQL RLS schema, and sample dataset
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-800/80 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Supabase Backend Connected
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5 font-mono">
                Project ID: ymyyzpomofoslazjjriu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecheckHealth}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Check Status</span>
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Syncing...' : 'Sync All Data Now'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-indigo-300 uppercase tracking-wider font-bold text-[10px] block mb-1">
              Endpoint URL
            </span>
            <span className="font-mono text-white break-all">
              https://ymyyzpomofoslazjjriu.supabase.co
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-indigo-300 uppercase tracking-wider font-bold text-[10px] block mb-1">
              Publishable API Key
            </span>
            <span className="font-mono text-white break-all">
              sb_publishable_eTvtgVMGFa_aInIrfXCyEQ_xMUmyC0f
            </span>
          </div>
        </div>

        {/* Database Table Setup Notice */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-xs text-white">
              Database Tables Setup (1 Step)
            </p>
            <p className="text-[11px] text-amber-200/90 mt-0.5">
              Copy the SQL below and run it in your Supabase SQL editor so the tables exist in your PostgreSQL database.
            </p>
          </div>
          <a
            href="https://supabase.com/dashboard/project/ymyyzpomofoslazjjriu/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shrink-0 transition-colors"
          >
            <span>Open SQL Editor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Section: Supabase PostgreSQL Schema & RLS Policies */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Supabase PostgreSQL Schema &amp; Policies</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tables: <code className="text-indigo-600 dark:text-indigo-400 font-bold">profiles</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">subjects</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">attendance_records</code>.
            </p>
          </div>
          <button
            onClick={handleCopySQL}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed border border-slate-800">
            {sqlSchema}
          </pre>
        </div>
      </div>

      {/* Section: Appearance & General Preferences */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>General Preferences</span>
        </h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select between light mode or high-contrast dark mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Default Target Percentage */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Default Target Attendance</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard target percentage applied when creating new subjects (default 75%)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="50"
              max="100"
              value={defaultTarget}
              onChange={(e) => setDefaultTarget(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-center bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <span className="text-sm font-bold text-slate-500">%</span>
          </div>
        </div>
      </div>

      {/* Section: Sample Data & Reset Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Demo Data &amp; Reset Tools</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Load 3rd Sem CSE Example Dataset</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loads the 8 courses with example figures (Java 80%, OS 85%, DSA 72.5%, etc.) for evaluation.
            </p>
          </div>
          <button
            onClick={loadSampleData}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors shrink-0"
          >
            Load Example Dataset
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Reset to Clean Zero Attendance</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resets attendance records back to 0 while retaining all 8 CIT Gubbi 3rd Sem CSE subjects.
            </p>
          </div>
          <button
            onClick={() => setIsConfirmClearOpen(true)}
            className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors shrink-0"
          >
            Reset Attendance to 0
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Clear */}
      <ConfirmationDialog
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={clearUserData}
        title="Reset Attendance Records"
        message="Are you sure you want to reset all attendance records to zero? Your 8 3rd Semester CSE subjects will remain intact."
        confirmLabel="Yes, Reset Attendance"
      />
    </div>
  );
};
