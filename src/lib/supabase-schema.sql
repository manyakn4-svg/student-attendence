-- =========================================================================
-- ATTENDWISE: SUPABASE POSTGRESQL SCHEMA FOR PROJECT: ymyyzpomofoslazjjriu
-- Channabasaveshwara Institute of Technology, Gubbi - 3rd Sem CSE
-- =========================================================================
-- 1. Go to: https://supabase.com/dashboard/project/ymyyzpomofoslazjjriu/sql/new
-- 2. Paste this script and click "RUN".

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  student_id TEXT DEFAULT '',
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

-- 2. SUBJECTS TABLE (Includes Course/Branch and Semester)
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  faculty_name TEXT DEFAULT '',
  semester TEXT DEFAULT '3rd Semester',
  course TEXT DEFAULT 'Computer Science and Engineering (CSE)',
  target_percentage NUMERIC(5, 2) NOT NULL DEFAULT 75.00 CHECK (target_percentage >= 0 AND target_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If table already existed, add column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'course') THEN
    ALTER TABLE public.subjects ADD COLUMN course TEXT DEFAULT 'Computer Science and Engineering (CSE)';
  END IF;
END $$;

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
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON public.attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(attendance_date);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

DROP POLICY IF EXISTS "subjects_select_policy" ON public.subjects;
DROP POLICY IF EXISTS "subjects_insert_policy" ON public.subjects;
DROP POLICY IF EXISTS "subjects_update_policy" ON public.subjects;
DROP POLICY IF EXISTS "subjects_delete_policy" ON public.subjects;

DROP POLICY IF EXISTS "attendance_select_policy" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_insert_policy" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_update_policy" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_delete_policy" ON public.attendance_records;

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
