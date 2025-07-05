import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../components/ScreenHeader";

function AddReading() {
  const router = useRouter()
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const user_id = 1

  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    device: '',
    notes: ''
  })

  // Input change handlers
  const setSystolic = (value) => setFormData(prev => ({ ...prev, systolic: value }));
  const setDiastolic = (value) => setFormData(prev => ({ ...prev, diastolic: value }));
  const setPulse = (value) => setFormData(prev => ({ ...prev, pulse: value }));
  const setDevice = (value) => setFormData(prev => ({ ...prev, device: value }));
  const setNotes = (value) => setFormData(prev => ({ ...prev, notes: value }));

  // Validation and category determination
  const getBPCategory = () => {
    const sys = parseInt(formData.systolic);
    const dia = parseInt(formData.diastolic);

    if (!sys || !dia) return null;

    if (sys < 120 && dia < 80) return { category: "Normal", color: "text-green-600", bg: "bg-green-50" };
    if (sys < 130 && dia < 80) return { category: "Elevated", color: "text-yellow-600", bg: "bg-yellow-50" };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { category: "Stage 1 High", color: "text-orange-600", bg: "bg-orange-50" };
    if (sys >= 140 || dia >= 90) return { category: "Stage 2 High", color: "text-red-600", bg: "bg-red-50" };
    if (sys >= 180 || dia >= 120) return { category: "Crisis", color: "text-red-800", bg: "bg-red-100" };

    return null;
  };

  const handleSave = async () => {
    if (!formData.systolic || !formData.diastolic) {
      Alert.alert("Missing Information", "Please enter both systolic and diastolic pressure values.");
      return;
    }

    try {
      const res = await fetch(`https://cardiomedai-api.onrender.com/bp/readings/?user_id=${user_id}`, {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
          pulse: formData.pulse ? parseInt(formData.pulse) : null,
          device: formData.device || null,
          notes: formData.notes || null
        })
      })

      const data = await res.json();

      if (res.ok) {
        console.log('success', data);
        Alert.alert("Success", "Blood pressure reading saved successfully!");
        // Reset form
        setFormData({
          systolic: '',
          diastolic: '',
          pulse: '',
          device: '',
          notes: ''
        });
        router.push('/')
      } else {
        console.log('data', data);
        Alert.alert("Error", "Failed to save reading. Please try again.");
      }

    } catch (error) {
      console.log('error occured when adding readings', error);
      Alert.alert("Error", "Network error. Please check your connection and try again.");
    }

  };

  const bpCategory = getBPCategory();

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={"padding"}
        style={[tw`flex-1 mx-auto`, { width: containerWidth }]}
      >
        <ScreenHeader />

        <ScrollView style={tw`mt-5`} showsVerticalScrollIndicator={false}>
          {/* Enhanced Header with Icon */}
          <View style={tw`items-center mb-8`}>
            <View style={tw`bg-blue-100 p-4 rounded-full mb-4`}>
              <Ionicons name="heart" size={32} color="#3B82F6" />
            </View>
            <Text style={tw`text-xl font-bold text-gray-900 mb-2 text-center`}>
              Add Blood Pressure Reading
            </Text>
            <Text style={tw`text-gray-600 text-center px-4 text-sm`}>
              Track your blood pressure to monitor your health
            </Text>
          </View>

          {/* BP Category Indicator */}
          {bpCategory && (
            <View style={tw`${bpCategory.bg} p-4 rounded-xl mb-6 border border-gray-100`}>
              <View style={tw`flex-row items-center justify-between`}>
                <View>
                  <Text style={tw`text-sm text-gray-600 mb-1`}>Blood Pressure Category</Text>
                  <Text style={tw`text-base font-semibold ${bpCategory.color}`}>
                    {bpCategory.category}
                  </Text>
                </View>
                <View style={tw`bg-white p-2 rounded-full`}>
                  <Ionicons
                    name={bpCategory.category === "Normal" ? "checkmark-circle" : "warning"}
                    size={24}
                    color={bpCategory.category === "Normal" ? "#10B981" : "#F59E0B"}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Main BP Reading Card */}
          <View style={tw`bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-4 text-center`}>
              Blood Pressure Reading
            </Text>

            <View style={tw`flex-row items-center justify-center mb-6`}>
              {/* Systolic */}
              <View style={tw`flex-1 mr-3`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2 text-center`}>
                  Systolic (mmHg)
                </Text>
                <View style={tw`relative`}>
                  <TextInput
                    style={tw`bg-gray-50 border-2 ${formData.systolic ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-4 text-2xl font-bold text-center text-gray-900`}
                    keyboardType="numeric"
                    placeholder="120"
                    placeholderTextColor="#9CA3AF"
                    value={formData.systolic}
                    onChangeText={setSystolic}
                    returnKeyType="next"
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Separator */}
              <View style={tw`px-2 pb-6`}>
                <Text style={tw`text-3xl font-bold text-gray-400`}>/</Text>
              </View>

              {/* Diastolic */}
              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2 text-center`}>
                  Diastolic (mmHg)
                </Text>
                <View style={tw`relative`}>
                  <TextInput
                    style={tw`bg-gray-50 border-2 ${formData.diastolic ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-4 text-2xl font-bold text-center text-gray-900`}
                    keyboardType="numeric"
                    placeholder="80"
                    placeholderTextColor="#9CA3AF"
                    value={formData.diastolic}
                    onChangeText={setDiastolic}
                    returnKeyType="next"
                    maxLength={3}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Additional Information Card */}
          <View style={tw`bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
              Additional Information
            </Text>

            {/* Pulse Rate */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2 flex-row items-center`}>
                <Ionicons name="pulse" size={16} color="#6B7280" /> Pulse Rate (BPM)
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.pulse ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                keyboardType="numeric"
                placeholder="72"
                placeholderTextColor="#9CA3AF"
                value={formData.pulse}
                onChangeText={setPulse}
                returnKeyType="next"
                maxLength={3}
              />
            </View>

            {/* Device Used */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2 flex-row items-center`}>
                <Ionicons name="medical" size={16} color="#6B7280" /> Device Used
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.device ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg`}
                placeholder="e.g. Omron HEM-7120"
                placeholderTextColor="#9CA3AF"
                value={formData.device}
                onChangeText={setDevice}
                returnKeyType="next"
              />
            </View>

            {/* Notes */}
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2 flex-row items-center`}>
                <Ionicons name="document-text" size={16} color="#6B7280" /> Notes
              </Text>
              <TextInput
                style={tw`bg-gray-50 border-2 ${formData.notes ? 'border-blue-200' : 'border-gray-200'} rounded-xl px-4 py-3 text-lg min-h-24`}
                placeholder="Any additional notes about this reading..."
                placeholderTextColor="#9CA3AF"
                value={formData.notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`mb-8`}>
            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 px-6 shadow-lg mb-3`}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Ionicons name="save" size={20} color="white" style={tw`mr-2`} />
                <Text style={tw`text-white text-lg font-semibold`}>
                  Save Reading
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-gray-100 rounded-xl py-4 px-6 border border-gray-200`}
              activeOpacity={0.8}
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Ionicons name="time" size={20} color="#6B7280" style={tw`mr-2`} />
                <Text style={tw`text-gray-700 text-lg font-medium`}>
                  Save for Later
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Health Tips */}
          <View style={tw`bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="bulb" size={20} color="#3B82F6" />
              <Text style={tw`text-lg font-semibold text-blue-900 ml-2`}>
                Quick Tip
              </Text>
            </View>
            <Text style={tw`text-blue-800 leading-relaxed`}>
              For the most accurate reading, sit quietly for 5 minutes before measuring,
              keep your feet flat on the floor, and support your arm at heart level.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddReading;