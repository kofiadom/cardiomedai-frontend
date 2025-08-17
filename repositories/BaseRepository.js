import databaseService from '../services/databaseService';
import syncService from '../services/syncService';

class BaseRepository {
  constructor(tableName, apiEndpoint) {
    this.tableName = tableName;
    this.apiEndpoint = apiEndpoint;
    this.baseUrl = 'https://cardiomedai-api.onrender.com';
  }

  // Create new record (optimistic update)
  async create(data, userId = null) {
    try {
      // Add user_id if provided and not already in data
      if (userId && !data.user_id) {
        data.user_id = userId;
      }

      // Insert into local database first (optimistic update)
      const result = await databaseService.insert(this.tableName, data, true);
      const localRecord = await databaseService.findById(this.tableName, result.lastInsertRowId);

      // Try to sync immediately if online
      if (syncService.getSyncStatus().isOnline) {
        try {
          await syncService.forceSyncTable(this.tableName);
        } catch (error) {
          console.log(`[${this.tableName}Repository] Immediate sync failed, will retry later:`, error);
        }
      }

      return localRecord;
    } catch (error) {
      console.error(`[${this.tableName}Repository] Create failed:`, error);
      throw error;
    }
  }

  // Get record by ID (local first, fallback to API)
  async findById(id) {
    try {
      // Try local database first
      const localRecord = await databaseService.findById(this.tableName, id);
      if (localRecord) {
        return localRecord;
      }

      // If not found locally and online, try API
      if (syncService.getSyncStatus().isOnline) {
        try {
          const response = await fetch(`${this.baseUrl}${this.apiEndpoint}/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const serverRecord = await response.json();
            // Store in local database for future use
            await databaseService.insert(this.tableName, serverRecord, false);
            return serverRecord;
          }
        } catch (error) {
          console.log(`[${this.tableName}Repository] API fetch failed, using local data only:`, error);
        }
      }

      return null;
    } catch (error) {
      console.error(`[${this.tableName}Repository] FindById failed:`, error);
      throw error;
    }
  }

  // Get all records (local first, with optional API sync)
  async findAll(conditions = {}, orderBy = 'created_at DESC', limit = null, syncFirst = false) {
    try {
      // Sync first if requested and online
      if (syncFirst && syncService.getSyncStatus().isOnline) {
        try {
          await syncService.forceSyncTable(this.tableName);
        } catch (error) {
          console.log(`[${this.tableName}Repository] Sync before findAll failed:`, error);
        }
      }

      // Get from local database
      const localRecords = await databaseService.findAll(this.tableName, conditions, orderBy, limit);
      
      // If no local records and online, try API
      if (localRecords.length === 0 && syncService.getSyncStatus().isOnline) {
        try {
          let url = `${this.baseUrl}${this.apiEndpoint}`;
          const params = new URLSearchParams();
          
          // Add conditions as query parameters
          Object.entries(conditions).forEach(([key, value]) => {
            params.append(key, value);
          });
          
          if (limit) {
            params.append('limit', limit);
          }
          
          if (params.toString()) {
            url += `?${params.toString()}`;
          }

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const serverRecords = await response.json();
            const records = Array.isArray(serverRecords) ? serverRecords : [serverRecords];
            
            // Store in local database
            for (const record of records) {
              await databaseService.insert(this.tableName, record, false);
            }
            
            return records;
          }
        } catch (error) {
          console.log(`[${this.tableName}Repository] API fetch failed, using local data only:`, error);
        }
      }

      return localRecords;
    } catch (error) {
      console.error(`[${this.tableName}Repository] FindAll failed:`, error);
      throw error;
    }
  }

  // Update record (optimistic update)
  async update(id, data) {
    try {
      // Update local database first
      await databaseService.update(this.tableName, id, data, true);
      const updatedRecord = await databaseService.findById(this.tableName, id);

      // Try to sync immediately if online
      if (syncService.getSyncStatus().isOnline) {
        try {
          await syncService.forceSyncTable(this.tableName);
        } catch (error) {
          console.log(`[${this.tableName}Repository] Immediate sync failed, will retry later:`, error);
        }
      }

      return updatedRecord;
    } catch (error) {
      console.error(`[${this.tableName}Repository] Update failed:`, error);
      throw error;
    }
  }

  // Delete record (soft delete with sync)
  async delete(id) {
    try {
      // Soft delete in local database
      await databaseService.delete(this.tableName, id, true);

      // Try to sync immediately if online
      if (syncService.getSyncStatus().isOnline) {
        try {
          await syncService.forceSyncTable(this.tableName);
        } catch (error) {
          console.log(`[${this.tableName}Repository] Immediate sync failed, will retry later:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error(`[${this.tableName}Repository] Delete failed:`, error);
      throw error;
    }
  }

  // Get sync status for this table
  async getSyncStatus() {
    try {
      const metadata = await databaseService.getSyncMetadata(this.tableName);
      const dirtyCount = await databaseService.getDirtyRecords(this.tableName, 1);
      
      return {
        lastSync: metadata?.last_sync_timestamp,
        syncStatus: metadata?.sync_status || 'unknown',
        hasPendingChanges: dirtyCount.length > 0,
        isOnline: syncService.getSyncStatus().isOnline
      };
    } catch (error) {
      console.error(`[${this.tableName}Repository] GetSyncStatus failed:`, error);
      return {
        lastSync: null,
        syncStatus: 'error',
        hasPendingChanges: false,
        isOnline: false
      };
    }
  }

  // Force sync this table
  async sync() {
    try {
      if (!syncService.getSyncStatus().isOnline) {
        throw new Error('Cannot sync while offline');
      }
      
      return await syncService.forceSyncTable(this.tableName);
    } catch (error) {
      console.error(`[${this.tableName}Repository] Sync failed:`, error);
      throw error;
    }
  }

  // Get pending changes count
  async getPendingChangesCount() {
    try {
      const dirtyRecords = await databaseService.getDirtyRecords(this.tableName);
      return dirtyRecords.length;
    } catch (error) {
      console.error(`[${this.tableName}Repository] GetPendingChangesCount failed:`, error);
      return 0;
    }
  }

  // Get records that need sync
  async getPendingChanges() {
    try {
      return await databaseService.getDirtyRecords(this.tableName);
    } catch (error) {
      console.error(`[${this.tableName}Repository] GetPendingChanges failed:`, error);
      return [];
    }
  }
}

export default BaseRepository;
