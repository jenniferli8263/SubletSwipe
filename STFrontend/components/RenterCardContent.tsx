import React from "react";
import { View, Text, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${month} ${day}${getOrdinal(day)}`;
}

export default function RenterCardContent({ match }: { match: any }) {
  let city = "";
  if (match.address_string) {
    const parts = match.address_string.split(",");
    if (parts.length >= 2) {
      city = parts[1].trim();
    }
  }

  return (
    <View className="flex-1 flex-col items-center p-2 justify-center">
      {/* Photo or icon */}
      <View className="flex-1 w-full min-h-[120px] mt-2 p-6 justify-center items-center">
        {match.renter_profile_photo && match.renter_profile_photo !== "NaN" ? (
          <Image
            source={{ uri: match.renter_profile_photo }}
            className="h-full aspect-square w-auto rounded-xl"
            style={{ resizeMode: "cover" }}
          />
        ) : (
          <View className="h-full aspect-square w-auto rounded-xl bg-gray-200 justify-center items-center mb-6">
            <MaterialIcons size={96} name="person" color="#505050" />
          </View>
        )}
      </View>
      <View className="w-full p-2">
        {/* Name */}
        <Text className="text-3xl font-bold text-left w-full mb-0.5">
          {match.renter_first_name} {match.renter_last_name}
        </Text>
        {/* City and Dates */}
        {city && (
          <View className="flex-row items-center mb-2">
            <MaterialIcons size={16} name={"location-on"} color={"#505050"} />
            <Text className=" text-gray-700 ml-1">Staying in {city}</Text>
          </View>
        )}
      </View>
      <View className="bg-white rounded-xl border border-gray-200 p-4 w-full mb-4">
        <Text className="text-sm font-semibold">Stay Duration</Text>
        <Text className="text-2xl font-semibold mb-3">
          {formatDate(match.start_date)} - {formatDate(match.end_date)}
        </Text>

        <Text className="text-sm font-semibold">Budget</Text>
        <Text className="text-2xl font-bold mb-1">
          ${Math.round(match.budget).toLocaleString()}{" "}
          <Text className="font-normal text-base text-gray-500">/ month</Text>
        </Text>

        <View className="h-px bg-gray-200 my-4 w-full" />

        <Text className="text-sm font-semibold">Looking for</Text>
        <Text className="text-2xl font-semibold mb-1">
          {match.num_bedrooms} Beds, {match.num_bathrooms} Baths
        </Text>
        {match.building_type && (
          <Text className="mb-1 text-gray-700">{match.building_type}</Text>
        )}
      </View>

      {/* no space for this :( */}
      {/* <View className="bg-white rounded-xl border border-gray-200 p-6 w-full mb-3 min-h-[64px]">
        <Text className="font-bold mb-1">Bio</Text>
        <Text className="text-gray-700" numberOfLines={2} ellipsizeMode="tail">
          {match.bio || "No bio provided."}
        </Text>
      </View> */}
    </View>
  );
}
