import { createContext, useContext, useEffect, useState } from "react";
import userRepository from "../repositories/UserRepository";

const UserProvider = createContext();

export const UserContext = ({ children }) => {
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Load users data
  const loadData = async () => {
    try {
      setUserLoading(true);
      setError(null);
      
      const users = await userRepository.findAll();
      setData(users);
      
      // Get current user (assuming user ID 1)
      const user = await userRepository.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('[UserContext] Failed to load data:', err);
      setError(err.message);
    } finally {
      setUserLoading(false);
    }
  };

  // Create new user
  const createUser = async (userData) => {
    try {
      const newUser = await userRepository.create(userData);
      await loadData(); // Refresh data
      return newUser;
    } catch (err) {
      console.error('[UserContext] Failed to create user:', err);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (userId, profileData) => {
    try {
      const updatedUser = await userRepository.updateProfile(userId, profileData);
      await loadData(); // Refresh data
      return updatedUser;
    } catch (err) {
      console.error('[UserContext] Failed to update profile:', err);
      throw err;
    }
  };

  // Get user by username
  const getUserByUsername = async (username) => {
    try {
      return await userRepository.findByUsername(username);
    } catch (err) {
      console.error('[UserContext] Failed to get user by username:', err);
      throw err;
    }
  };

  // Get user by email
  const getUserByEmail = async (email) => {
    try {
      return await userRepository.findByEmail(email);
    } catch (err) {
      console.error('[UserContext] Failed to get user by email:', err);
      throw err;
    }
  };

  // Mutate function for compatibility with existing code
  const mutate = async () => {
    await loadData();
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  const value = {
    // Data
    data,
    currentUser,
    error,
    userLoading,
    
    // Methods
    mutate,
    createUser,
    updateProfile,
    getUserByUsername,
    getUserByEmail,
  };

  return (
    <UserProvider.Provider value={value}>
      {children}
    </UserProvider.Provider>
  );
};

// Hook for using the context
export const useUser = () => {
  const context = useContext(UserProvider);
  if (!context) {
    throw new Error('useUser must be used within a UserContext');
  }
  return context;
};

export default UserProvider;
