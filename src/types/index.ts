export type AttendanceStatus = 'Present' | 'Absent';

export type AttendanceLevel = 'Good' | 'Warning' | 'Low';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  student_id: string;
  college_name: string;
  course: string;
  branch: string;
  semester: string;
  section: string;
  academic_year: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string;
  faculty_name: string;
  semester: string;
  course?: string;
  target_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  subject_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  topic?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubjectStats {
  subject: Subject;
  conducted: number;
  attended: number;
  absent: number;
  percentage: number;
  target: number;
  status: AttendanceLevel;
  classesCanMiss: number;
  classesNeeded: number;
  marginText: string;
}

export interface OverallStats {
  totalSubjects: number;
  totalConducted: number;
  totalAttended: number;
  totalAbsent: number;
  overallPercentage: number;
  overallStatus: AttendanceLevel;
  subjectsGood: number;
  subjectsWarning: number;
  subjectsLow: number;
  lowestSubject?: SubjectStats;
  highestSubject?: SubjectStats;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}
