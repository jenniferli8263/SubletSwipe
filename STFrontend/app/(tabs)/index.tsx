import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function TabsHome() {
  return (
    <View className="flex-1 justify-center items-center bg-white p-8">
      <Text className="text-2xl font-bold mb-8">Sublet Tinder Demo</Text>
      <Link
        href="./add-listing"
        className="mb-4 px-4 py-2 bg-green-600 rounded text-white text-lg text-center w-full"
      >
        Add Listing
      </Link>
      <Link
        href="./deactivate-listing"
        className="mb-4 px-4 py-2 bg-red-600 rounded text-white text-lg text-center w-full"
      >
        Deactivate Listing
      </Link>
      <Link
        href="./listing"
        className="mb-4 px-4 py-2 bg-blue-600 rounded text-white text-lg text-center w-full"
      >
        View Listing
      </Link>
    </View>
  );
}
