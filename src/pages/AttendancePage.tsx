import React, { useState } from 'react';
import { 
  CalendarCheck, Plus, Check, X, Calendar, AlertCircle, 
  Clock, Sparkles, BookOpen, Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import { AttendanceBadge } from '../components/common/AttendanceBadge';
import { AttendanceProgress } from '../components/common/AttendanceProgress';
import { EmptyState } from '../components/common/EmptyState';

interface AttendancePageProps {
  onOpenSingleModal: () => void;
  onOpenSubjectModal: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  onOpenSingleModal,
  onOpenSubjectModal,
}) => {
  const { subjects, subjectStats, batchMarkAttendance, showToast } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  // Status mapping for batch attendance: subjectId -> 'Present' | 'Absent' | 'Skip'
  const [dailyStatuses, setDailyStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    for (const sub of subjects) {
      initial[sub.id] = 'Present';
    }
    return initial;
  });
  const [topics, setTopics] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusToggle = (subjectId: string, status: AttendanceStatus) => {
    setDailyStatuses((prev) => ({
      ...prev,
      [subjectId]: status,
    }));
  };

  const handleTopicChange = (subjectId: string, topic: string) => {
    setTopics((prev) => ({
      ...prev,
      [subjectId]: topic,
    }));
  };

  const handleBatchSave = async () => {
    if (subjects.length === 0) return;
    try {
      setIsSubmitting(true);
      const entries = subjects.map((sub) => ({
        subject_id: sub.id,
        status: dailyStatuses[sub.id] || 'Present',
        attendance_date: selectedDate,
        topic: topics[sub.id] || 'Regular Lecture',
      }));

      await batchMarkAttendance(entries);
      showToast('success', 'Day Attendance Saved', `Recorded attendance for ${subjects.length} subjects on ${selectedDate}.`);
    } catch (err: any) {
      showToast('error', 'Error saving attendance', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Classroom Attendance Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Log daily classroom lectures, present/absent statuses, and topic logs
          </p>
        </div>

        <button
          onClick={onOpenSingleModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Single Session Logger</span>
        </button>
      </div>

      {/* Batch Logger Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Daily Roster Quick-Logger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log attendance for all your courses on this date in one quick pass
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Session Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BookOpen}
              title="No subjects registered"
              description="Please add subjects before marking daily attendance."
              actionLabel="Add Subject"
              onAction={onOpenSubjectModal}
            />
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="space-y-4">
              {subjectStats.map((stat) => {
                const currentStatus = dailyStatuses[stat.subject.id] || 'Present';
                return (
                  <div
                    key={stat.subject.id}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* Subject info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {stat.subject.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                          {stat.subject.code || 'COURSE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Current: <strong className="text-slate-700 dark:text-slate-300">{stat.percentage}%</strong></span>
                        <span>•</span>
                        <span>Attended: {stat.attended}/{stat.conducted}</span>
                        <span>•</span>
                        <AttendanceBadge status={stat.status} size="sm" showDot={false} />
                      </div>
                    </div>

                    {/* Topic input */}
                    <div className="w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Lecture topic (optional)..."
                        value={topics[stat.subject.id] || ''}
                        onChange={(e) => handleTopicChange(stat.subject.id, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Present / Absent Toggle Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(stat.subject.id, 'Present')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusToggle(stat.subject.id, 'Absent')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'Absent'
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
                        }`}
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Action */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Attendance records are saved directly to your Supabase PostgreSQL database with unique session date constraints.
              </p>
              <button
                onClick={handleBatchSave}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving All...' : `Save Attendance for ${selectedDate}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subject Standing Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectStats.map((stat) => (
          <div
            key={stat.subject.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {stat.subject.name}
              </span>
              <AttendanceBadge status={stat.status} size="sm" />
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Attended</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{stat.attended}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Absent</span>
                <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">{stat.absent}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Total</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{stat.conducted}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">{stat.percentage}%</span>
              <span className="text-slate-400 text-[11px]">Target: {stat.target}%</span>
            </div>
            <AttendanceProgress percentage={stat.percentage} target={stat.target} status={stat.status} height="h-2" />

            <p className="mt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {stat.marginText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
