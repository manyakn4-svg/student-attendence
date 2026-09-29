import React, { useState, useEffect } from 'react';
import { Subject, AttendanceRecord, AttendanceStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Check, X, Calendar, AlertCircle } from 'lucide-react';
import { calculatePercentage } from '../../utils/calculations';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  records: AttendanceRecord[];
  onSubmit: (data: {
    subject_id: string;
    attendance_date: string;
    status: AttendanceStatus;
    topic?: string;
    notes?: string;
  }) => Promise<void>;
  recordToEdit?: AttendanceRecord | null;
  defaultSubjectId?: string;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  subjects,
  records,
  onSubmit,
  recordToEdit,
  defaultSubjectId,
}) => {
  const [subjectId, setSubjectId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (recordToEdit) {
      setSubjectId(recordToEdit.subject_id);
      setAttendanceDate(recordToEdit.attendance_date);
      setStatus(recordToEdit.status);
      setTopic(recordToEdit.topic || '');
      setNotes(recordToEdit.notes || '');
    } else {
      setSubjectId(defaultSubjectId || (subjects.length > 0 ? subjects[0].id : ''));
      setAttendanceDate(new Date().toISOString().split('T')[0]);
      setStatus('Present');
      setTopic('');
      setNotes('');
    }
    setError('');
  }, [recordToEdit, defaultSubjectId, subjects, isOpen]);

  // Selected subject stats preview
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const currentSubjectRecords = records.filter((r) => r.subject_id === subjectId);
  const currentConducted = currentSubjectRecords.length;
  const currentAttended = currentSubjectRecords.filter((r) => r.status === 'Present').length;
  const currentPct = currentConducted === 0 ? 100 : calculatePercentage(currentAttended, currentConducted);

  // Projected calculation
  const isEditing = Boolean(recordToEdit);
  let projectedAttended = currentAttended;
  let projectedConducted = currentConducted;

  if (isEditing && recordToEdit) {
    if (recordToEdit.status === 'Present' && status === 'Absent') {
      projectedAttended = Math.max(0, currentAttended - 1);
    } else if (recordToEdit.status === 'Absent' && status === 'Present') {
      projectedAttended = currentAttended + 1;
    }
  } else {
    projectedConducted = currentConducted + 1;
    if (status === 'Present') {
      projectedAttended = currentAttended + 1;
    }
  }
  const projectedPct = calculatePercentage(projectedAttended, projectedConducted);

  // Check for duplicate on the same date if creating new
  const isDuplicate = !isEditing && records.some(
    (r) => r.subject_id === subjectId && r.attendance_date === attendanceDate
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!attendanceDate) {
      setError('Please specify the lecture date.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onSubmit({
        subject_id: subjectId,
        attendance_date: attendanceDate,
        status,
        topic: topic.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save attendance record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Attendance Session' : 'Record Classroom Attendance'}
      subtitle={isEditing ? 'Update status or lecture notes for this date' : 'Log whether you attended class on this date'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isDuplicate && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Notice: An attendance record already exists for this subject on {attendanceDate}. Saving will prompt to update or replace it.
            </span>
          </div>
        )}

        {/* Subject Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Subject *
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={isEditing}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {subjects.length === 0 ? (
              <option value="">No subjects available (Create one first)</option>
            ) : (
              subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ''} - Target: {sub.target_percentage}%
                </option>
              ))
            )}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Session Date *
          </label>
          <div className="relative">
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Status Selection: Big Interactive Buttons */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Attendance Status *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('Present')}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 font-bold text-sm transition-all ${
                status === 'Present'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${status === 'Present' ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Present</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('Absent')}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 font-bold text-sm transition-all ${
                status === 'Absent'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${status === 'Absent' ? 'bg-rose-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Absent</span>
            </button>
          </div>
        </div>

        {/* Live Impact Preview */}
        {selectedSubject && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Live Impact Preview
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                Current: <strong className="text-slate-900 dark:text-white">{currentPct}%</strong> ({currentAttended}/{currentConducted})
              </span>
              <span className="text-slate-400">➔</span>
              <span className="text-slate-600 dark:text-slate-300">
                New: <strong className={projectedPct >= selectedSubject.target_percentage ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                  {projectedPct}%
                </strong> ({projectedAttended}/{projectedConducted})
              </span>
            </div>
          </div>
        )}

        {/* Lecture Topic (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Lecture Topic / Module (Optional)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Red-Black Tree Rotation, TCP Handshake..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Personal Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Teacher announced surprise quiz next Monday..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || subjects.length === 0}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Record' : 'Save Attendance'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
