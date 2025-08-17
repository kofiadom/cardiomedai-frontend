import { useEffect } from "react";
import { Stack } from "expo-router";
import { BpReaderContext } from '../context/bpReadingsContext';
import { AverageBpContext } from '../context/averageReadings';
import { HealthAdvisorContext } from '../context/healthAdvisorContext';
import { RemindersContext } from '../context/remindersContext';
import { UserContext } from '../context/userContext';
import NotificationService from '../services/notificationService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize notification service when app starts
    const initializeNotifications = async () => {
      try {
        const success = await NotificationService.initialize();
        if (success) {
          // Schedule daily AI insights notification
          await NotificationService.scheduleDailyAIInsights();
          console.log('✅ Notifications ready! (Local notifications will work)');
        } else {
          console.warn('⚠️ Notifications not available - permissions denied');
        }
      } catch (error) {
        console.warn('⚠️ Notification initialization failed:', error.message);
        console.log('📱 App will continue to work without notifications');
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  return (
    <UserContext>
      <BpReaderContext>
        <AverageBpContext>
          <HealthAdvisorContext>
            <RemindersContext>
              <Stack screenOptions={{ headerShown: false }} />
            </RemindersContext>
          </HealthAdvisorContext>
        </AverageBpContext>
      </BpReaderContext>
    </UserContext>
  );
}
