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

function AddBPReminder() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  
  const { createBPReminder } = useContext(RemindersProvider) || {};
  
  const [formData, setFormData] = useState({
    bp_category: 'manual',
    notes: '',
  });
  
  const [reminderDateTime, setReminderDateTime] = useState(new Date());
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
      setReminderDateTime(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(reminderDateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setReminderDateTime(newDateTime);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const reminderData = {
        ...formData,
        reminder_datetime: reminderDateTime.toISOString(),
      };
      
      await createBPReminder(reminderData);
      
      Alert.alert(
        'Success',
        'Blood pressure check reminder created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Error creating BP reminder:', error);
      Alert.alert('Error', 'Failed to create BP reminder. Please try again.');
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

  const { date, time } = formatDateTime(reminderDateTime);

  const categories = [
    { value: 'manual', label: 'Manual Check', description: 'Regular blood pressure monitoring' },
    { value: 'morning', label: 'Morning Check', description: 'Morning blood pressure reading' },
    { value: 'evening', label: 'Evening Check', description: 'Evening blood pressure reading' },
    { value: 'medication', label: 'Post-Medication', description: 'Check after taking medication' },
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
              Add BP Check Reminder
            </Text>
            <Text style={tw`text-gray-600`}>
              Set up a reminder for blood pressure monitoring
            </Text>
          </View>

          {/* Category Selection */}
          <View style={tw`bg-white rounded-3xl p-6 border border-gray-100 mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Check Type
            </Text>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={tw`flex-row items-center p-4 rounded-2xl mb-3 ${
                  formData.bp_category === category.value 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onPress={() => handleInputChange('bp_category', category.value)}
              >
                <View style={tw`flex-1`}>
                  <Text style={tw`font-semibold text-gray-900 mb-1`}>
                    {category.label}
                  </Text>
                  <Text style={tw`text-gray-600 text-sm`}>
                    {category.description}
                  </Text>
                </View>
                <View style={tw`w-6 h-6 rounded-full border-2 ${
                  formData.bp_category === category.value 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                } items-center justify-center`}>
                  {formData.bp_category === category.value && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
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

          {/* Notes */}
          <View style={tw`bg-white rounded-3xl p-6 border border-gray-100 mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Notes (Optional)
            </Text>

            <TextInput
              style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base bg-gray-50 min-h-24`}
              placeholder="Additional notes about this BP check..."
              placeholderTextColor="#9ca3af"
              multiline={true}
              textAlignVertical="top"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              maxLength={500}
            />
          </View>

          {/* Action Buttons */}
          <View style={tw`mb-8`}>
            <TouchableOpacity
              style={tw`${isLoading ? 'bg-blue-400' : 'bg-blue-600'} rounded-2xl py-4 items-center mb-3 shadow-sm`}
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
            value={reminderDateTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={reminderDateTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddBPReminder;
