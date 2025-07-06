import { useContext, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../components/ScreenHeader";


function KnowledgeAgent() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      agent_id: null,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const cleanResponseText = (text) => {
    if (!text) return '';

    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
      .replace(/`(.*?)`/g, '$1') // Remove code `text`
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
      .replace(/^\s*[-*+]\s/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s/gm, '') // Remove numbered list markers
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();
  };

  const handleAskQuestion = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      agent_id: null,
      text: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage(""); // Clear input
    setIsLoading(true); // Start loading

    try {
      const res = await fetch(`https://cardiomedai-api.onrender.com/knowledge-agent/ask/${currentMessage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();
      console.log('question', data);

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        agent_id: data.agent_id,
        text: cleanResponseText(data.answer),
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.log('error occured', error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 2,
        agent_id: null,
        text: "Sorry, I couldn't process your request. Please try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Stop loading
    }
  }

  const MessageBubble = ({ message }) => (
    <View style={[
      tw`mb-4 max-w-[80%]`,
      message.isBot ? tw`self-start` : tw`self-end`
    ]}>
      <View style={[
        tw`px-4 py-3 rounded-2xl`,
        message.isBot
          ? tw`bg-white border border-gray-100 shadow-sm`
          : tw`bg-blue-500`
      ]}>
        <Text style={[
          tw`text-base leading-5`,
          message.isBot ? tw`text-gray-800` : tw`text-white`
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={[
        tw`text-xs text-gray-500 mt-1`,
        message.isBot ? tw`text-left` : tw`text-right`
      ]}>
        {message.timestamp}
      </Text>
    </View>
  );

  const LoadingBubble = () => (
    <View style={tw`mb-4 max-w-[80%] self-start`}>
      <View style={tw`px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm`}>
        <View style={tw`flex flex-row items-center`}>
          <Text style={tw`text-sm text-gray-500 ml-2`}>I&apos;m thinking...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
          <ScreenHeader />

          {/* Chat Header */}
          <View style={tw`mt-4 mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100`}>
            <View style={tw`flex flex-row justify-start items-center`}>
              <View style={tw`w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center`}>
                <Ionicons name="chatbubble-ellipses" size={20} color='white' />
              </View>
              <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-lg font-semibold text-gray-800`}>
                  Knowledge Assistant
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Hello, Kofi Adom! How was your day?
                </Text>
              </View>
              <View style={tw`w-2 h-2 bg-green-400 rounded-full`} />
            </View>
          </View>

          {/* Messages Container */}
          <View style={tw`flex-1 bg-white rounded-t-3xl border-t border-gray-100 shadow-sm`}>
            <ScrollView
              style={tw`flex-1 px-4 pt-6`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`pb-4`}
            >
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <LoadingBubble />}
            </ScrollView>

            {/* Input Area */}
            <View style={tw`p-4 bg-white border-t border-gray-100`}>
              <View style={tw`flex flex-row items-center bg-gray-50 rounded-2xl px-4 py-2`}>
                <TextInput
                  style={tw`flex-1 text-base py-2 text-gray-800`}
                  placeholder="Type your message..."
                  placeholderTextColor="#9ca3af"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={handleAskQuestion}
                  style={[
                    tw`ml-2 w-10 h-10 rounded-full flex items-center justify-center`,
                    message.trim() && !isLoading ? tw`bg-blue-500` : tw`bg-gray-300`
                  ]}
                  disabled={!message.trim() || isLoading}
                >
                  <Ionicons
                    name={isLoading ? "hourglass" : "send"}
                    size={18}
                    color={message.trim() && !isLoading ? 'white' : '#9ca3af'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default KnowledgeAgent;