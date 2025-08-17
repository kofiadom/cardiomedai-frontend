import { useState, useContext } from "react";
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
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from "../../components/ScreenHeader";
import RemindersProvider from "../../context/remindersContext";

function UploadPrescription() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  
  const { mutateMedication } = useContext(RemindersProvider) || {};
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const [showOcrResults, setShowOcrResults] = useState(false);

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      Alert.alert(
        'Select Image',
        'Choose how you want to select an image',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Gallery', onPress: () => openGallery() },
          { text: 'Cancel', style: 'cancel' },
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
        setSelectedImage(result.assets[0].uri);
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
        setSelectedImage(result.assets[0].uri);
        setOcrResults(null);
        setShowOcrResults(false);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const uploadPrescriptionForOCR = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'prescription.jpg',
      });
      
      formData.append('user_id', '1');
      
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const response = await fetch('https://cardiomedai-api.onrender.com/reminders/upload-prescription', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOcrResults(data);
        setShowOcrResults(true);
        Alert.alert(
          'OCR Complete', 
          `Found ${data.total_reminders} medication reminders. Please review and confirm the extracted information.`,
          [{ text: 'OK' }]
        );
      } else {
        console.error('OCR upload failed:', data);
        Alert.alert('Upload Failed', data.detail || 'Failed to process the prescription image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading prescription:', error);
      Alert.alert('Upload Error', 'Failed to upload prescription. Please check your internet connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveOCR = async () => {
    if (!ocrResults) return;
    
    setIsUploading(true);
    
    try {
      const response = await fetch('https://cardiomedai-api.onrender.com/reminders/save-ocr-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          extracted_data: ocrResults.extracted_data,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success', 
          `${ocrResults.total_reminders} medication reminders created successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                mutateMedication(); // Refresh medication data
                router.back();
              }
            }
          ]
        );
      } else {
        console.error('Save OCR failed:', data);
        Alert.alert('Save Failed', data.detail || 'Failed to save the reminders. Please try again.');
      }
    } catch (error) {
      console.error('Error saving OCR data:', error);
      Alert.alert('Save Error', 'Failed to save reminders. Please check your internet connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditOCR = () => {
    setShowOcrResults(false);
    setOcrResults(null);
    Alert.alert('Edit Values', 'Please upload a new prescription image or add reminders manually.');
  };

  const OCRResultsSection = ({ ocrResults, onApprove, onEdit }) => (
    <View style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-5`}>
      <View style={tw`flex-row items-center mb-4`}>
        <Ionicons name="scan" size={24} color="#10b981" />
        <Text style={tw`text-lg font-semibold text-gray-800 ml-2`}>
          Extracted Medication Information
        </Text>
      </View>

      <View style={tw`bg-green-50 rounded-2xl p-4 mb-4`}>
        <Text style={tw`text-green-800 text-sm mb-3 font-medium`}>
          Found {ocrResults.total_reminders} medication reminders:
        </Text>
        
        <Text style={tw`text-gray-800 font-bold text-lg mb-2`}>
          {ocrResults.extracted_data.name}
        </Text>
        
        <Text style={tw`text-gray-600 mb-2`}>
          Dosage: {ocrResults.extracted_data.dosage}
        </Text>
        
        {ocrResults.extracted_data.schedule && ocrResults.extracted_data.schedule.length > 0 && (
          <View style={tw`mt-3`}>
            <Text style={tw`text-gray-700 font-medium mb-2`}>Schedule:</Text>
            {ocrResults.extracted_data.schedule.map((schedule, index) => (
              <View key={index} style={tw`flex-row justify-between items-center mb-1`}>
                <Text style={tw`text-gray-600`}>
                  {new Date(schedule.datetime).toLocaleString()}
                </Text>
                <Text style={tw`text-gray-800 font-medium`}>
                  {schedule.dosage}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {ocrResults.extracted_data.interpretation && (
          <View style={tw`mt-3 pt-3 border-t border-green-200`}>
            <Text style={tw`text-green-700 text-sm font-medium mb-1`}>AI Interpretation:</Text>
            <Text style={tw`text-green-800 text-sm`}>{ocrResults.extracted_data.interpretation}</Text>
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
          {/* Header */}
          <View style={tw`mb-6`}>
            <TouchableOpacity
              style={tw`flex-row items-center mb-4`}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <Text style={tw`text-lg font-semibold text-gray-700 ml-2`}>
                Back to Reminders
              </Text>
            </TouchableOpacity>
            
            <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
              Upload Prescription
            </Text>
            <Text style={tw`text-gray-600`}>
              Take a photo of your prescription to automatically create medication reminders
            </Text>
          </View>

          {/* Image Upload Section */}
          <View style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Prescription Image
            </Text>

            <TouchableOpacity
              style={tw`border-2 border-dashed border-green-300 rounded-2xl p-8 items-center justify-center bg-green-50 min-h-48`}
              onPress={handleImageUpload}
              activeOpacity={0.7}
            >
              {selectedImage ? (
                <View style={tw`items-center w-full`}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={[tw`rounded-xl mb-3`, { width: '100%', height: 160 }]}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={tw`flex-row items-center bg-green-600 px-4 py-2 rounded-full`}
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
                  <View style={tw`bg-green-100 rounded-full p-4 mb-4`}>
                    <Ionicons name="camera" size={32} color="#10b981" />
                  </View>
                  <Text style={tw`text-green-600 font-semibold text-base mb-2`}>
                    Upload Prescription Image
                  </Text>
                  <Text style={tw`text-gray-500 text-sm text-center leading-5`}>
                    Take a photo of your prescription or select from gallery
                  </Text>
                  <View style={tw`flex-row mt-4`}>
                    <View style={tw`bg-green-600 px-4 py-2 rounded-full`}>
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
          <View style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Additional Notes
            </Text>

            <TextInput
              style={tw`border border-gray-200 rounded-2xl p-4 text-gray-700 text-base min-h-32 bg-gray-50`}
              placeholder="Add any additional notes about this prescription..."
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
                <Ionicons name="information-circle-outline" size={16} color="#9ca3af" />
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
                style={tw`${isUploading ? 'bg-green-400' : 'bg-green-600'} rounded-2xl py-4 items-center mb-3 shadow-sm`}
                onPress={uploadPrescriptionForOCR}
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
                    {isUploading ? 'Processing Prescription...' : 'Process Prescription'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`border border-gray-300 rounded-2xl py-4 items-center`}
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <Text style={tw`text-gray-600 font-medium text-base`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Loading Overlay */}
        {isUploading && (
          <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
            <View style={tw`bg-white rounded-3xl p-8 items-center mx-8`}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={tw`text-gray-800 font-semibold text-lg mt-4 mb-2`}>
                {showOcrResults ? 'Saving Reminders...' : 'Processing Prescription...'}
              </Text>
              <Text style={tw`text-gray-600 text-center text-sm`}>
                {showOcrResults 
                  ? 'Please wait while we save your medication reminders.'
                  : 'Please wait while we extract medication information from your prescription.'
                }
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default UploadPrescription;
