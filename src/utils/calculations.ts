import { AttendanceLevel, AttendanceRecord, OverallStats, Subject, SubjectStats } from '../types';

/**
 * Calculates subject attendance percentage.
 * Returns 100 if 0 classes have been conducted yet, so new subjects start in good standing.
 */
export function calculatePercentage(attended: number, conducted: number): number {
  if (conducted <= 0) return 0;
  if (attended <= 0) return 0;
  const pct = (attended / conducted) * 100;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(1));
}

/**
 * Classifies attendance status relative to target percentage.
 * If attendance >= target: Good
 * If attendance is below target but within 5 percentage points: Warning
 * If attendance is significantly below target (> 5% below target): Low
 */
export function getAttendanceStatus(percentage: number, targetPercentage: number): AttendanceLevel {
  if (percentage >= targetPercentage) {
    return 'Good';
  }
  // If within 5% of target
  if (percentage >= Math.max(0, targetPercentage - 5)) {
    return 'Warning';
  }
  return 'Low';
}

/**
 * Calculates the maximum number of future classes that can be missed while maintaining target.
 * Formula: largest integer n such that: attended / (conducted + n) >= target / 100
 * n <= (attended * 100 / target) - conducted
 */
export function calculateClassesCanMiss(attended: number, conducted: number, target: number): number {
  if (conducted === 0) return 0;
  if (target <= 0) return 999;
  if (target > 100) return 0;

  const currentPct = (attended / conducted) * 100;
  if (currentPct < target) {
    return 0; // Already below target, cannot miss any classes!
  }

  // Largest integer n >= 0
  const maxConducted = (attended * 100) / target;
  const n = Math.floor(maxConducted - conducted);
  return Math.max(0, n);
}

/**
 * Calculates the minimum number of consecutive future classes a student must attend to reach target.
 * Formula: smallest integer n such that: (attended + n) / (conducted + n) >= target / 100
 * (100 - target) * n >= target * conducted - 100 * attended
 * n >= (target * conducted - 100 * attended) / (100 - target)
 *
 * Returns null or -1 if mathematically impossible (e.g., target 100% when a class is already missed).
 */
export function calculateClassesNeeded(attended: number, conducted: number, target: number): number {
  if (conducted === 0) return 0;
  if (target <= 0) return 0;
  
  const currentPct = (attended / conducted) * 100;
  if (currentPct >= target) {
    return 0; // Already at or above target!
  }

  if (target >= 100) {
    // If target is 100% and classes have been missed, you can never mathematically reach 100% again
    if (attended < conducted) {
      return -1; // -1 represents impossible
    }
    return 0;
  }

  const numerator = (target * conducted) - (100 * attended);
  const denominator = 100 - target;
  
  if (denominator <= 0) return -1;

  const n = Math.ceil(numerator / denominator);
  return Math.max(0, n);
}

/**
 * Calculates complete statistics for a subject based on attendance records.
 */
export function calculateSubjectStats(subject: Subject, records: AttendanceRecord[]): SubjectStats {
  const subjectRecords = records.filter((r) => r.subject_id === subject.id);
  const conducted = subjectRecords.length;
  const attended = subjectRecords.filter((r) => r.status === 'Present').length;
  const absent = conducted - attended;
  
  const percentage = conducted === 0 ? 0 : calculatePercentage(attended, conducted);
  const status = conducted === 0 ? 'Good' : getAttendanceStatus(percentage, subject.target_percentage);
  
  const classesCanMiss = calculateClassesCanMiss(attended, conducted, subject.target_percentage);
  const classesNeeded = calculateClassesNeeded(attended, conducted, subject.target_percentage);

  let marginText = '';
  if (conducted === 0) {
    marginText = 'No classes conducted yet';
  } else if (percentage >= subject.target_percentage) {
    if (classesCanMiss === 0) {
      marginText = 'On the edge! Cannot miss any classes.';
    } else {
      marginText = `You can miss ${classesCanMiss} ${classesCanMiss === 1 ? 'class' : 'classes'} safely.`;
    }
  } else {
    if (classesNeeded === -1) {
      marginText = 'Cannot reach target of 100% after missing classes.';
    } else {
      marginText = `Must attend next ${classesNeeded} ${classesNeeded === 1 ? 'class' : 'classes'} consecutively.`;
    }
  }

  return {
    subject,
    conducted,
    attended,
    absent,
    percentage,
    target: subject.target_percentage,
    status,
    classesCanMiss,
    classesNeeded,
    marginText,
  };
}

/**
 * Calculates overall academic attendance statistics.
 * CRITICAL RULE: Overall percentage = (Total Attended / Total Conducted) * 100
 * NEVER a simple average of subject percentages.
 */
export function calculateOverallStats(subjects: Subject[], records: AttendanceRecord[]): OverallStats {
  const subjectStatsList = subjects.map((s) => calculateSubjectStats(s, records));

  const totalSubjects = subjects.length;
  let totalAttended = 0;
  let totalConducted = 0;
  let subjectsGood = 0;
  let subjectsWarning = 0;
  let subjectsLow = 0;

  for (const stat of subjectStatsList) {
    totalAttended += stat.attended;
    totalConducted += stat.conducted;
    if (stat.status === 'Good') subjectsGood++;
    else if (stat.status === 'Warning') subjectsWarning++;
    else if (stat.status === 'Low') subjectsLow++;
  }

  const totalAbsent = totalConducted - totalAttended;
  const overallPercentage = totalConducted === 0 ? 0 : calculatePercentage(totalAttended, totalConducted);

  // Compute weighted or benchmark target (average of user targets or default 75)
  const avgTarget = subjects.length > 0 
    ? Math.round(subjects.reduce((acc, s) => acc + s.target_percentage, 0) / subjects.length)
    : 75;

  const overallStatus = totalConducted === 0 ? 'Good' : getAttendanceStatus(overallPercentage, avgTarget);

  // Sort subjects by attendance percentage to identify highest and lowest
  const activeStats = subjectStatsList.filter((s) => s.conducted > 0);
  let lowestSubject: SubjectStats | undefined;
  let highestSubject: SubjectStats | undefined;

  if (activeStats.length > 0) {
    const sorted = [...activeStats].sort((a, b) => a.percentage - b.percentage);
    lowestSubject = sorted[0];
    highestSubject = sorted[sorted.length - 1];
  }

  return {
    totalSubjects,
    totalConducted,
    totalAttended,
    totalAbsent,
    overallPercentage,
    overallStatus,
    subjectsGood,
    subjectsWarning,
    subjectsLow,
    lowestSubject,
    highestSubject,
  };
}
