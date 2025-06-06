import { Text, View, SafeAreaView, Dimensions, Platform, ScrollView, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient'

function Index() {
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth * 0.92;

  const DailyHealthTips = `Good morning! I noticed your blood pressure readings this week have shown some fluctuations. It's important to maintain a healthy lifestyle to manage your blood pressure effectively. Here are a few tips:

• Stay Active: Aim for at least 30 minutes of moderate exercise most days of the week. Activities like walking, cycling, or swimming can help lower your blood pressure.

• Eat a Balanced Diet: Focus on whole foods like fruits, vegetables, whole grains, and lean proteins. Reduce your intake of salt and processed foods.

• Monitor Your Blood Pressure: Keep track of your readings regularly to understand how your lifestyle changes are affecting your health.

• Manage Stress: Practice relaxation techniques such as deep breathing, meditation, or yoga to help reduce stress levels.

• Stay Hydrated: Drink plenty of water throughout the day to maintain good hydration levels.`;

  const quickActions = [
    { icon: "add-circle-outline", label: "Add Reading", color: "#10b981", bgColor: "#ecfdf5", borderColor: "#a7f3d0" },
    { icon: "scan-outline", label: "Scan Device", color: "#3b82f6", bgColor: "#eff6ff", borderColor: "#bfdbfe" },
    { icon: "cloud-upload-outline", label: "Add Image", color: "#8b5cf6", bgColor: "#f5f3ff", borderColor: "#ddd6fe" },
    { icon: "calendar-outline", label: "History", color: "#f59e0b", bgColor: "#fef3c7", borderColor: "#fde68a" },
    { icon: "chatbox-outline", label: "Ask Question", color: "#ef4444", bgColor: "#fef2f2", borderColor: "#fecaca" },
    { icon: "time-outline", label: "Reminders", color: "#06b6d4", bgColor: "#ecfeff", borderColor: "#a5f3fc" },
  ];

  const todayTasks = [
    { icon: "medkit-outline", title: "Morning Medication", time: "8:00 AM", completed: true },
    { icon: "walk-outline", title: "Daily Walk", time: "10:00 AM", completed: false },
    { icon: "restaurant-outline", title: "Healthy Lunch", time: "12:30 PM", completed: false },
    { icon: "trending-up-outline", title: "Evening BP Check", time: "7:00 PM", completed: false },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>

        {/* Header Section */}
        <View style={[tw`flex-row justify-between items-center px-1 ${Platform.OS === 'ios' ? 'mt-4' : 'mt-12'}`]}>
          <View style={tw`flex flex-row justify-center items-center`}>
            <LinearGradient
              colors={['#3b82f6', '#1e40af']}
              style={tw`w-14 h-14 mr-3 rounded-2xl flex justify-center items-center`}
            >
              <Text style={tw`font-bold text-white text-base`}>KA</Text>
            </LinearGradient>
            <View>
              <Text style={tw`text-[#64748b] text-sm`}>Good morning</Text>
              <Text style={tw`font-bold text-[#1e293b] text-base`}>Kwabena Asumadu</Text>
            </View>
          </View>

          <TouchableOpacity style={tw`flex flex-row items-center bg-white rounded-2xl px-3 py-3 border border-[#e2e8f0]`}>
            <View style={tw`w-2.5 h-2.5 bg-[#ef4444] rounded-full mr-2`} />
            <Text style={tw`font-bold text-[#1e293b] text-sm mr-1`}>3</Text>
            <Ionicons name="notifications-outline" size={22} color="#1e293b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={tw`flex-1 mt-6`} showsVerticalScrollIndicator={false}>
          
          {/* Blood Pressure Card */}
          <LinearGradient
            colors={['#ffffff', '#f0f9ff', '#e0f2fe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`rounded-3xl border border-[#bae6fd]/40 mb-6`}
          >
            <View style={tw`p-6 flex flex-row justify-between items-center`}>
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <Ionicons name="heart" size={20} color="#0369a1" />
                  <Text style={tw`font-bold text-base text-[#0369a1] ml-2`}>Latest Blood Pressure</Text>
                </View>
                <Text style={tw`font-bold text-2xl mb-3 text-[#0c4a6e]`}>150/99</Text>
                <Text style={tw`text-[#0c4a6e] text-sm mb-3`}>99 BPM • Today 8:45 AM</Text>
                <View style={tw`bg-[#fee2e2] rounded-2xl px-4 py-2 self-start`}>
                  <Text style={tw`font-bold text-sm text-[#b91c1c]`}>Stage 2 High</Text>
                </View>
              </View>

              <View style={tw`w-25 h-25`}>
                <LottieView
                  source={require('../assets/animations/heart.json')}
                  autoPlay
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            </View>
          </LinearGradient>

          {/* Health Insights Card */}
          <View style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-6`}>
            <View style={tw`flex-row items-center mb-4`}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={tw`w-10 h-10 rounded-2xl flex justify-center items-center mr-3`}
              >
                <Ionicons name="leaf" size={20} color="white" />
              </LinearGradient>
              <Text style={tw`text-[#1e293b] font-bold text-base`}>Daily Health Insights</Text>
            </View>
            <ScrollView style={tw`max-h-32`} showsVerticalScrollIndicator={false}>
              <Text style={tw`text-[#475569] leading-6 text-sm`}>{DailyHealthTips}</Text>
            </ScrollView>
          </View>

          {/* Today's Tasks */}
          <View style={tw`bg-white rounded-3xl p-6 border border-[#e2e8f0] mb-6`}>
            <View style={tw`flex-row items-center mb-4`}>
              <LinearGradient
                colors={['#3b82f6', '#1e40af']}
                style={tw`w-10 h-10 rounded-2xl flex justify-center items-center mr-3`}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </LinearGradient>
              <Text style={tw`text-[#1e293b] font-bold text-base`}>Today's Tasks</Text>
            </View>

            {todayTasks.map((task, index) => (
              <TouchableOpacity key={index} style={tw`flex flex-row justify-between items-center py-4 ${index !== todayTasks.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                <View style={tw`flex flex-row items-center flex-1`}>
                  <View style={tw`w-12 h-12 ${task.completed ? 'bg-[#ecfdf5]' : 'bg-[#f8fafc]'} rounded-2xl flex justify-center items-center mr-4`}>
                    <Ionicons 
                      name={task.icon} 
                      size={20} 
                      color={task.completed ? "#10b981" : "#64748b"} 
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-semibold text-[#1e293b] text-base ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </Text>
                    <Text style={tw`text-[#64748b] text-sm`}>{task?.time}</Text>
                  </View>
                </View>
                <Ionicons 
                  name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={task.completed ? "#10b981" : "#cbd5e1"} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={tw`mb-8`}>
            <Text style={tw`font-bold text-base text-[#1e293b] mb-6 px-1`}>Quick Actions</Text>

            <View style={tw`flex flex-row flex-wrap justify-between`}>
              {quickActions.map((action, index) => (
                <TouchableOpacity key={index} style={tw`w-[30%] mb-6`}>
                  <LinearGradient
                    colors={[action.bgColor, 'rgba(255,255,255,0.8)']}
                    style={tw`w-full aspect-square rounded-3xl flex justify-center items-center mb-3 border border-[${action.borderColor}]`}
                  >
                    <Ionicons name={action.icon} size={32} color={action.color} />
                  </LinearGradient>
                  <Text style={tw`font-bold text-xs text-[#1e293b] text-center leading-4`}>
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