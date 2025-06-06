import { Text, View, SafeAreaView, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";
import ScreenHeader from "../../components/ScreenHeader";

function UploadBPMonitorImg() {
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth * 0.92;


  <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
    <StatusBar style="dark" />
    <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
      <ScreenHeader />


    </View>
  </SafeAreaView>

}
export default UploadBPMonitorImg;