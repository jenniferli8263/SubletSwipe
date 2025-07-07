import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Link, useRouter } from "expo-router";

export default function TabsHome() {
  const [listingId, setListingId] = useState("");
  const router = useRouter();

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
      <View className="w-full mb-4">
        <Text className="mb-2 text-lg">View Listing by ID</Text>
        <TextInput
          placeholder="Enter Listing ID"
          value={listingId}
          onChangeText={setListingId}
          keyboardType="numeric"
          className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
        />
        <Text
          onPress={() => listingId && router.push(`./listing/${listingId}`)}
          className={`px-4 py-2 rounded text-white text-lg text-center w-full ${listingId ? "bg-blue-600" : "bg-gray-400"}`}
          style={{ overflow: "hidden" }}
        >
          View Listing
        </Text>
      </View>
    </View>
  );
}
