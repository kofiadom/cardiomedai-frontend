import { useState, useEffect, useRef, useContext } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ScreenHeader from "../../components/ScreenHeader";
import { useUser } from "../../context/userContext";


function KnowledgeAgent() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const { currentUser } = useUser();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      agent_id: null,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardOffset(event.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    setMessage("");
    setIsLoading(true);

    try {
      const userId = currentUser?.id || 1; // Default to user ID 1 if not available
      const encodedMessage = encodeURIComponent(currentMessage);
      const res = await fetch(`https://staging.codinnovations.com/cardiomed/knowledge-agent/ask/${encodedMessage}?user_id=${userId}&include_user_context=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

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

      const errorMessage = {
        id: Date.now() + 2,
        agent_id: null,
        text: "Sorry, I couldn't process your request. Please try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const MessageBubble = ({ message }) => (
    <View style={tw`mb-4`}>
      {message.isBot ? (
        // Bot message - with light background, closest to edges
        <View style={tw`py-3 bg-blue-50/40`}>
          <Text style={tw`text-base leading-5 text-gray-800 px-0`}>
            {message.text}
          </Text>
          <Text style={tw`text-xs text-gray-500 mt-1 px-0`}>
            {message.timestamp}
          </Text>
        </View>
      ) : (
        // User message - bubble on the right
        <View style={tw`max-w-[80%] self-end`}>
          <View style={tw`bg-blue-500 px-4 py-3 rounded-2xl`}>
            <Text style={tw`text-base leading-5 text-white`}>
              {message.text}
            </Text>
          </View>
          <Text style={tw`text-xs text-gray-500 mt-1 text-right`}>
            {message.timestamp}
          </Text>
        </View>
      )}
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
      <View style={[tw`flex-1 mx-auto`, { width: containerWidth }]}>
        <ScreenHeader />

        {/* Chat Header */}
        <View style={tw`mt-4 mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100`}>
          <View style={tw`flex flex-row justify-start items-center`}>
            <LinearGradient
              colors={['#f87171', '#dc2626']}
              style={tw`w-10 h-10 rounded-full flex items-center justify-center`}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color='white' />
            </LinearGradient>
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

        {/* Messages Container - Takes full available space */}
        <ScrollView
          style={tw`flex-1 bg-white rounded-t-3xl border-t border-gray-100 shadow-sm`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            tw`px-4 pt-6`,
            { paddingBottom: keyboardOffset > 0 ? 120 : 120 } // Extra space for input area
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <LoadingBubble />}
        </ScrollView>

        {/* Floating Input Area - Positioned above keyboard */}
        <View style={[
          tw`absolute left-0 right-0 bg-white border-t border-gray-100 shadow-lg`,
          { bottom: keyboardOffset }
        ]}>
          <View style={tw`p-4 pb-6`}>
            <View style={tw`flex flex-row items-end bg-gray-50 rounded-2xl px-4 py-3 shadow-sm border border-gray-200`}>
              <TextInput
                style={tw`flex-1 text-base py-1 text-gray-800 max-h-32`}
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleAskQuestion}
                blurOnSubmit={false}
                autoCorrect={true}
                autoCapitalize="sentences"
              />
              <TouchableOpacity
                onPress={handleAskQuestion}
                style={[
                  tw`ml-3 w-10 h-10 rounded-full flex items-center justify-center shadow-sm`,
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
    </SafeAreaView>
  );
}

export default KnowledgeAgent;