import { useState, useContext } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ScreenHeader from "../../components/ScreenHeader";
import RemindersProvider from "../../context/remindersContext";

function Reminders() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  
  const [activeTab, setActiveTab] = useState('medication');
  
  const remindersContext = useContext(RemindersProvider) || {};
  const {
    medicationReminders = [],
    bpReminders = [],
    doctorReminders = [],
    workoutReminders = [],
    medicationLoading = false,
    bpLoading = false,
    doctorLoading = false,
    workoutLoading = false,
    markMedicationTaken = () => {},
    markBPCompleted = () => {},
    markDoctorCompleted = () => {},
    markWorkoutCompleted = () => {},
    deleteMedicationReminder = () => {},
    deleteBPReminder = () => {},
    deleteDoctorReminder = () => {},
    deleteWorkoutReminder = () => {},
    mutateMedication,
    mutateBP,
    mutateDoctor,
    mutateWorkout,
    mutateUpcomingMed,
    mutateUpcomingBP
  } = remindersContext;

  const tabs = [
    {
      id: 'medication',
      label: 'Medications',
      icon: 'medical',
      color: '#10b981',
      bgColor: '#ecfdf5',
      data: Array.isArray(medicationReminders) ? medicationReminders : [],
      loading: medicationLoading,
    },
    {
      id: 'bp',
      label: 'Blood Pressure',
      icon: 'heart',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      data: Array.isArray(bpReminders) ? bpReminders : [],
      loading: bpLoading,
    },
    {
      id: 'doctor',
      label: 'Appointment',
      icon: 'person',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      data: Array.isArray(doctorReminders) ? doctorReminders : [],
      loading: doctorLoading,
    },
    {
      id: 'workout',
      label: 'Workout',
      icon: 'fitness',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      data: Array.isArray(workoutReminders) ? workoutReminders : [],
      loading: workoutLoading,
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleMarkComplete = async (reminderId, type) => {
    try {
      switch (type) {
        case 'medication':
          await markMedicationTaken(reminderId);
          if (mutateMedication) await mutateMedication();
          if (mutateUpcomingMed) await mutateUpcomingMed();
          break;
        case 'bp':
          await markBPCompleted(reminderId);
          if (mutateBP) await mutateBP();
          if (mutateUpcomingBP) await mutateUpcomingBP();
          break;
        case 'doctor':
          await markDoctorCompleted(reminderId);
          if (mutateDoctor) await mutateDoctor();
          break;
        case 'workout':
          await markWorkoutCompleted(reminderId);
          if (mutateWorkout) await mutateWorkout();
          break;
      }

      // Wait a moment for the server to process the change
      await new Promise(resolve => setTimeout(resolve, 500));

      Alert.alert(
        "Success",
        `${type.charAt(0).toUpperCase() + type.slice(1)} reminder marked as completed.`,
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error marking reminder as complete:', error);
      Alert.alert('Error', `Failed to mark ${type} reminder as completed. Please try again.\n\nError: ${error.message}`);
    }
  };

  const handleDeleteReminder = async (reminderId, type, reminderName) => {
    Alert.alert(
      "Delete Reminder",
      `Are you sure you want to delete "${reminderName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              let deleteFunction;
              switch (type) {
                case 'medication':
                  deleteFunction = deleteMedicationReminder;
                  break;
                case 'bp':
                  deleteFunction = deleteBPReminder;
                  break;
                case 'doctor':
                  deleteFunction = deleteDoctorReminder;
                  break;
                case 'workout':
                  deleteFunction = deleteWorkoutReminder;
                  break;
              }

              if (typeof deleteFunction === 'function') {
                await deleteFunction(reminderId);
                // Context already handles data refresh in the delete functions
                Alert.alert(
                  "Success",
                  "Reminder deleted successfully.",
                  [{ text: "OK", style: "default" }],
                  { cancelable: true }
                );
              } else {
                Alert.alert('Error', `Delete function for ${type} is not available`);
              }
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleAddReminder = (type) => {
    switch (type) {
      case 'medication':
        router.push('/screens/AddMedicationReminder');
        break;
      case 'bp':
        router.push('/screens/AddBPReminder');
        break;
      case 'doctor':
        router.push('/screens/AddDoctorReminder');
        break;
      case 'workout':
        router.push('/screens/AddWorkoutReminder');
        break;
    }
  };

  const ReminderCard = ({ reminder, type }) => {
    const { date, time } = formatDateTime(
      reminder.schedule_datetime ||
      reminder.reminder_datetime ||
      reminder.appointment_datetime ||
      reminder.workout_datetime
    );

    // Check if reminder is completed
    const isCompleted = type === 'medication' ? reminder.is_taken : reminder.is_completed;



    return (
      <View style={tw`bg-white rounded-3xl p-6 mb-4 border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'} shadow-sm`}>
        {/* Status Banner */}
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-3 h-3 rounded-full mr-2 ${isCompleted ? 'bg-green-500' : 'bg-orange-400'}`} />
            <Text style={tw`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-orange-600'}`}>
              {isCompleted
                ? (type === 'medication' ? 'TAKEN' : 'COMPLETED')
                : 'PENDING'
              }
            </Text>
          </View>
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          )}
        </View>

        <View style={tw`flex-row items-start justify-between mb-4`}>
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Text style={tw`text-lg font-semibold ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                {reminder.name || reminder.doctor_name || reminder.workout_type || 'BP Check'}
              </Text>
            </View>
            
            {reminder.dosage && (
              <Text style={tw`text-gray-600 mb-1`}>
                Dosage: {reminder.dosage}
              </Text>
            )}
            
            {reminder.schedule_dosage && (
              <Text style={tw`text-gray-600 mb-1`}>
                Take: {reminder.schedule_dosage}
              </Text>
            )}
            
            {reminder.appointment_type && (
              <Text style={tw`text-gray-600 mb-1`}>
                Type: {reminder.appointment_type}
              </Text>
            )}
            
            {reminder.location && (
              <Text style={tw`text-gray-600 mb-1`}>
                Location: {reminder.location}
              </Text>
            )}
            
            {reminder.duration_minutes && (
              <Text style={tw`text-gray-600 mb-1`}>
                Duration: {reminder.duration_minutes} minutes
              </Text>
            )}
            
            <View style={tw`flex-row items-center mt-2`}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={tw`text-gray-500 text-sm ml-1`}>
                {date} at {time}
              </Text>
            </View>
            
            {reminder.notes && (
              <Text style={tw`text-gray-500 text-sm mt-2 italic`}>
                {reminder.notes}
              </Text>
            )}
          </View>
          
          <View style={tw`flex-row items-center`}>
            {/* Mark as complete button - show different state if completed */}
            {!isCompleted ? (
              <TouchableOpacity
                style={tw`ml-4 bg-${activeTabData.color.replace('#', '')}-100 rounded-full p-3 mr-2`}
                onPress={() => handleMarkComplete(reminder.id, type)}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={activeTabData.color}
                />
              </TouchableOpacity>
            ) : (
              <View style={tw`ml-4 bg-green-500 rounded-full p-3 mr-2`}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="white"
                />
              </View>
            )}

            {/* Delete button */}
            <TouchableOpacity
              style={tw`bg-red-100 rounded-full p-3 ${isCompleted ? 'opacity-60' : ''}`}
              onPress={() => handleDeleteReminder(
                reminder.id,
                type,
                reminder.name || reminder.doctor_name || reminder.workout_type || 'BP Check'
              )}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color="#ef4444"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const EmptyState = ({ type }) => (
    <View style={tw`bg-white rounded-3xl p-8 items-center border border-gray-100`}>
      <View style={[tw`p-4 rounded-full mb-4`, { backgroundColor: activeTabData.bgColor }]}>
        <Ionicons name={activeTabData.icon} size={32} color={activeTabData.color} />
      </View>
      <Text style={tw`text-lg font-semibold text-gray-900 mb-2`}>
        No {activeTabData.label} Reminders
      </Text>
      <Text style={tw`text-gray-500 text-center mb-4`}>
        You don't have any {activeTabData.label.toLowerCase()} reminders set up yet.
      </Text>

      {type === 'medication' ? (
        <View style={tw`w-full`}>
          <TouchableOpacity
            style={[tw`mb-3 px-6 py-3 rounded-2xl`, { backgroundColor: activeTabData.color }]}
            onPress={() => handleAddReminder(activeTab)}
          >
            <Text style={tw`text-white font-semibold text-center`}>
              Add Medication Reminder
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`border-2 border-dashed px-6 py-3 rounded-2xl`}
            style={[tw`border-2 border-dashed px-6 py-3 rounded-2xl`, { borderColor: activeTabData.color }]}
            onPress={() => router.push('/screens/UploadPrescription')}
          >
            <View style={tw`flex-row items-center justify-center`}>
              <Ionicons name="camera" size={18} color={activeTabData.color} />
              <Text style={tw`font-semibold ml-2`} style={[tw`font-semibold ml-2`, { color: activeTabData.color }]}>
                Upload Prescription
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[tw`px-6 py-3 rounded-2xl`, { backgroundColor: activeTabData.color }]}
          onPress={() => handleAddReminder(activeTab)}
        >
          <Text style={tw`text-white font-semibold`}>
            Add {activeTabData.label} Reminder
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
        <ScreenHeader />

        {/* Header */}
        <View style={tw`mt-5 mb-6`}>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
            Reminders
          </Text>
          <Text style={tw`text-gray-600`}>
            Manage your health reminders and stay on track
          </Text>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tw`mb-4 max-h-16`}
          contentContainerStyle={tw`px-1 py-1`}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={tw`mr-4 ${activeTab === tab.id ? 'bg-white border-2' : 'bg-gray-100 border'} border-gray-200 rounded-full px-10 py-1.5 flex-row items-center min-w-0 h-12 shadow-sm`}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <View style={[tw`w-6 h-6 rounded-full mr-3 items-center justify-center`,
                { backgroundColor: activeTab === tab.id ? tab.bgColor : '#f3f4f6' }]}>
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={activeTab === tab.id ? tab.color : '#6b7280'}
                />
              </View>
              <Text style={tw`font-semibold text-base ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'} whitespace-nowrap`}>
                {tab.label}
              </Text>
              {tab.data && tab.data.length > 0 && (
                <View style={[tw`ml-3 px-2.5 py-1 rounded-full`, { backgroundColor: tab.color }]}>
                  <Text style={tw`text-white text-xs font-bold`}>
                    {tab.data.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {activeTabData.loading ? (
            <View style={tw`bg-white rounded-3xl p-8 items-center border border-gray-100`}>
              <ActivityIndicator size="large" color={activeTabData.color} />
              <Text style={tw`text-gray-600 mt-4`}>
                Loading {activeTabData.label.toLowerCase()} reminders...
              </Text>
            </View>
          ) : activeTabData.data && activeTabData.data.length > 0 ? (
            activeTabData.data.map((reminder) => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                type={activeTab} 
              />
            ))
          ) : (
            <EmptyState type={activeTab} />
          )}
        </ScrollView>

        {/* Floating Add Button */}
        {activeTab === 'medication' ? (
          <View style={tw`absolute bottom-6 right-6`}>
            <TouchableOpacity
              style={[tw`w-16 h-16 rounded-full items-center justify-center shadow-lg mb-3`,
                { backgroundColor: activeTabData.color }]}
              activeOpacity={0.8}
              onPress={() => router.push('/screens/UploadPrescription')}
            >
              <Ionicons name="camera" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[tw`w-16 h-16 rounded-full items-center justify-center shadow-lg`,
                { backgroundColor: activeTabData.color }]}
              activeOpacity={0.8}
              onPress={() => handleAddReminder(activeTab)}
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[tw`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg`,
              { backgroundColor: activeTabData.color }]}
            activeOpacity={0.8}
            onPress={() => handleAddReminder(activeTab)}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

export default Reminders;
