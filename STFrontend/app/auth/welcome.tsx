import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomeScreen() {
  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignup = () => {
    router.push("/auth/signup");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        {/* Welcome Text */}
        <View className="flex-1 justify-center items-center">
          <Text className="text-4xl font-bold text-gray-900 text-center mb-4">
            Welcome to SubletTinder
          </Text>
          <Text className="text-lg text-gray-600 text-center leading-6">
            Find your perfect sublet match or list your property for others to
            discover
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4 pb-8 gap-y-4">
          <TouchableOpacity
            className="w-full bg-green-700 py-4 rounded-xl items-center"
            onPress={handleSignup}
          >
            <Text className="text-white text-lg font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-gray-100 py-4 rounded-xl items-center border border-gray-300"
            onPress={handleLogin}
          >
            <Text className="text-gray-900 text-lg font-semibold">
              I already have an account
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}
