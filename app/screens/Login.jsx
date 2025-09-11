import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
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
import NotificationService from "../../services/notificationService";

function Login() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { loginUser, userLoading } = useUser();

  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId.trim()) {
      Alert.alert("Missing Information", "Please enter your user ID.");
      return;
    }

    const id = parseInt(userId.trim());
    if (isNaN(id)) {
      Alert.alert("Invalid ID", "Please enter a valid numeric user ID.");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(id);
      console.log('[Login] User login successful, preparing navigation');

      // Schedule daily AI insights for this user
      try {
        console.log('[Login] Scheduling daily AI insights for user:', user.id);
        await NotificationService.scheduleDailyAIInsights(user.id);
      } catch (notifError) {
        console.warn('[Login] Failed to schedule AI insights:', notifError.message);
      }

      // Show welcome message first, then navigate after user dismisses it
      Alert.alert(
        "Welcome!",
        `Hello ${user.full_name || user.username}!`,
        [
          {
            text: "OK",
            onPress: () => {
              console.log('[Login] Alert dismissed, navigating to Home');
              // Small delay to ensure state is fully updated
              setTimeout(() => {
                console.log('[Login] Navigation: Attempting to navigate to /screens/Home');
                router.replace('/screens/Home');
                console.log('[Login] Navigation: router.replace called successfully');
              }, 200);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert("Login Failed", error.message || "User not found. Please check your user ID or create an account.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/screens/CreateUser');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={"padding"}
        style={[tw`flex-1 mx-auto`, { width: containerWidth }]}
      >
        <View style={tw`flex-1 justify-center items-center px-4`}>
          {/* Logo */}
          <View style={tw`items-center mb-8`}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 120, height: 120 }}
            />
            <Text style={tw`text-2xl font-bold text-[#1e40af] mt-4 tracking-wider`}>
              CardioMed
            </Text>
            <Text style={tw`text-gray-600 text-center mt-2 text-sm`}>
              Your personal health companion
            </Text>
          </View>

          {/* Login Card */}
          <View style={tw`bg-white rounded-3xl p-8 w-full shadow-lg border border-gray-100`}>
            <Text style={tw`text-xl font-bold text-gray-900 mb-2 text-center`}>
              Welcome Back
            </Text>
            <Text style={tw`text-gray-600 text-center mb-6 text-sm`}>
              Enter your user ID to continue
            </Text>

            {/* User ID Input */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                User ID
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${userId ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-4 text-lg`}
                placeholder="Enter your user ID"
                placeholderTextColor="#9CA3AF"
                value={userId}
                onChangeText={setUserId}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 px-6 shadow-lg mb-4 ${loading ? 'opacity-50' : ''}`}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={tw`flex-row items-center justify-center`}>
                {loading ? (
                  <Ionicons name="refresh-circle" size={20} color="white" style={tw`mr-2`} />
                ) : (
                  <Ionicons name="log-in" size={20} color="white" style={tw`mr-2`} />
                )}
                <Text style={tw`text-white text-lg font-semibold`}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity
              style={tw`bg-gray-100 rounded-xl py-4 px-6 border border-gray-200`}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Ionicons name="person-add" size={20} color="#6B7280" style={tw`mr-2`} />
                <Text style={tw`text-gray-700 text-lg font-medium`}>
                  Create Account
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={tw`mt-8 items-center`}>
            <Text style={tw`text-gray-500 text-sm text-center`}>
              Track your blood pressure and manage your health
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Login;