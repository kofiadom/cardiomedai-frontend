import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import databaseService from './databaseService';

class SyncService {
  constructor() {
    this.baseUrl = 'https://cardiomedai-api.onrender.com';
    this.isOnline = true;
    this.isSyncing = false;
    this.syncListeners = [];
    this.conflictResolvers = new Map();
    
    // Initialize network monitoring
    this.initializeNetworkMonitoring();
  }

  async initializeNetworkMonitoring() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isOnline = networkState.isConnected;
      
      // Listen for network changes
      Network.addNetworkStateListener((state) => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected;
        
        if (!wasOnline && this.isOnline) {
          // Just came back online - trigger sync
          console.log('[SyncService] Network restored, triggering sync');
          this.syncAll();
        }
        
        this.notifyListeners('networkChanged', { isOnline: this.isOnline });
      });
    } catch (error) {
      console.error('[SyncService] Failed to initialize network monitoring:', error);
    }
  }

  // Event listeners for sync status
  addSyncListener(listener) {
    this.syncListeners.push(listener);
  }

  removeSyncListener(listener) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  notifyListeners(event, data) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('[SyncService] Error in sync listener:', error);
      }
    });
  }

  // Main sync orchestrator
  async syncAll(force = false) {
    if (this.isSyncing && !force) {
      console.log('[SyncService] Sync already in progress');
      return;
    }

    if (!this.isOnline) {
      console.log('[SyncService] Offline - skipping sync');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('syncStarted', {});

    try {
      console.log('[SyncService] Starting full sync');
      
      // Sync in priority order
      const syncTables = [
        'users',
        'bp_readings',
        'medication_reminders',
        'bp_reminders',
        'doctor_reminders',
        'workout_reminders',
        'health_advisor_conversations',
        'knowledge_agent_qa'
      ];

      let totalSynced = 0;
      let totalErrors = 0;

      for (const tableName of syncTables) {
        try {
          const result = await this.syncTable(tableName);
          totalSynced += result.synced;
          totalErrors += result.errors;
          
          this.notifyListeners('tableSync', {
            tableName,
            synced: result.synced,
            errors: result.errors
          });
        } catch (error) {
          console.error(`[SyncService] Failed to sync table ${tableName}:`, error);
          totalErrors++;
        }
      }

      // Process sync queue
      await this.processSyncQueue();

      console.log(`[SyncService] Sync completed - ${totalSynced} records synced, ${totalErrors} errors`);
      
      this.notifyListeners('syncCompleted', {
        totalSynced,
        totalErrors,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
      this.notifyListeners('syncError', { error: error.message });
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync individual table
  async syncTable(tableName) {
    console.log(`[SyncService] Syncing table: ${tableName}`);
    
    let synced = 0;
    let errors = 0;

    try {
      // Step 1: Pull changes from server
      const pullResult = await this.pullChanges(tableName);
      synced += pullResult.synced;
      errors += pullResult.errors;

      // Step 2: Push local changes to server
      const pushResult = await this.pushChanges(tableName);
      synced += pushResult.synced;
      errors += pushResult.errors;

      // Update sync metadata
      await databaseService.updateSyncMetadata(
        tableName,
        new Date().toISOString(),
        errors > 0 ? 'partial' : 'completed'
      );

    } catch (error) {
      console.error(`[SyncService] Error syncing table ${tableName}:`, error);
      await databaseService.updateSyncMetadata(
        tableName,
        new Date().toISOString(),
        'error',
        error.message
      );
      errors++;
    }

    return { synced, errors };
  }

  // Pull changes from server
  async pullChanges(tableName) {
    const syncMetadata = await databaseService.getSyncMetadata(tableName);
    const lastSync = syncMetadata?.last_sync_timestamp;
    
    let synced = 0;
    let errors = 0;

    try {
      const endpoint = this.getEndpointForTable(tableName);
      if (!endpoint) {
        console.log(`[SyncService] No endpoint configured for table: ${tableName}`);
        return { synced, errors };
      }

      // Build query parameters
      let url = `${this.baseUrl}${endpoint}`;
      const params = new URLSearchParams();
      
      if (lastSync) {
        params.append('since', lastSync);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`[SyncService] Pulling from: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const serverData = await response.json();
      const records = Array.isArray(serverData) ? serverData : [serverData];

      // Process each record
      for (const record of records) {
        try {
          await this.mergeServerRecord(tableName, record);
          synced++;
        } catch (error) {
          console.error(`[SyncService] Error merging record:`, error);
          errors++;
        }
      }

    } catch (error) {
      console.error(`[SyncService] Pull failed for ${tableName}:`, error);
      errors++;
    }

    return { synced, errors };
  }

  // Push local changes to server
  async pushChanges(tableName) {
    const dirtyRecords = await databaseService.getDirtyRecords(tableName);
    
    let synced = 0;
    let errors = 0;

    for (const record of dirtyRecords) {
      try {
        const result = await this.pushRecord(tableName, record);
        if (result.success) {
          // Mark as synced
          await databaseService.markAsSynced(tableName, [record.id]);
          synced++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error(`[SyncService] Error pushing record ${record.id}:`, error);
        errors++;
      }
    }

    return { synced, errors };
  }

  // Push individual record to server
  async pushRecord(tableName, record) {
    const endpoint = this.getEndpointForTable(tableName, 'write');
    if (!endpoint) {
      throw new Error(`No write endpoint configured for table: ${tableName}`);
    }

    // Clean record data (remove sync metadata)
    const cleanRecord = this.cleanRecordForSync(record);
    
    try {
      let url = `${this.baseUrl}${endpoint}`;
      let method = 'POST';

      // If record has server ID, it's an update
      if (record.id && record.sync_status !== 'pending_insert') {
        url += `/${record.id}`;
        method = 'PUT';
      }

      // Add user_id as query parameter if needed
      if (tableName !== 'users' && cleanRecord.user_id) {
        url += `?user_id=${cleanRecord.user_id}`;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanRecord),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const serverRecord = await response.json();
      
      // Update local record with server data
      if (serverRecord.id && serverRecord.id !== record.id) {
        await databaseService.update(tableName, record.id, {
          id: serverRecord.id,
          ...serverRecord
        }, false); // Don't mark as dirty
      }

      return { success: true, serverRecord };

    } catch (error) {
      console.error(`[SyncService] Failed to push record:`, error);
      return { success: false, error: error.message };
    }
  }

  // Merge server record with local data
  async mergeServerRecord(tableName, serverRecord) {
    const existingRecord = await databaseService.findById(tableName, serverRecord.id);
    
    if (!existingRecord) {
      // New record from server
      await databaseService.insert(tableName, {
        ...serverRecord,
        last_synced_at: new Date().toISOString()
      }, false); // Don't mark as dirty
    } else {
      // Check for conflicts
      if (existingRecord.is_dirty && existingRecord.version !== serverRecord.version) {
        // Conflict detected
        const resolution = await this.resolveConflict(tableName, existingRecord, serverRecord);
        await databaseService.update(tableName, existingRecord.id, resolution, false);
      } else if (!existingRecord.is_dirty) {
        // No local changes, safe to update
        await databaseService.update(tableName, existingRecord.id, {
          ...serverRecord,
          last_synced_at: new Date().toISOString()
        }, false);
      }
      // If local is dirty but no version conflict, keep local changes
    }
  }

  // Conflict resolution
  async resolveConflict(tableName, localRecord, serverRecord) {
    console.log(`[SyncService] Conflict detected in ${tableName} for record ${localRecord.id}`);
    
    // Check for custom conflict resolver
    const resolver = this.conflictResolvers.get(tableName);
    if (resolver) {
      return await resolver(localRecord, serverRecord);
    }

    // Default resolution strategies
    switch (tableName) {
      case 'users':
        // For user profiles, prefer server data but keep local medical info if newer
        return this.mergeUserConflict(localRecord, serverRecord);
      
      case 'bp_readings':
        // For BP readings, prefer the one with more recent reading_time
        return new Date(localRecord.reading_time) > new Date(serverRecord.reading_time) 
          ? localRecord : serverRecord;
      
      case 'medication_reminders':
      case 'bp_reminders':
      case 'doctor_reminders':
      case 'workout_reminders':
        // For reminders, prefer local changes (user likely modified recently)
        return localRecord;
      
      default:
        // Last-write-wins based on updated_at
        return new Date(localRecord.updated_at) > new Date(serverRecord.updated_at)
          ? localRecord : serverRecord;
    }
  }

  mergeUserConflict(localRecord, serverRecord) {
    // Merge user data intelligently
    return {
      ...serverRecord,
      // Keep local medical info if it's newer
      medical_conditions: new Date(localRecord.updated_at) > new Date(serverRecord.updated_at)
        ? localRecord.medical_conditions : serverRecord.medical_conditions,
      medications: new Date(localRecord.updated_at) > new Date(serverRecord.updated_at)
        ? localRecord.medications : serverRecord.medications,
      last_synced_at: new Date().toISOString()
    };
  }

  // Process sync queue for failed operations
  async processSyncQueue() {
    const queueItems = await databaseService.getSyncQueue('pending');
    
    for (const item of queueItems) {
      try {
        const data = JSON.parse(item.data);
        
        switch (item.operation) {
          case 'INSERT':
          case 'UPDATE':
            const result = await this.pushRecord(item.table_name, data);
            if (result.success) {
              await databaseService.updateSyncQueueItem(item.id, 'completed');
            } else {
              await databaseService.updateSyncQueueItem(item.id, 'failed', result.error);
            }
            break;
            
          case 'DELETE':
            // Handle delete operations
            await this.handleDeleteOperation(item.table_name, item.record_id);
            await databaseService.updateSyncQueueItem(item.id, 'completed');
            break;
        }
      } catch (error) {
        console.error(`[SyncService] Error processing queue item ${item.id}:`, error);
        await databaseService.updateSyncQueueItem(item.id, 'failed', error.message);
      }
    }
  }

  async handleDeleteOperation(tableName, recordId) {
    const endpoint = this.getEndpointForTable(tableName, 'delete');
    if (!endpoint) return;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}/${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`[SyncService] Failed to delete record ${recordId}:`, error);
      throw error;
    }
  }

  // Utility methods
  getEndpointForTable(tableName, operation = 'read') {
    const endpoints = {
      users: {
        read: '/users/',
        write: '/users/',
        delete: '/users'
      },
      bp_readings: {
        read: '/bp/readings/1', // TODO: Make user_id dynamic
        write: '/bp/readings/',
        delete: '/bp/readings'
      },
      medication_reminders: {
        read: '/reminders/1',
        write: '/reminders/',
        delete: '/reminders/reminder'
      },
      bp_reminders: {
        read: '/reminders/bp-reminders/1',
        write: '/reminders/bp-reminder/',
        delete: '/reminders/bp-reminder'
      },
      doctor_reminders: {
        read: '/reminders/doctor-appointments/1',
        write: '/reminders/doctor-appointment/',
        delete: '/reminders/doctor-appointment'
      },
      workout_reminders: {
        read: '/reminders/workouts/1',
        write: '/reminders/workout/',
        delete: '/reminders/workout'
      },
      health_advisor_conversations: {
        read: '/health-advisor/advice/1',
        write: '/health-advisor/advice',
        delete: null
      },
      knowledge_agent_qa: {
        read: null, // No read endpoint - this is write-only for Q&A
        write: '/knowledge-agent/ask',
        delete: null
      }
    };

    return endpoints[tableName]?.[operation];
  }

  cleanRecordForSync(record) {
    const {
      last_synced_at,
      is_dirty,
      sync_status,
      version,
      created_at,
      updated_at,
      deleted_at,
      ...cleanRecord
    } = record;

    return cleanRecord;
  }

  // Public API methods
  async syncNow() {
    return await this.syncAll(true);
  }

  async getLastSyncTime() {
    try {
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('[SyncService] Error getting last sync time:', error);
      return null;
    }
  }

  async setLastSyncTime(timestamp = new Date()) {
    try {
      await AsyncStorage.setItem('lastSyncTime', timestamp.toISOString());
    } catch (error) {
      console.error('[SyncService] Error setting last sync time:', error);
    }
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: this.getLastSyncTime()
    };
  }

  // Register custom conflict resolver
  registerConflictResolver(tableName, resolver) {
    this.conflictResolvers.set(tableName, resolver);
  }

  // Force sync specific table
  async forceSyncTable(tableName) {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    return await this.syncTable(tableName);
  }

  // Clear all local data (for testing/reset)
  async clearLocalData() {
    const tables = [
      'users', 'bp_readings', 'medication_reminders', 'bp_reminders',
      'doctor_reminders', 'workout_reminders', 'health_advisor_conversations',
      'knowledge_agent_qa', 'sync_queue'
    ];

    for (const table of tables) {
      await databaseService.getDatabase().then(db => 
        db.runAsync(`DELETE FROM ${table}`)
      );
    }

    await AsyncStorage.removeItem('lastSyncTime');
    console.log('[SyncService] All local data cleared');
  }
}

// Export singleton instance
const syncService = new SyncService();
export default syncService;
