import React from "react";
import { View, Text } from "react-native";

export default function ResourceInfoCard({
  isRenter,
  resourceInfo,
  error,
  isActiveRole = false,
}: {
  isRenter: boolean;
  resourceInfo?: any;
  error?: string;
  isActiveRole?: boolean;
}) {
  // Grey out if deactivated, highlight if active
  let cardClass = "rounded-xl border p-4 ";
  if (isActiveRole) {
    cardClass += " border-green-700 border-2 bg-green-50";
  } else if (resourceInfo?.is_active === false) {
    cardClass += " bg-gray-100 border-gray-200 opacity-50";
  } else {
    cardClass += " bg-white border-gray-200";
  }

  return (
    <View
      className={cardClass}
      style={
        isActiveRole
          ? {
              shadowColor: "#166534",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }
          : undefined
      }
    >
      {error ? (
        <Text className="text-red-600 font-semibold">{error}</Text>
      ) : isRenter ? (
        <>
          <Text className="text-lg font-bold mb-1">Renter</Text>
          <Text className="text-gray-700 mb-1">
            Location: {resourceInfo?.address_string}
          </Text>
          <Text className="text-gray-700 mb-1">
            Budget: $
            {resourceInfo?.budget?.toLocaleString?.() ?? resourceInfo?.budget}{" "}
            /month
          </Text>
        </>
      ) : (
        <>
          <Text className="text-lg font-bold mb-1">Listing</Text>
          <Text className="text-gray-700 mb-1">
            {resourceInfo?.address_string}
          </Text>
          <Text className="text-gray-700 mb-1">
            $
            {resourceInfo?.asking_price?.toLocaleString?.() ??
              resourceInfo?.asking_price}{" "}
            /month
          </Text>
        </>
      )}
    </View>
  );
}
