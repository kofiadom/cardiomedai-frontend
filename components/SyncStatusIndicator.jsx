import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import syncService from '../services/syncService';

const SyncStatusIndicator = ({ 
  showDetails = false, 
  onPress = null,
  style = {},
  compact = false 
}) => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    isSyncing: false,
    lastSync: null
  });
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    // Get initial status
    updateStatus();

    // Listen for sync events
    const handleSyncEvent = (event, data) => {
      if (event === 'syncStarted') {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      } else if (event === 'syncCompleted') {
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync: new Date(data.timestamp) 
        }));
        updatePendingChanges();
      } else if (event === 'syncError') {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      } else if (event === 'networkChanged') {
        setSyncStatus(prev => ({ ...prev, isOnline: data.isOnline }));
      }
    };

    syncService.addSyncListener(handleSyncEvent);
    
    return () => {
      syncService.removeSyncListener(handleSyncEvent);
    };
  }, []);

  const updateStatus = async () => {
    try {
      const status = syncService.getSyncStatus();
      const lastSync = await syncService.getLastSyncTime();
      setSyncStatus({
        ...status,
        lastSync
      });
      await updatePendingChanges();
    } catch (error) {
      console.error('[SyncStatusIndicator] Failed to update status:', error);
    }
  };

  const updatePendingChanges = async () => {
    try {
      // This would need to be implemented to count pending changes across all repositories
      // For now, we'll set it to 0
      setPendingChanges(0);
    } catch (error) {
      console.error('[SyncStatusIndicator] Failed to update pending changes:', error);
    }
  };

  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else if (syncStatus.isOnline && !syncStatus.isSyncing) {
      try {
        await syncService.syncNow();
      } catch (error) {
        console.error('[SyncStatusIndicator] Manual sync failed:', error);
      }
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <ActivityIndicator size="small" color="#3B82F6" />;
    } else if (!syncStatus.isOnline) {
      return <Ionicons name="cloud-offline" size={16} color="#EF4444" />;
    } else if (pendingChanges > 0) {
      return <Ionicons name="cloud-upload" size={16} color="#F59E0B" />;
    } else {
      return <Ionicons name="cloud-done" size={16} color="#10B981" />;
    }
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    } else if (!syncStatus.isOnline) {
      return 'Offline';
    } else if (pendingChanges > 0) {
      return `${pendingChanges} pending`;
    } else {
      return 'Synced';
    }
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) {
      return 'text-blue-600';
    } else if (!syncStatus.isOnline) {
      return 'text-red-600';
    } else if (pendingChanges > 0) {
      return 'text-yellow-600';
    } else {
      return 'text-green-600';
    }
  };

  const formatLastSync = () => {
    if (!syncStatus.lastSync) return 'Never';
    
    const now = new Date();
    const diff = now - syncStatus.lastSync;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[tw`flex-row items-center px-2 py-1 rounded-full bg-gray-100`, style]}
        disabled={syncStatus.isSyncing}
      >
        {getStatusIcon()}
        {showDetails && (
          <Text style={tw`ml-1 text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[tw`flex-row items-center justify-between p-3 bg-white rounded-lg border border-gray-200`, style]}
      disabled={syncStatus.isSyncing}
    >
      <View style={tw`flex-row items-center flex-1`}>
        {getStatusIcon()}
        <View style={tw`ml-3 flex-1`}>
          <Text style={tw`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </Text>
          {showDetails && (
            <Text style={tw`text-xs text-gray-500 mt-1`}>
              Last sync: {formatLastSync()}
            </Text>
          )}
        </View>
      </View>
      
      {!syncStatus.isSyncing && syncStatus.isOnline && (
        <Ionicons name="refresh" size={16} color="#6B7280" />
      )}
    </TouchableOpacity>
  );
};

export default SyncStatusIndicator;
