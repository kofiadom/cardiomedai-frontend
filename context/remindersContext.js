import { createContext } from "react";
import useSWR from "swr";
import NotificationService from "../services/notificationService";

const RemindersProvider = createContext();

const BASE_URL = "https://cardiomedai-api.onrender.com";
const USER_ID = 1; // Should come from user context in real app

const fetcher = async (url) => {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data;
};

export const RemindersContext = ({ children }) => {
  // Medication Reminders
  const { 
    data: medicationReminders, 
    error: medicationError, 
    isLoading: medicationLoading, 
    mutate: mutateMedication 
  } = useSWR(`${BASE_URL}/reminders/${USER_ID}`, fetcher);

  // BP Check Reminders
  const { 
    data: bpReminders, 
    error: bpError, 
    isLoading: bpLoading, 
    mutate: mutateBP 
  } = useSWR(`${BASE_URL}/reminders/bp-reminders/${USER_ID}`, fetcher);

  // Doctor Appointment Reminders
  const { 
    data: doctorReminders, 
    error: doctorError, 
    isLoading: doctorLoading, 
    mutate: mutateDoctor 
  } = useSWR(`${BASE_URL}/reminders/doctor-appointments/${USER_ID}`, fetcher);

  // Workout Reminders
  const { 
    data: workoutReminders, 
    error: workoutError, 
    isLoading: workoutLoading, 
    mutate: mutateWorkout 
  } = useSWR(`${BASE_URL}/reminders/workouts/${USER_ID}`, fetcher);

  // Upcoming Reminders (next 24 hours)
  const { 
    data: upcomingMedication, 
    error: upcomingMedError, 
    isLoading: upcomingMedLoading, 
    mutate: mutateUpcomingMed 
  } = useSWR(`${BASE_URL}/reminders/upcoming/${USER_ID}?hours=24`, fetcher);

  const { 
    data: upcomingBP, 
    error: upcomingBPError, 
    isLoading: upcomingBPLoading, 
    mutate: mutateUpcomingBP 
  } = useSWR(`${BASE_URL}/reminders/bp-upcoming/${USER_ID}?hours=24`, fetcher);

  // Helper functions for API calls
  const createMedicationReminder = async (reminderData) => {
    const response = await fetch(`${BASE_URL}/reminders/?user_id=${USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminderData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create medication reminder');
    }
    
    const data = await response.json();
    console.log('[DEBUG] Full API response for medication reminder:', data);

    // Schedule notification for the new reminder
    // Based on the logs, the API returns the reminder data directly
    if (data && (data.schedule_datetime || data.id)) {
      console.log('[DEBUG] Medication reminder created, scheduling notification:', data);
      await NotificationService.scheduleReminderNotification(data, 'medication');
    } else {
      console.log('[DEBUG] No valid reminder data found in API response:', data);
    }

    mutateMedication(); // Refresh data
    return data;
  };

  const createBPReminder = async (reminderData) => {
    const response = await fetch(`${BASE_URL}/reminders/bp-reminder/?user_id=${USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminderData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create BP reminder');
    }
    
    const data = await response.json();
    console.log('[DEBUG] Full API response for BP reminder:', data);

    // Schedule notification for the new reminder
    // Based on the logs, the API returns the reminder data directly
    if (data && (data.reminder_datetime || data.id)) {
      console.log('[DEBUG] BP reminder created, scheduling notification:', data);
      await NotificationService.scheduleReminderNotification(data, 'bp');
    } else {
      console.log('[DEBUG] No valid BP reminder data found in API response:', data);
    }

    mutateBP(); // Refresh data
    return data;
  };

  const createDoctorReminder = async (reminderData) => {
    const response = await fetch(`${BASE_URL}/reminders/doctor-appointment/?user_id=${USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create doctor appointment reminder');
    }

    const data = await response.json();
    console.log('[DEBUG] Full API response for doctor reminder:', data);

    // Schedule notification for the new reminder
    // Based on the logs, the API returns the reminder data directly
    if (data && (data.appointment_datetime || data.id)) {
      console.log('[DEBUG] Doctor reminder created, scheduling notification:', data);
      await NotificationService.scheduleReminderNotification(data, 'doctor');
    } else {
      console.log('[DEBUG] No valid doctor reminder data found in API response:', data);
    }

    mutateDoctor(); // Refresh data
    return data;
  };

  const createWorkoutReminder = async (reminderData) => {
    const response = await fetch(`${BASE_URL}/reminders/workout/?user_id=${USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminderData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create workout reminder');
    }
    
    const data = await response.json();
    console.log('[DEBUG] Full API response for workout reminder:', data);

    // Schedule notification for the new reminder
    // Based on the logs, the API returns the reminder data directly
    if (data && (data.workout_datetime || data.id)) {
      console.log('[DEBUG] Workout reminder created, scheduling notification:', data);
      await NotificationService.scheduleReminderNotification(data, 'workout');
    } else {
      console.log('[DEBUG] No valid workout reminder data found in API response:', data);
    }

    mutateWorkout(); // Refresh data
    return data;
  };

  const markMedicationTaken = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/mark-taken/${reminderId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to mark medication as taken');
    }

    mutateMedication(); // Refresh data
    mutateUpcomingMed(); // Refresh upcoming data
    return response.json();
  };

  const markBPCompleted = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/bp-reminder/${reminderId}/complete`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to mark BP check as completed');
    }

    mutateBP(); // Refresh data
    mutateUpcomingBP(); // Refresh upcoming data
    return response.json();
  };

  const markDoctorCompleted = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/doctor-appointment/${reminderId}/complete`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark doctor appointment as completed');
    }
    
    mutateDoctor(); // Refresh data
    return response.json();
  };

  const markWorkoutCompleted = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/workout/${reminderId}/complete`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark workout as completed');
    }
    
    mutateWorkout(); // Refresh data
    return response.json();
  };

  // Delete functions
  const deleteMedicationReminder = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/reminder/${reminderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete medication reminder');
    }

    // Cancel the notification for this reminder
    await NotificationService.cancelReminderNotification(reminderId, 'medication');

    mutateMedication(); // Refresh data
    mutateUpcomingMed(); // Also refresh upcoming data
    return response.json();
  };

  const deleteBPReminder = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/bp-reminder/${reminderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete BP reminder');
    }

    // Cancel the notification for this reminder
    await NotificationService.cancelReminderNotification(reminderId, 'bp');

    mutateBP(); // Refresh data
    mutateUpcomingBP(); // Also refresh upcoming data
    return response.json();
  };

  const deleteDoctorReminder = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/doctor-appointment/${reminderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete doctor appointment reminder');
    }

    // Cancel the notification for this reminder
    await NotificationService.cancelReminderNotification(reminderId, 'doctor');

    mutateDoctor(); // Refresh data
    return response.json();
  };

  const deleteWorkoutReminder = async (reminderId) => {
    const response = await fetch(`${BASE_URL}/reminders/workout/${reminderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete workout reminder');
    }

    // Cancel the notification for this reminder
    await NotificationService.cancelReminderNotification(reminderId, 'workout');

    mutateWorkout(); // Refresh data
    return response.json();
  };

  const value = {
    // Data
    medicationReminders: medicationReminders || [],
    bpReminders: bpReminders || [],
    doctorReminders: doctorReminders || [],
    workoutReminders: workoutReminders || [],
    upcomingMedication: upcomingMedication || [],
    upcomingBP: upcomingBP || [],

    // Loading states
    medicationLoading: medicationLoading || false,
    bpLoading: bpLoading || false,
    doctorLoading: doctorLoading || false,
    workoutLoading: workoutLoading || false,
    upcomingMedLoading: upcomingMedLoading || false,
    upcomingBPLoading: upcomingBPLoading || false,

    // Errors
    medicationError: medicationError || null,
    bpError: bpError || null,
    doctorError: doctorError || null,
    workoutError: workoutError || null,
    upcomingMedError: upcomingMedError || null,
    upcomingBPError: upcomingBPError || null,

    // Mutate functions
    mutateMedication: mutateMedication || (() => {}),
    mutateBP: mutateBP || (() => {}),
    mutateDoctor: mutateDoctor || (() => {}),
    mutateWorkout: mutateWorkout || (() => {}),
    mutateUpcomingMed: mutateUpcomingMed || (() => {}),
    mutateUpcomingBP: mutateUpcomingBP || (() => {}),

    // API functions
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
  };

  return (
    <RemindersProvider.Provider value={value}>
      {children}
    </RemindersProvider.Provider>
  );
};

export default RemindersProvider;
