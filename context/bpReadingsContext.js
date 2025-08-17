import { createContext, useContext, useEffect, useState } from "react";
import bpReadingsRepository from "../repositories/BPReadingsRepository";
import syncService from "../services/syncService";

const BpReaderProvider = createContext();

export const BpReaderContext = ({ children }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [bpReaderLoading, setBpReaderLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    hasPendingChanges: false
  });

  const USER_ID = 1; // TODO: Get from user context

  // Load data from repository or fallback to API
  const loadData = async (syncFirst = false) => {
    try {
      setBpReaderLoading(true);
      setError(null);
      
      // Try repository first (offline-capable)
      try {
        const readings = await bpReadingsRepository.getReadingsForUser(USER_ID, 100);
        setData(readings);
        
        // Update sync status
        const status = await bpReadingsRepository.getSyncStatus();
        setSyncStatus(status);
      } catch (repoError) {
        console.warn('[BpReaderContext] Repository failed, falling back to API:', repoError.message);
        
        // Fallback to direct API call
        const response = await fetch(`https://cardiomedai-api.onrender.com/bp/readings/${USER_ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch data from API');
        }
        
        const apiData = await response.json();
        const readings = Array.isArray(apiData) ? apiData : [];
        setData(readings);
        
        // Set offline sync status
        setSyncStatus({
          isOnline: true,
          isSyncing: false,
          lastSync: null,
          hasPendingChanges: false
        });
      }
    } catch (err) {
      console.error('[BpReaderContext] Failed to load data:', err);
      setError(err.message);
      setData([]); // Set empty array as fallback
    } finally {
      setBpReaderLoading(false);
    }
  };

  // Create new BP reading
  const createReading = async (readingData) => {
    try {
      const newReading = await bpReadingsRepository.createReading(USER_ID, readingData);
      await loadData(); // Refresh data
      return newReading;
    } catch (err) {
      console.error('[BpReaderContext] Failed to create reading:', err);
      throw err;
    }
  };

  // Save OCR reading
  const saveOCRReading = async (ocrData) => {
    try {
      const newReading = await bpReadingsRepository.saveOCRReading(USER_ID, ocrData);
      await loadData(); // Refresh data
      return newReading;
    } catch (err) {
      console.error('[BpReaderContext] Failed to save OCR reading:', err);
      throw err;
    }
  };

  // Get recent readings
  const getRecentReadings = async (days = 30) => {
    try {
      return await bpReadingsRepository.getRecentReadings(USER_ID, days);
    } catch (err) {
      console.error('[BpReaderContext] Failed to get recent readings:', err);
      throw err;
    }
  };

  // Get average readings
  const getAverageReadings = async (days = 7) => {
    try {
      return await bpReadingsRepository.getAverageReadings(USER_ID, days);
    } catch (err) {
      console.error('[BpReaderContext] Failed to get average readings:', err);
      throw err;
    }
  };

  // Get readings statistics
  const getReadingsStats = async (days = 30) => {
    try {
      return await bpReadingsRepository.getReadingsStats(USER_ID, days);
    } catch (err) {
      console.error('[BpReaderContext] Failed to get readings stats:', err);
      throw err;
    }
  };

  // Force sync
  const syncNow = async () => {
    try {
      await bpReadingsRepository.sync();
      await loadData();
    } catch (err) {
      console.error('[BpReaderContext] Sync failed:', err);
      throw err;
    }
  };

  // Mutate function for compatibility with existing code
  const mutate = async () => {
    await loadData();
  };

  // Listen for sync events
  useEffect(() => {
    const handleSyncEvent = (event, data) => {
      if (event === 'syncCompleted' || event === 'tableSync') {
        if (!data.tableName || data.tableName === 'bp_readings') {
          loadData();
        }
      } else if (event === 'networkChanged') {
        setSyncStatus(prev => ({ ...prev, isOnline: data.isOnline }));
      }
    };

    syncService.addSyncListener(handleSyncEvent);
    
    return () => {
      syncService.removeSyncListener(handleSyncEvent);
    };
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  const value = {
    // Data
    data,
    error,
    bpReaderLoading,
    syncStatus,
    
    // Methods
    mutate,
    createReading,
    saveOCRReading,
    getRecentReadings,
    getAverageReadings,
    getReadingsStats,
    syncNow,
    
    // Utility methods
    interpretBP: bpReadingsRepository.interpretBP.bind(bpReadingsRepository),
    getBPCategory: bpReadingsRepository.getBPCategory.bind(bpReadingsRepository)
  };

  return (
    <BpReaderProvider.Provider value={value}>
      {children}
    </BpReaderProvider.Provider>
  );
};

// Hook for using the context
export const useBpReadings = () => {
  const context = useContext(BpReaderProvider);
  if (!context) {
    throw new Error('useBpReadings must be used within a BpReaderContext');
  }
  return context;
};

export default BpReaderProvider;
