import { useContext } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import BpReaderProvider from "../../context/bpReadingsContext";
import AverageBpProvider from "../../context/averageReadings";
import HealthAdvisorProvider from "../../context/healthAdvisorContext";

function extractDate(date) {
  return date?.split("T")[0];
}

function Index() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const navigation = useNavigation();
  const { data } = useContext(BpReaderProvider)
  const { average } = useContext(AverageBpProvider);
  const { advisor } = useContext(HealthAdvisorProvider);

  const quickActions = [
    {
      icon: "add-circle",
      label: "Add Reading",
      color: "#10b981",
      bgColor: "#ecfdf5",
      shadowColor: "#10b981",
      route: "screens/AddReading",
    },
    {
      icon: "scan",
      label: "Scan Device",
      color: "#3b82f6",
      bgColor: "#eff6ff",
      shadowColor: "#3b82f6",
      route: "screens/ScanDevice",
    },
    {
      icon: "cloud-upload",
      label: "Add Image",
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
      shadowColor: "#8b5cf6",
      route: "screens/UploadBPMonitorImg",
    },
    {
      icon: "calendar",
      label: "History",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      shadowColor: "#f59e0b",
      route: "screens/History",
    },
    {
      icon: "chatbubble-ellipses",
      label: "Ask Question",
      color: "#ef4444",
      bgColor: "#fef2f2",
      shadowColor: "#ef4444",
      route: "screens/KnowledgeAgent",

    },
    {
      icon: "notifications",
      label: "Reminders",
      color: "#06b6d4",
      bgColor: "#ecfeff",
      shadowColor: "#06b6d4",
    },
  ];

  const todayTasks = [
    {
      icon: "medical",
      title: "Morning Medication",
      time: "8:00 AM",
      completed: true,
    },
    { icon: "walk", title: "Daily Walk", time: "10:00 AM", completed: false },
    {
      icon: "restaurant",
      title: "Healthy Lunch",
      time: "12:30 PM",
      completed: false,
    },
    {
      icon: "pulse",
      title: "Evening BP Check",
      time: "7:00 PM",
      completed: false,
    },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
        <ScreenHeader />

        <ScrollView
          style={tw`flex-1 mt-4`}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced BP Reading Card */}
          <LinearGradient
            colors={["#ffffff", "#f0f9ff", "#dbeafe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`rounded-3xl border border-blue-100 mb-6 shadow-lg shadow-blue-500/10`}
          >
            <View style={tw`p-8`}>
              <View style={tw`flex-row items-center justify-between mb-6`}>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center mb-3`}>
                    <View style={tw`bg-blue-100 rounded-full p-2 mr-3`}>
                      <Ionicons name="heart" size={18} color="#0369a1" />
                    </View>
                    <Text style={tw`font-bold text-sm text-blue-900`}>
                      Latest Reading
                    </Text>
                  </View>

                  <View style={tw`mb-4`}>
                    <Text style={tw`font-black text-2xl text-blue-900 mb-1.5`}>
                      {`${data[0]?.systolic} / ${data[0]?.diastolic}`}
                    </Text>
                    <Text style={tw`text-blue-700 font-medium text-sm`}>
                      {`${data[0]?.pulse} BPM • ${extractDate(data[0]?.reading_time)}`}
                    </Text>
                  </View>

                  <View
                    style={tw`bg-red-100 border border-red-200 rounded-2xl px-4 py-3 self-start`}
                  >
                    <View style={tw`flex-row items-center`}>
                      <Ionicons name="warning" size={16} color="#dc2626" />
                      <Text style={tw`font-bold text-xs text-red-600 ml-2`}>
                        {data[0]?.interpretation}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={tw`w-24 h-24 ml-4`}>
                  <LottieView
                    source={require("../../assets/animations/heart.json")}
                    autoPlay
                    loop
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
              </View>

              {/* Quick Stats */}
              <View
                style={tw`bg-white/70 rounded-2xl p-4 flex-row justify-around`}
              >
                <View style={tw`items-center`}>
                  <Text style={tw`text-xs text-blue-600 font-medium mb-1`}>
                    AVERAGE
                  </Text>
                  <Text style={tw`font-bold text-blue-900 text-xs`}>
                    {`${average?.averages?.systolic} / ${average?.averages?.diastolic} . P=${average?.averages?.pulse}`}
                  </Text>
                </View>

                <View style={tw`w-px bg-blue-200`} />
                <View style={tw`items-center`}>
                  <Text style={tw`text-xs text-blue-600 font-medium mb-1`}>
                    TOTAL READINGS
                  </Text>
                  <Text style={tw`font-bold text-blue-900 text-xs`}>{average?.total_readings}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Enhanced Health Insights Card */}
          <View
            style={tw`bg-white rounded-3xl p-6 mb-6 shadow-lg shadow-gray-500/5 border border-gray-100`}
          >
            <View style={tw`flex-row items-center mb-5`}>
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={tw`w-12 h-12 rounded-2xl flex justify-center items-center mr-4 shadow-md shadow-emerald-500/25`}
              >
                <Ionicons name="bulb" size={22} color="white" />
              </LinearGradient>
              <View>
                <Text style={tw`text-gray-900 font-bold text-sm`}>
                  Health Insights
                </Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  Your health advisor
                </Text>
              </View>
            </View>

            <View
              style={tw`bg-blue-50 rounded-2xl p-4 border border-emerald-100`}
            >
              <ScrollView
                style={tw`max-h-28`}
                showsVerticalScrollIndicator={false}
              >
                <Text style={tw`text-gray-700 leading-6 text-sm`}>
                  {advisor?.advisor_response || 'loading...'}
                </Text>
              </ScrollView>
            </View>
          </View>

          {/* Enhanced Today's Tasks */}
          <View
            style={tw`bg-white rounded-3xl p-6 mb-6 shadow-lg shadow-gray-500/5 border border-gray-100`}
          >
            <View style={tw`flex-row items-center justify-between mb-5`}>
              <View style={tw`flex-row items-center`}>
                <LinearGradient
                  colors={["#3b82f6", "#1e40af"]}
                  style={tw`w-12 h-12 rounded-2xl flex justify-center items-center mr-4 shadow-md shadow-blue-500/25`}
                >
                  <Ionicons name="today" size={22} color="white" />
                </LinearGradient>
                <View>
                  <Text style={tw`text-gray-900 font-bold text-lg`}>
                    Today&apos;s Tasks
                  </Text>
                  <Text style={tw`text-gray-500 text-sm`}>
                    1 of 4 completed
                  </Text>
                </View>
              </View>
              <View style={tw`bg-blue-50 rounded-full px-3 py-1`}>
                <Text style={tw`text-blue-600 font-semibold text-xs`}>25%</Text>
              </View>
            </View>

            {todayTasks.map((task, index) => (
              <TouchableOpacity
                key={index}
                style={tw`flex flex-row items-center py-4 ${index !== todayTasks.length - 1
                  ? "border-b border-gray-50"
                  : ""
                  }`}
                activeOpacity={0.7}
              >
                <View
                  style={tw`w-14 h-14 ${task.completed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-gray-50 border-gray-200"
                    } border rounded-2xl flex justify-center items-center mr-4`}
                >
                  <Ionicons
                    name={task.icon}
                    size={20}
                    color={task.completed ? "#10b981" : "#64748b"}
                  />
                </View>

                <View style={tw`flex-1`}>
                  <Text
                    style={tw`font-semibold text-gray-900 text-sm mb-1 ${task.completed ? "line-through opacity-60" : ""
                      }`}
                  >
                    {task.title}
                  </Text>
                  <Text style={tw`text-gray-500 text-xs`}>{task?.time}</Text>
                </View>

                <TouchableOpacity style={tw`ml-4`}>
                  <Ionicons
                    name={
                      task.completed ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={28}
                    color={task.completed ? "#10b981" : "#cbd5e1"}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* Enhanced Quick Actions */}
          <View style={tw`mb-8`}>
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <Text style={tw`font-bold text-base text-gray-900`}>
                Quick Actions
              </Text>
              <TouchableOpacity>
                <Text style={tw`text-blue-600 font-medium text-sm`}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={tw`flex flex-row flex-wrap justify-between`}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={tw`w-[30%] mb-6`}
                  onPress={() => navigation.navigate(action.route)}
                  activeOpacity={0.8}
                >
                  <View style={tw`relative`}>
                    <LinearGradient
                      colors={[action.bgColor, "rgba(255,255,255,0.9)"]}
                      style={tw`w-full aspect-square rounded-3xl flex 
                      justify-center items-center mb-3 border border-gray-100`}
                    >
                      <View
                        style={[
                          tw`absolute inset-0 rounded-3xl shadow-lg`,
                          {
                            shadowColor: action.shadowColor,
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                          },
                        ]}
                      />
                      <Ionicons
                        name={action.icon}
                        size={36}
                        color={action.color}
                      />
                    </LinearGradient>
                  </View>
                  <Text
                    style={tw`font-bold text-sm text-gray-900 text-center leading-4`}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default Index;