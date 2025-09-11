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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from "../../components/ScreenHeader";
import BpReaderProvider from "../../context/bpReadingsContext";
import { useUser } from "../../context/userContext";

function UploadBPMonitorImg() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { currentUser } = useUser();
  const { mutate } = useContext(BpReaderProvider);

  const [selectedImage, setSelectedImage] = useState(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const [showOcrResults, setShowOcrResults] = useState(false);

  const handleImageUpload = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Show action sheet for camera or gallery
      Alert.alert(
        'Select Image',
        'Choose how you want to select an image',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Gallery',
            onPress: () => openGallery(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Selected camera image URI:', imageUri);
        setSelectedImage(imageUri);
        setOcrResults(null);
        setShowOcrResults(false);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Selected gallery image URI:', imageUri);
        setSelectedImage(imageUri);
        setOcrResults(null);
        setShowOcrResults(false);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const uploadImageForOCR = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add the image file
      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'bp_monitor.jpg',
      });

      formData.append('user_id', currentUser?.id?.toString() || '1');

      // Add notes if provided
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      // Upload to OCR endpoint
      const response = await fetch('https://staging.codinnovations.com/cardiomed/bp/upload/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // OCR successful, show results for approval
        setOcrResults(data);
        setShowOcrResults(true);
        Alert.alert(
          'OCR Complete',
          'Blood pressure values have been extracted from the image. Please review and confirm the values below.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('OCR upload failed:', data);
        Alert.alert('Upload Failed', data.detail || 'Failed to process the image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please check your internet connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveOCR = async () => {
    if (!ocrResults) return;

    setIsUploading(true);

    try {
      const response = await fetch('https://staging.codinnovations.com/cardiomed/bp/save-ocr/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser?.id || 1,
          systolic: ocrResults.systolic,
          diastolic: ocrResults.diastolic,
          pulse: ocrResults.pulse,
          notes: notes.trim() || null,
          device_id: ocrResults.device_id || null,
          interpretation: ocrResults.interpretation || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Blood pressure reading saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setSelectedImage(null);
                setNotes('');
                setOcrResults(null);
                setShowOcrResults(false);
                // Refresh BP readings data
                mutate();
                // Navigate back to home
                router.push('/');
              }
            }
          ]
        );
      } else {
        console.error('Save OCR failed:', data);
        Alert.alert('Save Failed', data.detail || 'Failed to save the reading. Please try again.');
      }
    } catch (error) {
      console.error('Error saving OCR data:', error);
      Alert.alert('Save Error', 'Failed to save reading. Please check your internet connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditOCR = () => {
    // For now, just hide OCR results to allow re-upload
    setShowOcrResults(false);
    setOcrResults(null);
    Alert.alert('Edit Values', 'Please upload a new image or use manual entry to correct the values.');
  };

  const handleSave = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }
    uploadImageForOCR();
  };

  // OCR Results Component
  const OCRResultsSection = ({ ocrResults, onApprove, onEdit }) => (
    <View style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-5`}>
      <View style={tw`flex-row items-center mb-4`}>
        <Ionicons name="scan" size={24} color="#10b981" />
        <Text style={tw`text-lg font-semibold text-gray-800 ml-2`}>
          Extracted Values
        </Text>
      </View>

      <View style={tw`bg-green-50 rounded-2xl p-4 mb-4`}>
        <Text style={tw`text-green-800 text-sm mb-3 font-medium`}>
          The following values were detected from your image:
        </Text>

        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-600 font-medium`}>Systolic:</Text>
          <Text style={tw`text-gray-800 font-bold text-lg`}>{ocrResults.systolic} mmHg</Text>
        </View>

        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-600 font-medium`}>Diastolic:</Text>
          <Text style={tw`text-gray-800 font-bold text-lg`}>{ocrResults.diastolic} mmHg</Text>
        </View>

        {ocrResults.pulse && (
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-600 font-medium`}>Pulse:</Text>
            <Text style={tw`text-gray-800 font-bold text-lg`}>{ocrResults.pulse} bpm</Text>
          </View>
        )}

        {ocrResults.interpretation && (
          <View style={tw`mt-3 pt-3 border-t border-green-200`}>
            <Text style={tw`text-green-700 text-sm font-medium mb-1`}>Interpretation:</Text>
            <Text style={tw`text-green-800 text-sm`}>{ocrResults.interpretation}</Text>
          </View>
        )}
      </View>

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          style={tw`flex-1 bg-green-600 rounded-2xl py-3 items-center`}
          onPress={onApprove}
          activeOpacity={0.8}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={tw`text-white font-semibold ml-2`}>Approve & Save</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`flex-1 border border-gray-300 rounded-2xl py-3 items-center`}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons name="create-outline" size={18} color="#6b7280" />
            <Text style={tw`text-gray-600 font-medium ml-2`}>Edit Values</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

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
                <View style={tw`items-center w-full`}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={[tw`rounded-xl mb-3`, { width: '100%', height: 160 }]}
                    resizeMode="cover"
                    onError={(error) => {
                      console.error('Image load error:', error);
                      Alert.alert('Image Error', 'Failed to load the selected image');
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
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

          {/* OCR Results Section */}
          {showOcrResults && ocrResults && (
            <OCRResultsSection
              ocrResults={ocrResults}
              onApprove={handleApproveOCR}
              onEdit={handleEditOCR}
            />
          )}

          {/* Action Buttons */}
          {!showOcrResults && (
            <View style={tw`mb-8`}>
              <TouchableOpacity
                style={tw`${isUploading ? 'bg-blue-400' : 'bg-blue-600'} rounded-2xl py-4 items-center mb-3 shadow-sm`}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={isUploading || !selectedImage}
              >
                <View style={tw`flex-row items-center`}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="scan" size={20} color="white" />
                  )}
                  <Text style={tw`text-white font-semibold text-base ml-2`}>
                    {isUploading ? 'Processing Image...' : 'Process Image'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`border border-gray-300 rounded-2xl py-4 items-center`}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedImage(null);
                  setNotes('');
                  setOcrResults(null);
                  setShowOcrResults(false);
                }}
              >
                <Text style={tw`text-gray-600 font-medium text-base`}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {isUploading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
          <View style={tw`bg-white rounded-3xl p-8 items-center mx-8`}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={tw`text-gray-800 font-semibold text-lg mt-4 mb-2`}>
              {showOcrResults ? 'Saving Reading...' : 'Processing Image...'}
            </Text>
            <Text style={tw`text-gray-600 text-center text-sm`}>
              {showOcrResults
                ? 'Please wait while we save your blood pressure reading.'
                : 'Please wait while we extract blood pressure values from your image.'
              }
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default UploadBPMonitorImg;
