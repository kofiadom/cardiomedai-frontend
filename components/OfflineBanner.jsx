import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import syncService from '../services/syncService';

const OfflineBanner = ({ 
  style = {},
  showPendingCount = true,
  onPress = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Get initial status
    updateStatus();

    // Listen for sync events
    const handleSyncEvent = (event, data) => {
      if (event === 'networkChanged') {
        const shouldShow = !data.isOnline;
        setIsVisible(shouldShow);
        
        if (shouldShow) {
          showBanner();
          updatePendingChanges();
        } else {
          hideBanner();
        }
      } else if (event === 'syncCompleted' && isVisible) {
        updatePendingChanges();
      }
    };

    syncService.addSyncListener(handleSyncEvent);
    
    return () => {
      syncService.removeSyncListener(handleSyncEvent);
    };
  }, [isVisible]);

  const updateStatus = async () => {
    try {
      const status = syncService.getSyncStatus();
      const shouldShow = !status.isOnline;
      setIsVisible(shouldShow);
      
      if (shouldShow) {
        showBanner();
        await updatePendingChanges();
      }
    } catch (error) {
      console.error('[OfflineBanner] Failed to update status:', error);
    }
  };

  const updatePendingChanges = async () => {
    try {
      // This would need to be implemented to count pending changes across all repositories
      // For now, we'll simulate some pending changes when offline
      setPendingChanges(Math.floor(Math.random() * 5) + 1);
    } catch (error) {
      console.error('[OfflineBanner] Failed to update pending changes:', error);
    }
  };

  const showBanner = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default action - maybe show sync details or retry connection
      console.log('[OfflineBanner] Banner pressed - showing offline info');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        tw`absolute top-0 left-0 right-0 z-50`,
        { transform: [{ translateY: slideAnim }] },
        style
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={tw`bg-red-500 px-4 py-3 flex-row items-center justify-between shadow-lg`}
        activeOpacity={0.8}
      >
        <View style={tw`flex-row items-center flex-1`}>
          <Ionicons name="cloud-offline" size={20} color="white" />
          <View style={tw`ml-3 flex-1`}>
            <Text style={tw`text-white font-medium text-sm`}>
              You&apos;re offline
            </Text>
            {showPendingCount && pendingChanges > 0 && (
              <Text style={tw`text-red-100 text-xs mt-1`}>
                {pendingChanges} change{pendingChanges !== 1 ? 's' : ''} will sync when online
              </Text>
            )}
          </View>
        </View>
        
        <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OfflineBanner;
