import { useEffect } from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import { BpReaderContext } from '../context/bpReadingsContext';
import { AverageBpContext } from '../context/averageReadings';
import { HealthAdvisorContext } from '../context/healthAdvisorContext';
import { RemindersContext } from '../context/remindersContext';
import { UserContext } from '../context/userContext';
import NotificationService from '../services/notificationService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize notifications when app starts
    const initializeServices = async () => {
      try {
        console.log('🚀 Initializing CardioMedAI services...');

        // Initialize notifications
        console.log('🔔 Initializing notifications...');
        try {
          const notificationsSuccess = await NotificationService.initialize();
          if (notificationsSuccess) {
            // Don't schedule daily insights here - will be done when user logs in
            console.log('✅ Notifications ready');
          } else {
            console.warn('⚠️ Notifications not available - permissions denied');
          }
        } catch (notifError) {
          console.warn('⚠️ Notification initialization failed:', notifError.message);
        }

        console.log('🎉 Service initialization completed!');

      } catch (error) {
        console.error('❌ Critical service initialization failed:', error);
        console.log('📱 App will continue with basic functionality');
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
                <Stack screenOptions={{ headerShown: false }} />
              </View>
            </RemindersContext>
          </HealthAdvisorContext>
        </AverageBpContext>
      </BpReaderContext>
    </UserContext>
  );
}
