import { useContext } from "react";
import { Text, View, Platform, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import UserProvider from "../context/userContext";

function ScreenHeader() {
  const navigation = useNavigation();
  const { data: users, userLoading } = useContext(UserProvider) || {};

  // Get the first user (assuming single user app for now)
  const currentUser = users && users.length > 0 ? users[0] : null;

  // Generate initials from full name or username
  const getInitials = (user) => {
    if (!user) return "U";
    const name = user.full_name || user.username || "User";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDisplayName = (user) => {
    if (!user) return "User";
    return user.full_name || user.username || "User";
  };

  const handleProfilePress = () => {
    navigation.navigate("screens/Profile");
  };

  return (
    <View style={[tw`flex-row justify-between items-center px-1 ${Platform.OS === 'ios' ? 'mt-4' : 'mt-12'}`]}>
      <TouchableOpacity
        style={tw`flex flex-row justify-center items-center`}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#3b82f6', '#1e40af']}
          style={tw`w-14 h-14 mr-3 rounded-2xl flex justify-center items-center`}
        >
          <Text style={tw`font-bold text-white text-base`}>
            {userLoading ? "..." : getInitials(currentUser)}
          </Text>
        </LinearGradient>
        <View>
          <Text style={tw`text-[#64748b] text-xs`}>Hello</Text>
          <Text style={tw`font-bold text-[#1e293b] text-sm`}>
            {userLoading ? "Loading..." : getDisplayName(currentUser)}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex flex-row items-center bg-white rounded-2xl px-3 py-3 border border-[#e2e8f0]`}>
        <View style={tw`w-2.5 h-2.5 bg-[#ef4444] rounded-full mr-2`} />
        <Text style={tw`font-bold text-[#1e293b] text-sm mr-1`}>3</Text>
        <Ionicons name="notifications-outline" size={22} color="#1e293b" />
      </TouchableOpacity>
    </View>
  )
}
export default ScreenHeader;