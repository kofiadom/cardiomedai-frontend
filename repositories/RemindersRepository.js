import BaseRepository from './BaseRepository';

class RemindersRepository extends BaseRepository {
  constructor() {
    super('medication_reminders', '/reminders');
  }

  // Create medication reminder
  async createMedicationReminder(userId, reminderData) {
    try {
      const requiredFields = ['name', 'dosage', 'schedule_datetime', 'schedule_dosage'];
      for (const field of requiredFields) {
        if (!reminderData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const data = {
        ...reminderData,
        user_id: userId,
        is_taken: 0
      };

      // Ensure we're using the correct table for medication reminders
      return await this.createInTable('medication_reminders', data, userId);
    } catch (error) {
      console.error('[RemindersRepository] CreateMedicationReminder failed:', error);
      throw error;
    }
  }

  // Create BP reminder
  async createBPReminder(userId, reminderData) {
    try {
      if (!reminderData.reminder_datetime) {
        throw new Error('Missing required field: reminder_datetime');
      }

      const data = {
        ...reminderData,
        user_id: userId,
        bp_category: reminderData.bp_category || 'manual',
        is_completed: 0
      };

      // Use bp_reminders table
      const result = await this.createInTable('bp_reminders', data, userId);
      return result;
    } catch (error) {
      console.error('[RemindersRepository] CreateBPReminder failed:', error);
      throw error;
    }
  }

  // Create doctor appointment reminder
  async createDoctorReminder(userId, reminderData) {
    try {
      const requiredFields = ['appointment_datetime', 'doctor_name', 'appointment_type'];
      for (const field of requiredFields) {
        if (!reminderData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const data = {
        ...reminderData,
        user_id: userId,
        is_completed: 0
      };

      return await this.createInTable('doctor_reminders', data, userId);
    } catch (error) {
      console.error('[RemindersRepository] CreateDoctorReminder failed:', error);
      throw error;
    }
  }

  // Create workout reminder
  async createWorkoutReminder(userId, reminderData) {
    try {
      const requiredFields = ['workout_datetime', 'workout_type'];
      for (const field of requiredFields) {
        if (!reminderData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const data = {
        ...reminderData,
        user_id: userId,
        is_completed: 0
      };

      return await this.createInTable('workout_reminders', data, userId);
    } catch (error) {
      console.error('[RemindersRepository] CreateWorkoutReminder failed:', error);
      throw error;
    }
  }

  // Helper method to create in specific table
  async createInTable(tableName, data, userId) {
    const originalTableName = this.tableName;
    this.tableName = tableName;
    try {
      const result = await this.create(data, userId);
      return result;
    } finally {
      this.tableName = originalTableName;
    }
  }

  // Get medication reminders for user
  async getMedicationReminders(userId, includeTaken = true) {
    try {
      const conditions = { user_id: userId };
      if (!includeTaken) {
        conditions.is_taken = 0;
      }
      
      // Ensure we're using the correct table
      const originalTableName = this.tableName;
      this.tableName = 'medication_reminders';
      try {
        return await this.findAll(conditions, 'schedule_datetime ASC');
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] GetMedicationReminders failed:', error);
      throw error;
    }
  }

  // Get BP reminders for user
  async getBPReminders(userId, includeCompleted = true) {
    try {
      const conditions = { user_id: userId };
      if (!includeCompleted) {
        conditions.is_completed = 0;
      }

      const originalTableName = this.tableName;
      this.tableName = 'bp_reminders';
      try {
        return await this.findAll(conditions, 'reminder_datetime ASC');
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] GetBPReminders failed:', error);
      throw error;
    }
  }

  // Get doctor reminders for user
  async getDoctorReminders(userId, includeCompleted = true) {
    try {
      const conditions = { user_id: userId };
      if (!includeCompleted) {
        conditions.is_completed = 0;
      }

      const originalTableName = this.tableName;
      this.tableName = 'doctor_reminders';
      try {
        return await this.findAll(conditions, 'appointment_datetime ASC');
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] GetDoctorReminders failed:', error);
      throw error;
    }
  }

  // Get workout reminders for user
  async getWorkoutReminders(userId, includeCompleted = true) {
    try {
      const conditions = { user_id: userId };
      if (!includeCompleted) {
        conditions.is_completed = 0;
      }

      const originalTableName = this.tableName;
      this.tableName = 'workout_reminders';
      try {
        return await this.findAll(conditions, 'workout_datetime ASC');
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] GetWorkoutReminders failed:', error);
      throw error;
    }
  }

  // Get upcoming reminders (next 24 hours)
  async getUpcomingReminders(userId, hours = 24) {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));

      const results = {
        medication: [],
        bp: [],
        doctor: [],
        workout: []
      };

      // Get medication reminders
      const medicationReminders = await this.getMedicationReminders(userId, false);
      results.medication = medicationReminders.filter(reminder => {
        const reminderTime = new Date(reminder.schedule_datetime);
        return reminderTime >= now && reminderTime <= futureTime;
      });

      // Get BP reminders
      const bpReminders = await this.getBPReminders(userId, false);
      results.bp = bpReminders.filter(reminder => {
        const reminderTime = new Date(reminder.reminder_datetime);
        return reminderTime >= now && reminderTime <= futureTime;
      });

      // Get doctor reminders
      const doctorReminders = await this.getDoctorReminders(userId, false);
      results.doctor = doctorReminders.filter(reminder => {
        const reminderTime = new Date(reminder.appointment_datetime);
        return reminderTime >= now && reminderTime <= futureTime;
      });

      // Get workout reminders
      const workoutReminders = await this.getWorkoutReminders(userId, false);
      results.workout = workoutReminders.filter(reminder => {
        const reminderTime = new Date(reminder.workout_datetime);
        return reminderTime >= now && reminderTime <= futureTime;
      });

      return results;
    } catch (error) {
      console.error('[RemindersRepository] GetUpcomingReminders failed:', error);
      throw error;
    }
  }

  // Mark medication as taken
  async markMedicationTaken(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'medication_reminders';
      try {
        return await this.update(reminderId, {
          is_taken: 1,
          taken_at: new Date().toISOString()
        });
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] MarkMedicationTaken failed:', error);
      throw error;
    }
  }

  // Mark BP reminder as completed
  async markBPCompleted(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'bp_reminders';
      try {
        return await this.update(reminderId, {
          is_completed: 1,
          completed_at: new Date().toISOString()
        });
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] MarkBPCompleted failed:', error);
      throw error;
    }
  }

  // Mark doctor appointment as completed
  async markDoctorCompleted(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'doctor_reminders';
      try {
        return await this.update(reminderId, {
          is_completed: 1,
          completed_at: new Date().toISOString()
        });
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] MarkDoctorCompleted failed:', error);
      throw error;
    }
  }

  // Mark workout as completed
  async markWorkoutCompleted(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'workout_reminders';
      try {
        return await this.update(reminderId, {
          is_completed: 1,
          completed_at: new Date().toISOString()
        });
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] MarkWorkoutCompleted failed:', error);
      throw error;
    }
  }

  // Delete medication reminder
  async deleteMedicationReminder(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'medication_reminders';
      try {
        return await this.delete(reminderId);
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] DeleteMedicationReminder failed:', error);
      throw error;
    }
  }

  // Delete BP reminder
  async deleteBPReminder(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'bp_reminders';
      try {
        return await this.delete(reminderId);
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] DeleteBPReminder failed:', error);
      throw error;
    }
  }

  // Delete doctor reminder
  async deleteDoctorReminder(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'doctor_reminders';
      try {
        return await this.delete(reminderId);
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] DeleteDoctorReminder failed:', error);
      throw error;
    }
  }

  // Delete workout reminder
  async deleteWorkoutReminder(reminderId) {
    try {
      const originalTableName = this.tableName;
      this.tableName = 'workout_reminders';
      try {
        return await this.delete(reminderId);
      } finally {
        this.tableName = originalTableName;
      }
    } catch (error) {
      console.error('[RemindersRepository] DeleteWorkoutReminder failed:', error);
      throw error;
    }
  }

  // Get overdue reminders
  async getOverdueReminders(userId) {
    try {
      const now = new Date();
      const results = {
        medication: [],
        bp: [],
        doctor: [],
        workout: []
      };

      // Get overdue medication reminders
      const medicationReminders = await this.getMedicationReminders(userId, false);
      results.medication = medicationReminders.filter(reminder => 
        new Date(reminder.schedule_datetime) < now
      );

      // Get overdue BP reminders
      const bpReminders = await this.getBPReminders(userId, false);
      results.bp = bpReminders.filter(reminder => 
        new Date(reminder.reminder_datetime) < now
      );

      // Get overdue doctor appointments
      const doctorReminders = await this.getDoctorReminders(userId, false);
      results.doctor = doctorReminders.filter(reminder => 
        new Date(reminder.appointment_datetime) < now
      );

      // Get overdue workouts
      const workoutReminders = await this.getWorkoutReminders(userId, false);
      results.workout = workoutReminders.filter(reminder => 
        new Date(reminder.workout_datetime) < now
      );

      return results;
    } catch (error) {
      console.error('[RemindersRepository] GetOverdueReminders failed:', error);
      throw error;
    }
  }

  // Get reminders statistics
  async getRemindersStats(userId, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const stats = {
        medication: { total: 0, completed: 0, overdue: 0 },
        bp: { total: 0, completed: 0, overdue: 0 },
        doctor: { total: 0, completed: 0, overdue: 0 },
        workout: { total: 0, completed: 0, overdue: 0 }
      };

      const now = new Date();

      // Medication stats
      const medicationReminders = await this.getMedicationReminders(userId);
      const recentMedication = medicationReminders.filter(r => 
        new Date(r.schedule_datetime) >= cutoffDate
      );
      stats.medication.total = recentMedication.length;
      stats.medication.completed = recentMedication.filter(r => r.is_taken).length;
      stats.medication.overdue = recentMedication.filter(r => 
        !r.is_taken && new Date(r.schedule_datetime) < now
      ).length;

      // BP stats
      const bpReminders = await this.getBPReminders(userId);
      const recentBP = bpReminders.filter(r => 
        new Date(r.reminder_datetime) >= cutoffDate
      );
      stats.bp.total = recentBP.length;
      stats.bp.completed = recentBP.filter(r => r.is_completed).length;
      stats.bp.overdue = recentBP.filter(r => 
        !r.is_completed && new Date(r.reminder_datetime) < now
      ).length;

      // Doctor stats
      const doctorReminders = await this.getDoctorReminders(userId);
      const recentDoctor = doctorReminders.filter(r => 
        new Date(r.appointment_datetime) >= cutoffDate
      );
      stats.doctor.total = recentDoctor.length;
      stats.doctor.completed = recentDoctor.filter(r => r.is_completed).length;
      stats.doctor.overdue = recentDoctor.filter(r => 
        !r.is_completed && new Date(r.appointment_datetime) < now
      ).length;

      // Workout stats
      const workoutReminders = await this.getWorkoutReminders(userId);
      const recentWorkout = workoutReminders.filter(r => 
        new Date(r.workout_datetime) >= cutoffDate
      );
      stats.workout.total = recentWorkout.length;
      stats.workout.completed = recentWorkout.filter(r => r.is_completed).length;
      stats.workout.overdue = recentWorkout.filter(r => 
        !r.is_completed && new Date(r.workout_datetime) < now
      ).length;

      return {
        ...stats,
        period: days,
        overall: {
          total: stats.medication.total + stats.bp.total + stats.doctor.total + stats.workout.total,
          completed: stats.medication.completed + stats.bp.completed + stats.doctor.completed + stats.workout.completed,
          overdue: stats.medication.overdue + stats.bp.overdue + stats.doctor.overdue + stats.workout.overdue
        }
      };
    } catch (error) {
      console.error('[RemindersRepository] GetRemindersStats failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
const remindersRepository = new RemindersRepository();
export default remindersRepository;
