import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BASE_URL = "https://cardiomedai-api.onrender.com";
const USER_ID = 1; // This should come from user context in a real app

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      // Check if we're in Expo Go (which has limitations)
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        console.warn('Running in Expo Go - notifications will be limited to local notifications only');
      }

      // Request permissions
      const { status } = await this.requestPermissions();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Get push token (may fail in Expo Go, that's okay)
      try {
        this.expoPushToken = await this.registerForPushNotificationsAsync();
        console.log('Push token:', this.expoPushToken);
      } catch (error) {
        console.log('Push token not available (normal in Expo Go):', error.message);
        this.expoPushToken = 'local-only';
      }

      // Set up listeners
      this.setupNotificationListeners();

      console.log('Notifications initialized successfully (local notifications available)');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return { status: finalStatus };
    } else {
      console.warn('Must use physical device for Push Notifications');
      return { status: 'denied' };
    }
  }

  // Get push notification token
  async registerForPushNotificationsAsync() {
    let token;
    
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      // For development, we'll use local notifications only
      // In production, you'd need a proper project ID for push tokens
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-project-id',
        })).data;
      } catch (error) {
        console.log('Push token not available in development, using local notifications only');
        token = 'local-development-token';
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification tap/interaction
  handleNotificationResponse(response) {
    const { notification } = response;
    const { data } = notification.request.content;

    console.log('Notification tapped:', {
      type: data?.type,
      source: data?.source,
      title: notification.request.content.title
    });

    // Handle different notification types
    switch (data?.type) {
      case 'ai_insight':
      case 'ai_insight_immediate':
        // Navigate to AI insights screen or health advisor
        console.log('User tapped AI insights notification - navigate to health advisor');
        // TODO: Add navigation to health advisor screen
        break;
      case 'medication_reminder':
        // Navigate to reminders or show quick action
        console.log('User tapped medication reminder - navigate to reminders');
        // TODO: Add navigation to reminders screen
        break;
      case 'bp_reminder':
        // Navigate to BP check screen
        console.log('User tapped BP reminder - navigate to BP check');
        // TODO: Add navigation to BP readings screen
        break;
      case 'doctor_appointment':
        // Navigate to appointment details
        console.log('User tapped doctor appointment - navigate to appointments');
        // TODO: Add navigation to appointments screen
        break;
      case 'workout_reminder':
        // Navigate to workout screen
        console.log('User tapped workout reminder - navigate to workouts');
        // TODO: Add navigation to workout screen
        break;
      case 'test':
        console.log('Test notification tapped');
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  // Fetch daily insights from health advisor API
  async fetchDailyInsights() {
    try {
      const response = await fetch(`${BASE_URL}/health-advisor/advice/${USER_ID}?message=Good morning! Please give me my daily health insights and recommendations.`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health advisor API error: ${response.status}`);
      }

      const data = await response.json();
      return data.advisor_response || 'Your daily health insights are ready! Check the app for personalized recommendations.';
    } catch (error) {
      console.error('Error fetching daily insights:', error);
      // Fallback message if API fails
      return 'Good morning! Check your health progress and stay on track with your wellness goals today! 💪';
    }
  }

  // Schedule daily AI insights notification (8 AM every day)
  async scheduleDailyAIInsights() {
    try {
      // Cancel existing AI insights notifications
      await this.cancelNotificationsByType('ai_insight');

      // For development/testing, schedule a notification in 10 seconds
      const isDevelopment = __DEV__ || Constants.appOwnership === 'expo';

      let trigger;
      if (isDevelopment) {
        // In development, schedule for 10 seconds from now for testing
        trigger = { seconds: 10 };
        console.log('🧪 Development mode: AI insights notification scheduled for 10 seconds');
      } else {
        // In production, schedule for 8 AM daily
        trigger = {
          hour: 8,
          minute: 0,
          repeats: true,
        };
        console.log('📅 Production mode: AI insights notification scheduled for 8 AM daily');
      }

      // Fetch personalized insights from health advisor
      const personalizedMessage = await this.fetchDailyInsights();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧠 Daily AI Health Insights',
          body: personalizedMessage,
          data: {
            type: 'ai_insight',
            timestamp: Date.now(),
            source: 'health_advisor'
          },
        },
        trigger,
      });

      console.log('Daily AI insights notification scheduled with personalized message:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily AI insights:', error);
      return null;
    }
  }

  // Schedule reminder notification
  async scheduleReminderNotification(reminder, type) {
    try {
      const reminderDate = new Date(
        reminder.schedule_datetime ||
        reminder.reminder_datetime ||
        reminder.appointment_datetime ||
        reminder.workout_datetime
      );

      console.log(`📅 Scheduling ${type} reminder:`, {
        reminderId: reminder.id,
        reminderDate: reminderDate.toLocaleString(),
        currentTime: new Date().toLocaleString(),
        timeUntilReminder: Math.round((reminderDate - new Date()) / 1000 / 60) + ' minutes'
      });

      // Don't schedule if the time has already passed
      if (reminderDate <= new Date()) {
        console.log(`⚠️ ${type} reminder time has passed, not scheduling notification`);
        return null;
      }

      const notificationContent = this.getReminderNotificationContent(reminder, type);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationContent.title,
          body: notificationContent.body,
          data: {
            type: `${type}_reminder`,
            reminderId: reminder.id,
            reminderType: type,
            timestamp: Date.now()
          },
        },
        trigger: {
          type: 'date',
          date: reminderDate
        },
      });

      console.log(`✅ ${type} reminder notification scheduled successfully:`, {
        notificationId,
        title: notificationContent.title,
        scheduledFor: reminderDate.toLocaleString()
      });

      return notificationId;
    } catch (error) {
      console.error(`❌ Error scheduling ${type} reminder:`, error);
      return null;
    }
  }

  // Get notification content based on reminder type
  getReminderNotificationContent(reminder, type) {
    switch (type) {
      case 'medication':
        return {
          title: '💊 Medication Reminder',
          body: `Time to take ${reminder.name || 'your medication'}${reminder.dosage ? ` (${reminder.dosage})` : ''}`,
        };
      case 'bp':
        return {
          title: '🩺 Blood Pressure Check',
          body: 'Time for your blood pressure check. Don\'t forget to record your reading!',
        };
      case 'doctor':
        return {
          title: '👨‍⚕️ Doctor Appointment',
          body: `Appointment with ${reminder.doctor_name || 'your doctor'} is coming up!`,
        };
      case 'workout':
        return {
          title: '💪 Workout Time',
          body: `Time for your ${reminder.workout_type || 'workout'} session!`,
        };
      default:
        return {
          title: '⏰ Reminder',
          body: 'You have a scheduled reminder',
        };
    }
  }

  // Cancel notifications by type
  async cancelNotificationsByType(type) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel = scheduledNotifications.filter(
        notification => notification.content.data?.type === type
      );

      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`Cancelled ${notificationsToCancel.length} notifications of type: ${type}`);
    } catch (error) {
      console.error(`Error cancelling notifications of type ${type}:`, error);
    }
  }

  // Cancel specific reminder notification
  async cancelReminderNotification(reminderId, type) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationToCancel = scheduledNotifications.find(
        notification => 
          notification.content.data?.type === `${type}_reminder` &&
          notification.content.data?.reminderId === reminderId
      );

      if (notificationToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notificationToCancel.identifier);
        console.log(`Cancelled ${type} reminder notification for ID: ${reminderId}`);
      }
    } catch (error) {
      console.error(`Error cancelling ${type} reminder notification:`, error);
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Send immediate AI insights notification (for testing or manual triggers)
  async sendImmediateAIInsights() {
    try {
      // Fetch personalized insights from health advisor
      const personalizedMessage = await this.fetchDailyInsights();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧠 AI Health Insights',
          body: personalizedMessage,
          data: {
            type: 'ai_insight_immediate',
            timestamp: Date.now(),
            source: 'health_advisor'
          },
        },
        trigger: { seconds: 1 }, // Send immediately
      });

      console.log('Immediate AI insights notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending immediate AI insights:', error);
      return null;
    }
  }

  // Get push token for server-side notifications (if needed)
  getPushToken() {
    return this.expoPushToken;
  }
}

// Export singleton instance
export default new NotificationService();
