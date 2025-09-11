import { createContext, useContext, useEffect, useState } from "react";
import bpReadingsRepository from "../repositories/BPReadingsRepository";
import { useUser } from "./userContext";

const BpReaderProvider = createContext();

export const BpReaderContext = ({ children }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [bpReaderLoading, setBpReaderLoading] = useState(true);
  const { currentUser } = useUser();

  const USER_ID = currentUser?.id || 1; // Use current user ID or fallback to 1

  // Load data from repository
  const loadData = async () => {
    try {
      setBpReaderLoading(true);
      setError(null);
      
      const readings = await bpReadingsRepository.getReadingsForUser(USER_ID, 100);
      setData(readings);
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

  // Mutate function for compatibility with existing code
  const mutate = async () => {
    await loadData();
  };

  // Initial data load and reload when user changes
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const value = {
    // Data
    data,
    error,
    bpReaderLoading,
    
    // Methods
    mutate,
    createReading,
    saveOCRReading,
    getRecentReadings,
    getAverageReadings,
    getReadingsStats,
    
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
