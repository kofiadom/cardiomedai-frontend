import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import syncService from './syncService';
import databaseService from './databaseService';

const BACKGROUND_SYNC_TASK = 'background-sync';

// Define the background task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log('[BackgroundSync] Starting background sync task');
    
    // Check if we have network connectivity
    const syncStatus = syncService.getSyncStatus();
    if (!syncStatus.isOnline) {
      console.log('[BackgroundSync] Offline - skipping background sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Check if there are pending changes to sync
    const hasPendingChanges = await checkForPendingChanges();
    if (!hasPendingChanges) {
      console.log('[BackgroundSync] No pending changes - skipping sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Perform the sync
    await syncService.syncAll();
    
    console.log('[BackgroundSync] Background sync completed successfully');
    return BackgroundFetch.BackgroundFetchResult.NewData;
    
  } catch (error) {
    console.error('[BackgroundSync] Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Check if there are pending changes across all tables
async function checkForPendingChanges() {
  try {
    const tables = [
      'users', 'bp_readings', 'medication_reminders', 'bp_reminders',
      'doctor_reminders', 'workout_reminders', 'health_advisor_conversations',
      'knowledge_agent_qa'
    ];

    for (const tableName of tables) {
      const dirtyRecords = await databaseService.getDirtyRecords(tableName, 1);
      if (dirtyRecords.length > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[BackgroundSync] Error checking for pending changes:', error);
    return false;
  }
}

class BackgroundSyncService {
  constructor() {
    this.isRegistered = false;
  }

  // Register background sync task
  async registerBackgroundSync() {
    try {
      // Check if background fetch is available
      const status = await BackgroundFetch.getStatusAsync();
      if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || 
          status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        console.warn('[BackgroundSync] Background fetch is restricted or denied');
        return false;
      }

      // Register the background fetch task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes minimum interval
        stopOnTerminate: false, // Continue running when app is terminated
        startOnBoot: true, // Start when device boots
      });

      this.isRegistered = true;
      console.log('[BackgroundSync] Background sync registered successfully');
      return true;
      
    } catch (error) {
      console.error('[BackgroundSync] Failed to register background sync:', error);
      return false;
    }
  }

  // Unregister background sync task
  async unregisterBackgroundSync() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      this.isRegistered = false;
      console.log('[BackgroundSync] Background sync unregistered');
      return true;
    } catch (error) {
      console.error('[BackgroundSync] Failed to unregister background sync:', error);
      return false;
    }
  }

  // Check if background sync is registered
  async isBackgroundSyncRegistered() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
      this.isRegistered = isRegistered;
      return isRegistered;
    } catch (error) {
      console.error('[BackgroundSync] Error checking registration status:', error);
      return false;
    }
  }

  // Get background fetch status
  async getBackgroundFetchStatus() {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      const statusMap = {
        [BackgroundFetch.BackgroundFetchStatus.Restricted]: 'restricted',
        [BackgroundFetch.BackgroundFetchStatus.Denied]: 'denied',
        [BackgroundFetch.BackgroundFetchStatus.Available]: 'available',
      };
      
      return {
        status: statusMap[status] || 'unknown',
        isAvailable: status === BackgroundFetch.BackgroundFetchStatus.Available,
        isRegistered: this.isRegistered
      };
    } catch (error) {
      console.error('[BackgroundSync] Error getting background fetch status:', error);
      return {
        status: 'error',
        isAvailable: false,
        isRegistered: false
      };
    }
  }

  // Manually trigger background sync (for testing)
  async triggerBackgroundSync() {
    try {
      console.log('[BackgroundSync] Manually triggering background sync');
      
      // Check if we have network connectivity
      const syncStatus = syncService.getSyncStatus();
      if (!syncStatus.isOnline) {
        throw new Error('Cannot sync while offline');
      }

      // Perform the sync
      await syncService.syncAll();
      
      console.log('[BackgroundSync] Manual background sync completed');
      return true;
      
    } catch (error) {
      console.error('[BackgroundSync] Manual background sync failed:', error);
      throw error;
    }
  }

  // Initialize background sync (call this on app startup)
  async initialize() {
    try {
      console.log('[BackgroundSync] Initializing background sync service');
      
      // Check current registration status
      const isRegistered = await this.isBackgroundSyncRegistered();
      
      if (!isRegistered) {
        // Register background sync
        await this.registerBackgroundSync();
      }

      // Get and log status
      const status = await this.getBackgroundFetchStatus();
      console.log('[BackgroundSync] Background fetch status:', status);
      
      return status.isAvailable;
      
    } catch (error) {
      console.error('[BackgroundSync] Failed to initialize background sync:', error);
      return false;
    }
  }

  // Enable/disable background sync
  async setBackgroundSyncEnabled(enabled) {
    try {
      if (enabled) {
        return await this.registerBackgroundSync();
      } else {
        return await this.unregisterBackgroundSync();
      }
    } catch (error) {
      console.error('[BackgroundSync] Failed to set background sync enabled:', error);
      return false;
    }
  }

  // Get sync statistics
  async getSyncStats() {
    try {
      const tables = [
        'users', 'bp_readings', 'medication_reminders', 'bp_reminders',
        'doctor_reminders', 'workout_reminders', 'health_advisor_conversations',
        'knowledge_agent_qa'
      ];

      let totalPending = 0;
      const tableStats = {};

      for (const tableName of tables) {
        const dirtyRecords = await databaseService.getDirtyRecords(tableName);
        const pendingCount = dirtyRecords.length;
        totalPending += pendingCount;
        
        if (pendingCount > 0) {
          tableStats[tableName] = pendingCount;
        }
      }

      return {
        totalPending,
        tableStats,
        lastSync: await syncService.getLastSyncTime(),
        isOnline: syncService.getSyncStatus().isOnline
      };
      
    } catch (error) {
      console.error('[BackgroundSync] Error getting sync stats:', error);
      return {
        totalPending: 0,
        tableStats: {},
        lastSync: null,
        isOnline: false
      };
    }
  }
}

// Export singleton instance
const backgroundSyncService = new BackgroundSyncService();
export default backgroundSyncService;
