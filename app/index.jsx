import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useEffect, useContext } from "react";
import UserProvider from "../context/userContext";


function Index() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;

  const { data, isLoading } = useContext(UserProvider);

  useEffect(() => {
    if (!isLoading) {
      router.replace("/screens/Home");
    }
  }, [isLoading, data, router]);


  return (
    <SafeAreaView style={tw`flex-1 bg-blue-200`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
        <View style={tw`flex justify-center items-center w-35 mx-auto`}>
          <LottieView
            source={require("../assets/animations/heart.json")}
            autoPlay
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Index;