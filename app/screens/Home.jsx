import { useContext } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import RemindersProvider from "../../context/remindersContext";

function extractDate(date) {
  return date?.split("T")[0];
}

function formatTime(datetime) {
  if (!datetime) return "";
  const date = new Date(datetime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Index() {
  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth * 0.92;
  const navigation = useNavigation();
  const { data = [] } = useContext(BpReaderProvider) || {}
  const { average } = useContext(AverageBpProvider) || {};
  const { advisor } = useContext(HealthAdvisorProvider) || {};
  const remindersContext = useContext(RemindersProvider) || {};
  const {
    upcomingMedication = [],
    upcomingBP = [],
    medicationReminders = [], // Full list of medication reminders
    bpReminders = [], // Full list of BP reminders
    doctorReminders = [],
    workoutReminders = [],
    upcomingMedLoading = false,
    upcomingBPLoading = false,
    medicationLoading = false,
    bpLoading = false,
    doctorLoading = false,
    workoutLoading = false,
    markMedicationTaken,
    markBPCompleted,
    markDoctorCompleted,
    markWorkoutCompleted,
    mutateMedication,
    mutateBP,
    mutateDoctor,
    mutateWorkout,
    mutateUpcomingMed,
    mutateUpcomingBP
  } = remindersContext;





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
      route: "screens/Reminders",
    },
  ];

  // Handle task completion with error handling
  const handleTaskCompletion = async (taskType, reminderId, actionFunction) => {
    try {
      if (typeof actionFunction === 'function') {
        await actionFunction(reminderId);

        // Wait a moment for the server to process the change
        await new Promise(resolve => setTimeout(resolve, 500));

        // Force refresh of relevant data to ensure UI updates immediately
        switch (taskType) {
          case 'medication':
            if (mutateMedication) await mutateMedication();
            if (mutateUpcomingMed) await mutateUpcomingMed();
            break;
          case 'bp':
            if (mutateBP) await mutateBP();
            if (mutateUpcomingBP) await mutateUpcomingBP();
            break;
          case 'doctor':
            if (mutateDoctor) await mutateDoctor();
            break;
          case 'workout':
            if (mutateWorkout) await mutateWorkout();
            break;
        }

        // Show a brief success message
        Alert.alert(
          "Success",
          `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} reminder marked as completed.`,
          [{ text: "OK", style: "default" }],
          { cancelable: true }
        );
      } else {
        console.warn(`Action function for ${taskType} is not available`);
        Alert.alert('Error', `Action function for ${taskType} is not available`);
      }
    } catch (error) {
      console.error(`Error completing ${taskType} task:`, error);
      Alert.alert('Error', `Failed to mark ${taskType} reminder as completed. Please try again.\n\nError: ${error.message}`);
    }
  };

  // Handle task deletion with error handling
  const handleTaskDeletion = async (taskType, reminderId) => {
    try {
      let deleteFunction;
      switch (taskType) {
        case 'medication':
          deleteFunction = remindersContext.deleteMedicationReminder;
          break;
        case 'bp':
          deleteFunction = remindersContext.deleteBPReminder;
          break;
        case 'doctor':
          deleteFunction = remindersContext.deleteDoctorReminder;
          break;
        case 'workout':
          deleteFunction = remindersContext.deleteWorkoutReminder;
          break;
        default:
          console.warn(`Unknown task type: ${taskType}`);
          return;
      }

      if (typeof deleteFunction === 'function') {
        await deleteFunction(reminderId);
        // Context already handles data refresh in the delete functions
        Alert.alert('Success', `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} reminder deleted successfully.`);
      } else {
        console.warn(`Delete function for ${taskType} is not available`);
        Alert.alert('Error', `Delete function for ${taskType} is not available`);
      }
    } catch (error) {
      console.error(`Error deleting ${taskType} task:`, error);
      Alert.alert('Error', `Failed to delete ${taskType} reminder. Please try again.`);
    }
  };

  // Helper function to get next upcoming reminder from an array
  const getNextUpcomingReminder = (reminders, dateField, type, config) => {
    if (!Array.isArray(reminders) || reminders.length === 0) {
      return null;
    }

    const now = new Date();

    const futureReminders = reminders
      .filter(reminder => {
        // Check if the date field exists
        if (reminder[dateField] === undefined) {
          return false;
        }

        const reminderDate = new Date(reminder[dateField]);
        const isFuture = reminderDate > now;

        // Different reminder types use different completion fields
        let isNotCompleted;
        if (type === 'medication') {
          isNotCompleted = !reminder.is_taken; // API uses is_taken, not taken
        } else {
          isNotCompleted = !reminder.is_completed; // API uses is_completed, not completed
        }

        // Only show incomplete future reminders on task board
        return isFuture && isNotCompleted;
      })
      .sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));

    if (futureReminders.length === 0) {
      return null;
    }

    const reminder = futureReminders[0];
    const reminderDate = new Date(reminder[dateField]);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Check if the reminder is today or in the future
    const isToday = reminderDate >= todayStart && reminderDate < todayEnd;

    return {
      id: `${type}-${reminder.id}`,
      type: type,
      icon: config.icon,
      title: config.getTitle(reminder),
      subtitle: config.getSubtitle(reminder),
      time: formatTime(reminder[dateField]),
      date: new Date(reminder[dateField]).toLocaleDateString(),
      completed: type === 'medication' ? (reminder.is_taken || false) : (reminder.is_completed || false),
      reminder: reminder,
      onToggle: () => handleTaskCompletion(type, reminder.id, config.actionFunction),
      onDelete: () => handleTaskDeletion(type, reminder.id),
      isUpcoming: !isToday, // True for future dates, false for today
      isToday: isToday // Flag to indicate this is today's reminder
    };
  };

  // Generate today's tasks with hybrid approach
  const generateTodayTasks = () => {
    const tasks = [];
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // First, try to get today's reminders
    const todayTasks = [];

    // Add today's medication reminders (only incomplete ones)
    if (Array.isArray(medicationReminders)) {
      medicationReminders.forEach(reminder => {
        const reminderDate = new Date(reminder.schedule_datetime);
        if (reminderDate >= todayStart && reminderDate < todayEnd && !reminder.is_taken) {
          todayTasks.push({
            id: `med-${reminder.id}`,
            type: 'medication',
            icon: "medical",
            title: reminder.name || "Medication",
            subtitle: reminder.dosage || "",
            time: formatTime(reminder.schedule_datetime),
            completed: reminder.is_taken || false,
            reminder: reminder,
            onToggle: () => handleTaskCompletion('medication', reminder.id, markMedicationTaken),
            onDelete: () => handleTaskDeletion('medication', reminder.id),
            isUpcoming: false,
            isToday: true
          });
        }
      });
    }

    // Add today's BP check reminders (only incomplete ones)
    if (Array.isArray(bpReminders)) {
      bpReminders.forEach(reminder => {
        const reminderDate = new Date(reminder.reminder_datetime);
        if (reminderDate >= todayStart && reminderDate < todayEnd && !reminder.is_completed) {
          todayTasks.push({
            id: `bp-${reminder.id}`,
            type: 'bp',
            icon: "pulse",
            title: "Blood Pressure Check",
            subtitle: reminder.bp_category || "Manual",
            time: formatTime(reminder.reminder_datetime),
            completed: reminder.is_completed || false,
            reminder: reminder,
            onToggle: () => handleTaskCompletion('bp', reminder.id, markBPCompleted),
            onDelete: () => handleTaskDeletion('bp', reminder.id),
            isUpcoming: false,
            isToday: true
          });
        }
      });
    }

    // Add today's doctor appointments (only incomplete ones)
    if (Array.isArray(doctorReminders)) {
      doctorReminders.forEach(reminder => {
        const reminderDate = new Date(reminder.appointment_datetime);
        if (reminderDate >= todayStart && reminderDate < todayEnd && !reminder.is_completed) {
          todayTasks.push({
            id: `doctor-${reminder.id}`,
            type: 'doctor',
            icon: "person",
            title: "Doctor Appointment",
            subtitle: reminder.doctor_name || "Appointment",
            time: formatTime(reminder.appointment_datetime),
            completed: reminder.is_completed || false,
            reminder: reminder,
            onToggle: () => handleTaskCompletion('doctor', reminder.id, markDoctorCompleted),
            onDelete: () => handleTaskDeletion('doctor', reminder.id),
            isUpcoming: false,
            isToday: true
          });
        }
      });
    }

    // Add today's workout reminders (only incomplete ones)
    if (Array.isArray(workoutReminders)) {
      workoutReminders.forEach(reminder => {
        const reminderDate = new Date(reminder.workout_datetime);
        if (reminderDate >= todayStart && reminderDate < todayEnd && !reminder.is_completed) {
          todayTasks.push({
            id: `workout-${reminder.id}`,
            type: 'workout',
            icon: "fitness",
            title: reminder.workout_type || "Workout",
            subtitle: `${reminder.duration || 30} min`,
            time: formatTime(reminder.workout_datetime),
            completed: reminder.is_completed || false,
            reminder: reminder,
            onToggle: () => handleTaskCompletion('workout', reminder.id, markWorkoutCompleted),
            onDelete: () => handleTaskDeletion('workout', reminder.id),
            isUpcoming: false,
            isToday: true
          });
        }
      });
    }

    // If we have today's tasks, use them
    if (Array.isArray(todayTasks) && todayTasks.length > 0) {
      tasks.push(...todayTasks);
    } else {
      // No tasks for today, get next upcoming reminders from each category
      // Use full reminder arrays instead of just 24-hour upcoming ones
      const nextMedication = getNextUpcomingReminder(
        medicationReminders,
        'schedule_datetime',
        'medication',
        {
          icon: "medical",
          getTitle: (r) => r.name || "Medication",
          getSubtitle: (r) => r.dosage || "",
          actionFunction: markMedicationTaken
        }
      );

      const nextBP = getNextUpcomingReminder(
        bpReminders,
        'reminder_datetime',
        'bp',
        {
          icon: "pulse",
          getTitle: () => "Blood Pressure Check",
          getSubtitle: (r) => r.bp_category || "Manual",
          actionFunction: markBPCompleted
        }
      );

      const nextDoctor = getNextUpcomingReminder(
        doctorReminders,
        'appointment_datetime',
        'doctor',
        {
          icon: "person",
          getTitle: () => "Doctor Appointment",
          getSubtitle: (r) => r.doctor_name || "Appointment",
          actionFunction: markDoctorCompleted
        }
      );

      const nextWorkout = getNextUpcomingReminder(
        workoutReminders,
        'workout_datetime',
        'workout',
        {
          icon: "fitness",
          getTitle: (r) => r.workout_type || "Workout",
          getSubtitle: (r) => `${r.duration || 30} min`,
          actionFunction: markWorkoutCompleted
        }
      );

      // Add non-null upcoming reminders
      console.log(`[DEBUG] Individual upcoming tasks:`, {
        nextMedication,
        nextBP,
        nextDoctor,
        nextWorkout
      });

      const upcomingTasks = [nextMedication, nextBP, nextDoctor, nextWorkout]
        .filter(task => task !== null);

      console.log(`[DEBUG] Final upcoming tasks after filtering:`, upcomingTasks);
      if (Array.isArray(upcomingTasks)) {
        upcomingTasks.forEach(task => tasks.push(task));
      }
    }

    // Sort tasks by time (today's tasks first, then by time)
    return tasks.sort((a, b) => {
      // Today's tasks come first
      if (!a.isUpcoming && b.isUpcoming) return -1;
      if (a.isUpcoming && !b.isUpcoming) return 1;

      // Within the same category (today or upcoming), sort by time
      const timeA = new Date(`2000-01-01 ${a.time}`);
      const timeB = new Date(`2000-01-01 ${b.time}`);
      return timeA - timeB;
    });
  };

  const todayTasks = generateTodayTasks() || [];
  const completedTasks = Array.isArray(todayTasks) ? todayTasks.filter(task => task && task.completed).length : 0;
  const totalTasks = Array.isArray(todayTasks) ? todayTasks.length : 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;





  // Check if we're showing today's tasks or upcoming tasks
  const hasActualTodayTasks = Array.isArray(todayTasks) ? todayTasks.some(task => task && !task.isUpcoming) : false;
  const sectionTitle = hasActualTodayTasks ? "Today's Tasks" : "Upcoming Tasks";
  const sectionSubtitle = hasActualTodayTasks
    ? `${completedTasks} of ${totalTasks} completed`
    : `Next ${totalTasks} reminder${totalTasks !== 1 ? 's' : ''}`;

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
          {data && data.length > 0 && data[0] && (
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
          )}

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
                style={tw`max-h-40`}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
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
                    {sectionTitle}
                  </Text>
                  <Text style={tw`text-gray-500 text-sm`}>
                    {sectionSubtitle}
                  </Text>
                </View>
              </View>
              {hasActualTodayTasks && (
                <View style={tw`bg-blue-50 rounded-full px-3 py-1`}>
                  <Text style={tw`text-blue-600 font-semibold text-xs`}>{completionPercentage}%</Text>
                </View>
              )}
            </View>

            {!Array.isArray(todayTasks) || todayTasks.length === 0 ? (
              <View style={tw`py-8 items-center`}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text style={tw`text-gray-500 text-base mt-3 text-center`}>
                  No reminders found
                </Text>
                <Text style={tw`text-gray-400 text-sm mt-1 text-center`}>
                  {(medicationLoading || bpLoading || doctorLoading || workoutLoading)
                    ? "Loading reminders..."
                    : "Create reminders to see them here"}
                </Text>
              </View>
            ) : (
              Array.isArray(todayTasks) && todayTasks.map((task, index) => (
                <TouchableOpacity
                  key={task?.id || `task-${index}`}
                  style={tw`flex flex-row items-center py-4 ${index !== todayTasks.length - 1
                    ? "border-b border-gray-50"
                    : ""
                    }`}
                  activeOpacity={0.7}
                  onPress={task.onToggle}
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
                    <View style={tw`flex-row items-center mb-1`}>
                      <Text
                        style={tw`font-semibold text-gray-900 text-sm ${task.completed ? "line-through opacity-60" : ""
                          }`}
                      >
                        {task.title}
                      </Text>
                      {task.isToday && (
                        <View style={tw`ml-2 bg-blue-100 px-2 py-0.5 rounded-full`}>
                          <Text style={tw`text-blue-600 text-xs font-medium`}>
                            Today
                          </Text>
                        </View>
                      )}
                      {task.isUpcoming && (
                        <View style={tw`ml-2 bg-orange-100 px-2 py-0.5 rounded-full`}>
                          <Text style={tw`text-orange-600 text-xs font-medium`}>
                            Upcoming
                          </Text>
                        </View>
                      )}
                    </View>
                    {task.subtitle && (
                      <Text style={tw`text-gray-400 text-xs mt-0.5`}>
                        {task.subtitle}
                      </Text>
                    )}
                    <Text style={tw`text-gray-500 text-xs`}>
                      {task.isToday ? task.time : `${task.date} at ${task.time}`}
                    </Text>
                  </View>

                  <View style={tw`flex-row items-center ml-4`}>
                    {/* Mark as done button */}
                    <TouchableOpacity
                      style={tw`mr-3`}
                      onPress={task.onToggle}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={
                          task.completed ? "checkmark-circle" : "ellipse-outline"
                        }
                        size={28}
                        color={task.completed ? "#10b981" : "#cbd5e1"}
                      />
                    </TouchableOpacity>

                    {/* Delete button */}
                    <TouchableOpacity
                      style={tw`p-1`}
                      onPress={() => {
                        Alert.alert(
                          "Delete Reminder",
                          `Are you sure you want to delete this ${task.type} reminder?`,
                          [
                            {
                              text: "Cancel",
                              style: "cancel"
                            },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: task.onDelete
                            }
                          ]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Upcoming Reminders */}
          {((upcomingMedication && upcomingMedication.length > 0) || (upcomingBP && upcomingBP.length > 0)) && (
            <View style={tw`mb-8`}>
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`font-bold text-base text-gray-900`}>
                  Upcoming Reminders
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('screens/Reminders')}>
                  <Text style={tw`text-blue-600 font-medium text-sm`}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(upcomingMedication || []).slice(0, 3).map((reminder) => (
                  <View key={reminder.id} style={tw`bg-white rounded-2xl p-4 mr-4 border border-gray-100 w-64`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <View style={tw`bg-green-100 rounded-full p-2 mr-3`}>
                        <Ionicons name="medical" size={16} color="#10b981" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`font-semibold text-gray-900 text-sm`}>
                          {reminder.name}
                        </Text>
                        <Text style={tw`text-gray-500 text-xs`}>
                          {reminder.schedule_dosage}
                        </Text>
                      </View>
                    </View>
                    <Text style={tw`text-gray-600 text-xs`}>
                      {new Date(reminder.schedule_datetime).toLocaleString()}
                    </Text>
                  </View>
                ))}

                {(upcomingBP || []).slice(0, 2).map((reminder) => (
                  <View key={reminder.id} style={tw`bg-white rounded-2xl p-4 mr-4 border border-gray-100 w-64`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <View style={tw`bg-blue-100 rounded-full p-2 mr-3`}>
                        <Ionicons name="heart" size={16} color="#3b82f6" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`font-semibold text-gray-900 text-sm`}>
                          BP Check
                        </Text>
                        <Text style={tw`text-gray-500 text-xs`}>
                          {reminder.bp_category}
                        </Text>
                      </View>
                    </View>
                    <Text style={tw`text-gray-600 text-xs`}>
                      {new Date(reminder.reminder_datetime).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

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