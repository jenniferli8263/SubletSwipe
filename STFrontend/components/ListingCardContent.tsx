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

function getTruncatedAddress(address: string) {
  if (!address) return "";
  const parts = address.split(",");
  if (parts.length < 3) return address;
  let truncated = parts.slice(0, 3).join(",");
  const words = truncated.trim().split(" ");
  if (words.length > 2) {
    words.pop();
    words.pop();
    return words.join(" ");
  }
  return truncated;
}

export default function ListingCardContent({ match }: { match: any }) {
  return (
    <View className="flex-1 flex-col p-2">
      <Text className="text-2xl font-bold mb-0.5 text-left">
        {match.lister_name && match.building_type
          ? `${match.lister_name}'s ${match.building_type}`
          : "Listing"}
      </Text>
      <View className="flex-row items-center mb-2">
        <MaterialIcons size={16} name={"location-on"} color={"#505050"} />
        <Text
          className="text-sm text-gray-700 ml-1 flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getTruncatedAddress(match.address_string)}
        </Text>
      </View>
      <View className="border border-gray-200 rounded-lg p-4 w-full my-3 items-start">
        <Text className="text-2xl font-semibold mb">
          ${Math.round(match.asking_price).toLocaleString()}
          <Text className="font-normal text-base text-gray-500"> / month</Text>
        </Text>
        <Text className="text-gray-700 mt-2">
          {formatDate(match.start_date)} - {formatDate(match.end_date)}
        </Text>
        <View className="h-px bg-gray-200 my-4 w-full" />
        <Text className="text-base text-gray-700">
          {match.num_bedrooms} Beds, {match.num_bathrooms} Baths
        </Text>
      </View>
      <View className="flex-1 w-full min-h-[120px] mb-4 my-3">
        {match.photo_url ? (
          <Image
            source={{ uri: match.photo_url }}
            className="flex-1 w-full h-full rounded-xl"
            style={{ resizeMode: "cover" }}
          />
        ) : (
          <View className="flex-1 w-full h-full rounded-xl bg-gray-200 justify-center items-center">
            <Text>No Photo</Text>
          </View>
        )}
      </View>
    </View>
  );
}
