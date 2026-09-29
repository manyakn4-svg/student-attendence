import React from 'react';
import { 
  BookOpen, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, 
  PlusCircle, Calculator, Sparkles, Calendar, ArrowUpRight, Check, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceBadge } from '../components/common/AttendanceBadge';
import { AttendanceProgress } from '../components/common/AttendanceProgress';
import { EmptyState } from '../components/common/EmptyState';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenSubjectModal: () => void;
  onOpenAttendanceModal: (subjectId?: string) => void;
  onOpenAIAssistant: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenSubjectModal,
  onOpenAttendanceModal,
  onOpenAIAssistant,
}) => {
  const { session, subjects, subjectStats, overallStats, markPresent, markAbsent } = useApp();

  const studentFirstName = session?.profile?.full_name?.split(' ')[0] || 'Student';

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Identify subjects with low attendance (< target)
  const lowAttendanceSubjects = subjectStats.filter((s) => s.status === 'Low' || s.status === 'Warning');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Supabase Connected Banner */}
      <div className="px-4 py-2.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">Supabase Backend:</span>
          <span className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300">ymyyzpomofoslazjjriu</span>
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">• Real-time attendance auto-sync active</span>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>SQL Schema &amp; Database Settings</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {studentFirstName} 👋
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
              {session?.profile?.college_name || 'Channabasaveshwara Institute of Technology, Gubbi'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              CSE • 3rd Semester
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAttendanceModal()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mark Class</span>
          </button>
          <button
            onClick={onOpenSubjectModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs sm:text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banners if any subject is below target */}
      {lowAttendanceSubjects.length > 0 && (
        <div className="space-y-3">
          {lowAttendanceSubjects.slice(0, 2).map((stat) => (
            <div
              key={stat.subject.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                stat.status === 'Low'
                  ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    stat.status === 'Low'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    ⚠ Your {stat.subject.name} attendance is {stat.percentage}%, which is below your target of {stat.target}%.
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {stat.classesNeeded > 0
                      ? `You need to attend the next ${stat.classesNeeded} ${stat.classesNeeded === 1 ? 'class' : 'classes'} consecutively to reach ${stat.target}%.`
                      : 'Take immediate action to avoid academic detention.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onOpenAttendanceModal(stat.subject.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Log Session
                </button>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Calculate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Overall Attendance */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Attendance
            </span>
            <AttendanceBadge status={overallStats.overallStatus} size="sm" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {overallStats.overallPercentage}%
            </span>
            <span className="text-xs text-slate-400">cumulative</span>
          </div>
          <AttendanceProgress
            percentage={overallStats.overallPercentage}
            target={75}
            status={overallStats.overallStatus}
            height="h-2"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
            Standard 75% benchmark applied
          </p>
        </div>

        {/* Total Subjects */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Subjects
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {overallStats.totalSubjects}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{overallStats.subjectsGood} Good</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{overallStats.subjectsWarning} Warning</span>
            <span>•</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{overallStats.subjectsLow} Low</span>
          </div>
        </div>

        {/* Classes Attended */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Classes Attended
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {overallStats.totalAttended}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sessions actively attended in person
          </p>
        </div>

        {/* Classes Conducted */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Classes Conducted
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {overallStats.totalConducted}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Total lectures scheduled this term
          </p>
        </div>
      </div>

      {/* 3rd Semester CSE Attendance Cards for All 8 Subjects */}
      {subjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                3rd Semester CSE Attendance Cards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Summary cards for each enrolled subject
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {subjectStats.length} Subjects
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectStats.map((stat) => (
              <div
                key={stat.subject.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/80 dark:hover:border-indigo-600 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                      {stat.subject.code}
                    </span>
                    <AttendanceBadge status={stat.status} size="sm" />
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[38px] leading-snug">
                    {stat.subject.name}
                  </h4>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {stat.percentage}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {stat.attended} / {stat.conducted}
                    </span>
                  </div>

                  <div className="mt-2">
                    <AttendanceProgress
                      percentage={stat.percentage}
                      target={stat.target}
                      status={stat.status}
                      height="h-2"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Target: {stat.target}%
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => markPresent(stat.subject.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
                      title="Quick Mark Present Today"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => markAbsent(stat.subject.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors"
                      title="Quick Mark Absent Today"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Absent</span>
                    </button>
                    <button
                      onClick={() => onOpenAttendanceModal(stat.subject.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
                      title="Log with Date & Topic"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Subject Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Subject Attendance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown across your registered semester modules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Subjects</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={BookOpen}
              title="No subjects added yet"
              description="Add your first course subject to start logging daily attendance and calculating percentages."
              actionLabel="Add Subject"
              onAction={onOpenSubjectModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-4 text-center">Attended</th>
                  <th className="py-3.5 px-4 text-center">Conducted</th>
                  <th className="py-3.5 px-6">Percentage</th>
                  <th className="py-3.5 px-4 text-center">Target</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {subjectStats.map((stat) => (
                  <tr
                    key={stat.subject.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Subject Name & Faculty */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {stat.subject.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{stat.subject.code || 'NO-CODE'}</span>
                        {stat.subject.faculty_name && (
                          <>
                            <span>•</span>
                            <span>{stat.subject.faculty_name}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Attended */}
                    <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {stat.attended}
                    </td>

                    {/* Conducted */}
                    <td className="py-4 px-4 text-center font-bold text-slate-500 dark:text-slate-400">
                      {stat.conducted}
                    </td>

                    {/* Percentage & Progress Bar */}
                    <td className="py-4 px-6 min-w-[180px]">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className={stat.status === 'Good' ? 'text-emerald-600 dark:text-emerald-400' : stat.status === 'Warning' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                          {stat.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {stat.classesCanMiss > 0 ? `+${stat.classesCanMiss} skips` : stat.classesNeeded > 0 ? `+${stat.classesNeeded} needed` : 'At target'}
                        </span>
                      </div>
                      <AttendanceProgress
                        percentage={stat.percentage}
                        target={stat.target}
                        status={stat.status}
                        height="h-2"
                      />
                    </td>

                    {/* Target */}
                    <td className="py-4 px-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                      {stat.target}%
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <AttendanceBadge status={stat.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => markPresent(stat.subject.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors"
                          title="Quick Mark Present Today"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="hidden sm:inline">Present</span>
                        </button>
                        <button
                          onClick={() => markAbsent(stat.subject.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition-colors"
                          title="Quick Mark Absent Today"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="hidden sm:inline">Absent</span>
                        </button>
                        <button
                          onClick={() => onOpenAttendanceModal(stat.subject.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                          title="Log with Custom Date / Topic"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Log</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Automated Dashboard Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Insight 1: Overall standing */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Standing Insight</h4>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Your overall attendance is {overallStats.overallPercentage}%.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {overallStats.overallPercentage >= 75
                ? 'You are safely above the standard 75% university eligibility requirement.'
                : 'You are currently below the required 75% exam attendance threshold.'}
            </p>
          </div>
        </div>

        {/* Insight 2: Attention Area */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attention Required</h4>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {overallStats.lowestSubject
                ? `${overallStats.lowestSubject.subject.name} has your lowest attendance (${overallStats.lowestSubject.percentage}%).`
                : 'No subjects recorded yet.'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {overallStats.lowestSubject?.classesNeeded && overallStats.lowestSubject.classesNeeded > 0
                ? `Attend the next ${overallStats.lowestSubject.classesNeeded} classes to get back on track.`
                : 'All courses are maintaining adequate buffers.'}
            </p>
          </div>
        </div>

        {/* Insight 3: AI Assistant Shortcut */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Academic Advisor</span>
            </div>
            <p className="text-sm font-bold text-white">
              Want a weekly class-skip gameplan?
            </p>
            <p className="text-xs text-indigo-100 mt-0.5">
              Gemini 3.8 calculates exact safe skips based on your schedule.
            </p>
            <button
              onClick={onOpenAIAssistant}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-xs"
            >
              Consult AI Advisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
