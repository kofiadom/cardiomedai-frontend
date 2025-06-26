import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../components/ScreenHeader";

function UploadBPMonitorImg() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;

  const [selectedImage, setSelectedImage] = useState(null);
  const [notes, setNotes] = useState("");

  const handleImageUpload = () => {
    // Your image picker logic here
    console.log("Open image picker");
  };

  const handleSave = () => {
    console.log("Save data");
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={"padding"}
        style={[tw`flex-1 mx-auto`, { width: containerWidth }]}
      >
        <ScreenHeader />

        <ScrollView style={tw`mt-5`} showsVerticalScrollIndicator={false}>
          {/* Image Upload Section */}
          <View
            style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-5`}
          >
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Blood Pressure Reading
            </Text>

            <TouchableOpacity
              style={tw`border-2 border-dashed border-blue-300 rounded-2xl p-8 items-center justify-center bg-blue-50 min-h-48`}
              onPress={handleImageUpload}
              activeOpacity={0.7}
            >
              {selectedImage ? (
                <View style={tw`items-center`}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={tw`w-full h-40 rounded-xl mb-3`}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={tw`flex-row items-center bg-blue-600 px-4 py-2 rounded-full`}
                    onPress={handleImageUpload}
                  >
                    <Ionicons name="camera" size={16} color="white" />
                    <Text style={tw`text-white text-sm font-medium ml-2`}>
                      Change Image
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={tw`items-center`}>
                  <View style={tw`bg-blue-100 rounded-full p-4 mb-4`}>
                    <Ionicons name="camera" size={32} color="#3b82f6" />
                  </View>
                  <Text style={tw`text-blue-600 font-semibold text-base mb-2`}>
                    Upload Monitor Image
                  </Text>
                  <Text style={tw`text-gray-500 text-sm text-center leading-5`}>
                    Take a photo of your blood pressure monitor or select from
                    gallery
                  </Text>
                  <View style={tw`flex-row mt-4`}>
                    <View style={tw`bg-blue-600 px-4 py-2 rounded-full`}>
                      <Text style={tw`text-white text-sm font-medium`}>
                        Choose Image
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes Section */}
          <View
            style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-5`}
          >
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Additional Notes
            </Text>

            <TextInput
              style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base min-h-32 bg-gray-50`}
              placeholder="Add any additional notes about your blood pressure reading..."
              placeholderTextColor="#9ca3af"
              multiline={true}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              maxLength={500}
            />

            <View style={tw`flex-row justify-between items-center mt-3`}>
              <Text style={tw`text-gray-400 text-sm`}>
                {notes.length}/500 characters
              </Text>
              <View style={tw`flex-row items-center`}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#9ca3af"
                />
                <Text style={tw`text-gray-400 text-xs ml-1`}>Optional</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`mb-8`}>
            <TouchableOpacity
              style={tw`bg-blue-600 rounded-2xl py-4 items-center mb-3 shadow-sm`}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={tw`text-white font-semibold text-base ml-2`}>
                  Save Reading
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`border border-gray-300 rounded-2xl py-4 items-center`}
              activeOpacity={0.7}
            >
              <Text style={tw`text-gray-600 font-medium text-base`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default UploadBPMonitorImg;
