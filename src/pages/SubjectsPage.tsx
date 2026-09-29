import React, { useState } from 'react';
import { 
  BookOpen, Plus, Edit2, Trash2, CalendarCheck, Search, 
  User, GraduationCap, ChevronRight, Calculator, AlertTriangle,
  Check, X, History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject, SubjectStats } from '../types';
import { AttendanceBadge } from '../components/common/AttendanceBadge';
import { AttendanceProgress } from '../components/common/AttendanceProgress';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';

interface SubjectsPageProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (subject: Subject) => void;
  onOpenAttendanceModal: (subjectId: string) => void;
  onNavigateToCalculator: () => void;
  onNavigateToHistory?: () => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenAttendanceModal,
  onNavigateToCalculator,
  onNavigateToHistory,
}) => {
  const { subjects, subjectStats, deleteSubject, markPresent, markAbsent } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered stats
  const filteredStats = subjectStats.filter((stat) => {
    const matchesSearch =
      stat.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stat.subject.code && stat.subject.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (stat.subject.faculty_name && stat.subject.faculty_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSemester =
      selectedSemester === 'all' ||
      stat.subject.semester === selectedSemester ||
      stat.subject.semester.toLowerCase().includes(selectedSemester.toLowerCase());

    return matchesSearch && matchesSemester;
  });

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;
    try {
      setIsDeleting(true);
      await deleteSubject(subjectToDelete.id);
      setSubjectToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Subjects &amp; Course Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure subjects, faculty instructors, and custom target percentages
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject name, course code, or faculty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Semesters</option>
          <option value="3">3rd Semester (Current)</option>
          <option value="1">1st Semester</option>
          <option value="2">2nd Semester</option>
          <option value="4">4th Semester</option>
          <option value="5">5th Semester</option>
          <option value="6">6th Semester</option>
          <option value="7">7th Semester</option>
          <option value="8">8th Semester</option>
        </select>
      </div>

      {/* Grid of Subject Cards */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses registered yet"
          description="Get started by adding subjects like Java, Data Structures, or DBMS with your semester requirements."
          actionLabel="Add First Subject"
          onAction={onOpenAddModal}
        />
      ) : filteredStats.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-sm text-slate-500">No subjects matched your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStats.map((stat) => (
            <div
              key={stat.subject.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md"
            >
              <div>
                {/* Top Meta info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {stat.subject.code || 'COURSE'}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">
                      Sem {stat.subject.semester || '1'}
                    </span>
                  </div>
                  <AttendanceBadge status={stat.status} size="sm" />
                </div>

                {/* Subject Name */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {stat.subject.name}
                </h3>

                {/* Faculty name */}
                {stat.subject.faculty_name && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{stat.subject.faculty_name}</span>
                  </p>
                )}

                {/* Numbers and percentage */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {stat.percentage}%
                      </span>
                      <span className="text-xs text-slate-400">
                        ({stat.attended}/{stat.conducted} classes)
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Target: {stat.target}%
                    </span>
                  </div>

                  <AttendanceProgress
                    percentage={stat.percentage}
                    target={stat.target}
                    status={stat.status}
                    height="h-2"
                  />

                  {/* Margin Text */}
                  <div className="mt-2.5 text-[11px] font-semibold flex items-center gap-1.5">
                    {stat.status === 'Good' ? (
                      <span className="text-emerald-700 dark:text-emerald-300">
                        ✓ {stat.marginText}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{stat.marginText}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => markPresent(stat.subject.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors"
                    title="Quick Mark Present Today"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Present</span>
                  </button>
                  <button
                    onClick={() => markAbsent(stat.subject.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition-colors"
                    title="Quick Mark Absent Today"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Absent</span>
                  </button>
                  <button
                    onClick={() => onOpenAttendanceModal(stat.subject.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                    title="Log class with date or notes"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {onNavigateToHistory && (
                    <button
                      onClick={onNavigateToHistory}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View Attendance History"
                      aria-label="View Attendance History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenEditModal(stat.subject)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Subject"
                    aria-label="Edit Subject"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSubjectToDelete(stat.subject)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Subject"
                    aria-label="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        message={`Are you sure you want to delete "${subjectToDelete?.name}"? All associated lecture attendance records will also be permanently deleted.`}
        confirmLabel="Delete Subject"
        isLoading={isDeleting}
      />
    </div>
  );
};
