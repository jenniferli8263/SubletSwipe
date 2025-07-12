import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_photo?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from storage on app start
    loadUserFromStorage();

    // Fallback: if loading takes too long, stop loading
    const timeout = setTimeout(() => {
      console.log("Loading timeout - forcing isLoading to false");
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const loadUserFromStorage = async () => {
    try {
      console.log("Loading user from storage...");
      // Test if AsyncStorage is working
      await AsyncStorage.setItem("test", "test");
      const testData = await AsyncStorage.getItem("test");
      console.log("AsyncStorage test:", testData);

      const userData = await AsyncStorage.getItem("user");
      console.log("User data from storage:", userData);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const signIn = async (userData: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      router.replace("/auth/welcome");
    } catch (error) {
      console.error("Error removing user from storage:", error);
    }
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signOut, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
