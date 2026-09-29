import React, { useState } from 'react';
import { 
  History, Search, Filter, Trash2, Edit2, Download, 
  Calendar, CheckCircle2, XCircle, ArrowUpDown, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';

interface AttendanceHistoryPageProps {
  onEditRecord: (record: AttendanceRecord) => void;
  onOpenAddAttendance: () => void;
}

export const AttendanceHistoryPage: React.FC<AttendanceHistoryPageProps> = ({
  onEditRecord,
  onOpenAddAttendance,
}) => {
  const { records, subjects, deleteAttendance } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Present' | 'Absent'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subject lookup map
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Date filtering logic
  const now = new Date();
  const filteredRecords = records.filter((r) => {
    // Subject filter
    if (selectedSubjectId !== 'all' && r.subject_id !== selectedSubjectId) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'all' && r.status !== selectedStatus) {
      return false;
    }
    // Date filter
    if (dateFilter === '7days') {
      const recDate = new Date(r.attendance_date);
      const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7) return false;
    } else if (dateFilter === '30days') {
      const recDate = new Date(r.attendance_date);
      const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 30) return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sub = subjectMap.get(r.subject_id);
      const matchesSub = sub ? sub.name.toLowerCase().includes(q) || (sub.code && sub.code.toLowerCase().includes(q)) : false;
      const matchesTopic = r.topic ? r.topic.toLowerCase().includes(q) : false;
      const matchesNotes = r.notes ? r.notes.toLowerCase().includes(q) : false;
      const matchesDate = r.attendance_date.includes(q);
      if (!matchesSub && !matchesTopic && !matchesNotes && !matchesDate) {
        return false;
      }
    }
    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await deleteAttendance(recordToDelete.id);
      setRecordToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['Date', 'Subject Name', 'Subject Code', 'Status', 'Topic', 'Notes'];
    const rows = filteredRecords.map((r) => {
      const sub = subjectMap.get(r.subject_id);
      return [
        r.attendance_date,
        `"${sub?.name || 'Unknown'}"`,
        `"${sub?.code || ''}"`,
        r.status,
        `"${(r.topic || '').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendwise_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance Log &amp; History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit, search, edit, or export every classroom attendance event
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Record New</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search topic or notes..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} {sub.code ? `(${sub.code})` : ''}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses (Present &amp; Absent)</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time History</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Filter Results stats line */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong>{filteredRecords.length}</strong> matching records (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {filteredRecords.filter((r) => r.status === 'Present').length} Present
            </span>
            ,{' '}
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              {filteredRecords.filter((r) => r.status === 'Absent').length} Absent
            </span>
            )
          </span>
          {(searchQuery || selectedSubjectId !== 'all' || selectedStatus !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubjectId('all');
                setSelectedStatus('all');
                setDateFilter('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={History}
              title="No records found"
              description="No attendance logs matched your filter or search query."
              actionLabel="Record Attendance"
              onAction={onOpenAddAttendance}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Subject</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6">Lecture Topic</th>
                    <th className="py-3.5 px-6">Notes</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {paginatedRecords.map((record) => {
                    const subject = subjectMap.get(record.subject_id);
                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Date */}
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          {record.attendance_date}
                        </td>

                        {/* Subject */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {subject?.name || 'Deleted Subject'}
                          </div>
                          {subject?.code && (
                            <div className="text-[10px] font-mono text-slate-400">
                              {subject.code}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              record.status === 'Present'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {record.status === 'Present' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            <span>{record.status}</span>
                          </span>
                        </td>

                        {/* Topic */}
                        <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                          {record.topic || <span className="text-slate-400 italic">No topic specified</span>}
                        </td>

                        {/* Notes */}
                        <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                          {record.notes || <span className="text-slate-400 italic">—</span>}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditRecord(record)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRecordToDelete(record)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Record Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance Record"
        message={`Are you sure you want to remove the ${recordToDelete?.status} record for ${recordToDelete?.attendance_date}? Your attendance percentage will automatically recalculate.`}
        confirmLabel="Delete Record"
        isLoading={isDeleting}
      />
    </div>
  );
};
