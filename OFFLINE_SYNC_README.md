# CardioMedAI Offline Data Sync Implementation

This document provides a comprehensive guide to the offline data synchronization system implemented in the CardioMedAI React Native application.

## Overview

The offline sync system enables the app to work seamlessly without an internet connection by storing data locally and synchronizing with the cloud database (Microsoft Azure SQL Database) when connectivity is restored.

## Architecture

### Core Components

1. **Database Service** (`services/databaseService.js`)
   - SQLite local database management
   - CRUD operations with sync metadata
   - Conflict resolution support
   - Data integrity maintenance

2. **Sync Service** (`services/syncService.js`)
   - Bidirectional synchronization logic
   - Network connectivity monitoring
   - Conflict resolution strategies
   - Queue-based retry mechanisms

3. **Background Sync Service** (`services/backgroundSyncService.js`)
   - Periodic background synchronization
   - Battery-optimized sync scheduling
   - Background task management

4. **Repository Pattern** (`repositories/`)
   - Data access abstraction layer
   - Offline-first operations
   - Optimistic updates
   - Automatic sync triggers

5. **Context Providers** (`context/`)
   - Updated to use repositories
   - Real-time sync status
   - Offline-aware data management

6. **UI Components** (`components/`)
   - Sync status indicators
   - Offline banners
   - User feedback systems

## Features

### ✅ Offline-First Architecture
- All data operations work offline
- Local SQLite database for data persistence
- Automatic sync when connectivity is restored

### ✅ Bidirectional Synchronization
- Pull changes from server to local database
- Push local changes to server
- Delta sync for efficiency

### ✅ Conflict Resolution
- Intelligent conflict detection
- Configurable resolution strategies
- User-prompted resolution for critical conflicts

### ✅ Background Sync
- Periodic sync when app is backgrounded
- Battery-optimized scheduling
- Automatic retry on failure

### ✅ Real-time Status Indicators
- Network connectivity status
- Sync progress indicators
- Pending changes count
- Last sync timestamp

### ✅ Optimistic Updates
- Immediate UI updates for better UX
- Background sync for data consistency
- Rollback on sync failures

## Data Types Supported

The sync system supports all major data types in the CardioMedAI app:

- **Users**: Profile information, medical conditions, medications
- **Blood Pressure Readings**: Measurements, interpretations, device data
- **Medication Reminders**: Schedules, dosages, completion status
- **BP Check Reminders**: Automated scheduling based on readings
- **Doctor Appointments**: Scheduling and completion tracking
- **Workout Reminders**: Exercise scheduling and tracking
- **Health Advisor Conversations**: AI chat history
- **Knowledge Agent Q&A**: Educational content interactions

## Installation & Setup

### Dependencies

The following packages are required and have been installed:

```json
{
  "expo-sqlite": "~14.0.0",
  "expo-network": "~6.0.0",
  "expo-task-manager": "~12.0.0",
  "expo-background-fetch": "~13.0.0",
  "@react-native-async-storage/async-storage": "^2.0.0"
}
```

### Initialization

The sync system is automatically initialized in `app/_layout.jsx`:

```javascript
import databaseService from '../services/databaseService';
import syncService from '../services/syncService';
import backgroundSyncService from '../services/backgroundSyncService';

// Services are initialized on app startup
await databaseService.initialize();
await backgroundSyncService.initialize();
```

## Usage Examples

### Using Repositories

```javascript
import bpReadingsRepository from '../repositories/BPReadingsRepository';
import remindersRepository from '../repositories/RemindersRepository';

// Create a new BP reading (works offline)
const newReading = await bpReadingsRepository.createReading(userId, {
  systolic: 120,
  diastolic: 80,
  pulse: 72,
  notes: 'Morning reading'
});

// Get readings (local-first, with optional sync)
const readings = await bpReadingsRepository.getReadingsForUser(userId);

// Create a medication reminder (works offline)
const reminder = await remindersRepository.createMedicationReminder(userId, {
  name: 'Lisinopril',
  dosage: '10mg',
  schedule_datetime: '2024-01-15T08:00:00',
  schedule_dosage: '1 tablet'
});
```

### Using Context Providers

```javascript
import { useBpReadings } from '../context/bpReadingsContext';
import { useReminders } from '../context/remindersContext';

function MyComponent() {
  const { 
    data, 
    syncStatus, 
    createReading, 
    syncNow 
  } = useBpReadings();
  
  const handleAddReading = async () => {
    try {
      await createReading({
        systolic: 130,
        diastolic: 85,
        pulse: 75
      });
      // Data is immediately available in UI
      // Sync happens automatically in background
    } catch (error) {
      console.error('Failed to add reading:', error);
    }
  };

  return (
    <View>
      <Text>Status: {syncStatus.isOnline ? 'Online' : 'Offline'}</Text>
      <Text>Pending Changes: {syncStatus.hasPendingChanges ? 'Yes' : 'No'}</Text>
      <Button title="Add Reading" onPress={handleAddReading} />
      <Button title="Sync Now" onPress={syncNow} />
    </View>
  );
}
```

### UI Components

```javascript
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import OfflineBanner from '../components/OfflineBanner';

function MyScreen() {
  return (
    <View>
      <OfflineBanner />
      <SyncStatusIndicator showDetails={true} />
      {/* Your screen content */}
    </View>
  );
}
```

## Sync Strategies

### Conflict Resolution

The system uses different strategies based on data type:

1. **Users**: Server data preferred, but local medical info kept if newer
2. **BP Readings**: Most recent reading time wins
3. **Reminders**: Local changes preferred (user likely modified recently)
4. **Default**: Last-write-wins based on `updated_at` timestamp

### Custom Conflict Resolvers

You can register custom conflict resolution logic:

```javascript
import syncService from '../services/syncService';

syncService.registerConflictResolver('bp_readings', (localRecord, serverRecord) => {
  // Custom logic for BP reading conflicts
  if (localRecord.systolic > serverRecord.systolic) {
    return localRecord; // Keep higher reading
  }
  return serverRecord;
});
```

## Monitoring & Debugging

### Sync Status

```javascript
import syncService from '../services/syncService';

// Get current sync status
const status = syncService.getSyncStatus();
console.log('Online:', status.isOnline);
console.log('Syncing:', status.isSyncing);

// Get last sync time
const lastSync = await syncService.getLastSyncTime();
console.log('Last sync:', lastSync);
```

### Background Sync Statistics

```javascript
import backgroundSyncService from '../services/backgroundSyncService';

// Get sync statistics
const stats = await backgroundSyncService.getSyncStats();
console.log('Pending changes:', stats.totalPending);
console.log('Table breakdown:', stats.tableStats);
```

### Event Listeners

```javascript
import syncService from '../services/syncService';

// Listen for sync events
const handleSyncEvent = (event, data) => {
  switch (event) {
    case 'syncStarted':
      console.log('Sync started');
      break;
    case 'syncCompleted':
      console.log('Sync completed:', data);
      break;
    case 'syncError':
      console.error('Sync error:', data.error);
      break;
    case 'networkChanged':
      console.log('Network status:', data.isOnline ? 'Online' : 'Offline');
      break;
  }
};

syncService.addSyncListener(handleSyncEvent);
```

## Database Schema

### Sync Metadata Fields

Each table includes the following sync-related fields:

```sql
last_synced_at TEXT,           -- Timestamp of last successful sync
is_dirty INTEGER DEFAULT 0,    -- 1 if record has local changes
sync_status TEXT DEFAULT 'synced', -- 'synced', 'pending', 'conflict', 'error'
version INTEGER DEFAULT 1,     -- Version for optimistic concurrency
created_at TEXT DEFAULT CURRENT_TIMESTAMP,
updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
deleted_at TEXT                -- Soft delete timestamp
```

### Sync Queue Table

```sql
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL,      -- 'INSERT', 'UPDATE', 'DELETE'
  data TEXT NOT NULL,          -- JSON data
  priority INTEGER DEFAULT 1,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Considerations

### Optimization Strategies

1. **Delta Sync**: Only sync changed records since last sync
2. **Batch Operations**: Group multiple changes for efficiency
3. **Priority Queues**: Critical data (BP readings, medications) synced first
4. **Background Processing**: Non-blocking sync operations
5. **Connection Pooling**: Reuse database connections
6. **Indexed Queries**: Optimized database queries for sync operations

### Battery Optimization

1. **Intelligent Scheduling**: Background sync only when needed
2. **Network-Aware**: Avoid sync on cellular when possible
3. **Exponential Backoff**: Reduce retry frequency on failures
4. **Minimal Wake-ups**: Batch operations to reduce device wake-ups

## Troubleshooting

### Common Issues

1. **Sync Not Working**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check console logs for errors

2. **Data Conflicts**
   - Review conflict resolution logs
   - Check version numbers in database
   - Verify timestamp accuracy

3. **Background Sync Disabled**
   - Check device battery optimization settings
   - Verify background app refresh permissions
   - Check TaskManager registration status

### Debug Commands

```javascript
// Clear all local data (for testing)
await syncService.clearLocalData();

// Force sync specific table
await syncService.forceSyncTable('bp_readings');

// Get database info
const info = await databaseService.getStorageInfo();

// Vacuum database (cleanup)
await databaseService.vacuum();
```

## Security Considerations

1. **Data Encryption**: Sensitive health data should be encrypted at rest
2. **Authentication**: Implement proper user authentication
3. **API Security**: Secure API endpoints with proper authentication
4. **Local Storage**: Consider encrypting local SQLite database
5. **Network Security**: Use HTTPS for all API communications

## Future Enhancements

### Planned Features

1. **Real-time Sync**: WebSocket-based real-time synchronization
2. **Selective Sync**: User-configurable sync preferences
3. **Compression**: Data compression for large sync operations
4. **Encryption**: End-to-end encryption for sensitive data
5. **Multi-device Sync**: Conflict resolution across multiple devices
6. **Offline Analytics**: Local analytics with periodic sync
7. **Progressive Sync**: Prioritized sync based on user activity

### API Enhancements

1. **Timestamp-based Queries**: Server support for delta sync
2. **Batch Endpoints**: Bulk operations for efficiency
3. **Conflict Resolution**: Server-side conflict detection
4. **Webhook Support**: Real-time notifications of server changes

## Testing

### Unit Tests

```javascript
// Example test for repository
import bpReadingsRepository from '../repositories/BPReadingsRepository';

test('should create BP reading offline', async () => {
  const reading = await bpReadingsRepository.createReading(1, {
    systolic: 120,
    diastolic: 80,
    pulse: 72
  });
  
  expect(reading.systolic).toBe(120);
  expect(reading.is_dirty).toBe(1);
  expect(reading.sync_status).toBe('pending');
});
```

### Integration Tests

```javascript
// Example sync test
test('should sync data when coming online', async () => {
  // Create data offline
  await bpReadingsRepository.createReading(1, testData);
  
  // Simulate coming online
  await syncService.syncAll();
  
  // Verify data is synced
  const reading = await bpReadingsRepository.findById(1);
  expect(reading.sync_status).toBe('synced');
});
```

## Support

For issues or questions regarding the offline sync implementation:

1. Check the console logs for detailed error messages
2. Review the sync status indicators in the UI
3. Use the debug commands to inspect database state
4. Refer to this documentation for configuration options

## Conclusion

The offline sync system provides a robust foundation for offline-first mobile health applications. It ensures data availability, consistency, and user experience regardless of network connectivity while maintaining data integrity and security.

The implementation follows best practices for mobile app development and provides a scalable architecture that can be extended for future requirements.
