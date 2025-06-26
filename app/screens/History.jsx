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
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../components/ScreenHeader";

function History() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - replace with actual data from your backend
  const historyData = [
    {
      id: 1,
      type: 'blood_pressure',
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'normal',
      device: 'BP Monitor Pro'
    },
    {
      id: 2,
      type: 'blood_pressure',
      systolic: 135,
      diastolic: 85,
      heartRate: 78,
      date: '2024-01-14',
      time: '2:15 PM',
      status: 'elevated',
      device: 'BP Monitor Pro'
    },
    {
      id: 3,
      type: 'blood_sugar',
      glucose: 95,
      date: '2024-01-13',
      time: '8:45 AM',
      status: 'normal',
      device: 'Glucose Meter X1',
      notes: 'Fasting'
    },
    {
      id: 4,
      type: 'weight',
      weight: 70.5,
      bmi: 23.4,
      date: '2024-01-12',
      time: '7:00 AM',
      status: 'normal',
      device: 'Smart Scale'
    },
    {
      id: 5,
      type: 'blood_pressure',
      systolic: 145,
      diastolic: 92,
      heartRate: 85,
      date: '2024-01-11',
      time: '6:20 PM',
      status: 'high',
      device: 'BP Monitor Pro'
    }
  ];

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'medical' },
    { key: 'blood_pressure', label: 'Blood Pressure', icon: 'heart' },
    { key: 'blood_sugar', label: 'Blood Sugar', icon: 'water' },
    { key: 'weight', label: 'Weight', icon: 'fitness' }
  ];

  const filteredData = historyData.filter(item => {
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesSearch = searchQuery === '' ||
      item.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'elevated': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
    return (
      <TouchableOpacity
        key={item.id}
        style={tw`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100`}
        onPress={() => {
          Alert.alert(
            "Reading Details",
            `Date: ${item.date}\nTime: ${item.time}\nDevice: ${item.device}${item.notes ? `\nNotes: ${item.notes}` : ''}`
          );
        }}
      >
        <View style={tw`flex-row items-start justify-between`}>
          <View style={tw`flex-1`}>
            {/* Type and Status */}
            <View style={tw`flex-row items-center mb-2`}>
              <View style={tw`bg-blue-100 p-2 rounded-full mr-3`}>
                <Ionicons
                  name={item.type === 'blood_pressure' ? 'heart' :
                    item.type === 'blood_sugar' ? 'water' : 'fitness'}
                  size={16}
                  color="#2563EB"
                />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-semibold text-gray-900 capitalize`}>
                  {item.type.replace('_', ' ')}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  {item.device}
                </Text>
              </View>
              <View style={[tw`px-2 py-1 rounded-full`, tw`${getStatusBg(item.status)}`]}>
                <Text style={[tw`text-xs font-medium capitalize`, tw`${getStatusColor(item.status)}`]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Reading Values */}
            <View style={tw`mb-3`}>
              {item.type === 'blood_pressure' && (
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
                      {item.heartRate}
                    </Text>
                    <Text style={tw`text-sm text-gray-500`}>BPM</Text>
                  </View>
                </View>
              )}

              {item.type === 'blood_sugar' && (
                <View>
                  <Text style={tw`text-2xl font-bold text-gray-900`}>
                    {item.glucose}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>mg/dL</Text>
                </View>
              )}

              {item.type === 'weight' && (
                <View style={tw`flex-row items-center space-x-4`}>
                  <View>
                    <Text style={tw`text-2xl font-bold text-gray-900`}>
                      {item.weight}
                    </Text>
                    <Text style={tw`text-sm text-gray-500`}>kg</Text>
                  </View>
                  <View style={tw`h-8 w-px bg-gray-200`} />
                  <View>
                    <Text style={tw`text-lg font-semibold text-gray-700`}>
                      {item.bmi}
                    </Text>
                    <Text style={tw`text-sm text-gray-500`}>BMI</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Date and Time */}
            <View style={tw`flex-row items-center`}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={tw`text-sm text-gray-500 ml-1`}>
                {item.date} at {item.time}
              </Text>
            </View>
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

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tw`mb-4`}
            contentContainerStyle={tw`px-1`}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  tw`flex-row items-center px-4 py-2 mr-3 rounded-xl`,
                  selectedFilter === option.key
                    ? tw`bg-blue-600`
                    : tw`bg-white border border-gray-200`
                ]}
                onPress={() => setSelectedFilter(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={selectedFilter === option.key ? 'white' : '#6B7280'}
                />
                <Text style={[
                  tw`ml-2 font-medium`,
                  selectedFilter === option.key ? tw`text-white` : tw`text-gray-700`
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Summary Stats */}
          <View style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100`}>
            <Text style={tw`font-semibold text-gray-900 mb-3`}>
              Summary
            </Text>
            <View style={tw`flex-row justify-between`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-blue-600`}>
                  {filteredData.length}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Total Records
                </Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-green-600`}>
                  {filteredData.filter(item => item.status === 'normal').length}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Normal
                </Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-yellow-600`}>
                  {filteredData.filter(item => item.status === 'elevated').length}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Elevated
                </Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-red-600`}>
                  {filteredData.filter(item => item.status === 'high').length}
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

            {filteredData.length > 0 ? (
              filteredData.map(renderHistoryItem)
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