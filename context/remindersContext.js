import { createContext, useContext, useEffect, useState } from "react";
import remindersRepository from "../repositories/RemindersRepository";
import NotificationService from "../services/notificationService";
import { useUser } from "./userContext";

const RemindersProvider = createContext();

export const RemindersContext = ({ children }) => {
  const [medicationReminders, setMedicationReminders] = useState([]);
  const [bpReminders, setBpReminders] = useState([]);
  const [doctorReminders, setDoctorReminders] = useState([]);
  const [workoutReminders, setWorkoutReminders] = useState([]);
  const [upcomingMedication, setUpcomingMedication] = useState([]);
  const [upcomingBP, setUpcomingBP] = useState([]);

  const [medicationError, setMedicationError] = useState(null);
  const [bpError, setBpError] = useState(null);
  const [doctorError, setDoctorError] = useState(null);
  const [workoutError, setWorkoutError] = useState(null);
  const [upcomingMedError, setUpcomingMedError] = useState(null);
  const [upcomingBPError, setUpcomingBPError] = useState(null);

  const [medicationLoading, setMedicationLoading] = useState(true);
  const [bpLoading, setBpLoading] = useState(true);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [workoutLoading, setWorkoutLoading] = useState(true);
  const [upcomingMedLoading, setUpcomingMedLoading] = useState(true);
  const [upcomingBPLoading, setUpcomingBPLoading] = useState(true);

  const { currentUser } = useUser();
  const USER_ID = currentUser?.id || 1; // Use current user ID or fallback to 1

  // Load all reminders data
  const loadAllData = async () => {
    await Promise.all([
      loadMedicationReminders(),
      loadBPReminders(),
      loadDoctorReminders(),
      loadWorkoutReminders(),
      loadUpcomingReminders()
    ]);
  };

  // Load medication reminders
  const loadMedicationReminders = async () => {
    try {
      setMedicationLoading(true);
      setMedicationError(null);
      
      const data = await remindersRepository.getMedicationReminders(USER_ID);
      setMedicationReminders(data);
    } catch (err) {
      console.error('[RemindersContext] Failed to load medication reminders:', err);
      setMedicationError(err.message);
      setMedicationReminders([]);
    } finally {
      setMedicationLoading(false);
    }
  };

  // Load BP reminders
  const loadBPReminders = async () => {
    try {
      setBpLoading(true);
      setBpError(null);
      
      const data = await remindersRepository.getBPReminders(USER_ID);
      setBpReminders(data);
    } catch (err) {
      console.error('[RemindersContext] Failed to load BP reminders:', err);
      setBpError(err.message);
      setBpReminders([]);
    } finally {
      setBpLoading(false);
    }
  };

  // Load doctor reminders
  const loadDoctorReminders = async () => {
    try {
      setDoctorLoading(true);
      setDoctorError(null);
      
      const data = await remindersRepository.getDoctorReminders(USER_ID);
      setDoctorReminders(data);
    } catch (err) {
      console.error('[RemindersContext] Failed to load doctor reminders:', err);
      setDoctorError(err.message);
      setDoctorReminders([]);
    } finally {
      setDoctorLoading(false);
    }
  };

  // Load workout reminders
  const loadWorkoutReminders = async () => {
    try {
      setWorkoutLoading(true);
      setWorkoutError(null);
      
      const data = await remindersRepository.getWorkoutReminders(USER_ID);
      setWorkoutReminders(data);
    } catch (err) {
      console.error('[RemindersContext] Failed to load workout reminders:', err);
      setWorkoutError(err.message);
      setWorkoutReminders([]);
    } finally {
      setWorkoutLoading(false);
    }
  };

  // Load upcoming reminders
  const loadUpcomingReminders = async () => {
    try {
      setUpcomingMedLoading(true);
      setUpcomingBPLoading(true);
      setUpcomingMedError(null);
      setUpcomingBPError(null);
      
      const upcoming = await remindersRepository.getUpcomingReminders(USER_ID, 24);
      setUpcomingMedication(upcoming.medication);
      setUpcomingBP(upcoming.bp);
    } catch (err) {
      console.error('[RemindersContext] Failed to load upcoming reminders:', err);
      setUpcomingMedError(err.message);
      setUpcomingBPError(err.message);
      setUpcomingMedication([]);
      setUpcomingBP([]);
    } finally {
      setUpcomingMedLoading(false);
      setUpcomingBPLoading(false);
    }
  };

  // Create reminder functions using repository
  const createMedicationReminder = async (reminderData) => {
    try {
      const newReminder = await remindersRepository.createMedicationReminder(USER_ID, reminderData);
      
      // Schedule notification
      if (newReminder && (newReminder.schedule_datetime || newReminder.id)) {
        console.log('[DEBUG] Medication reminder created, scheduling notification:', newReminder);
        await NotificationService.scheduleReminderNotification(newReminder, 'medication');
      }

      await loadMedicationReminders();
      await loadUpcomingReminders();
      return newReminder;
    } catch (err) {
      console.error('[RemindersContext] Failed to create medication reminder:', err);
      throw err;
    }
  };

  const createBPReminder = async (reminderData) => {
    try {
      const newReminder = await remindersRepository.createBPReminder(USER_ID, reminderData);
      
      // Schedule notification
      if (newReminder && (newReminder.reminder_datetime || newReminder.id)) {
        console.log('[DEBUG] BP reminder created, scheduling notification:', newReminder);
        await NotificationService.scheduleReminderNotification(newReminder, 'bp');
      }

      await loadBPReminders();
      await loadUpcomingReminders();
      return newReminder;
    } catch (err) {
      console.error('[RemindersContext] Failed to create BP reminder:', err);
      throw err;
    }
  };

  const createDoctorReminder = async (reminderData) => {
    try {
      const newReminder = await remindersRepository.createDoctorReminder(USER_ID, reminderData);
      
      // Schedule notification
      if (newReminder && (newReminder.appointment_datetime || newReminder.id)) {
        console.log('[DEBUG] Doctor reminder created, scheduling notification:', newReminder);
        await NotificationService.scheduleReminderNotification(newReminder, 'doctor');
      }

      await loadDoctorReminders();
      return newReminder;
    } catch (err) {
      console.error('[RemindersContext] Failed to create doctor reminder:', err);
      throw err;
    }
  };

  const createWorkoutReminder = async (reminderData) => {
    try {
      const newReminder = await remindersRepository.createWorkoutReminder(USER_ID, reminderData);
      
      // Schedule notification
      if (newReminder && (newReminder.workout_datetime || newReminder.id)) {
        console.log('[DEBUG] Workout reminder created, scheduling notification:', newReminder);
        await NotificationService.scheduleReminderNotification(newReminder, 'workout');
      }

      await loadWorkoutReminders();
      return newReminder;
    } catch (err) {
      console.error('[RemindersContext] Failed to create workout reminder:', err);
      throw err;
    }
  };

  // Mark as completed functions
  const markMedicationTaken = async (reminderId) => {
    try {
      await remindersRepository.markMedicationTaken(reminderId);
      await loadMedicationReminders();
      await loadUpcomingReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to mark medication taken:', err);
      throw err;
    }
  };

  const markBPCompleted = async (reminderId) => {
    try {
      await remindersRepository.markBPCompleted(reminderId);
      await loadBPReminders();
      await loadUpcomingReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to mark BP completed:', err);
      throw err;
    }
  };

  const markDoctorCompleted = async (reminderId) => {
    try {
      await remindersRepository.markDoctorCompleted(reminderId);
      await loadDoctorReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to mark doctor completed:', err);
      throw err;
    }
  };

  const markWorkoutCompleted = async (reminderId) => {
    try {
      await remindersRepository.markWorkoutCompleted(reminderId);
      await loadWorkoutReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to mark workout completed:', err);
      throw err;
    }
  };

  // Delete functions
  const deleteMedicationReminder = async (reminderId) => {
    try {
      await remindersRepository.deleteMedicationReminder(reminderId);
      await NotificationService.cancelReminderNotification(reminderId, 'medication');
      await loadMedicationReminders();
      await loadUpcomingReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to delete medication reminder:', err);
      throw err;
    }
  };

  const deleteBPReminder = async (reminderId) => {
    try {
      await remindersRepository.deleteBPReminder(reminderId);
      await NotificationService.cancelReminderNotification(reminderId, 'bp');
      await loadBPReminders();
      await loadUpcomingReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to delete BP reminder:', err);
      throw err;
    }
  };

  const deleteDoctorReminder = async (reminderId) => {
    try {
      await remindersRepository.deleteDoctorReminder(reminderId);
      await NotificationService.cancelReminderNotification(reminderId, 'doctor');
      await loadDoctorReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to delete doctor reminder:', err);
      throw err;
    }
  };

  const deleteWorkoutReminder = async (reminderId) => {
    try {
      await remindersRepository.deleteWorkoutReminder(reminderId);
      await NotificationService.cancelReminderNotification(reminderId, 'workout');
      await loadWorkoutReminders();
    } catch (err) {
      console.error('[RemindersContext] Failed to delete workout reminder:', err);
      throw err;
    }
  };

  // Get statistics
  const getRemindersStats = async (days = 30) => {
    try {
      return await remindersRepository.getRemindersStats(USER_ID, days);
    } catch (err) {
      console.error('[RemindersContext] Failed to get reminders stats:', err);
      throw err;
    }
  };

  // Get overdue reminders
  const getOverdueReminders = async () => {
    try {
      return await remindersRepository.getOverdueReminders(USER_ID);
    } catch (err) {
      console.error('[RemindersContext] Failed to get overdue reminders:', err);
      throw err;
    }
  };

  // Mutate functions for compatibility
  const mutateMedication = loadMedicationReminders;
  const mutateBP = loadBPReminders;
  const mutateDoctor = loadDoctorReminders;
  const mutateWorkout = loadWorkoutReminders;
  const mutateUpcomingMed = loadUpcomingReminders;
  const mutateUpcomingBP = loadUpcomingReminders;

  // Initial data load and reload when user changes
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const value = {
    // Data
    medicationReminders,
    bpReminders,
    doctorReminders,
    workoutReminders,
    upcomingMedication,
    upcomingBP,

    // Loading states
    medicationLoading,
    bpLoading,
    doctorLoading,
    workoutLoading,
    upcomingMedLoading,
    upcomingBPLoading,

    // Errors
    medicationError,
    bpError,
    doctorError,
    workoutError,
    upcomingMedError,
    upcomingBPError,

    // Mutate functions (for compatibility)
    mutateMedication,
    mutateBP,
    mutateDoctor,
    mutateWorkout,
    mutateUpcomingMed,
    mutateUpcomingBP,

    // CRUD functions
    createMedicationReminder,
    createBPReminder,
    createDoctorReminder,
    createWorkoutReminder,
    markMedicationTaken,
    markBPCompleted,
    markDoctorCompleted,
    markWorkoutCompleted,
    deleteMedicationReminder,
    deleteBPReminder,
    deleteDoctorReminder,
    deleteWorkoutReminder,

    // Utility functions
    getRemindersStats,
    getOverdueReminders,
  };

  return (
    <RemindersProvider.Provider value={value}>
      {children}
    </RemindersProvider.Provider>
  );
};

// Hook for using the context
export const useReminders = () => {
  const context = useContext(RemindersProvider);
  if (!context) {
    throw new Error('useReminders must be used within a RemindersContext');
  }
  return context;
};

export default RemindersProvider;
