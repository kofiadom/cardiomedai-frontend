import { Text, View, SafeAreaView, Dimensions, Platform } from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { BarChart } from "react-native-gifted-charts";


function Index() {
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth * 0.90;

  const heartRateData = [
    { value: 72, label: 'Sun', frontColor: '#ff6b6b' },
    { value: 68, label: 'Mon', frontColor: '#4ecdc4' },
    { value: 75, label: 'Tue', frontColor: '#45b7d1' },
    { value: 70, label: 'Wed', frontColor: '#96ceb4' },
    { value: 73, label: 'Thur', frontColor: '#feca57' },
    { value: 69, label: 'Fri', frontColor: '#ff9ff3' },
    { value: 74, label: 'Sat', frontColor: '#54a0ff' }
  ];


  return (
    <SafeAreaView style={tw`flex-1 bg-[#eff1f3]`}>
      <StatusBar style="dark" />
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
        <View style={[tw`flex-row justify-between items-center ${Platform.OS === 'ios' ? 'mt-4' : 'mt-11'}`]}>

          <View style={tw`flex flex-row justify-center items-center`}>
            <View style={tw`w-12 h-12 bg-blue-100 mr-3 rounded-2xl flex justify-center items-center`}>
              <Text style={tw`font-bold text-blue-700 text-sm`}>KA</Text>
            </View>

            <View>
              <Text style={tw`text-gray-500 text-sm`}>Good morning</Text>
              <Text style={tw`font-bold text-gray-800 text-base`}>Kwabena Asumadu</Text>
            </View>
          </View>


          <View style={tw`flex flex-row items-center bg-white rounded-full px-3 py-2 shadow-sm`}>
            <View style={tw`w-2 h-2 bg-red-500 rounded-full mr-2`} />
            <Text style={tw`font-semibold text-gray-700 mr-1`}>3</Text>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
          </View>
        </View>

        <View style={tw`flex-1`}>
          <View style={tw`h-30 bg-[#e1e6f0] mt-6 rounded-lg`}>
            <View style={tw`h-full flex flex-row justify-around items-center py-3 px-2`}>
              <View style={tw`flex flex-col items-start`}>
                <Text style={tw`font-semibold text-sm`}>Your Heart Health</Text>
                <Text style={tw`font-light text-sm`}>Last checked: 122/80</Text>
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
          </View>


          <View style={tw`mt-6`}>
            <Text style={tw`font-semibold text-base`}>Services</Text>

            <View style={tw`mt-3 flex flex-row justify-around items-center`}>
              <View style={tw`flex`}>
                <View style={tw`w-15 h-15 bg-red-50 rounded-2xl flex justify-center items-center mb-3 shadow-sm`}>
                  <Ionicons name="heart-outline" size={25} color="#2474dc" />
                </View>
                <Text style={tw`font-semibold text-sm text-gray-700 text-center`}>Heart Monitor</Text>
              </View>

              <View style={tw`flex`}>
                <View style={tw`w-15 h-15 bg-teal-50 rounded-2xl flex justify-center items-center mb-3 shadow-sm`}>
                  <Ionicons name="body-outline" size={25} color="#2474dc" />
                </View>
                <Text style={tw`font-semibold text-sm text-gray-700 text-center`}>Fitness Plan</Text>
              </View>

              <View style={tw`flex`}>
                <View style={tw`w-15 h-15 bg-blue-50 rounded-2xl flex justify-center items-center mb-3 shadow-sm`}>
                  <Ionicons name="options-outline" size={25} color="#2474dc" />
                </View>
                <Text style={tw`font-semibold text-sm text-gray-700 text-center`}>Analytics</Text>
              </View>

            </View>
          </View>

          <View style={tw`mt-5`}>
            <BarChart
              data={heartRateData}
              width={containerWidth - 30}
              height={165}
              barWidth={32}
              spacing={15}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: '#64748b', fontSize: 11 }}
              xAxisLabelTextStyle={{ color: '#64748b', fontSize: 11, marginTop: 5 }}
              noOfSections={4}
              maxValue={85}
              showGradient
              gradientColor="rgba(53, 162, 235, 0.8)"
            />
          </View>

        </View>

        <View style={tw`mt-2 mb-3 flex flex-row justify-around items-center`}>
          <View style={tw`flex justify-center items-center`}>
            <Ionicons name="home-outline" size={24} color="#374151" />
            <Text style={tw`text-xs text-gray-700 mt-1`}>Home</Text>
          </View>

          <View style={tw`flex justify-center items-center`}>
            <Ionicons name="heart-outline" size={24} color="#374151" />
            <Text style={tw`text-xs text-gray-700 mt-1`}>Heart</Text>
          </View>

          <View style={tw`flex justify-center items-center`}>
            <Ionicons name="stats-chart-outline" size={24} color="#374151" />
            <Text style={tw`text-xs text-gray-700 mt-1`}>Stats</Text>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
export default Index;