import React, { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, PieChart as PieIcon, Calendar, 
  Filter, CheckCircle2, XCircle, ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, ReferenceLine 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calculatePercentage } from '../utils/calculations';
import { EmptyState } from '../components/common/EmptyState';

export const AnalyticsPage: React.FC = () => {
  const { subjects, records, subjectStats, overallStats } = useApp();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // Colors for charts
  const THEME_COLORS = {
    primary: '#4f46e5',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#ef4444',
    indigo: '#6366f1',
    sky: '#0284c7',
    violet: '#8b5cf6',
  };

  // 1. Subject Comparison Data (Attended vs Absent vs Target)
  const subjectComparisonData = useMemo(() => {
    return subjectStats.map((stat) => ({
      name: stat.subject.code || stat.subject.name.substring(0, 10),
      fullName: stat.subject.name,
      percentage: stat.percentage,
      target: stat.target,
      attended: stat.attended,
      conducted: stat.conducted,
    }));
  }, [subjectStats]);

  // 2. Present vs Absent Ratio Data (Pie Chart)
  const pieData = useMemo(() => {
    return [
      { name: 'Present', value: overallStats.totalAttended, color: '#10b981' },
      { name: 'Absent', value: overallStats.totalAbsent, color: '#ef4444' },
    ];
  }, [overallStats]);

  // 3. Attendance Trend Over Time (Cumulative Percentage as records occurred)
  const trendData = useMemo(() => {
    if (records.length === 0) return [];

    // Filter by subject if specified
    const activeRecords = selectedSubjectFilter === 'all'
      ? [...records]
      : records.filter((r) => r.subject_id === selectedSubjectFilter);

    // Sort chronologically ascending
    const sorted = [...activeRecords].sort((a, b) =>
      a.attendance_date.localeCompare(b.attendance_date)
    );

    let cumulativeAttended = 0;
    let cumulativeConducted = 0;

    // Aggregate by date
    const dateMap = new Map<string, { attended: number; conducted: number }>();
    for (const r of sorted) {
      const existing = dateMap.get(r.attendance_date) || { attended: 0, conducted: 0 };
      existing.conducted += 1;
      if (r.status === 'Present') existing.attended += 1;
      dateMap.set(r.attendance_date, existing);
    }

    const points: Array<{ date: string; percentage: number; target: number }> = [];
    // target to compare against
    const targetRef = selectedSubjectFilter === 'all'
      ? 75
      : subjects.find((s) => s.id === selectedSubjectFilter)?.target_percentage || 75;

    for (const [date, counts] of dateMap.entries()) {
      cumulativeAttended += counts.attended;
      cumulativeConducted += counts.conducted;
      const pct = calculatePercentage(cumulativeAttended, cumulativeConducted);
      points.push({
        date: date.substring(5), // MM-DD for clean axis
        percentage: pct,
        target: targetRef,
      });
    }

    return points;
  }, [records, selectedSubjectFilter, subjects]);

  // 4. Monthly Attendance Rate
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { attended: number; conducted: number }>();
    for (const r of records) {
      if (selectedSubjectFilter !== 'all' && r.subject_id !== selectedSubjectFilter) {
        continue;
      }
      const monthKey = r.attendance_date.substring(0, 7); // YYYY-MM
      const existing = monthMap.get(monthKey) || { attended: 0, conducted: 0 };
      existing.conducted += 1;
      if (r.status === 'Present') existing.attended += 1;
      monthMap.set(monthKey, existing);
    }

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => {
        const dateObj = new Date(`${month}-01`);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return {
          month: label,
          percentage: calculatePercentage(data.attended, data.conducted),
          conducted: data.conducted,
          attended: data.attended,
        };
      });
  }, [records, selectedSubjectFilter]);

  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No subjects registered"
        description="Add course subjects to generate attendance comparison charts, performance ratios, and trends."
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Zero records banner if student has not logged yet */}
      {records.length === 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
          <span>
            <strong>3rd Semester CSE Analytics Ready:</strong> All 8 subjects are configured with a 75% attendance benchmark. Attendance percentages and curves will plot live as you record classes.
          </span>
        </div>
      )}

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Attendance Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize your attendance velocity, thresholds, and subject balance
          </p>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            Filter:
          </label>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Overall (All Subjects)</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid 1: Trend Chart & Ratio Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Over Time Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cumulative Attendance Trend
              </h3>
              <p className="text-xs text-slate-400">
                Track how your attendance percentage evolves lecture by lecture
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Actual %
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-bold">
                <span className="w-2.5 h-0.5 bg-slate-400" />
                Target (75%)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Attendance']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '75% Threshold', fill: '#ef4444', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Present vs Absent Ratio Donut Chart (1 Col) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Present vs Absent Ratio
            </h3>
            <p className="text-xs text-slate-400">
              Total classroom attendance breakdown
            </p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} classes`, name]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Present: {overallStats.totalAttended}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Absent: {overallStats.totalAbsent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Subject Performance Bar Chart & Monthly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Comparison Bar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subject-Wise Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Attendance percentage by subject vs each course target
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (Target: ${item.payload.target}%)`,
                    item.payload.fullName,
                  ]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {subjectComparisonData.map((entry, idx) => (
                    <Cell
                      key={`bar-${idx}`}
                      fill={
                        entry.percentage >= entry.target
                          ? '#10b981'
                          : entry.percentage >= entry.target - 5
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Attendance */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Attendance Performance
            </h3>
            <p className="text-xs text-slate-400">
              Average attendance rate recorded each calendar month
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.attended}/${item.payload.conducted} classes)`,
                    'Monthly Score',
                  ]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" />
                <Bar dataKey="percentage" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
