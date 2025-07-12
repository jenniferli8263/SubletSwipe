import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiPost } from "@/lib/api";
import Input from "@/components/ui/Input";

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSignup = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (password && password.length < 8)
      newErrors.password = "Password must be at least 8 characters long";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    setErrors({});
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
      // Show error at the top (global error)
      setErrors((prev) => ({ ...prev, global: errorMessage }));
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
                <Text className="text-green-800 text-lg">← Back</Text>
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </Text>
              {errors.global ? (
                <Text className="text-red-600 mb-2">{errors.global}</Text>
              ) : null}
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
                  <Input
                    className="mb-4"
                    placeholder="First name"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errors.firstName)
                        setErrors((e) => ({ ...e, firstName: "" }));
                    }}
                    autoCapitalize="words"
                  />
                  {errors.firstName ? (
                    <Text className="text-red-600 mb-2">
                      {errors.firstName}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-700 font-medium mb-2">
                    Last Name
                  </Text>
                  <Input
                    className="mb-4"
                    placeholder="Last name"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errors.lastName)
                        setErrors((e) => ({ ...e, lastName: "" }));
                    }}
                    autoCapitalize="words"
                  />
                  {errors.lastName ? (
                    <Text className="text-red-600 mb-2">{errors.lastName}</Text>
                  ) : null}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <Input
                  className="mb-4"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((e) => ({ ...e, email: "" }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email ? (
                  <Text className="text-red-600 mb-2">{errors.email}</Text>
                ) : null}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Password</Text>
                <Input
                  className="mb-4"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password)
                      setErrors((e) => ({ ...e, password: "" }));
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.password ? (
                  <Text className="text-red-600 mb-2">{errors.password}</Text>
                ) : null}
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">
                  Confirm Password
                </Text>
                <Input
                  className="mb-4"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors((e) => ({ ...e, confirmPassword: "" }));
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.confirmPassword ? (
                  <Text className="text-red-600 mb-2">
                    {errors.confirmPassword}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center mb-4 ${
                  isLoading ? "bg-gray-400" : "bg-green-800"
                }`}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={goToLogin}>
                <Text className="text-green-800 text-base">
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
