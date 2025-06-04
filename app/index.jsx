import { Text, View, SafeAreaView, Dimensions, Platform, ScrollView } from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient'

function Index() {
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth * 0.90;

  const DailyHealthTips = `Good morning! I noticed your blood pressure readings this week have shown some fluctuations. It's important to maintain a healthy lifestyle to manage your blood pressure effectively. Here are a few tips: \n\n1. Stay Active: Aim for at least 30 minutes of moderate exercise most days of the week. Activities like walking, cycling, or swimming can help lower your blood pressure.\n\n2. Eat a Balanced Diet: Focus on whole foods like fruits, vegetables, whole grains, and lean proteins. Reduce your intake of salt and processed foods.\n\n3. Monitor Your Blood Pressure: Keep track of your readings regularly to understand how your lifestyle changes are affecting your health.\n\n4. Manage Stress: Practice relaxation techniques such as deep breathing, meditation, or yoga to help reduce stress levels.\n\n5. Stay Hydrated: Drink plenty of water throughout the day to maintain good hydration levels.\n\n6. Limit Alcohol and Caffeine: Reducing alcohol intake and moderating caffeine consumption can also help manage blood pressure.\n\n7. Get Enough Sleep:`;

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>

        <View style={[tw`flex-row justify-between items-center ${Platform.OS === 'ios' ? 'mt-4' : 'mt-11'}`]}>
          <View style={tw`flex flex-row justify-center items-center`}>
            <View style={tw`w-12 h-12 bg-[#e0f2fe] mr-3 rounded-2xl flex justify-center items-center`}>
              <Text style={tw`font-bold text-[#0369a1] text-sm`}>KA</Text>
            </View>
            <View>
              <Text style={tw`text-[#64748b] text-xs`}>Good morning</Text>
              <Text style={tw`font-semibold text-[#475569] text-sm`}>Kwabena Asumadu</Text>
            </View>
          </View>

          <View style={tw`flex flex-row items-center bg-white rounded-full px-2.5 py-1.5 border border-[#e2e8f0]`}>
            <View style={tw`w-2 h-2 bg-[#ef4444] rounded-full mr-2`} />
            <Text style={tw`font-semibold text-[#334155] mr-1`}>3</Text>
            <Ionicons name="notifications-outline" size={20} color="#334155" />
          </View>
        </View>

        <ScrollView style={tw`flex-1`}>
          <LinearGradient
            colors={['#fff', '#e0f2fe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={tw`h-30 mt-6 rounded-xl border border-[#bae6fd]/30`}
          >
            <View style={tw`h-full flex flex-row justify-around items-center py-3 px-2`}>
              <View style={tw`flex flex-col items-start`}>
                <Text style={tw`font-semibold text-sm text-[#0369a1]`}>Latest Blood Pressure</Text>
                <Text style={tw`font-light text-sm mb-2 text-[#0c4a6e]`}>150/99 mmHg - 99 BPM</Text>
                <View style={tw`bg-[#fee2e2] rounded-xl px-3.5 py-1.5`}>
                  <Text style={tw`font-semibold text-xs text-[#b91c1c]`}>Stage 2 High</Text>
                </View>
              </View>

              <View style={tw`w-30`}>
                <LottieView
                  source={require('../assets/animations/heart.json')}
                  autoPlay
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            </View>
          </LinearGradient>

          <View style={tw`flex-1 mt-5 bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]`}>
            <View style={tw`flex-row items-center pb-2`}>
              <Ionicons name="leaf-outline" size={20} color="#10b981" />
              <Text style={tw`ml-2 text-[#10b981] font-medium`}>Daily Health Insights</Text>
            </View>
            <ScrollView style={tw`mt-2 h-30`}>
              <Text style={tw`text-[#475569] leading-6`}>{DailyHealthTips}</Text>
            </ScrollView>
          </View>

          <View style={tw`flex-1 mt-4`}>
            <View style={tw`mt-5 mb-2.5 bg-white rounded-xl p-4 shadow-sm border border-[#fff]`}
            >
              <View style={tw`flex-row items-center pb-2`}>
                <Ionicons name="alarm-outline" size={20} color="#000" />
                <Text style={tw`ml-2 text-[#000] font-semibold`}>Daily Health Insights</Text>
              </View>

              <View style={tw`mt-3`}>
                <View style={tw`flex flex-row justify-between items-center`}>
                  <View style={tw`flex flex-row items-center`}>
                    <Ionicons name="medkit-outline" size={20} color="#2596be" />
                    <View style={tw`flex ml-2`}>
                      <Text style={tw`text-sm`}>Morning Medication</Text>
                      <Text style={tw`text-black/60 text-xs`}>8:00 AM</Text>
                    </View>
                  </View>

                  <Ionicons name="time" size={20} color="#2596be" />
                </View>

                <View style={tw`mt-7 flex flex-row justify-between items-center`}>
                  <View style={tw`flex flex-row items-center`}>
                    <Ionicons name="walk-outline" size={20} color="#2596be" />
                    <View style={tw`flex ml-2`}>
                      <Text style={tw`text-sm`}>Daily Walk</Text>
                      <Text style={tw`text-black/60 text-xs`}>8:00 AM</Text>
                    </View>
                  </View>

                  <Ionicons name="time" size={20} color="#2596be" />
                </View>

                <View style={tw`mt-7 flex flex-row justify-between items-center`}>
                  <View style={tw`flex flex-row items-center`}>
                    <Ionicons name="trending-up-outline" size={20} color="#2596be" />
                    <View style={tw`flex ml-2`}>
                      <Text style={tw`text-sm`}>Evening BP Check</Text>
                      <Text style={tw`text-black/60 text-xs`}>8:00 AM</Text>
                    </View>
                  </View>

                  <Ionicons name="time" size={20} color="#2596be" />
                </View>

              </View>

            </View>

          </View>

          <View style={tw`mt-6 mb-5`}>
            <Text style={tw`font-semibold text-sm text-[#1e293b]`}>Quick Actions</Text>

            <View style={tw`mt-3 flex flex-row justify-around items-center`}>
              <View style={tw`flex items-center`}>
                <View style={tw`w-16 h-16 bg-[#ecfdf5] rounded-xl flex justify-center items-center mb-2 shadow-sm border border-[#a7f3d0]`}>
                  <Ionicons name="add-circle-outline" size={28} color="#10b981" />
                </View>
                <Text style={tw`font-semibold text-xs text-[#064e3b] text-center`}>Add Reading</Text>
              </View>

              <View style={tw`flex items-center`}>
                <View style={tw`w-16 h-16 bg-[#eff6ff] rounded-xl flex justify-center items-center mb-2 shadow-sm border border-[#bfdbfe]`}>
                  <Ionicons name="scan-outline" size={28} color="#3b82f6" />
                </View>
                <Text style={tw`font-semibold text-xs text-[#1e40af] text-center`}>Scan Device</Text>
              </View>

              <View style={tw`flex items-center`}>
                <View style={tw`w-16 h-16 bg-[#f5f3ff] rounded-xl flex justify-center items-center mb-2 shadow-sm border border-[#ddd6fe]`}>
                  <Ionicons name="cloud-upload-outline" size={28} color="#8b5cf6" />
                </View>
                <Text style={tw`font-semibold text-xs text-[#5b21b6] text-center`}>Add Image</Text>
              </View>

            </View>

            <View style={tw`mt-8 flex flex-row justify-around items-center`}>
              <View style={tw`flex items-center`}>
                <View style={tw`w-16 h-16 bg-[#ecfdf5] rounded-xl flex justify-center items-center mb-2 shadow-sm border border-[#a7f3d0]`}>
                  <Ionicons name="calendar-outline" size={28} color="#10b981" />
                </View>
                <Text style={tw`font-semibold text-xs text-[#064e3b] text-center`}>History</Text>
              </View>

              <View style={tw`flex items-center`}>
                <View style={tw`w-16 h-16 bg-[#eff6ff] rounded-xl flex justify-center items-center mb-2 shadow-sm border border-[#bfdbfe]`}>
                  <Ionicons name="chatbox-outline" size={28} color="#3b82f6" />
                </View>
                <Text style={tw`font-semibold text-xs text-[#1e40af] text-center`}>Ask Question</Text>
              </View>

              <View style={tw`flex items-center`}>
                <View style={tw`w-16 h-16 bg-[#f5f3ff] rounded-xl flex justify-center items-center mb-2 shadow-sm border border-[#ddd6fe]`}>
                  <Ionicons name="time-outline" size={28} color="#8b5cf6" />
                </View>
                <Text style={tw`font-semibold text-xs text-[#5b21b6] text-center`}>Reminders</Text>
              </View>

            </View>
          </View>


        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default Index;