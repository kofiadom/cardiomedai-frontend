import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView
} from "react-native";
import { useState, useContext } from "react";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../components/ScreenHeader";
import BpReaderProvider from "../../context/bpReadingsContext";

function History() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { data } = useContext(BpReaderProvider);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(item => {
    const matchesSearch = searchQuery === '' ||
      (item.device_id && item.device_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.reading_time.includes(searchQuery) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'elevated': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusFromInterpretation = (interpretation) => {
    if (interpretation?.includes('Normal')) return 'normal';
    if (interpretation?.includes('Elevated')) return 'elevated';
    if (interpretation?.includes('High') || interpretation?.includes('Hypertensive')) return 'high';
    return 'normal';
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-100';
      case 'elevated': return 'bg-yellow-100';
      case 'high': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const renderHistoryItem = (item) => {
    // Parse the reading time
    const readingDate = new Date(item.reading_time);
    const formattedDate = readingDate.toLocaleDateString();
    const formattedTime = readingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const status = getStatusFromInterpretation(item.interpretation);

    return (
      <TouchableOpacity
        key={item.id}
        style={tw`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100`}
        onPress={() => {
          Alert.alert(
            "Reading Details",
            `Date: ${formattedDate} at ${formattedTime}\nInterpretation: ${item.interpretation}${item.notes ? `\n\nNotes: ${item.notes}` : ''}`
          );
        }}
      >
        <View style={tw`flex-row items-start justify-between`}>
          <View style={tw`flex-1`}>
            {/* Type and Status */}
            <View style={tw`flex-row items-center mb-2`}>
              <View style={tw`bg-blue-100 p-2 rounded-full mr-3`}>
                <Ionicons
                  name="heart"
                  size={16}
                  color="#2563EB"
                />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-semibold text-gray-900`}>
                  Blood Pressure
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  {item.device_id || 'Manual Entry'}
                </Text>
              </View>
              <View style={[tw`px-2 py-1 rounded-full`, tw`${getStatusBg(status)}`]}>
                <Text style={[tw`text-xs font-medium capitalize`, tw`${getStatusColor(status)}`]}>
                  {status}
                </Text>
              </View>
            </View>

            {/* Reading Values */}
            <View style={tw`mb-3`}>
              <View style={tw`flex-row items-center space-x-4`}>
                <View>
                  <Text style={tw`text-2xl font-bold text-gray-900`}>
                    {item.systolic}/{item.diastolic}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>mmHg</Text>
                </View>
                <View style={tw`h-8 w-px bg-gray-200`} />
                <View>
                  <Text style={tw`text-lg font-semibold text-gray-700`}>
                    {item.pulse}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>BPM</Text>
                </View>
              </View>
            </View>

            {/* Interpretation */}
            <View style={tw`mb-2`}>
              <Text style={tw`text-sm text-gray-700 italic`}>
                {item.interpretation}
              </Text>
            </View>

            {/* Date and Time */}
            <View style={tw`flex-row items-center`}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={tw`text-sm text-gray-500 ml-1`}>
                {formattedDate} at {formattedTime}
              </Text>
            </View>

            {/* Notes if available */}
            {item.notes && (
              <View style={tw`mt-2 flex-row items-start`}>
                <Ionicons name="document-text-outline" size={14} color="#6B7280" style={tw`mt-0.5`} />
                <Text style={tw`text-sm text-gray-600 ml-1 flex-1`}>
                  {item.notes}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={"padding"}
        style={[tw`flex-1 mx-auto`, { width: containerWidth }]}
      >
        <ScreenHeader title="History" />

        <ScrollView
          style={tw`flex-1`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-6`}
        >
          {/* Search Bar */}
          <View style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100`}>
            <View style={tw`flex-row items-center bg-gray-50 rounded-xl px-4 py-3`}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={tw`flex-1 ml-3 text-gray-900`}
                placeholder="Search by device or date..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Summary Stats */}
          <View style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100`}>
            <Text style={tw`font-semibold text-gray-900 mb-3`}>
              Summary
            </Text>
            <View style={tw`flex-row justify-between`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-blue-600`}>
                  {data?.length || 0}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Total Records
                </Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-green-600`}>
                  {filteredData.filter(item => getStatusFromInterpretation(item.interpretation) === 'normal').length}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Normal
                </Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-yellow-600`}>
                  {filteredData.filter(item => getStatusFromInterpretation(item.interpretation) === 'elevated').length}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Elevated
                </Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-red-600`}>
                  {filteredData.filter(item => getStatusFromInterpretation(item.interpretation) === 'high').length}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  High
                </Text>
              </View>
            </View>
          </View>

          {/* History List */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Recent Readings
              </Text>
              <TouchableOpacity
                onPress={() => Alert.alert("Export", "Export functionality coming soon!")}
              >
                <Ionicons name="download-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {data.length > 0 ? (
              data.map(renderHistoryItem)
            ) : (
              <View style={tw`bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100`}>
                <View style={tw`bg-gray-100 p-4 rounded-full mb-4`}>
                  <Ionicons name="document-text-outline" size={32} color="#6B7280" />
                </View>
                <Text style={tw`text-lg font-semibold text-gray-900 mb-2`}>
                  No Records Found
                </Text>
                <Text style={tw`text-gray-500 text-center`}>
                  {searchQuery !== ''
                    ? 'Try adjusting your search terms or filters'
                    : 'Start taking measurements to see your history here'
                  }
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default History;