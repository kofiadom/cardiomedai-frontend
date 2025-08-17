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

function AddMedicationReminder() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  
  const { createMedicationReminder } = useContext(RemindersProvider) || {};
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    schedule_dosage: '',
    notes: '',
  });
  
  const [scheduleDateTime, setScheduleDateTime] = useState(new Date());
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
      setScheduleDateTime(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(scheduleDateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setScheduleDateTime(newDateTime);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter medication name');
      return false;
    }
    if (!formData.dosage.trim()) {
      Alert.alert('Validation Error', 'Please enter dosage');
      return false;
    }
    if (!formData.schedule_dosage.trim()) {
      Alert.alert('Validation Error', 'Please enter schedule dosage');
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
        schedule_datetime: scheduleDateTime.toISOString(),
      };
      
      await createMedicationReminder(reminderData);
      
      Alert.alert(
        'Success',
        'Medication reminder created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Error creating medication reminder:', error);
      Alert.alert('Error', 'Failed to create medication reminder. Please try again.');
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

  const { date, time } = formatDateTime(scheduleDateTime);

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
              Add Medication Reminder
            </Text>
            <Text style={tw`text-gray-600`}>
              Set up a reminder for your medication
            </Text>
          </View>

          {/* Medication Details */}
          <View style={tw`bg-white rounded-3xl p-6 border border-gray-100 mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Medication Details
            </Text>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Medication Name *
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50`}
                placeholder="e.g., Lisinopril, Metformin"
                placeholderTextColor="#9ca3af"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Dosage *
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50`}
                placeholder="e.g., 10mg, 500mg"
                placeholderTextColor="#9ca3af"
                value={formData.dosage}
                onChangeText={(value) => handleInputChange('dosage', value)}
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Schedule Dosage *
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50`}
                placeholder="e.g., 1 tablet, 2 capsules"
                placeholderTextColor="#9ca3af"
                value={formData.schedule_dosage}
                onChangeText={(value) => handleInputChange('schedule_dosage', value)}
              />
            </View>

            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Notes (Optional)
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50 min-h-24`}
                placeholder="Additional notes about this medication..."
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
              Schedule
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
              style={tw`${isLoading ? 'bg-green-400' : 'bg-green-600'} rounded-2xl py-4 items-center mb-3 shadow-sm`}
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
            value={scheduleDateTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={scheduleDateTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddMedicationReminder;
