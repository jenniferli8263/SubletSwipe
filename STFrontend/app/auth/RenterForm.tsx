import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";

export default function RenterForm() {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      <KeyboardAvoidingView>
        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-8">
            Renter Form (Coming Soon)
          </Text>
        </View>
        <TouchableOpacity
          className="w-11/12 mb-8 py-4 rounded-lg bg-green-700 items-center"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-white text-lg font-semibold">Skip</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
