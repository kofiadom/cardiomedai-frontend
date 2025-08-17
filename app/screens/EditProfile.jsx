import { useState, useContext, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import ScreenHeader from "../../components/ScreenHeader";
import UserProvider from "../../context/userContext";

function EditProfile() {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { data: users, userLoading, mutate } = useContext(UserProvider) || {};
  
  // Get the first user (assuming single user app for now)
  const currentUser = users && users.length > 0 ? users[0] : null;
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medical_conditions: '',
    medications: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        full_name: currentUser.full_name || '',
        age: currentUser.age ? currentUser.age.toString() : '',
        gender: currentUser.gender || '',
        height: currentUser.height ? currentUser.height.toString() : '',
        weight: currentUser.weight ? currentUser.weight.toString() : '',
        medical_conditions: currentUser.medical_conditions || '',
        medications: currentUser.medications || ''
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      Alert.alert("Validation Error", "Username is required");
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    
    // Validate numeric fields
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) < 0 || parseInt(formData.age) > 150)) {
      Alert.alert("Validation Error", "Please enter a valid age (0-150)");
      return false;
    }
    
    if (formData.height && (isNaN(formData.height) || parseFloat(formData.height) < 0 || parseFloat(formData.height) > 300)) {
      Alert.alert("Validation Error", "Please enter a valid height in cm (0-300)");
      return false;
    }
    
    if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) < 0 || parseFloat(formData.weight) > 1000)) {
      Alert.alert("Validation Error", "Please enter a valid weight in kg (0-1000)");
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Prepare data for API
      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        full_name: formData.full_name.trim() || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        medical_conditions: formData.medical_conditions.trim() || null,
        medications: formData.medications.trim() || null
      };

      const response = await fetch(`https://cardiomedai-api.onrender.com/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Refresh user data
      await mutate();
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = "default",
    multiline = false,
    maxLength,
    icon
  }) => (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>{label}</Text>
      <View style={tw`bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center`}>
        {icon && (
          <Ionicons name={icon} size={20} color="#6B7280" style={tw`mr-3`} />
        )}
        <TextInput
          style={[
            tw`flex-1 text-base text-gray-900`,
            multiline && tw`min-h-20`
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
        />
      </View>
    </View>
  );

  const GenderPicker = () => (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Gender</Text>
      <TouchableOpacity
        style={tw`bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center justify-between`}
        onPress={() => setShowGenderPicker(!showGenderPicker)}
      >
        <View style={tw`flex-row items-center`}>
          <Ionicons name="person-circle" size={20} color="#6B7280" style={tw`mr-3`} />
          <Text style={tw`text-base ${formData.gender ? 'text-gray-900' : 'text-gray-400'}`}>
            {formData.gender || 'Select gender'}
          </Text>
        </View>
        <Ionicons 
          name={showGenderPicker ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
      </TouchableOpacity>
      
      {showGenderPicker && (
        <View style={tw`bg-white border border-gray-200 rounded-2xl mt-2 overflow-hidden`}>
          {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
            <TouchableOpacity
              key={option}
              style={tw`px-4 py-3 border-b border-gray-100 last:border-b-0`}
              onPress={() => {
                handleInputChange('gender', option);
                setShowGenderPicker(false);
              }}
            >
              <Text style={tw`text-base text-gray-900`}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (userLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
        <StatusBar style="dark" />
        <View style={[tw`flex-1 mx-auto justify-center items-center`, { width: containerWidth }]}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={tw`text-gray-600 mt-4`}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
        <StatusBar style="dark" />
        <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
          <ScreenHeader />
          <View style={tw`flex-1 justify-center items-center`}>
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
            <Text style={tw`text-xl font-bold text-gray-900 mt-4 mb-2`}>
              Profile Not Found
            </Text>
            <Text style={tw`text-gray-600 text-center`}>
              Unable to load your profile information.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
          <ScreenHeader />

          <ScrollView style={tw`mt-5`} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={tw`mb-6`}>
              <TouchableOpacity
                style={tw`flex-row items-center mb-4`}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
                <Text style={tw`text-lg font-semibold text-gray-700 ml-2`}>
                  Back to Profile
                </Text>
              </TouchableOpacity>
              
              <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
                Edit Profile
              </Text>
              <Text style={tw`text-gray-600`}>
                Update your personal and health information
              </Text>
            </View>

            {/* Personal Information Section */}
            <View style={tw`bg-white rounded-3xl p-6 mb-6 border border-gray-100`}>
              <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
                Personal Information
              </Text>
              
              <InputField
                label="Username *"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                placeholder="Enter your username"
                icon="person"
                maxLength={50}
              />
              
              <InputField
                label="Email *"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                icon="mail"
                maxLength={100}
              />
              
              <InputField
                label="Full Name"
                value={formData.full_name}
                onChangeText={(value) => handleInputChange('full_name', value)}
                placeholder="Enter your full name"
                icon="person-circle"
                maxLength={100}
              />
              
              <InputField
                label="Age"
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                placeholder="Enter your age"
                keyboardType="numeric"
                icon="calendar"
                maxLength={3}
              />
              
              <GenderPicker />
            </View>

            {/* Health Information Section */}
            <View style={tw`bg-white rounded-3xl p-6 mb-6 border border-gray-100`}>
              <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
                Health Information
              </Text>
              
              <InputField
                label="Height (cm)"
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
                placeholder="Enter your height in cm"
                keyboardType="numeric"
                icon="resize"
                maxLength={6}
              />
              
              <InputField
                label="Weight (kg)"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                placeholder="Enter your weight in kg"
                keyboardType="numeric"
                icon="fitness"
                maxLength={6}
              />
              
              <InputField
                label="Medical Conditions"
                value={formData.medical_conditions}
                onChangeText={(value) => handleInputChange('medical_conditions', value)}
                placeholder="List any medical conditions"
                multiline={true}
                icon="medical"
                maxLength={500}
              />
              
              <InputField
                label="Current Medications"
                value={formData.medications}
                onChangeText={(value) => handleInputChange('medications', value)}
                placeholder="List your current medications"
                multiline={true}
                icon="pill"
                maxLength={500}
              />
            </View>

            {/* Action Buttons */}
            <View style={tw`flex-row gap-3 mb-8`}>
              <TouchableOpacity
                style={[
                  tw`flex-1 py-4 rounded-2xl items-center`,
                  isLoading ? tw`bg-gray-300` : tw`bg-blue-500`
                ]}
                onPress={handleSave}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={tw`text-white font-semibold text-base mt-1`}>
                      Save Changes
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={tw`flex-1 border border-gray-300 py-4 rounded-2xl items-center`}
                onPress={() => navigation.goBack()}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
                <Text style={tw`text-gray-600 font-medium text-base mt-1`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default EditProfile;
