import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AttendanceLevel, AttendanceRecord, OverallStats, Subject, SubjectStats, UserProfile, UserSession } from '../types';
import { authService, profileService, subjectsService, attendanceService, sampleDataService } from '../services/dataService';
import { checkSupabaseHealth, getSupabaseClient, SupabaseHealth } from '../lib/supabase';
import { calculateOverallStats, calculateSubjectStats } from '../utils/calculations';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  session: UserSession | null;
  isLoading: boolean;
  subjects: Subject[];
  records: AttendanceRecord[];
  subjectStats: SubjectStats[];
  overallStats: OverallStats;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
  supabaseHealth: SupabaseHealth;
  checkHealth: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  toggleTheme: () => void;
  refreshData: () => Promise<void>;
  
  // Auth
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, details?: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;

  // Subjects
  addSubject: (data: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Attendance
  addAttendance: (data: Omit<AttendanceRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAttendance: (id: string, data: Partial<AttendanceRecord>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  markPresent: (subjectId: string, date?: string) => Promise<void>;
  markAbsent: (subjectId: string, date?: string) => Promise<void>;
  batchMarkAttendance: (entries: Array<{ subject_id: string; status: 'Present' | 'Absent'; attendance_date: string; topic?: string }>) => Promise<number>;

  // Samples
  loadSampleData: () => Promise<void>;
  clearUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth>({ connected: true, tablesExist: false });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('attendwise_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('attendwise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const checkHealth = async () => {
    const health = await checkSupabaseHealth();
    setSupabaseHealth(health);
  };

  // Initial load
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      await checkHealth();

      const userSession = await authService.getSession();
      setSession(userSession);

      if (userSession?.user?.id) {
        const [userSubjects, userRecords] = await Promise.all([
          subjectsService.getSubjects(userSession.user.id),
          attendanceService.getRecords(userSession.user.id),
        ]);
        setSubjects(userSubjects);
        setRecords(userRecords);
      } else {
        setSubjects([]);
        setRecords([]);
      }
    } catch (err: any) {
      console.error('Error loading user data:', err);
      showToast('error', 'Failed to load data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();

    const client = getSupabaseClient();
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setSubjects([]);
          setRecords([]);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const refreshData = async () => {
    if (!session?.user?.id) return;
    try {
      const [userSubjects, userRecords] = await Promise.all([
        subjectsService.getSubjects(session.user.id),
        attendanceService.getRecords(session.user.id),
      ]);
      setSubjects(userSubjects);
      setRecords(userRecords);
      await checkHealth();
    } catch (err: any) {
      console.error('Error refreshing data:', err);
    }
  };

  const syncToSupabase = async () => {
    if (!session?.user?.id) return;
    try {
      const { subjectsSynced, recordsSynced } = await attendanceService.syncAllToSupabase(session.user.id);
      showToast('success', 'Synced to Supabase!', `${subjectsSynced} subjects & ${recordsSynced} attendance records uploaded to Supabase.`);
      await checkHealth();
    } catch (err: any) {
      showToast('error', 'Sync Failed', err.message || 'Make sure the SQL tables have been created in your Supabase SQL editor.');
    }
  };

  // Derived statistics using mathematically sound formulas
  const subjectStats = useMemo(() => {
    return subjects.map((sub) => calculateSubjectStats(sub, records));
  }, [subjects, records]);

  const overallStats = useMemo(() => {
    return calculateOverallStats(subjects, records);
  }, [subjects, records]);

  // Auth Handlers
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const userSession = await authService.signIn(email, pass);
      setSession(userSession);
      const [userSubjects, userRecords] = await Promise.all([
        subjectsService.getSubjects(userSession.user.id),
        attendanceService.getRecords(userSession.user.id),
      ]);
      setSubjects(userSubjects);
      setRecords(userRecords);
      showToast('success', 'Logged in successfully', `Welcome back, ${userSession.profile.full_name || 'Student'}!`);
      await checkHealth();
    } catch (err: any) {
      showToast('error', 'Login Failed', err.message || 'Invalid email or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string, details?: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const userSession = await authService.signUp(email, pass, name, details);
      setSession(userSession);
      const userSubjects = await subjectsService.getSubjects(userSession.user.id);
      setSubjects(userSubjects);
      // New students start with zero attendance records until entered
      setRecords([]);
      showToast('success', 'Account created!', 'Welcome to CIT Gubbi CSE 3rd Semester Attendance Portal.');
      await checkHealth();
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Could not complete signup');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setSession(null);
      setSubjects([]);
      setRecords([]);
      showToast('info', 'Logged out', 'You have been signed out safely.');
    } catch (err: any) {
      showToast('error', 'Logout Error', err.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      showToast('success', 'Reset link sent', 'Check your email inbox for password reset instructions.');
      return true;
    } catch (err: any) {
      showToast('error', 'Password reset error', err.message);
      return false;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!session?.user?.id) return;
    try {
      const updated = await profileService.updateProfile(data, session.user.id);
      setSession((prev) => (prev ? { ...prev, profile: updated } : null));
      showToast('success', 'Profile updated', 'Your academic profile details have been saved.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  // Subject Handlers
  const addSubject = async (data: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    try {
      const created = await subjectsService.addSubject(session.user.id, data);
      setSubjects((prev) => [created, ...prev]);
      showToast('success', 'Subject added successfully', `${created.name} (${created.code || 'No code'}) saved.`);
      await checkHealth();
    } catch (err: any) {
      showToast('error', 'Failed to add subject', err.message);
      throw err;
    }
  };

  const updateSubject = async (id: string, data: Partial<Subject>) => {
    try {
      const updated = await subjectsService.updateSubject(id, data);
      setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast('success', 'Subject updated', `${updated.name} details refreshed.`);
    } catch (err: any) {
      showToast('error', 'Failed to update subject', err.message);
      throw err;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const sub = subjects.find((s) => s.id === id);
      await subjectsService.deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setRecords((prev) => prev.filter((r) => r.subject_id !== id));
      showToast('success', 'Subject deleted', `${sub?.name || 'Subject'} and associated records were removed.`);
    } catch (err: any) {
      showToast('error', 'Failed to delete subject', err.message);
      throw err;
    }
  };

  // Attendance Handlers
  const addAttendance = async (data: Omit<AttendanceRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    try {
      const created = await attendanceService.addRecord(session.user.id, data);
      setRecords((prev) => [created, ...prev]);
      showToast(
        created.status === 'Present' ? 'success' : 'warning',
        'Attendance recorded',
        `Marked ${created.status} for ${data.attendance_date}. Synchronized to Supabase database.`
      );
      await checkHealth();
    } catch (err: any) {
      showToast('error', 'Failed to record attendance', err.message);
      throw err;
    }
  };

  const updateAttendance = async (id: string, data: Partial<AttendanceRecord>) => {
    try {
      const updated = await attendanceService.updateRecord(id, data);
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast('success', 'Record updated', `Status changed to ${updated.status}.`);
    } catch (err: any) {
      showToast('error', 'Failed to update record', err.message);
      throw err;
    }
  };

  const deleteAttendance = async (id: string) => {
    try {
      await attendanceService.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('info', 'Record removed', 'Attendance session was deleted.');
    } catch (err: any) {
      showToast('error', 'Failed to delete record', err.message);
      throw err;
    }
  };

  const markPresent = async (subjectId: string, date?: string) => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sub = subjects.find((s) => s.id === subjectId);
    const existing = records.find(
      (r) => r.subject_id === subjectId && r.attendance_date === targetDate
    );
    if (existing) {
      await updateAttendance(existing.id, { status: 'Present' });
      showToast('success', 'Marked Present', `${sub?.name || 'Class'} marked Present for ${targetDate}.`);
    } else {
      await addAttendance({
        subject_id: subjectId,
        attendance_date: targetDate,
        status: 'Present',
        topic: 'Lecture Session',
      });
    }
  };

  const markAbsent = async (subjectId: string, date?: string) => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sub = subjects.find((s) => s.id === subjectId);
    const existing = records.find(
      (r) => r.subject_id === subjectId && r.attendance_date === targetDate
    );
    if (existing) {
      await updateAttendance(existing.id, { status: 'Absent' });
      showToast('warning', 'Marked Absent', `${sub?.name || 'Class'} marked Absent for ${targetDate}.`);
    } else {
      await addAttendance({
        subject_id: subjectId,
        attendance_date: targetDate,
        status: 'Absent',
        topic: 'Lecture Session',
      });
    }
  };

  const batchMarkAttendance = async (entries: Array<{ subject_id: string; status: 'Present' | 'Absent'; attendance_date: string; topic?: string }>) => {
    if (!session?.user?.id) return 0;
    try {
      const count = await attendanceService.batchMark(session.user.id, entries);
      await refreshData();
      showToast('success', 'Attendance Logged', `Successfully updated attendance for ${count} classes and synced.`);
      return count;
    } catch (err: any) {
      showToast('error', 'Batch update failed', err.message);
      throw err;
    }
  };

  const loadSampleData = async () => {
    if (!session?.user?.id) return;
    try {
      sampleDataService.loadPromptExampleData(session.user.id);
      await refreshData();
      showToast('success', 'Example Dataset Loaded', 'Loaded demonstration attendance data for all 8 3rd Semester CSE subjects.');
    } catch (err: any) {
      showToast('error', 'Error loading sample data', err.message);
    }
  };

  const clearUserData = async () => {
    if (!session?.user?.id) return;
    try {
      sampleDataService.resetToZero3rdSemSubjects(session.user.id);
      await refreshData();
      showToast('info', 'Attendance Reset', 'Attendance records reset to zero. All 8 3rd Semester CSE subjects retained.');
    } catch (err: any) {
      showToast('error', 'Error resetting data', err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        session,
        isLoading,
        subjects,
        records,
        subjectStats,
        overallStats,
        theme,
        toasts,
        supabaseHealth,
        checkHealth,
        syncToSupabase,
        showToast,
        removeToast,
        toggleTheme,
        refreshData,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        addSubject,
        updateSubject,
        deleteSubject,
        addAttendance,
        updateAttendance,
        deleteAttendance,
        markPresent,
        markAbsent,
        batchMarkAttendance,
        loadSampleData,
        clearUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
