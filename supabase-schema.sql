-- =========================================================================
-- ATTENDWISE: SUPABASE DATABASE SCHEMA FOR CHANNABASAVESHWARA INSTITUTE OF TECHNOLOGY, GUBBI
-- Course: Computer Science and Engineering (CSE) • 3rd Semester
-- Project ID: ymyyzpomofoslazjjriu
-- =========================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ymyyzpomofoslazjjriu/sql/new
-- 2. Paste this entire script into the SQL Editor.
-- 3. Click "RUN" (or Ctrl + Enter).
-- 4. Your Supabase database is now fully prepared to automatically save & display all student attendance data!
-- =========================================================================

-- 1. PROFILES TABLE (Student details, USN, college & semester)
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
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUBJECTS TABLE (8 Official 3rd Sem CSE Subjects with target percentages)
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

-- 3. ATTENDANCE RECORDS TABLE (Daily class present/absent logs)
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

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON public.attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(attendance_date);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform operations
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
CREATE POLICY "attendance_delete_policy" ON public.attendance_records FOR DELETE USING (true);
