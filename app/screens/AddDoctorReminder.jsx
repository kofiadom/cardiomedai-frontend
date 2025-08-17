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

function AddDoctorReminder() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  
  const { createDoctorReminder } = useContext(RemindersProvider) || {};
  
  const [formData, setFormData] = useState({
    doctor_name: '',
    appointment_type: '',
    location: '',
    notes: '',
  });
  
  const [appointmentDateTime, setAppointmentDateTime] = useState(new Date());
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
      setAppointmentDateTime(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(appointmentDateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setAppointmentDateTime(newDateTime);
    }
  };

  const validateForm = () => {
    if (!formData.doctor_name.trim()) {
      Alert.alert('Validation Error', 'Please enter doctor name');
      return false;
    }
    if (!formData.appointment_type.trim()) {
      Alert.alert('Validation Error', 'Please enter appointment type');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please enter location');
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
        appointment_datetime: appointmentDateTime.toISOString(),
      };
      
      await createDoctorReminder(reminderData);
      
      Alert.alert(
        'Success',
        'Doctor appointment reminder created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Error creating doctor reminder:', error);
      Alert.alert('Error', 'Failed to create doctor appointment reminder. Please try again.');
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

  const { date, time } = formatDateTime(appointmentDateTime);

  const appointmentTypes = [
    'General Checkup',
    'Cardiology Consultation',
    'Follow-up Visit',
    'Specialist Consultation',
    'Lab Results Review',
    'Prescription Renewal',
    'Emergency Visit',
    'Other',
  ];

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
              Add Doctor Appointment
            </Text>
            <Text style={tw`text-gray-600`}>
              Set up a reminder for your doctor appointment
            </Text>
          </View>

          {/* Appointment Details */}
          <View style={tw`bg-white rounded-3xl p-6 border border-gray-100 mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Appointment Details
            </Text>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Doctor Name *
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50`}
                placeholder="e.g., Dr. Smith, Dr. Johnson"
                placeholderTextColor="#9ca3af"
                value={formData.doctor_name}
                onChangeText={(value) => handleInputChange('doctor_name', value)}
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Appointment Type *
              </Text>
              <View style={tw`border border-gray-200 rounded-2xl bg-gray-50`}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={tw`p-2`}
                >
                  {appointmentTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={tw`mr-2 px-4 py-2 rounded-xl ${
                        formData.appointment_type === type 
                          ? 'bg-purple-100 border border-purple-300' 
                          : 'bg-white border border-gray-200'
                      }`}
                      onPress={() => handleInputChange('appointment_type', type)}
                    >
                      <Text style={tw`text-sm ${
                        formData.appointment_type === type 
                          ? 'text-purple-700 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {formData.appointment_type === 'Other' && (
                <TextInput
                  style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50 mt-3`}
                  placeholder="Enter custom appointment type"
                  placeholderTextColor="#9ca3af"
                  value={formData.custom_type}
                  onChangeText={(value) => handleInputChange('custom_type', value)}
                />
              )}
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Location *
              </Text>
              <TextInput
                style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50`}
                placeholder="e.g., Medical Center, Hospital Name"
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
                placeholder="Additional notes about this appointment..."
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
              Appointment Schedule
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
              style={tw`${isLoading ? 'bg-purple-400' : 'bg-purple-600'} rounded-2xl py-4 items-center mb-3 shadow-sm`}
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
            value={appointmentDateTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={appointmentDateTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddDoctorReminder;
