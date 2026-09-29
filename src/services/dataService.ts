import { getSupabaseClient } from '../lib/supabase';
import { AttendanceRecord, Subject, UserProfile, UserSession } from '../types';

const STORAGE_CURRENT_USER = 'attendwise_local_current_user';
const STORAGE_SUBJECTS = 'attendwise_local_subjects';
const STORAGE_ATTENDANCE = 'attendwise_local_attendance';

// Default student profile for Channabasaveshwara Institute of Technology, Gubbi (3rd Sem CSE)
export const DEFAULT_PROFILE: UserProfile = {
  id: 'profile-demo-1',
  user_id: 'user-demo-1',
  full_name: 'CSE Student',
  student_id: '1CG24CS001',
  college_name: 'Channabasaveshwara Institute of Technology, Gubbi',
  course: 'Computer Science and Engineering (CSE)',
  branch: 'CSE',
  semester: '3rd Semester',
  section: 'A',
  academic_year: '2026-2027',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// 8 Official 3rd Semester CSE Subjects
export function getStandard3rdSemSubjects(userId: string): Subject[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sub-1bcs301',
      user_id: userId,
      code: '1BCS301',
      name: 'Probability Distributions and Statistics',
      faculty_name: 'Faculty of Mathematics',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'sub-1bcs302',
      user_id: userId,
      code: '1BCS302',
      name: 'Object Oriented Programming with Java',
      faculty_name: 'Faculty of CSE',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'sub-1bcs303',
      user_id: userId,
      code: '1BCS303',
      name: 'Digital Design and Computer Organisation',
      faculty_name: 'Faculty of CSE',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'sub-1bcs304',
      user_id: userId,
      code: '1BCS304',
      name: 'Operating Systems',
      faculty_name: 'Faculty of CSE',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'sub-1bcs305',
      user_id: userId,
      code: '1BCS305',
      name: 'Data Structures and Applications',
      faculty_name: 'Faculty of CSE',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'sub-1bcsl306',
      user_id: userId,
      code: '1BCSL306',
      name: 'Data Structures Lab',
      faculty_name: 'Lab Instructor',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'sub-1bcsl307a',
      user_id: userId,
      code: '1BCSL307A',
      name: 'Project Management with Git',
      faculty_name: 'Lab Instructor',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'sub-1bcp308',
      user_id: userId,
      code: '1BCP308',
      name: 'Community Project',
      faculty_name: 'Project Guide',
      semester: '3rd Semester',
      course: 'Computer Science and Engineering (CSE)',
      target_percentage: 75,
      created_at: now,
      updated_at: now,
    },
  ];
}

// -------------------------------------------------------------
// LOCAL STORAGE HELPERS
// -------------------------------------------------------------
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Local storage write error:', err);
  }
}

// Ensure default local structure without creating a fake logged-in user
function initLocalStorageIfNeeded() {
  // If there's an obsolete mock user from prior development sessions, clean it out
  const current = getLocalItem<UserSession | null>(STORAGE_CURRENT_USER, null);
  if (current && current.user?.id === 'user-demo-1') {
    localStorage.removeItem(STORAGE_CURRENT_USER);
  }
}

initLocalStorageIfNeeded();

// -------------------------------------------------------------
// AUTHENTICATION SERVICE (Pure Supabase Auth)
// -------------------------------------------------------------
export const authService = {
  async getSession(): Promise<UserSession | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: { session }, error } = await client.auth.getSession();
        if (!error && session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const fullProfile: UserProfile = {
            id: session.user.id,
            user_id: session.user.id,
            full_name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'CSE Student',
            student_id: profile?.student_id || session.user.user_metadata?.student_id || '1CG24CS001',
            college_name: profile?.college_name || session.user.user_metadata?.college_name || 'Channabasaveshwara Institute of Technology, Gubbi',
            course: profile?.course || session.user.user_metadata?.course || 'Computer Science and Engineering (CSE)',
            branch: profile?.branch || session.user.user_metadata?.branch || 'CSE',
            semester: profile?.semester || session.user.user_metadata?.semester || '3rd Semester',
            section: profile?.section || 'A',
            academic_year: profile?.academic_year || '2026-2027',
            avatar_url: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          };

          const userSession: UserSession = {
            user: {
              id: session.user.id,
              email: session.user.email || '',
            },
            profile: fullProfile,
          };
          setLocalItem(STORAGE_CURRENT_USER, userSession);
          return userSession;
        } else {
          setLocalItem(STORAGE_CURRENT_USER, null);
          return null;
        }
      } catch (err) {
        console.warn('Supabase auth session check:', err);
        return null;
      }
    }

    return null;
  },

  async signUp(email: string, password: string, fullName: string, studentDetails?: Partial<UserProfile>): Promise<UserSession> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not initialized. Please verify configuration.');
    }

    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          college_name: studentDetails?.college_name || 'Channabasaveshwara Institute of Technology, Gubbi',
          course: studentDetails?.course || 'Computer Science and Engineering (CSE)',
          branch: studentDetails?.branch || 'CSE',
          semester: studentDetails?.semester || '3rd Semester',
          student_id: studentDetails?.student_id || '',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed: no user returned from Supabase Auth.');
    }

    const newProfile: UserProfile = {
      id: data.user.id,
      user_id: data.user.id,
      full_name: fullName.trim(),
      student_id: studentDetails?.student_id?.trim() || '1CG24CS001',
      college_name: studentDetails?.college_name?.trim() || 'Channabasaveshwara Institute of Technology, Gubbi',
      course: studentDetails?.course?.trim() || 'Computer Science and Engineering (CSE)',
      branch: studentDetails?.branch?.trim() || 'CSE',
      semester: studentDetails?.semester?.trim() || '3rd Semester',
      section: studentDetails?.section?.trim() || 'A',
      academic_year: studentDetails?.academic_year || '2026-2027',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    // Save profile to Supabase
    try {
      await client.from('profiles').upsert(newProfile);
    } catch (e) {
      console.warn('Profile table not yet initialized in Supabase:', e);
    }

    // Seed the official 8 3rd-semester CSE subjects for this student
    const subs = getStandard3rdSemSubjects(data.user.id);
    for (const s of subs) {
      try {
        await client.from('subjects').upsert(s);
      } catch (e) {
        console.warn('Subject table not ready for auto-seed:', e);
      }
    }

    const session: UserSession = {
      user: { id: data.user.id, email: data.user.email || email.trim() },
      profile: newProfile,
    };

    setLocalItem(STORAGE_CURRENT_USER, session);
    setLocalItem(STORAGE_SUBJECTS, subs);
    // New students start with zero attendance records until entered
    setLocalItem(STORAGE_ATTENDANCE, []);
    return session;
  },

  async signIn(email: string, password: string): Promise<UserSession> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not initialized.');
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // Return clear error message directly from Supabase Auth
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed: user data not found.');
    }

    // Fetch student profile from database
    let profile: UserProfile | null = null;
    try {
      const { data: profileData } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();
      profile = profileData;
    } catch (e) {
      console.warn('Profile fetch warning:', e);
    }

    const fullProfile: UserProfile = {
      id: data.user.id,
      user_id: data.user.id,
      full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
      student_id: profile?.student_id || data.user.user_metadata?.student_id || '1CG24CS001',
      college_name: profile?.college_name || data.user.user_metadata?.college_name || 'Channabasaveshwara Institute of Technology, Gubbi',
      course: profile?.course || data.user.user_metadata?.course || 'Computer Science and Engineering (CSE)',
      branch: profile?.branch || data.user.user_metadata?.branch || 'CSE',
      semester: profile?.semester || data.user.user_metadata?.semester || '3rd Semester',
      section: profile?.section || 'A',
      academic_year: profile?.academic_year || '2026-2027',
      avatar_url: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    const session: UserSession = {
      user: { id: data.user.id, email: data.user.email || email.trim() },
      profile: fullProfile,
    };

    setLocalItem(STORAGE_CURRENT_USER, session);
    return session;
  },

  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    setLocalItem(STORAGE_CURRENT_USER, null);
    localStorage.removeItem(STORAGE_CURRENT_USER);
  },

  async resetPassword(email: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not initialized.');
    }

    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/`,
    });

    if (error) {
      throw new Error(error.message);
    }
    return true;
  },
};

// -------------------------------------------------------------
// PROFILE SERVICE
// -------------------------------------------------------------
export const profileService = {
  async updateProfile(profileData: Partial<UserProfile>, userId: string): Promise<UserProfile> {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from('profiles')
          .upsert({
            user_id: userId,
            ...profileData,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }

    const currentSession = getLocalItem<UserSession | null>(STORAGE_CURRENT_USER, null);
    if (currentSession) {
      const updatedProfile: UserProfile = {
        ...currentSession.profile,
        ...profileData,
        updated_at: new Date().toISOString(),
      };
      setLocalItem(STORAGE_CURRENT_USER, {
        ...currentSession,
        profile: updatedProfile,
      });
      return updatedProfile;
    }
    throw new Error('No user profile found to update');
  },
};

// -------------------------------------------------------------
// SUBJECTS SERVICE (Supabase + Local Write-Through)
// -------------------------------------------------------------
export const subjectsService = {
  async getSubjects(userId: string): Promise<Subject[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('subjects')
          .select('*')
          .eq('user_id', userId)
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_SUBJECTS, data);
          return data;
        }

        // If Supabase has no subjects for user yet, push the 8 3rd Sem subjects to Supabase
        const initialSubs = getStandard3rdSemSubjects(userId);
        for (const sub of initialSubs) {
          await client.from('subjects').upsert({
            id: sub.id,
            user_id: sub.user_id,
            code: sub.code,
            name: sub.name,
            faculty_name: sub.faculty_name,
            semester: sub.semester,
            course: sub.course,
            target_percentage: sub.target_percentage,
          });
        }
        setLocalItem(STORAGE_SUBJECTS, initialSubs);
        return initialSubs;
      } catch (err) {
        console.warn('Supabase getSubjects failed, using local cache:', err);
      }
    }

    const all = getLocalItem<Subject[]>(STORAGE_SUBJECTS, []);
    const userSubs = all.filter((s) => s.user_id === userId);
    if (userSubs.length === 0) {
      const standard = getStandard3rdSemSubjects(userId);
      setLocalItem(STORAGE_SUBJECTS, standard);
      return standard;
    }
    return userSubs;
  },

  async addSubject(userId: string, subject: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Subject> {
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      user_id: userId,
      name: subject.name.trim(),
      code: subject.code.trim().toUpperCase(),
      faculty_name: subject.faculty_name.trim(),
      semester: subject.semester.trim() || '3rd Semester',
      course: subject.course?.trim() || 'Computer Science and Engineering (CSE)',
      target_percentage: Number(subject.target_percentage) || 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to local storage first
    const all = getLocalItem<Subject[]>(STORAGE_SUBJECTS, []);
    setLocalItem(STORAGE_SUBJECTS, [newSub, ...all]);

    // Save to Supabase
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('subjects')
          .insert({
            id: newSub.id,
            user_id: userId,
            code: newSub.code,
            name: newSub.name,
            faculty_name: newSub.faculty_name,
            semester: newSub.semester,
            course: newSub.course,
            target_percentage: newSub.target_percentage,
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          console.log('[Supabase] Subject saved to database:', data);
          return data;
        }
      } catch (err) {
        console.warn('[Supabase] Subject insert network error:', err);
      }
    }

    return newSub;
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const all = getLocalItem<Subject[]>(STORAGE_SUBJECTS, []);
    let updated: Subject | null = null;
    const newList = all.map((s) => {
      if (s.id === id) {
        updated = { ...s, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return s;
    });

    setLocalItem(STORAGE_SUBJECTS, newList);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from('subjects')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        console.log('[Supabase] Subject updated in database');
      } catch (err) {
        console.warn('[Supabase] updateSubject error:', err);
      }
    }

    if (!updated) throw new Error('Subject not found');
    return updated;
  },

  async deleteSubject(id: string): Promise<void> {
    const allSubs = getLocalItem<Subject[]>(STORAGE_SUBJECTS, []);
    setLocalItem(STORAGE_SUBJECTS, allSubs.filter((s) => s.id !== id));

    const allAtt = getLocalItem<AttendanceRecord[]>(STORAGE_ATTENDANCE, []);
    setLocalItem(STORAGE_ATTENDANCE, allAtt.filter((a) => a.subject_id !== id));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('subjects').delete().eq('id', id);
        await client.from('attendance_records').delete().eq('subject_id', id);
        console.log('[Supabase] Subject & associated attendance deleted from Supabase');
      } catch (err) {
        console.warn('[Supabase] deleteSubject error:', err);
      }
    }
  },
};

// -------------------------------------------------------------
// ATTENDANCE RECORDS SERVICE (Supabase + Local Write-Through)
// -------------------------------------------------------------
export const attendanceService = {
  async getRecords(userId: string): Promise<AttendanceRecord[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('attendance_records')
          .select('*')
          .eq('user_id', userId)
          .order('attendance_date', { ascending: false });

        if (!error && data) {
          setLocalItem(STORAGE_ATTENDANCE, data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase getRecords failed, using local cache:', err);
      }
    }

    const all = getLocalItem<AttendanceRecord[]>(STORAGE_ATTENDANCE, []);
    return all.filter((r) => r.user_id === userId).sort((a, b) => b.attendance_date.localeCompare(a.attendance_date));
  },

  async addRecord(userId: string, record: Omit<AttendanceRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AttendanceRecord> {
    const all = getLocalItem<AttendanceRecord[]>(STORAGE_ATTENDANCE, []);
    const duplicate = all.find(
      (r) => r.user_id === userId && r.subject_id === record.subject_id && r.attendance_date === record.attendance_date
    );

    if (duplicate) {
      throw new Error(`An attendance record for this subject on ${record.attendance_date} already exists. Please edit that record instead.`);
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      subject_id: record.subject_id,
      attendance_date: record.attendance_date,
      status: record.status,
      topic: record.topic?.trim() || '',
      notes: record.notes?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLocalItem(STORAGE_ATTENDANCE, [newRecord, ...all]);

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('attendance_records')
          .insert({
            id: newRecord.id,
            user_id: userId,
            subject_id: record.subject_id,
            attendance_date: record.attendance_date,
            status: record.status,
            topic: record.topic?.trim() || '',
            notes: record.notes?.trim() || '',
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          console.log('[Supabase] Successfully saved attendance record to Supabase database:', data);
          return data;
        }
      } catch (err) {
        console.warn('[Supabase] Attendance insert network error:', err);
      }
    }

    return newRecord;
  },

  async updateRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const all = getLocalItem<AttendanceRecord[]>(STORAGE_ATTENDANCE, []);
    let updated: AttendanceRecord | null = null;
    const newList = all.map((r) => {
      if (r.id === id) {
        updated = { ...r, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return r;
    });

    setLocalItem(STORAGE_ATTENDANCE, newList);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from('attendance_records')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        console.log('[Supabase] Attendance record updated in Supabase');
      } catch (err) {
        console.warn('[Supabase] updateRecord error:', err);
      }
    }

    if (!updated) throw new Error('Record not found');
    return updated;
  },

  async deleteRecord(id: string): Promise<void> {
    const all = getLocalItem<AttendanceRecord[]>(STORAGE_ATTENDANCE, []);
    setLocalItem(STORAGE_ATTENDANCE, all.filter((r) => r.id !== id));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('attendance_records').delete().eq('id', id);
        console.log('[Supabase] Attendance record deleted from Supabase');
      } catch (err) {
        console.warn('[Supabase] deleteRecord error:', err);
      }
    }
  },

  async batchMark(userId: string, entries: Array<{ subject_id: string; status: 'Present' | 'Absent'; attendance_date: string; topic?: string }>): Promise<number> {
    let savedCount = 0;
    for (const entry of entries) {
      try {
        await this.addRecord(userId, {
          subject_id: entry.subject_id,
          attendance_date: entry.attendance_date,
          status: entry.status,
          topic: entry.topic || 'Regular Class',
          notes: 'Batch marked',
        });
        savedCount++;
      } catch (e) {
        const all = getLocalItem<AttendanceRecord[]>(STORAGE_ATTENDANCE, []);
        const index = all.findIndex((r) => r.user_id === userId && r.subject_id === entry.subject_id && r.attendance_date === entry.attendance_date);
        if (index >= 0) {
          all[index].status = entry.status;
          all[index].topic = entry.topic || 'Regular Class';
          setLocalItem(STORAGE_ATTENDANCE, all);
          savedCount++;

          const client = getSupabaseClient();
          if (client) {
            try {
              await client
                .from('attendance_records')
                .update({ status: entry.status, topic: entry.topic || 'Regular Class' })
                .eq('user_id', userId)
                .eq('subject_id', entry.subject_id)
                .eq('attendance_date', entry.attendance_date);
            } catch (err) {
              // Ignore batch update error
            }
          }
        }
      }
    }
    return savedCount;
  },

  async syncAllToSupabase(userId: string): Promise<{ subjectsSynced: number; recordsSynced: number }> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client is not connected');

    const localSubs = getLocalItem<Subject[]>(STORAGE_SUBJECTS, []).filter((s) => s.user_id === userId);
    const localAtt = getLocalItem<AttendanceRecord[]>(STORAGE_ATTENDANCE, []).filter((a) => a.user_id === userId);

    let subjectsSynced = 0;
    let recordsSynced = 0;

    for (const sub of localSubs) {
      const { error } = await client.from('subjects').upsert({
        id: sub.id,
        user_id: sub.user_id,
        code: sub.code,
        name: sub.name,
        faculty_name: sub.faculty_name,
        semester: sub.semester,
        course: sub.course,
        target_percentage: sub.target_percentage,
      });
      if (!error) subjectsSynced++;
    }

    for (const att of localAtt) {
      const { error } = await client.from('attendance_records').upsert({
        id: att.id,
        user_id: att.user_id,
        subject_id: att.subject_id,
        attendance_date: att.attendance_date,
        status: att.status,
        topic: att.topic || '',
        notes: att.notes || '',
      });
      if (!error) recordsSynced++;
    }

    return { subjectsSynced, recordsSynced };
  },
};

// -------------------------------------------------------------
// SAMPLE / EXAMPLE DATA SERVICE
// -------------------------------------------------------------
export const sampleDataService = {
  resetToZero3rdSemSubjects(userId: string) {
    const subs = getStandard3rdSemSubjects(userId);
    setLocalItem(STORAGE_SUBJECTS, subs);
    setLocalItem(STORAGE_ATTENDANCE, []);
  },

  // Populates the exact example scenario from the prompt if user clicks "Load Example Data"
  loadPromptExampleData(userId: string) {
    const subs = getStandard3rdSemSubjects(userId);
    setLocalItem(STORAGE_SUBJECTS, subs);

    const exampleConfig = [
      { subId: 'sub-1bcs301', attended: 35, conducted: 40 }, // 87.5%
      { subId: 'sub-1bcs302', attended: 32, conducted: 40 }, // 80%
      { subId: 'sub-1bcs303', attended: 30, conducted: 40 }, // 75%
      { subId: 'sub-1bcs304', attended: 34, conducted: 40 }, // 85%
      { subId: 'sub-1bcs305', attended: 29, conducted: 40 }, // 72.5%
      { subId: 'sub-1bcsl306', attended: 18, conducted: 20 }, // 90%
      { subId: 'sub-1bcsl307a', attended: 17, conducted: 20 }, // 85%
      { subId: 'sub-1bcp308', attended: 19, conducted: 20 }, // 95%
    ];

    const records: AttendanceRecord[] = [];
    const now = new Date();

    for (const item of exampleConfig) {
      const missedIndices = new Set<number>();
      const absentCount = item.conducted - item.attended;
      while (missedIndices.size < absentCount) {
        missedIndices.add(Math.floor(Math.random() * item.conducted));
      }

      for (let i = 0; i < item.conducted; i++) {
        const daysAgo = Math.floor((item.conducted - i) * 1.5);
        const dateObj = new Date(now.getTime() - daysAgo * 86400000);
        const dateStr = dateObj.toISOString().split('T')[0];
        const isAbsent = missedIndices.has(i);

        records.push({
          id: `att-${item.subId}-${i}`,
          user_id: userId,
          subject_id: item.subId,
          attendance_date: dateStr,
          status: isAbsent ? 'Absent' : 'Present',
          topic: `Lecture Unit ${((i % 5) + 1)}`,
          notes: isAbsent ? 'Missed class' : 'Attended',
          created_at: dateObj.toISOString(),
        });
      }
    }

    setLocalItem(STORAGE_ATTENDANCE, records);
  },

  clearAllData(userId: string) {
    const subs = getStandard3rdSemSubjects(userId);
    setLocalItem(STORAGE_SUBJECTS, subs);
    setLocalItem(STORAGE_ATTENDANCE, []);
  }
};
