import React, { useState, useEffect } from 'react';
import { Subject } from '../../types';
import { Modal } from '../common/Modal';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code: string;
    faculty_name: string;
    semester: string;
    course?: string;
    target_percentage: number;
  }) => Promise<void>;
  subjectToEdit?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subjectToEdit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [semester, setSemester] = useState('3rd Semester');
  const [course, setCourse] = useState('Computer Science and Engineering (CSE)');
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code || '');
      setFacultyName(subjectToEdit.faculty_name || '');
      setSemester(subjectToEdit.semester || '3rd Semester');
      setCourse(subjectToEdit.course || 'Computer Science and Engineering (CSE)');
      setTargetPercentage(subjectToEdit.target_percentage || 75);
    } else {
      setName('');
      setCode('');
      setFacultyName('');
      setSemester('3rd Semester');
      setCourse('Computer Science and Engineering (CSE)');
      setTargetPercentage(75);
    }
    setErrors({});
  }, [subjectToEdit, isOpen]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Subject name is required';
    }
    if (targetPercentage < 0 || targetPercentage > 100 || isNaN(targetPercentage)) {
      newErrors.targetPercentage = 'Target must be between 0% and 100%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        faculty_name: facultyName.trim(),
        semester: semester.trim(),
        course: course.trim(),
        target_percentage: Number(targetPercentage),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
      subtitle={subjectToEdit ? 'Update course specifications and attendance target' : 'Define a new curriculum subject to track attendance'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Subject Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Operating Systems"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.name ? 'border-rose-500 ring-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>}
        </div>

        {/* Code & Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 1BCS304"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="3rd Semester">3rd Semester (Current)</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="4th Semester">4th Semester</option>
              <option value="5th Semester">5th Semester</option>
              <option value="6th Semester">6th Semester</option>
              <option value="7th Semester">7th Semester</option>
              <option value="8th Semester">8th Semester</option>
            </select>
          </div>
        </div>

        {/* Course / Branch */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Course / Department
          </label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. Computer Science and Engineering (CSE)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Faculty Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Faculty / Professor Name
          </label>
          <input
            type="text"
            value={facultyName}
            onChange={(e) => setFacultyName(e.target.value)}
            placeholder="e.g. Prof. Ramesh Rao"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Target Attendance Percentage */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Target Attendance Percentage (%)
            </label>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {targetPercentage}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={targetPercentage}
            onChange={(e) => setTargetPercentage(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>50%</span>
            <span className="font-semibold text-slate-600 dark:text-slate-400">75% (Standard University Target)</span>
            <span>85%+</span>
          </div>
          {errors.targetPercentage && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.targetPercentage}</p>
          )}
        </div>

        {/* Action Buttons */}
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
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : subjectToEdit ? 'Save Changes' : 'Create Subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
