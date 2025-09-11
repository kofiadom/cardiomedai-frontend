import { useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  Image
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useUser } from "@/context/userContext";


function Index() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { currentUser, userLoading } = useUser();

  useEffect(() => {
    // Only navigate once when the component mounts and user state is determined
    console.log('[Index] Navigation check - userLoading:', userLoading, 'currentUser:', currentUser?.full_name || 'null');
    
    if (!userLoading) {
      // Add a small delay to prevent interference with login navigation
      const navigationTimeout = setTimeout(() => {
        if (currentUser) {
          console.log('[Index] User already logged in, redirecting to Home');
          router.replace('/screens/Home');
        } else {
          console.log('[Index] No user logged in, redirecting to Login');
          router.replace('/screens/Login');
        }
      }, 100);

      return () => clearTimeout(navigationTimeout);
    } else {
      console.log('[Index] Still loading user state, waiting...');
    }
  }, [currentUser, userLoading, router])

  return (
    <SafeAreaView style={tw`flex-1 bg-[#fff]`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto justify-center items-center`, { width: containerWidth }]}>
        <View style={tw`flex justify-center items-center`}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 150, height: 150 }}
          />
          <Text style={tw`text-xl font-bold text-[#1e40af] mt-4 tracking-wider`}>
            CardioMed
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Index;