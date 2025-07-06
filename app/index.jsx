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


function Index() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/screens/Home');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);


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