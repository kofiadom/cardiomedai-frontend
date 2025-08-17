import { useEffect } from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import { BpReaderContext } from '../context/bpReadingsContext';
import { AverageBpContext } from '../context/averageReadings';
import { HealthAdvisorContext } from '../context/healthAdvisorContext';
import { RemindersContext } from '../context/remindersContext';
import { UserContext } from '../context/userContext';
import NotificationService from '../services/notificationService';
import databaseService from '../services/databaseService';
import syncService from '../services/syncService';
import backgroundSyncService from '../services/backgroundSyncService';
import OfflineBanner from '../components/OfflineBanner';

export default function RootLayout() {
  useEffect(() => {
    let isInitializing = false;
    
    // Initialize all services when app starts
    const initializeServices = async () => {
      if (isInitializing) return;
      isInitializing = true;
      
      try {
        console.log('🚀 Initializing CardioMedAI services...');

        // 1. Initialize database first
        console.log('📊 Initializing local database...');
        let databaseInitialized = false;
        try {
          await databaseService.initialize();
          databaseInitialized = true;
          
          // Reset database to ensure clean schema (development only)
          if (__DEV__) {
            console.log('🔄 Resetting database for clean schema...');
            await databaseService.resetDatabase();
            
            // Wait longer for database to be fully ready after reset
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          console.log('✅ Database initialized');
        } catch (dbError) {
          console.error('❌ Database initialization failed:', dbError.message);
          console.log('📱 App will continue with API-only mode');
          databaseInitialized = false;
        }

        // 2. Initialize sync service (only if database is available)
        if (databaseInitialized) {
          console.log('🔄 Initializing sync service...');
          try {
            // Sync service initializes automatically via constructor
            console.log('✅ Sync service initialized');
          } catch (syncError) {
            console.error('❌ Sync service initialization failed:', syncError.message);
          }
        }

        // 3. Initialize background sync (skip in Expo Go)
        if (databaseInitialized) {
          console.log('⏰ Initializing background sync...');
          try {
            const backgroundSyncAvailable = await backgroundSyncService.initialize();
            if (backgroundSyncAvailable) {
              console.log('✅ Background sync enabled');
            } else {
              console.warn('⚠️ Background sync not available (Expo Go limitation)');
            }
          } catch (bgError) {
            console.warn('⚠️ Background sync failed to initialize:', bgError.message);
          }
        }

        // 4. Initialize notifications
        console.log('🔔 Initializing notifications...');
        try {
          const notificationsSuccess = await NotificationService.initialize();
          if (notificationsSuccess) {
            await NotificationService.scheduleDailyAIInsights();
            console.log('✅ Notifications ready (local notifications in Expo Go)');
          } else {
            console.warn('⚠️ Notifications not available - permissions denied');
          }
        } catch (notifError) {
          console.warn('⚠️ Notification initialization failed:', notifError.message);
        }

        // 5. Perform initial sync if online (only if database is available)
        if (databaseInitialized && databaseService.isInitialized) {
          console.log('🌐 Checking connectivity and performing initial sync...');
          try {
            // Wait a bit more to ensure database is fully ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const syncStatus = syncService.getSyncStatus();
            if (syncStatus.isOnline) {
              await syncService.syncAll();
              console.log('✅ Initial sync completed');
            } else {
              console.log('📱 Starting in offline mode');
            }
          } catch (syncError) {
            console.warn('⚠️ Initial sync failed:', syncError.message);
          }
        } else {
          console.log('📱 Database not available - running in API-only mode');
        }

        console.log('🎉 Service initialization completed!');

      } catch (error) {
        console.error('❌ Critical service initialization failed:', error);
        console.log('📱 App will continue with basic functionality');
      } finally {
        isInitializing = false;
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      try {
        NotificationService.cleanup();
      } catch (error) {
        console.warn('⚠️ Cleanup failed:', error.message);
      }
    };
  }, []);

  return (
    <UserContext>
      <BpReaderContext>
        <AverageBpContext>
          <HealthAdvisorContext>
            <RemindersContext>
              <View style={{ flex: 1 }}>
                <OfflineBanner />
                <Stack screenOptions={{ headerShown: false }} />
              </View>
            </RemindersContext>
          </HealthAdvisorContext>
        </AverageBpContext>
      </BpReaderContext>
    </UserContext>
  );
}
