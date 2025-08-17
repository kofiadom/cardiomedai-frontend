import { useContext } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import UserProvider from "../../context/userContext";

function Profile() {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { data: users, userLoading, error } = useContext(UserProvider) || {};
  
  // Get the first user (assuming single user app for now)
  const currentUser = users && users.length > 0 ? users[0] : null;

  const getInitials = (user) => {
    if (!user) return "U";
    const name = user.full_name || user.username || "User";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleEditProfile = () => {
    navigation.navigate("screens/EditProfile");
  };

  const ProfileField = ({ icon, label, value, iconColor = "#6B7280" }) => (
    <View style={tw`bg-white rounded-2xl p-4 mb-3 border border-gray-100`}>
      <View style={tw`flex-row items-center`}>
        <View style={tw`w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3`}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={tw`flex-1`}>
          <Text style={tw`text-xs text-gray-500 mb-1`}>{label}</Text>
          <Text style={tw`text-base text-gray-900 font-medium`}>
            {value || "Not provided"}
          </Text>
        </View>
      </View>
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

  if (error || !currentUser) {
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
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
        <ScreenHeader />

        <ScrollView style={tw`mt-5`} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={tw`bg-white rounded-3xl p-6 mb-6 border border-gray-100`}>
            <View style={tw`items-center`}>
              <LinearGradient
                colors={['#3b82f6', '#1e40af']}
                style={tw`w-24 h-24 rounded-3xl flex justify-center items-center mb-4`}
              >
                <Text style={tw`font-bold text-white text-2xl`}>
                  {getInitials(currentUser)}
                </Text>
              </LinearGradient>
              <Text style={tw`text-2xl font-bold text-gray-900 mb-1`}>
                {currentUser.full_name || currentUser.username}
              </Text>
              <Text style={tw`text-gray-600 mb-4`}>
                {currentUser.email}
              </Text>
              <TouchableOpacity
                style={tw`bg-blue-500 px-6 py-3 rounded-2xl flex-row items-center mb-3`}
                onPress={handleEditProfile}
                activeOpacity={0.8}
              >
                <Ionicons name="create" size={18} color="white" />
                <Text style={tw`text-white font-semibold ml-2`}>
                  Edit Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-purple-500 px-6 py-3 rounded-2xl flex-row items-center`}
                onPress={() => navigation.navigate('notification-settings')}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications" size={18} color="white" />
                <Text style={tw`text-white font-semibold ml-2`}>
                  Notification Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 mb-4 px-1`}>
              Personal Information
            </Text>
            
            <ProfileField
              icon="person"
              label="Username"
              value={currentUser.username}
              iconColor="#3B82F6"
            />
            
            <ProfileField
              icon="mail"
              label="Email"
              value={currentUser.email}
              iconColor="#10B981"
            />
            
            <ProfileField
              icon="calendar"
              label="Age"
              value={currentUser.age ? `${currentUser.age} years` : null}
              iconColor="#F59E0B"
            />
            
            <ProfileField
              icon="person-circle"
              label="Gender"
              value={currentUser.gender}
              iconColor="#8B5CF6"
            />
          </View>

          {/* Health Information */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 mb-4 px-1`}>
              Health Information
            </Text>
            
            <ProfileField
              icon="resize"
              label="Height"
              value={currentUser.height ? `${currentUser.height} cm` : null}
              iconColor="#06B6D4"
            />
            
            <ProfileField
              icon="fitness"
              label="Weight"
              value={currentUser.weight ? `${currentUser.weight} kg` : null}
              iconColor="#EF4444"
            />
            
            <ProfileField
              icon="medical"
              label="Medical Conditions"
              value={currentUser.medical_conditions}
              iconColor="#F97316"
            />
            
            <ProfileField
              icon="pill"
              label="Current Medications"
              value={currentUser.medications}
              iconColor="#84CC16"
            />
          </View>

          {/* Bottom spacing */}
          <View style={tw`h-6`} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default Profile;
