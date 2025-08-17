import { useState, useContext } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from "../../components/ScreenHeader";
import RemindersProvider from "../../context/remindersContext";

function AddWorkoutReminder() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  
  const { createWorkoutReminder } = useContext(RemindersProvider) || {};
  
  const [formData, setFormData] = useState({
    workout_type: '',
    duration_minutes: '',
    location: '',
    notes: '',
  });
  
  const [workoutDateTime, setWorkoutDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setWorkoutDateTime(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(workoutDateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setWorkoutDateTime(newDateTime);
    }
  };

  const validateForm = () => {
    if (!formData.workout_type.trim()) {
      Alert.alert('Validation Error', 'Please enter workout type');
      return false;
    }
    if (!formData.duration_minutes || isNaN(formData.duration_minutes)) {
      Alert.alert('Validation Error', 'Please enter a valid duration in minutes');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const reminderData = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes),
        workout_datetime: workoutDateTime.toISOString(),
      };
      
      await createWorkoutReminder(reminderData);
      
      Alert.alert(
        'Success',
        'Workout reminder created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Error creating workout reminder:', error);
      Alert.alert('Error', 'Failed to create workout reminder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const { date, time } = formatDateTime(workoutDateTime);

  const workoutTypes = [
    'Cardio',
    'Walking',
    'Running',
    'Cycling',
    'Swimming',
    'Strength Training',
    'Yoga',
    'Pilates',
    'Dancing',
    'Sports',
    'Other',
  ];

  const durations = [15, 20, 30, 45, 60, 90, 120];

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[tw`flex-1 mx-auto`, { width: containerWidth }]}
      >
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
                Back to Reminders
              </Text>
            </TouchableOpacity>
            
            <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
              Add Workout Reminder
            </Text>
            <Text style={tw`text-gray-600`}>
              Set up a reminder for your workout session
            </Text>
          </View>

          {/* Workout Details */}
          <View style={tw`bg-white rounded-3xl p-6 border border-gray-100 mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Workout Details
            </Text>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Workout Type *
              </Text>
              <View style={tw`border border-gray-200 rounded-2xl bg-gray-50`}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={tw`p-2`}
                >
                  {workoutTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={tw`mr-2 px-4 py-2 rounded-xl ${
                        formData.workout_type === type 
                          ? 'bg-orange-100 border border-orange-300' 
                          : 'bg-white border border-gray-200'
                      }`}
                      onPress={() => handleInputChange('workout_type', type)}
                    >
                      <Text style={tw`text-sm ${
                        formData.workout_type === type 
                          ? 'text-orange-700 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {formData.workout_type === 'Other' && (
                <TextInput
                  style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50 mt-3`}
                  placeholder="Enter custom workout type"
                  placeholderTextColor="#9ca3af"
                  value={formData.custom_type}
                  onChangeText={(value) => handleInputChange('custom_type', value)}
                />
              )}
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Duration (minutes) *
              </Text>
              <View style={tw`flex-row gap-2 mb-3`}>
                {durations.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={tw`px-3 py-2 rounded-xl ${
                      formData.duration_minutes === duration.toString() 
                        ? 'bg-orange-100 border border-orange-300' 
                        : 'bg-gray-100 border border-gray-200'
                    }`}
                    onPress={() => handleInputChange('duration_minutes', duration.toString())}
                  >
                    <Text style={tw`text-sm ${
                      formData.duration_minutes === duration.toString() 
                        ? 'text-orange-700 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50`}
                placeholder="Or enter custom duration"
                placeholderTextColor="#9ca3af"
                value={formData.duration_minutes}
                onChangeText={(value) => handleInputChange('duration_minutes', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Location (Optional)
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50`}
                placeholder="e.g., Gym, Home, Park"
                placeholderTextColor="#9ca3af"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
              />
            </View>

            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Notes (Optional)
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50 min-h-24`}
                placeholder="Additional notes about this workout..."
                placeholderTextColor="#9ca3af"
                multiline={true}
                textAlignVertical="top"
                value={formData.notes}
                onChangeText={(value) => handleInputChange('notes', value)}
                maxLength={500}
              />
            </View>
          </View>

          {/* Schedule */}
          <View style={tw`bg-white rounded-3xl p-6 border border-gray-100 mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Workout Schedule
            </Text>

            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                style={tw`flex-1 border border-gray-200 rounded-2xl p-4 bg-gray-50`}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={tw`flex-row items-center justify-between`}>
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>
                      Date
                    </Text>
                    <Text style={tw`text-base text-gray-900`}>
                      {date}
                    </Text>
                  </View>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-1 border border-gray-200 rounded-2xl p-4 bg-gray-50`}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={tw`flex-row items-center justify-between`}>
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>
                      Time
                    </Text>
                    <Text style={tw`text-base text-gray-900`}>
                      {time}
                    </Text>
                  </View>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`mb-8`}>
            <TouchableOpacity
              style={tw`${isLoading ? 'bg-orange-400' : 'bg-orange-600'} rounded-2xl py-4 items-center mb-3 shadow-sm`}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View style={tw`flex-row items-center`}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                )}
                <Text style={tw`text-white font-semibold text-base ml-2`}>
                  {isLoading ? 'Creating Reminder...' : 'Create Reminder'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`border border-gray-300 rounded-2xl py-4 items-center`}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={tw`text-gray-600 font-medium text-base`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={workoutDateTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={workoutDateTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddWorkoutReminder;
