import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.isResetting = false;
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.isInitialized && this.db) return;
    
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      // Wait for current initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;
    
    try {
      console.log('[DatabaseService] Initializing database...');
      this.db = await SQLite.openDatabaseAsync('cardiomedai.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('[DatabaseService] Database initialized successfully');
    } catch (error) {
      console.error('[DatabaseService] Failed to initialize database:', error);
      this.isInitialized = false;
      this.db = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async migrateDatabase() {
    try {
      // Use the database directly without calling getDatabase() to avoid circular dependency
      if (!this.db) {
        return; // Database not initialized yet, skip migration
      }
      
      const db = this.db;
      
      // List of tables that need the deleted_at column
      const tablesToMigrate = [
        'users', 'bp_readings', 'medication_reminders', 'bp_reminders',
        'doctor_reminders', 'workout_reminders', 'health_advisor_conversations',
        'knowledge_agent_qa'
      ];

      for (const tableName of tablesToMigrate) {
        try {
          // Check if table exists and if deleted_at column exists
          const tableInfo = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
          
          if (tableInfo.length > 0) {
            // Table exists, check if deleted_at column exists
            const hasDeletedAt = tableInfo.some(column => column.name === 'deleted_at');
            
            if (!hasDeletedAt) {
              console.log(`[DatabaseService] Adding deleted_at column to ${tableName}`);
              await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN deleted_at TEXT`);
            }
          }
        } catch (error) {
          // Table might not exist yet, which is fine
          console.log(`[DatabaseService] Table ${tableName} doesn't exist yet or migration failed:`, error.message);
        }
      }
      
      console.log('[DatabaseService] Database migration completed');
    } catch (error) {
      console.error('[DatabaseService] Migration failed:', error);
      // Don't throw error, let table creation proceed
    }
  }

  async createTables() {
    // First, check if we need to migrate existing tables
    await this.migrateDatabase();
    
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        height REAL,
        weight REAL,
        medical_conditions TEXT,
        medications TEXT,
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Blood pressure readings table
      `CREATE TABLE IF NOT EXISTS bp_readings (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        systolic INTEGER NOT NULL,
        diastolic INTEGER NOT NULL,
        pulse INTEGER,
        notes TEXT,
        device_id TEXT,
        interpretation TEXT,
        reading_time TEXT NOT NULL,
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Medication reminders table
      `CREATE TABLE IF NOT EXISTS medication_reminders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        schedule_datetime TEXT NOT NULL,
        schedule_dosage TEXT NOT NULL,
        notes TEXT,
        is_taken INTEGER DEFAULT 0,
        taken_at TEXT,
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // BP check reminders table
      `CREATE TABLE IF NOT EXISTS bp_reminders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        reminder_datetime TEXT NOT NULL,
        bp_category TEXT DEFAULT 'manual',
        notes TEXT,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Doctor appointment reminders table
      `CREATE TABLE IF NOT EXISTS doctor_reminders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        appointment_datetime TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        appointment_type TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Workout reminders table
      `CREATE TABLE IF NOT EXISTS workout_reminders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        workout_datetime TEXT NOT NULL,
        workout_type TEXT NOT NULL,
        duration_minutes INTEGER,
        location TEXT,
        notes TEXT,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Health advisor conversations table
      `CREATE TABLE IF NOT EXISTS health_advisor_conversations (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        request_message TEXT NOT NULL,
        advisor_response TEXT NOT NULL,
        agent_id TEXT,
        thread_id TEXT,
        status TEXT DEFAULT 'completed',
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Knowledge agent Q&A table
      `CREATE TABLE IF NOT EXISTS knowledge_agent_qa (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sources TEXT,
        agent_id TEXT,
        thread_id TEXT,
        vector_store_id TEXT,
        status TEXT DEFAULT 'completed',
        last_synced_at TEXT,
        is_dirty INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        version INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Sync metadata table
      `CREATE TABLE IF NOT EXISTS sync_metadata (
        id INTEGER PRIMARY KEY,
        table_name TEXT UNIQUE NOT NULL,
        last_sync_timestamp TEXT,
        sync_direction TEXT DEFAULT 'bidirectional',
        sync_status TEXT DEFAULT 'idle',
        last_error TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sync queue table for offline operations
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      await this.db.execAsync(tableSQL);
    }

    // Initialize sync metadata for each table
    const syncTables = [
      'users', 'bp_readings', 'medication_reminders', 'bp_reminders',
      'doctor_reminders', 'workout_reminders', 'health_advisor_conversations',
      'knowledge_agent_qa'
    ];

    for (const tableName of syncTables) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO sync_metadata (table_name) VALUES (?)`,
        [tableName]
      );
    }

    console.log('[DatabaseService] All tables created successfully');
  }

  async getDatabase() {
    // If currently resetting, wait for it to complete
    if (this.isResetting) {
      while (this.isResetting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (!this.isInitialized || !this.db) {
      await this.initialize();
    }
    
    if (!this.db) {
      throw new Error('Database connection failed to initialize');
    }
    
    return this.db;
  }

  // Generic CRUD operations with sync metadata
  async insert(tableName, data, markDirty = true) {
    try {
      const db = await this.getDatabase();
      
      // Add sync metadata
      const insertData = {
        ...data,
        is_dirty: markDirty ? 1 : 0,
        sync_status: markDirty ? 'pending' : 'synced',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const columns = Object.keys(insertData);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(insertData);

      const result = await db.runAsync(
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );

      // Add to sync queue if marked dirty
      if (markDirty) {
        await this.addToSyncQueue(tableName, result.lastInsertRowId, 'INSERT', insertData);
      }

      return result;
    } catch (error) {
      console.error(`[DatabaseService] Insert failed for table ${tableName}:`, error);
      throw error;
    }
  }

  async update(tableName, id, data, markDirty = true) {
    try {
      const db = await this.getDatabase();
      
      // Add sync metadata
      const updateData = {
        ...data,
        is_dirty: markDirty ? 1 : 0,
        sync_status: markDirty ? 'pending' : 'synced',
        updated_at: new Date().toISOString()
      };

      if (markDirty) {
        updateData.version = `version + 1`;
      }

      const columns = Object.keys(updateData);
      const setClause = columns.map(col =>
        col === 'version' ? `${col} = ${updateData[col]}` : `${col} = ?`
      ).join(', ');
      
      const values = Object.values(updateData).filter((_, index) =>
        columns[index] !== 'version'
      );
      values.push(id);

      const result = await db.runAsync(
        `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
        values
      );

      // Add to sync queue if marked dirty
      if (markDirty) {
        await this.addToSyncQueue(tableName, id, 'UPDATE', updateData);
      }

      return result;
    } catch (error) {
      console.error(`[DatabaseService] Update failed for table ${tableName}:`, error);
      throw error;
    }
  }

  async delete(tableName, id, softDelete = true) {
    const db = await this.getDatabase();
    
    if (softDelete) {
      // Soft delete - mark as deleted and dirty
      const result = await db.runAsync(
        `UPDATE ${tableName} SET 
         deleted_at = ?, 
         is_dirty = 1, 
         sync_status = 'pending',
         updated_at = ?,
         version = version + 1
         WHERE id = ?`,
        [new Date().toISOString(), new Date().toISOString(), id]
      );

      await this.addToSyncQueue(tableName, id, 'DELETE', { deleted_at: new Date().toISOString() });
      return result;
    } else {
      // Hard delete
      return await db.runAsync(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    }
  }

  async findById(tableName, id) {
    const db = await this.getDatabase();
    const result = await db.getFirstAsync(
      `SELECT * FROM ${tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result;
  }

  async findAll(tableName, conditions = {}, orderBy = 'created_at DESC', limit = null) {
    const db = await this.getDatabase();
    
    let query = `SELECT * FROM ${tableName} WHERE deleted_at IS NULL`;
    const params = [];

    // Add conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query += ` AND ${key} = ?`;
      params.push(value);
    });

    // Add ordering
    query += ` ORDER BY ${orderBy}`;

    // Add limit
    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }

    const result = await db.getAllAsync(query, params);
    return result;
  }

  async addToSyncQueue(tableName, recordId, operation, data, priority = 1) {
    const db = await this.getDatabase();
    
    await db.runAsync(
      `INSERT INTO sync_queue (table_name, record_id, operation, data, priority) 
       VALUES (?, ?, ?, ?, ?)`,
      [tableName, recordId, operation, JSON.stringify(data), priority]
    );
  }

  async getSyncQueue(status = 'pending', limit = 50) {
    const db = await this.getDatabase();
    
    const result = await db.getAllAsync(
      `SELECT * FROM sync_queue 
       WHERE status = ? AND retry_count < max_retries 
       ORDER BY priority DESC, created_at ASC 
       LIMIT ?`,
      [status, limit]
    );
    
    return result;
  }

  async updateSyncQueueItem(id, status, errorMessage = null) {
    const db = await this.getDatabase();
    
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (errorMessage) {
      updateData.error_message = errorMessage;
      updateData.retry_count = 'retry_count + 1';
    }

    const columns = Object.keys(updateData);
    const setClause = columns.map(col => 
      col === 'retry_count' ? `${col} = ${updateData[col]}` : `${col} = ?`
    ).join(', ');
    
    const values = Object.values(updateData).filter((_, index) => 
      columns[index] !== 'retry_count'
    );
    values.push(id);

    await db.runAsync(
      `UPDATE sync_queue SET ${setClause} WHERE id = ?`,
      values
    );
  }

  async clearSyncQueue(status = 'completed') {
    const db = await this.getDatabase();
    await db.runAsync(`DELETE FROM sync_queue WHERE status = ?`, [status]);
  }

  async updateSyncMetadata(tableName, lastSyncTimestamp, status = 'completed', error = null) {
    const db = await this.getDatabase();
    
    await db.runAsync(
      `UPDATE sync_metadata 
       SET last_sync_timestamp = ?, sync_status = ?, last_error = ?, updated_at = ?
       WHERE table_name = ?`,
      [lastSyncTimestamp, status, error, new Date().toISOString(), tableName]
    );
  }

  async getSyncMetadata(tableName = null) {
    const db = await this.getDatabase();
    
    if (tableName) {
      return await db.getFirstAsync(
        `SELECT * FROM sync_metadata WHERE table_name = ?`,
        [tableName]
      );
    } else {
      return await db.getAllAsync(`SELECT * FROM sync_metadata`);
    }
  }

  // Get dirty records that need to be synced
  async getDirtyRecords(tableName, limit = 100) {
    const db = await this.getDatabase();
    
    return await db.getAllAsync(
      `SELECT * FROM ${tableName} 
       WHERE is_dirty = 1 AND sync_status = 'pending'
       ORDER BY updated_at ASC 
       LIMIT ?`,
      [limit]
    );
  }

  // Mark records as synced
  async markAsSynced(tableName, ids) {
    const db = await this.getDatabase();
    const placeholders = ids.map(() => '?').join(', ');
    
    await db.runAsync(
      `UPDATE ${tableName} 
       SET is_dirty = 0, sync_status = 'synced', last_synced_at = ?
       WHERE id IN (${placeholders})`,
      [new Date().toISOString(), ...ids]
    );
  }

  // Database maintenance
  async vacuum() {
    const db = await this.getDatabase();
    await db.execAsync('VACUUM');
    console.log('[DatabaseService] Database vacuumed');
  }

  async getStorageInfo() {
    const db = await this.getDatabase();
    const result = await db.getFirstAsync('PRAGMA database_list');
    return result;
  }

  // Reset database (for development/testing)
  async resetDatabase() {
    try {
      console.log('[DatabaseService] Resetting database...');
      
      // Don't reset if already in progress
      if (this.isResetting) {
        console.log('[DatabaseService] Reset already in progress, waiting...');
        while (this.isResetting) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
      }
      
      this.isResetting = true;
      
      // Wait a moment to let any pending operations complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If database exists, drop tables without closing connection
      if (this.db && this.isInitialized) {
        // List of all tables to drop (order matters for foreign keys)
        const tablesToDrop = [
          'sync_queue', 'sync_metadata', 'knowledge_agent_qa', 'health_advisor_conversations',
          'workout_reminders', 'doctor_reminders', 'bp_reminders', 'medication_reminders',
          'bp_readings', 'users'
        ];

        for (const tableName of tablesToDrop) {
          try {
            // Add a small delay between drops to prevent locking
            await new Promise(resolve => setTimeout(resolve, 50));
            await this.db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
            console.log(`[DatabaseService] Dropped table: ${tableName}`);
          } catch (error) {
            console.log(`[DatabaseService] Failed to drop table ${tableName}:`, error.message);
          }
        }
      } else {
        // Initialize if not already done
        await this.initialize();
      }

      // Wait before recreating tables
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Recreate all tables
      await this.createTables();
      
      console.log('[DatabaseService] Database reset completed');
      return true;
    } catch (error) {
      console.error('[DatabaseService] Database reset failed:', error);
      return false;
    } finally {
      this.isResetting = false;
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
