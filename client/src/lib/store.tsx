'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MedicationCourse,
  DoseEvent,
  AdherenceMetrics,
  HealthInsight,
  CaregiverConsent,
  ActivityLog,
  Medicine,
  DoseStatus,
  UserProfile
} from './types';
import {
  initialMedicines,
  initialCourses,
  initialDoseEvents,
  initialMetrics,
  initialInsights,
  initialCaregivers,
  initialActivities
} from './mockData';
import { apiClient } from './api';

const emptyMetrics: AdherenceMetrics = {
  adherencePercentage: 0,
  lastWeekDelta: 0,
  dosesTakenToday: 0,
  dosesTotalToday: 0,
  activeMedicationsCount: 0,
  streakDays: 0,
  weeklyTrend: [
    { day: 'Mon', date: '09-20', rate: 100 },
    { day: 'Tue', date: '09-21', rate: 100 },
    { day: 'Wed', date: '09-22', rate: 100 },
    { day: 'Thu', date: '09-23', rate: 100 },
    { day: 'Fri', date: '09-24', rate: 100 },
    { day: 'Sat', date: '09-25', rate: 100 },
    { day: 'Sun', date: '09-26', rate: 100 },
  ],
};

const createWelcomeActivity = (userName: string): ActivityLog => ({
  id: `act-welcome-${Date.now()}`,
  timestamp: 'Just now',
  type: 'schedule_created',
  title: 'Account Ready',
  description: `Welcome ${userName}! Add your first medication course or upload a prescription to start scheduling.`,
  status: 'info',
});

interface AppContextType {
  // User Authentication & Profile
  user: UserProfile | null;
  authInitialized: boolean;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  registerUser: (data: { name: string; email: string; password?: string; role?: string; conditions?: string[] }) => Promise<boolean>;
  logoutUser: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isProfileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;

  // Patient info
  patientName: string;
  patientGreeting: string;

  // Medicines & Courses
  medicines: Medicine[];
  courses: MedicationCourse[];
  activeCoursesCount: number;
  addCourse: (course: Omit<MedicationCourse, 'id' | 'patientId' | 'status'>) => void;
  removeCourse: (courseId: string) => void;

  // Doses & Scheduling
  doseEvents: DoseEvent[];
  markDose: (doseId: string, status: DoseStatus) => void;
  nextPendingDose?: DoseEvent;

  // Adherence
  metrics: AdherenceMetrics;

  // Health Insights
  insights: HealthInsight[];
  dismissInsight: (id: string) => void;

  // Caregivers
  caregivers: CaregiverConsent[];
  addCaregiver: (caregiver: Omit<CaregiverConsent, 'id'>) => Promise<void>;
  updateCaregiver: (id: string, updates: Partial<CaregiverConsent>) => Promise<void>;
  removeCaregiver: (id: string) => Promise<void>;
  toggleCaregiverConsent: (id: string, granted: boolean) => void;
  updateCaregiverRules: (id: string, rules: Partial<CaregiverConsent>) => void;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<boolean>;

  // Activity Log
  activities: ActivityLog[];

  // Conversational Assistant State
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const [medicines] = useState<Medicine[]>(initialMedicines);
  const [courses, setCourses] = useState<MedicationCourse[]>([]);
  const [doseEvents, setDoseEvents] = useState<DoseEvent[]>([]);
  const [metrics, setMetrics] = useState<AdherenceMetrics>(emptyMetrics);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverConsent[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  // Helper to load user-scoped data
  const loadUserData = (currentUser: UserProfile) => {
    const isDemo =
      currentUser.email === 'rahul.sharma@example.com' ||
      currentUser.id === 'demo-rahul' ||
      currentUser.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

    if (typeof window === 'undefined') return;

    const savedCourses = localStorage.getItem(`arogyalink_courses_${currentUser.id}`);
    const savedDoses = localStorage.getItem(`arogyalink_doses_${currentUser.id}`);
    const savedCaregivers = localStorage.getItem(`arogyalink_caregivers_${currentUser.id}`);
    const savedActivities = localStorage.getItem(`arogyalink_activities_${currentUser.id}`);

    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch {
        setCourses([]);
      }
    } else if (isDemo) {
      setCourses(initialCourses);
    } else {
      setCourses([]);
    }

    if (savedDoses) {
      try {
        setDoseEvents(JSON.parse(savedDoses));
      } catch {
        setDoseEvents([]);
      }
    } else if (isDemo) {
      setDoseEvents(initialDoseEvents);
    } else {
      setDoseEvents([]);
    }

    if (savedCaregivers) {
      try {
        setCaregivers(JSON.parse(savedCaregivers));
      } catch {
        setCaregivers([]);
      }
    } else if (isDemo) {
      setCaregivers(initialCaregivers);
    } else {
      setCaregivers([]);
    }

    if (savedActivities) {
      try {
        setActivities(JSON.parse(savedActivities));
      } catch {
        setActivities([]);
      }
    } else if (isDemo) {
      setActivities(initialActivities);
    } else {
      setActivities([createWelcomeActivity(currentUser.name)]);
    }

    if (isDemo && !savedCourses) {
      setMetrics(initialMetrics);
      setInsights(initialInsights);
    } else {
      setInsights([]);
    }
  };

  // Initial authentication & session check
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const loggedOut = localStorage.getItem('arogyalink_logged_out');
        const savedUser = localStorage.getItem('arogyalink_user');

        if (loggedOut === 'true') {
          setUser(null);
        } else if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          loadUserData(parsed);
        } else {
          // If no user exists, leave user as null so AuthGuard directs to /auth
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    } finally {
      setAuthInitialized(true);
    }
  }, []);

  const patientName = user ? user.name : 'Guest Patient';
  const patientGreeting = user
    ? `Good Morning, ${user.name.split(' ')[0]} 👋`
    : 'Welcome to ArogyaLink 👋';

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      if (typeof window !== 'undefined') {
        localStorage.setItem('arogyalink_user', JSON.stringify(updated));
      }
      if (updated.id) {
        apiClient.updateProfile(updated.id, data).catch(console.warn);
      }
      return updated;
    });
  };

  const completeOnboarding = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updated: UserProfile = {
      ...user,
      ...data,
      onboardingCompleted: true,
    };
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arogyalink_user', JSON.stringify(updated));
      localStorage.removeItem('arogyalink_onboarding_draft');
    }
    try {
      await apiClient.updateProfile(user.id, {
        ...data,
        onboardingCompleted: true,
      });
      return true;
    } catch (err) {
      console.warn('Failed to sync completed onboarding to backend:', err);
      return true; // Still true locally
    }
  };

  const loginUser = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await apiClient.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        loadUserData(res.user);

        if (typeof window !== 'undefined') {
          localStorage.setItem('arogyalink_user', JSON.stringify(res.user));
          localStorage.removeItem('arogyalink_logged_out');
        }
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    conditions?: string[];
  }): Promise<boolean> => {
    try {
      const res = await apiClient.register(data);
      if (res.success && res.user) {
        const newUser = res.user;
        setUser(newUser);

        // Every new account starts completely FRESH and EMPTY
        setCourses([]);
        setDoseEvents([]);
        setCaregivers([]);
        setInsights([]);
        setMetrics(emptyMetrics);

        const welcomeActivities = [createWelcomeActivity(newUser.name)];
        setActivities(welcomeActivities);

        if (typeof window !== 'undefined') {
          localStorage.setItem('arogyalink_user', JSON.stringify(newUser));
          localStorage.removeItem('arogyalink_logged_out');

          // Initialize fresh scoped local storage for this new user id
          localStorage.setItem(`arogyalink_courses_${newUser.id}`, JSON.stringify([]));
          localStorage.setItem(`arogyalink_doses_${newUser.id}`, JSON.stringify([]));
          localStorage.setItem(`arogyalink_caregivers_${newUser.id}`, JSON.stringify([]));
          localStorage.setItem(`arogyalink_activities_${newUser.id}`, JSON.stringify(welcomeActivities));
        }
        return true;
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
    return false;
  };

  const logoutUser = () => {
    setUser(null);
    setCourses([]);
    setDoseEvents([]);
    setCaregivers([]);
    setActivities([]);
    setInsights([]);
    setMetrics(emptyMetrics);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('arogyalink_user');
      localStorage.setItem('arogyalink_logged_out', 'true');
    }
  };

  // Recalculate deterministic adherence metrics whenever doses change
  useEffect(() => {
    const totalDoses = doseEvents.length;
    const takenDoses = doseEvents.filter((d) => d.status === 'taken').length;
    const rate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    setMetrics((prev) => ({
      ...prev,
      adherencePercentage: rate,
      dosesTakenToday: takenDoses,
      dosesTotalToday: totalDoses,
      activeMedicationsCount: courses.filter((c) => c.status === 'active').length,
    }));
  }, [doseEvents, courses]);

  // User-scoped storage helpers
  const updateCoursesForUser = (newCourses: MedicationCourse[]) => {
    setCourses(newCourses);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`arogyalink_courses_${user.id}`, JSON.stringify(newCourses));
    }
  };

  const updateDosesForUser = (newDoses: DoseEvent[]) => {
    setDoseEvents(newDoses);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`arogyalink_doses_${user.id}`, JSON.stringify(newDoses));
    }
  };

  const updateActivitiesForUser = (newActs: ActivityLog[]) => {
    setActivities(newActs);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`arogyalink_activities_${user.id}`, JSON.stringify(newActs));
    }
  };

  const updateCaregiversForUser = (newCgs: CaregiverConsent[]) => {
    setCaregivers(newCgs);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`arogyalink_caregivers_${user.id}`, JSON.stringify(newCgs));
    }
  };

  // Mark dose as taken, missed, or skipped
  const markDose = (doseId: string, newStatus: DoseStatus) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let targetDose: DoseEvent | undefined;

    const updatedDoses = doseEvents.map((dose) => {
      if (dose.id === doseId) {
        targetDose = dose;
        return {
          ...dose,
          status: newStatus,
          takenAt: newStatus === 'taken' ? timeNow : undefined,
          missedAt: newStatus === 'missed' ? timeNow : undefined,
          isNext: false,
        };
      }
      return dose;
    });

    updateDosesForUser(updatedDoses);

    // Log deterministic activity
    if (targetDose) {
      const isTaken = newStatus === 'taken';
      const isMissed = newStatus === 'missed';
      const title = isTaken
        ? 'Dose Taken Successfully'
        : isMissed
          ? 'Missed Dose Detected'
          : 'Dose Skipped';

      const desc = `${targetDose.medicineName} (${targetDose.scheduledTime}) marked as ${newStatus}`;

      const newActivity: ActivityLog = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: isTaken ? 'dose_taken' : isMissed ? 'dose_missed' : 'medication_confirmed',
        title,
        description: desc,
        status: isTaken ? 'success' : isMissed ? 'warning' : 'info',
      };

      updateActivitiesForUser([newActivity, ...activities]);

      // If missed dose and caregiver consent is granted, simulate deterministic notification
      if (isMissed) {
        caregivers.forEach((cg) => {
          if (cg.consentGranted && cg.notifyOnMissedDose) {
            const caregiverAlert: ActivityLog = {
              id: `act-cg-${Date.now()}`,
              timestamp: 'Just now',
              type: 'caregiver_alert',
              title: `Caregiver Alert Sent to ${cg.name}`,
              description: `Automated consent-based notification sent regarding missed ${targetDose?.medicineName} dose.`,
              status: 'warning',
            };
            updateActivitiesForUser([caregiverAlert, ...activities]);
          }
        });
      }
    }
  };

  const addCourse = (courseData: Omit<MedicationCourse, 'id' | 'patientId' | 'status'>) => {
    const currentUserId = user ? user.id : 'patient-user';
    const newCourse: MedicationCourse = {
      ...courseData,
      id: `course-${Date.now()}`,
      patientId: currentUserId,
      status: 'active',
    };

    const updatedCourses = [...courses, newCourse];
    updateCoursesForUser(updatedCourses);

    // Sync to backend for server-side automated reminder scheduling
    if (user && user.id) {
      apiClient.createCourse(user.id, newCourse).catch(console.warn);
    }

    // Deterministically generate schedule dose events for today
    const newEvents: DoseEvent[] = newCourse.timesOfDay.map((time, idx) => ({
      id: `dose-new-${Date.now()}-${idx}`,
      courseId: newCourse.id,
      medicineName: newCourse.medicineName,
      dosage: newCourse.dosage,
      scheduledTime: time,
      scheduledDate: new Date().toISOString().split('T')[0],
      mealRelation: newCourse.mealRelation.replace('_', ' '),
      status: 'pending',
    }));

    const updatedDoses = [...doseEvents, ...newEvents];
    updateDosesForUser(updatedDoses);

    const newActivity: ActivityLog = {
      id: `act-add-${Date.now()}`,
      timestamp: 'Just now',
      type: 'schedule_created',
      title: 'New Medication Scheduled',
      description: `${newCourse.medicineName} added to personalized schedule (${newCourse.frequency}). Automated email reminders enabled.`,
      status: 'success',
    };
    updateActivitiesForUser([newActivity, ...activities]);
  };

  const removeCourse = (courseId: string) => {
    const updatedCourses = courses.filter((c) => c.id !== courseId);
    const updatedDoses = doseEvents.filter((d) => d.courseId !== courseId);
    updateCoursesForUser(updatedCourses);
    updateDosesForUser(updatedDoses);

    if (user && user.id) {
      apiClient.deleteCourse(user.id, courseId).catch(console.warn);
    }
  };

  const dismissInsight = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  const addCaregiver = async (cgData: Omit<CaregiverConsent, 'id'>) => {
    const newCg: CaregiverConsent = {
      ...cgData,
      id: `cg-${Date.now()}`,
      patientId: user?.id,
      consentGranted: cgData.consentGranted ?? true,
      grantedAt: cgData.consentGranted ? new Date().toLocaleString() : undefined,
      notifyOnMissedDose: cgData.notifyOnMissedDose ?? true,
      notifyAfterMinutes: cgData.notifyAfterMinutes || 45,
      notifyOnLowStock: cgData.notifyOnLowStock ?? true,
    };
    const updated = [...caregivers, newCg];
    updateCaregiversForUser(updated);
    if (user?.id) {
      apiClient.addCaregiver(user.id, newCg).catch(console.warn);
    }
  };

  const updateCaregiver = async (id: string, updates: Partial<CaregiverConsent>) => {
    const updated = caregivers.map((cg) => (cg.id === id ? { ...cg, ...updates } : cg));
    updateCaregiversForUser(updated);
    if (user?.id) {
      apiClient.updateCaregiver(user.id, id, updates).catch(console.warn);
    }
  };

  const removeCaregiver = async (id: string) => {
    const updated = caregivers.filter((cg) => cg.id !== id);
    updateCaregiversForUser(updated);
    if (user?.id) {
      apiClient.deleteCaregiver(user.id, id).catch(console.warn);
    }
  };

  const toggleCaregiverConsent = (id: string, granted: boolean) => {
    const updated = caregivers.map((cg) =>
      cg.id === id
        ? {
          ...cg,
          consentGranted: granted,
          grantedAt: granted ? new Date().toLocaleString() : undefined,
        }
        : cg
    );
    updateCaregiversForUser(updated);
    if (user?.id) {
      apiClient.updateCaregiver(user.id, id, {
        consentGranted: granted,
        grantedAt: granted ? new Date().toISOString() : undefined,
      }).catch(console.warn);
    }
  };

  const updateCaregiverRules = (id: string, rules: Partial<CaregiverConsent>) => {
    const updated = caregivers.map((cg) => (cg.id === id ? { ...cg, ...rules } : cg));
    updateCaregiversForUser(updated);
    if (user?.id) {
      apiClient.updateCaregiver(user.id, id, rules).catch(console.warn);
    }
  };

  const nextPendingDose = doseEvents.find((d) => d.status === 'pending');

  return (
    <AppContext.Provider
      value={{
        user,
        authInitialized,
        isProfileModalOpen,
        setProfileModalOpen,
        updateProfile,
        completeOnboarding,
        loginUser,
        registerUser,
        logoutUser,
        patientName,
        patientGreeting,
        medicines,
        courses,
        activeCoursesCount: courses.filter((c) => c.status === 'active').length,
        addCourse,
        removeCourse,
        doseEvents,
        markDose,
        nextPendingDose,
        metrics,
        insights,
        dismissInsight,
        caregivers,
        addCaregiver,
        updateCaregiver,
        removeCaregiver,
        toggleCaregiverConsent,
        updateCaregiverRules,
        activities,
        isAssistantOpen,
        setAssistantOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
