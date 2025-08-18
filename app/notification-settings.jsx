import { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenHeader from "../components/ScreenHeader";
import NotificationService from "../services/notificationService";
import * as Notifications from 'expo-notifications';

function NotificationSettings() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  
  const [settings, setSettings] = useState({
    dailyInsights: true,
    medicationReminders: true,
    bpReminders: true,
    doctorAppointments: true,
    workoutReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    checkNotificationPermissions();
    loadSettings();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const loadSettings = () => {
    // In a real app, you'd load these from AsyncStorage or user preferences
    // For now, we'll use default values
    console.log('Loading notification settings...');
  };

  const saveSettings = async (newSettings) => {
    // In a real app, you'd save these to AsyncStorage or user preferences
    setSettings(newSettings);
    console.log('Notification settings saved:', newSettings);
  };

  const handleToggle = async (settingKey) => {
    const newSettings = {
      ...settings,
      [settingKey]: !settings[settingKey]
    };
    
    await saveSettings(newSettings);
    
    // Handle specific setting changes
    if (settingKey === 'dailyInsights') {
      if (newSettings.dailyInsights) {
        await NotificationService.scheduleDailyAIInsights();
        Alert.alert('Success', 'Daily AI insights notifications enabled');
      } else {
        await NotificationService.cancelNotificationsByType('ai_insight');
        Alert.alert('Success', 'Daily AI insights notifications disabled');
      }
    }
  };

  const requestPermissions = async () => {
    const { status } = await NotificationService.requestPermissions();
    setPermissionStatus(status);
    
    if (status === 'granted') {
      Alert.alert('Success', 'Notification permissions granted!');
      // Re-initialize notifications
      await NotificationService.initialize();
      if (settings.dailyInsights) {
        await NotificationService.scheduleDailyAIInsights();
      }
    } else {
      Alert.alert('Permission Denied', 'Please enable notifications in your device settings to receive reminders.');
    }
  };

  const testNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification from CardioMed AI!',
          data: { type: 'test' },
        },
        trigger: { seconds: 1 },
      });
      Alert.alert('Test Sent', 'A test notification will appear in 1 second');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const testAIInsights = async () => {
    try {
      await NotificationService.sendImmediateAIInsights();
      Alert.alert('AI Insights Sent', 'Your personalized AI health insights will appear in 1 second');
    } catch (error) {
      Alert.alert('Error', 'Failed to send AI insights notification');
    }
  };

  const testReminderNotifications = async () => {
    try {
      // Test all reminder types with notifications in 5, 10, 15, 20 seconds
      const testReminders = [
        {
          id: 'test-med',
          name: 'Test Medication',
          dosage: '10mg',
          schedule_datetime: new Date(Date.now() + 5000).toISOString(),
          type: 'medication'
        },
        {
          id: 'test-bp',
          reminder_datetime: new Date(Date.now() + 10000).toISOString(),
          type: 'bp'
        },
        {
          id: 'test-doctor',
          doctor_name: 'Dr. Test',
          appointment_datetime: new Date(Date.now() + 15000).toISOString(),
          type: 'doctor'
        },
        {
          id: 'test-workout',
          workout_type: 'Cardio',
          workout_datetime: new Date(Date.now() + 20000).toISOString(),
          type: 'workout'
        }
      ];

      for (const reminder of testReminders) {
        await NotificationService.scheduleReminderNotification(reminder, reminder.type);
      }

      Alert.alert(
        'Test Reminders Scheduled',
        'You will receive 4 test notifications:\n• Medication (5s)\n• BP Check (10s)\n• Doctor (15s)\n• Workout (20s)'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule test reminders');
    }
  };

  const SettingRow = ({ icon, title, description, value, onToggle, iconColor = "#6B7280" }) => (
    <View style={tw`bg-white rounded-2xl p-4 mb-3 border border-gray-100`}>
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1`}>
          <View style={tw`w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3`}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-base font-medium text-gray-900 mb-1`}>{title}</Text>
            <Text style={tw`text-sm text-gray-500`}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
        <ScreenHeader />

        <ScrollView style={tw`mt-5`} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={tw`mb-6`}>
            <TouchableOpacity
              style={tw`flex-row items-center mb-4`}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <Text style={tw`text-lg font-semibold text-gray-700 ml-2`}>
                Back
              </Text>
            </TouchableOpacity>
            
            <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
              Notification Settings
            </Text>
            <Text style={tw`text-gray-600`}>
              Manage your notification preferences
            </Text>
          </View>

          {/* Permission Status */}
          <View style={tw`bg-white rounded-3xl p-6 mb-6 border border-gray-100`}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <Text style={tw`text-lg font-semibold text-gray-800`}>
                Permission Status
              </Text>
              <View style={tw`px-3 py-1 rounded-full ${permissionStatus === 'granted' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text style={tw`text-xs font-medium ${permissionStatus === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                  {String(permissionStatus === 'granted' ? 'Enabled' : 'Disabled')}
                </Text>
              </View>
            </View>
            
            {permissionStatus !== 'granted' && (
              <TouchableOpacity
                style={tw`bg-blue-500 py-3 px-4 rounded-2xl flex-row items-center justify-center`}
                onPress={requestPermissions}
              >
                <Ionicons name="notifications" size={20} color="white" />
                <Text style={tw`text-white font-semibold ml-2`}>
                  Enable Notifications
                </Text>
              </TouchableOpacity>
            )}
            
            {permissionStatus === 'granted' && (
              <View style={tw`gap-3`}>
                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity
                    style={tw`flex-1 bg-gray-100 py-3 px-4 rounded-2xl flex-row items-center justify-center`}
                    onPress={testNotification}
                  >
                    <Ionicons name="flask" size={20} color="#6B7280" />
                    <Text style={tw`text-gray-700 font-semibold ml-2`}>
                      Test Basic
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`flex-1 bg-purple-100 py-3 px-4 rounded-2xl flex-row items-center justify-center`}
                    onPress={testAIInsights}
                  >
                    <Ionicons name="brain" size={20} color="#8B5CF6" />
                    <Text style={tw`text-purple-700 font-semibold ml-2`}>
                      Test AI Insights
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={tw`bg-blue-100 py-3 px-4 rounded-2xl flex-row items-center justify-center`}
                  onPress={testReminderNotifications}
                >
                  <Ionicons name="alarm" size={20} color="#3B82F6" />
                  <Text style={tw`text-blue-700 font-semibold ml-2`}>
                    Test All Reminder Types (5s, 10s, 15s, 20s)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notification Types */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 mb-4 px-1`}>
              Notification Types
            </Text>
            
            <SettingRow
              icon="brain"
              title="Daily AI Insights"
              description="Get personalized health insights every day at 8 AM"
              value={settings.dailyInsights}
              onToggle={() => handleToggle('dailyInsights')}
              iconColor="#8B5CF6"
            />
            
            <SettingRow
              icon="medical"
              title="Medication Reminders"
              description="Get notified when it's time to take your medications"
              value={settings.medicationReminders}
              onToggle={() => handleToggle('medicationReminders')}
              iconColor="#3B82F6"
            />
            
            <SettingRow
              icon="pulse"
              title="Blood Pressure Reminders"
              description="Get reminded to check your blood pressure"
              value={settings.bpReminders}
              onToggle={() => handleToggle('bpReminders')}
              iconColor="#EF4444"
            />
            
            <SettingRow
              icon="person"
              title="Doctor Appointments"
              description="Get notified about upcoming appointments"
              value={settings.doctorAppointments}
              onToggle={() => handleToggle('doctorAppointments')}
              iconColor="#10B981"
            />
            
            <SettingRow
              icon="fitness"
              title="Workout Reminders"
              description="Get reminded about your scheduled workouts"
              value={settings.workoutReminders}
              onToggle={() => handleToggle('workoutReminders')}
              iconColor="#F59E0B"
            />
          </View>

          {/* Notification Behavior */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 mb-4 px-1`}>
              Notification Behavior
            </Text>
            
            <SettingRow
              icon="volume-high"
              title="Sound"
              description="Play sound when notifications arrive"
              value={settings.soundEnabled}
              onToggle={() => handleToggle('soundEnabled')}
              iconColor="#06B6D4"
            />
            
            <SettingRow
              icon="phone-portrait"
              title="Vibration"
              description="Vibrate when notifications arrive"
              value={settings.vibrationEnabled}
              onToggle={() => handleToggle('vibrationEnabled')}
              iconColor="#84CC16"
            />
          </View>

          {/* Info */}
          <View style={tw`bg-blue-50 rounded-3xl p-6 mb-8 border border-blue-100`}>
            <View style={tw`flex-row items-start`}>
              <Ionicons name="information-circle" size={24} color="#3B82F6" style={tw`mr-3 mt-0.5`} />
              <View style={tw`flex-1`}>
                <Text style={tw`text-blue-900 font-semibold mb-2`}>
                  About Notifications
                </Text>
                <Text style={tw`text-blue-800 text-sm leading-5`}>
                  Notifications help you stay on top of your health routine. You can customize which types of reminders you receive and when you receive them.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default NotificationSettings;
