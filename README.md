# AttendWise — Smart Student Attendance & Percentage Manager

AttendWise is a production-grade academic attendance and percentage management platform built for college and university students. It solves attendance compliance, provides mathematically rigorous class-skip calculations, automated detention alerts, interactive subject analytics, and a Gemini-powered AI Attendance Advisor.

---

## 1. Project Structure

```
├── /src
│   ├── /components
│   │   ├── /ai
│   │   │   └── AIAssistantModal.tsx       # Gemini 3.8 Flash academic advisor modal
│   │   ├── /common
│   │   │   ├── AttendanceBadge.tsx        # Good / Warning / Low status indicator badge
│   │   │   ├── AttendanceProgress.tsx     # Percentage bar with target tick line
│   │   │   ├── ConfirmationDialog.tsx     # Reusable confirmation dialog for deletions
│   │   │   ├── EmptyState.tsx             # Friendly empty states with action triggers
│   │   │   ├── Modal.tsx                  # Accessible backdrop modal dialog wrapper
│   │   │   └── ToastContainer.tsx         # Notification feedback toast banner system
│   │   ├── /layout
│   │   │   ├── MobileNavigation.tsx       # Bottom mobile app bar navigation
│   │   │   ├── Navbar.tsx                 # Top app bar with theme toggle & student avatar
│   │   │   └── Sidebar.tsx                # Desktop navigation with live status widget
│   │   └── /modals
│   │       ├── AttendanceModal.tsx        # Single session attendance logger with impact preview
│   │       └── SubjectModal.tsx           # Course creation and target % editing modal
│   ├── /context
│   │   └── AppContext.tsx                 # Centralized React state context & data coordinator
│   ├── /lib
│   │   ├── supabase.ts                    # Supabase client manager & dynamic credentials
│   │   └── supabase-schema.sql            # Complete PostgreSQL DDL & RLS security policies
│   ├── /pages
│   │   ├── /auth
│   │   │   ├── ForgotPasswordPage.tsx     # Password recovery workflow
│   │   │   ├── LoginPage.tsx              # Email/password authentication & 1-click demo login
│   │   │   └── SignUpPage.tsx             # Academic profile registration form
│   │   ├── AnalyticsPage.tsx              # Recharts trends, monthly breakdown & comparison
│   │   ├── AttendanceHistoryPage.tsx      # Filterable logs, search, pagination & CSV export
│   │   ├── AttendancePage.tsx             # Daily roster quick-logger & subject summaries
│   │   ├── CalculatorPage.tsx             # Class-skip & recovery calculator + What-If simulator
│   │   ├── DashboardPage.tsx              # Main dashboard, summary metric cards & subject table
│   │   ├── LandingPage.tsx                # SaaS marketing landing page with interactive preview
│   │   ├── ProfilePage.tsx                # Student ID, department credentials & avatar picker
│   │   └── SettingsPage.tsx               # Theme switcher, SQL script viewer & Supabase manager
│   ├── /services
│   │   └── dataService.ts                 # Unified Supabase and local persistence service
│   ├── /types
│   │   └── index.ts                       # TypeScript domain interfaces and type declarations
│   ├── /utils
│   │   └── calculations.ts                # Mathematically verified attendance formulas
│   ├── App.tsx                            # Root application component & layout router
│   ├── index.css                          # Tailwind CSS styling, typography & scrollbar
│   └── main.tsx                           # React 19 entry point
├── index.html                             # App HTML entry point & font links
├── metadata.json                          # App metadata & capabilities
├── package.json                           # NPM dependencies and scripts
├── server.ts                              # Express server with Vite middleware & Gemini API endpoint
├── tsconfig.json                          # TypeScript configuration
└── vite.config.ts                         # Vite configuration with Tailwind CSS plugin
```

---

## 2. Mathematical Attendance Formulas

AttendWise adheres strictly to mathematically rigorous formulas:

### A. Subject Attendance
$$\text{Attendance Percentage} = \left(\frac{\text{Classes Attended}}{\text{Classes Conducted}}\right) \times 100$$
*(Clamped between 0% and 100%, rounded to 1 decimal place).*

### B. Overall Attendance
$$\text{Overall Attendance} = \left(\frac{\sum \text{Classes Attended across all subjects}}{\sum \text{Classes Conducted across all subjects}}\right) \times 100$$
*(Note: Never a simple average of subject percentages).*

### C. Class-Skip Calculator ("How many classes can I miss?")
Find the largest integer $n \ge 0$ such that:
$$\frac{\text{Attended}}{\text{Conducted} + n} \ge \frac{\text{Target}}{100}$$
Solving for $n$:
$$n = \left\lfloor \frac{\text{Attended} \times 100}{\text{Target}} - \text{Conducted} \right\rfloor$$
*(If current percentage is already below target, $n = 0$.)*

### D. Recovery Requirement ("How many classes do I need to attend?")
Find the smallest integer $n \ge 1$ such that:
$$\frac{\text{Attended} + n}{\text{Conducted} + n} \ge \frac{\text{Target}}{100}$$
Solving for $n$:
$$n = \left\lceil \frac{\text{Target} \times \text{Conducted} - 100 \times \text{Attended}}{100 - \text{Target}} \right\rceil$$
*(If already at or above target, $n = 0$. If target is 100% and any class was missed, flagged as mathematically impossible).*

---

## 3. Supabase Database Schema & RLS Policies

Run this complete SQL script in your **Supabase Dashboard → SQL Editor**:

```sql
-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  student_id TEXT DEFAULT '',
  college_name TEXT DEFAULT '',
  course TEXT DEFAULT '',
  branch TEXT DEFAULT '',
  semester TEXT DEFAULT '1',
  section TEXT DEFAULT 'A',
  academic_year TEXT DEFAULT '2026-2027',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  faculty_name TEXT DEFAULT '',
  semester TEXT DEFAULT '1',
  target_percentage NUMERIC(5, 2) NOT NULL DEFAULT 75.00 CHECK (target_percentage >= 0 AND target_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
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

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subjects" ON public.subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own attendance" ON public.attendance_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attendance" ON public.attendance_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attendance" ON public.attendance_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own attendance" ON public.attendance_records FOR DELETE USING (auth.uid() = user_id);
```

---

## 4. Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
# Gemini AI API Key (configured automatically in Google AI Studio or set manually)
GEMINI_API_KEY="AIzaSy..."

# Public URL
APP_URL="http://localhost:3000"

# Supabase Credentials (optional: you can also configure these in Settings UI)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

---

## 5. Local Development Instructions

1. Clone or download the repository:
   ```bash
   git clone <repo-url>
   cd attendwise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the full-stack development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. Build for production:
   ```bash
   npm run build
   ```

5. Run production server:
   ```bash
   npm start
   ```

---

## 6. GitHub Setup Instructions

```bash
git init
git add .
git commit -m "feat: complete production-ready AttendWise academic attendance platform"
git branch -M main
git remote add origin https://github.com/<your-username>/attendwise.git
git push -u origin main
```
