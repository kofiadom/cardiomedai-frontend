import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  Image,
} from "react-native";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/userContext";

function CreateUser() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { createUser, userLoading } = useUser();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medical_conditions: '',
    medications: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async () => {
    // Basic validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert("Missing Information", "Please fill in username, email, and password.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const userData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      };

      const newUser = await createUser(userData);
      Alert.alert(
        "Account Created!",
        `Welcome ${newUser.full_name || newUser.username}!\n\nYour User ID is: ${newUser.id}\n\nPlease remember this ID for future logins.`
      );
      router.push('/screens/Home');
    } catch (error) {
      console.error('Create account failed:', error);
      Alert.alert("Creation Failed", error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/screens/Login');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={"padding"}
        style={[tw`flex-1 mx-auto`, { width: containerWidth }]}
      >
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={tw`items-center mt-8 mb-6`}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 80, height: 80 }}
            />
            <Text style={tw`text-xl font-bold text-[#1e40af] mt-4 tracking-wider`}>
              CardioMed
            </Text>
            <Text style={tw`text-gray-600 text-center mt-2 text-sm`}>
              Create your health account
            </Text>
          </View>

          {/* Create Account Card */}
          <View style={tw`bg-white rounded-3xl p-6 mb-6 shadow-lg border border-gray-100`}>
            <Text style={tw`text-xl font-bold text-gray-900 mb-6 text-center`}>
              Create Account
            </Text>

            {/* Username */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Username *
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.username ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                placeholder="Choose a username"
                placeholderTextColor="#9CA3AF"
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Email */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Email *
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.email ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Password *
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.password ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
              />
            </View>

            {/* Full Name */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Full Name
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.full_name ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                placeholder="Your full name"
                placeholderTextColor="#9CA3AF"
                value={formData.full_name}
                onChangeText={(value) => updateFormData('full_name', value)}
              />
            </View>

            {/* Age and Gender Row */}
            <View style={tw`flex-row mb-4`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                  Age
                </Text>
                <TextInput
                  style={tw`bg-gray-50 border-2 ${formData.age ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                  placeholder="25"
                  placeholderTextColor="#9CA3AF"
                  value={formData.age}
                  onChangeText={(value) => updateFormData('age', value)}
                  keyboardType="numeric"
                />
              </View>
              <View style={tw`flex-1 ml-2`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                  Gender
                </Text>
                <TextInput
                  style={tw`bg-gray-50 border-2 ${formData.gender ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                  placeholder="Male/Female"
                  placeholderTextColor="#9CA3AF"
                  value={formData.gender}
                  onChangeText={(value) => updateFormData('gender', value)}
                />
              </View>
            </View>

            {/* Height and Weight Row */}
            <View style={tw`flex-row mb-4`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                  Height (cm)
                </Text>
                <TextInput
                  style={tw`bg-gray-50 border-2 ${formData.height ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                  placeholder="170"
                  placeholderTextColor="#9CA3AF"
                  value={formData.height}
                  onChangeText={(value) => updateFormData('height', value)}
                  keyboardType="numeric"
                />
              </View>
              <View style={tw`flex-1 ml-2`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                  Weight (kg)
                </Text>
                <TextInput
                  style={tw`bg-gray-50 border-2 ${formData.weight ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                  placeholder="70"
                  placeholderTextColor="#9CA3AF"
                  value={formData.weight}
                  onChangeText={(value) => updateFormData('weight', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Medical Conditions */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Medical Conditions
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.medical_conditions ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                placeholder="e.g. Hypertension, Diabetes"
                placeholderTextColor="#9CA3AF"
                value={formData.medical_conditions}
                onChangeText={(value) => updateFormData('medical_conditions', value)}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Medications */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                Current Medications
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.medications ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                placeholder="e.g. Lisinopril 10mg daily"
                placeholderTextColor="#9CA3AF"
                value={formData.medications}
                onChangeText={(value) => updateFormData('medications', value)}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 px-6 shadow-lg mb-4 ${loading ? 'opacity-50' : ''}`}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={tw`flex-row items-center justify-center`}>
                {loading ? (
                  <Ionicons name="refresh-circle" size={20} color="white" style={tw`mr-2`} />
                ) : (
                  <Ionicons name="person-add" size={20} color="white" style={tw`mr-2`} />
                )}
                <Text style={tw`text-white text-lg font-semibold`}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={tw`bg-gray-100 rounded-xl py-4 px-6 border border-gray-200`}
              onPress={handleBackToLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Ionicons name="arrow-back" size={20} color="#6B7280" style={tw`mr-2`} />
                <Text style={tw`text-gray-700 text-lg font-medium`}>
                  Back to Login
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default CreateUser;