import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { AttendancePage } from './pages/AttendancePage';
import { AttendanceHistoryPage } from './pages/AttendanceHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { ToastContainer } from './components/common/ToastContainer';
import { SubjectModal } from './components/modals/SubjectModal';
import { AttendanceModal } from './components/modals/AttendanceModal';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { Subject, AttendanceRecord } from './types';

const MainApp: React.FC = () => {
  const { session, isLoading, subjects, records, addSubject, updateSubject, addAttendance, updateAttendance } = useApp();

  // Navigation state
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [publicView, setPublicView] = useState<'login' | 'signup' | 'forgot' | 'landing'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceToEdit, setAttendanceToEdit] = useState<AttendanceRecord | null>(null);
  const [defaultAttendanceSubjectId, setDefaultAttendanceSubjectId] = useState<string | undefined>(undefined);

  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Loading state while checking Supabase session
  if (isLoading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Verifying CIT Gubbi Student Session...</p>
        </div>
      </div>
    );
  }

  // PROTECTED ROUTES: If not authenticated, unauthenticated users cannot access student pages
  if (!session) {
    if (publicView === 'signup') {
      return (
        <>
          <SignUpPage
            onNavigateToLogin={() => setPublicView('login')}
            onBackToLanding={() => setPublicView('landing')}
          />
          <ToastContainer />
        </>
      );
    }
    if (publicView === 'forgot') {
      return (
        <>
          <ForgotPasswordPage onBackToLogin={() => setPublicView('login')} />
          <ToastContainer />
        </>
      );
    }
    if (publicView === 'landing') {
      return (
        <>
          <LandingPage
            onGetStarted={() => setPublicView('signup')}
            onLogin={() => setPublicView('login')}
            onTryDemo={() => setPublicView('login')}
          />
          <ToastContainer />
        </>
      );
    }
    // Default unauthenticated route: Professional Student Login Page
    return (
      <>
        <LoginPage
          onNavigateToSignUp={() => setPublicView('signup')}
          onNavigateToForgot={() => setPublicView('forgot')}
          onBackToLanding={() => setPublicView('landing')}
          onLoginSuccess={() => setCurrentPage('dashboard')}
        />
        <ToastContainer />
      </>
    );
  }

  // Handlers for subject modal
  const handleOpenAddSubject = () => {
    setSubjectToEdit(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subject: Subject) => {
    setSubjectToEdit(subject);
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (data: {
    name: string;
    code: string;
    faculty_name: string;
    semester: string;
    target_percentage: number;
  }) => {
    if (subjectToEdit) {
      await updateSubject(subjectToEdit.id, data);
    } else {
      await addSubject(data);
    }
  };

  // Handlers for attendance modal
  const handleOpenAddAttendance = (subjectId?: string) => {
    setAttendanceToEdit(null);
    setDefaultAttendanceSubjectId(subjectId);
    setIsAttendanceModalOpen(true);
  };

  const handleOpenEditAttendance = (record: AttendanceRecord) => {
    setAttendanceToEdit(record);
    setDefaultAttendanceSubjectId(undefined);
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceSubmit = async (data: {
    subject_id: string;
    attendance_date: string;
    status: 'Present' | 'Absent';
    topic?: string;
    notes?: string;
  }) => {
    if (attendanceToEdit) {
      await updateAttendance(attendanceToEdit.id, data);
    } else {
      await addAttendance(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 pb-20 lg:pb-8">
        <Navbar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          onQuickMark={() => handleOpenAddAttendance()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={(page) => setCurrentPage(page)}
              onOpenSubjectModal={handleOpenAddSubject}
              onOpenAttendanceModal={handleOpenAddAttendance}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            />
          )}

          {currentPage === 'subjects' && (
            <SubjectsPage
              onOpenAddModal={handleOpenAddSubject}
              onOpenEditModal={handleOpenEditSubject}
              onOpenAttendanceModal={handleOpenAddAttendance}
              onNavigateToCalculator={() => setCurrentPage('calculator')}
              onNavigateToHistory={() => setCurrentPage('history')}
            />
          )}

          {currentPage === 'attendance' && (
            <AttendancePage
              onOpenSingleModal={() => handleOpenAddAttendance()}
              onOpenSubjectModal={handleOpenAddSubject}
            />
          )}

          {currentPage === 'history' && (
            <AttendanceHistoryPage
              onEditRecord={handleOpenEditAttendance}
              onOpenAddAttendance={() => handleOpenAddAttendance()}
            />
          )}

          {currentPage === 'analytics' && <AnalyticsPage />}

          {currentPage === 'calculator' && <CalculatorPage />}

          {currentPage === 'profile' && <ProfilePage />}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Navigation bar */}
      <MobileNavigation
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onQuickMark={() => handleOpenAddAttendance()}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Global Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSubmit={handleSubjectSubmit}
        subjectToEdit={subjectToEdit}
      />

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        subjects={subjects}
        records={records}
        onSubmit={handleAttendanceSubmit}
        recordToEdit={attendanceToEdit}
        defaultSubjectId={defaultAttendanceSubjectId}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      {/* Notification Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
