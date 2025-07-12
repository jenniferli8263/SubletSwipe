import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiPost } from "@/lib/api";

interface SignupData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  profile_photo?: string;
}

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const signupData: SignupData = {
        id: 0, // This will be set by the backend
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      };

      await apiPost("/signup", signupData);

      // After successful signup, automatically log in
      const loginData = { email, password };
      const user = await apiPost("/login", loginData);
      await signIn(user);

      router.push("/auth/questionnaire");
    } catch (error) {
      let errorMessage = "An error occurred";
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "detail" in error) {
        errorMessage = (error as any).detail;
      } else if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed && typeof parsed === "object" && "detail" in parsed) {
            errorMessage = parsed.detail;
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/auth/login");
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-8 pt-8">
            {/* Header */}
            <View className="mb-8">
              <TouchableOpacity onPress={goBack} className="mb-4">
                <Text className="text-green-700 text-lg">← Back</Text>
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </Text>
              <Text className="text-gray-600 text-lg">
                Join SubletTinder today!
              </Text>
            </View>

            {/* Form */}
            <View className="flex-1">
              {/* Name Fields */}
              <View className="flex-row mb-4">
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium mb-2">
                    First Name
                  </Text>
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-700 font-medium mb-2">
                    Last Name
                  </Text>
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Password</Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center mb-4 ${
                  isLoading ? "bg-gray-400" : "bg-green-700"
                }`}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={goToLogin}>
                <Text className="text-green-700 text-base">
                  Already have an account? Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
