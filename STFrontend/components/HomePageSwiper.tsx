import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LoadingIndicator from "./ui/LoadingIndicator";

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

interface HomePageSwiperProps {
  matches: any[];
  loading: boolean;
  error: string;
  swiperRef: React.RefObject<any>;
  isRenter: boolean;
}

export default function HomePageSwiper({
  matches,
  loading,
  error,
  swiperRef,
  isRenter,
}: HomePageSwiperProps) {
  const [showOutOfMatches, setShowOutOfMatches] = useState(false);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  const bottomBarHeight = useBottomTabBarHeight();

  const handleSwipeLeft = (i: number) => {
    console.log("swiped left on ", matches[i]);
  };

  const handleSwipeRight = (i: number) => {
    console.log("swiped right on ", matches[i]);
  };

  if (loading) {
    return <LoadingIndicator />;
  }
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }
  if (!matches.length) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>No matches found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      {showOutOfMatches && (
        <View
          pointerEvents="none"
          className="absolute inset-0 justify-center items-center z-0"
        >
          <Text className="text-2xl font-bold text-gray-400 text-center">
            Out of {isRenter ? "listings" : "renters"} :(
          </Text>
        </View>
      )}
      <View
        className="flex-1 justify-center items-center w-full"
        onLayout={(e: LayoutChangeEvent) => {
          const totalHeight = e.nativeEvent.layout.height;
          setAvailableHeight(totalHeight - bottomBarHeight);
        }}
      >
        {availableHeight !== null && (
          <Swiper
            ref={swiperRef}
            cards={matches}
            renderCard={(rec: any) => (
              <SwiperCard
                rec={rec}
                swiperRef={swiperRef}
                isRenter={isRenter}
                height={availableHeight}
              />
            )}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            showSecondCard={true}
            onSwipedLeft={handleSwipeLeft}
            onSwipedRight={handleSwipeRight}
            onSwipedAll={() => setShowOutOfMatches(true)}
            disableTopSwipe
            disableBottomSwipe
            verticalSwipe={false}
            horizontalSwipe={true}
          />
        )}
      </View>
    </View>
  );
}

function SwiperCard({
  rec,
  swiperRef,
  isRenter,
  height,
}: {
  rec: any;
  swiperRef: React.RefObject<any>;
  isRenter: boolean;
  height: number;
}) {
  return (
    <View
      style={{ top: -24, height }}
      className="w-[90vw] max-w-xl bg-white rounded-2xl p-7 flex flex-col shadow-md mx-auto justify-center mb-10"
    >
      {/* Content area, clips overflow*/}
      <View style={{ flex: 1, overflow: "hidden" }}>
        {isRenter ? (
          <ListingCardContent rec={rec} />
        ) : (
          <RenterCardContent rec={rec} />
        )}
      </View>
      {/* Buttons*/}
      <View className="flex-row justify-between w-full mt-2 mb-0">
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center"
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <MaterialIcons size={28} name="highlight-off" color="#505050" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 mx-3 bg-green-800 rounded-lg justify-center items-center h-12">
          <Text className="text-white font-bold">Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center"
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <MaterialIcons size={28} name="favorite-border" color="#505050" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ListingCardContent({ rec }: { rec: any }) {
  return (
    <View className="flex-1 flex-col">
      <Text className="text-2xl font-bold mb-0.5 text-left">
        {rec.lister_name ? `${rec.lister_name}'s Apartment` : "Apartment"}
      </Text>
      <View className="flex-row items-center mb-2">
        <MaterialIcons size={16} name={"location-on"} color={"#505050"} />
        <Text className="text-sm text-gray-700 ml-1">{rec.address_string}</Text>
      </View>
      <View className="border border-gray-200 rounded-lg p-3 w-full mb-2 items-start">
        <View className="flex-row items-end">
          <Text className="text-2xl font-bold text-gray-900">
            ${Math.round(rec.asking_price).toLocaleString()}
          </Text>
          <Text className="text-lg text-gray-500 font-semibold ml-1">
            /month
          </Text>
        </View>
        <Text className="text-sm text-gray-700 mt-1">
          {formatDate(rec.start_date)} - {formatDate(rec.end_date)}
        </Text>
        <View className="h-px bg-gray-200 my-4 w-full" />
        <Text className="text-base text-gray-700">
          {rec.num_bedrooms} Beds, {rec.num_bathrooms} Baths
        </Text>
      </View>
      <View className="flex-1 w-full min-h-[120px] mb-4 mt-2">
        {rec.photo_url ? (
          <Image
            source={{ uri: rec.photo_url }}
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

function RenterCardContent({ rec }: { rec: any }) {
  let city = "";
  if (rec.address_string) {
    const parts = rec.address_string.split(",");
    if (parts.length >= 2) {
      city = parts[1].trim();
    }
  }

  return (
    <View className="flex-1 flex-col items-center px-2 pt-2 justify-center">
      {/* Photo or icon */}
      {rec.renter_profile_photo && rec.renter_profile_photo !== "NaN" ? (
        <Image
          source={{ uri: rec.renter_profile_photo }}
          className="w-40 h-40 rounded-xl mb-6"
          style={{ resizeMode: "cover" }}
        />
      ) : (
        <View className="w-40 h-40 rounded-xl bg-gray-200 justify-center items-center mb-6">
          <MaterialIcons size={128} name="person" color="#505050" />
        </View>
      )}
      <View className="w-full p-2">
        {/* Name */}
        <Text className="text-3xl font-bold text-left w-full mb-0.5">
          {rec.renter_first_name} {rec.renter_last_name}
        </Text>
        {/* City and Dates */}
        {city && (
          <Text className="font-semibold text-base text-left w-full mb-0.5">
            Staying in {city}
          </Text>
        )}
        <Text className="text-base text-gray-700 text-left w-full mb-3">
          {formatDate(rec.start_date)} - {formatDate(rec.end_date)}
        </Text>
      </View>
      {/* Building Card */}
      <View className="bg-white rounded-xl border border-gray-200 p-6 w-full mb-4">
        <Text className="font-bold mb-1">Building</Text>
        <Text className="mb-1">{rec.building_type || "Any"}</Text>
        <Text className="text-gray-700">
          {rec.num_bedrooms} Beds, {rec.num_bathrooms} Baths
        </Text>
      </View>
      {/* Budget Card */}
      <View className="bg-white rounded-xl border border-gray-200 p-6 w-full mb-4">
        <Text className="font-bold mb-1">Budget</Text>
        <Text className="mb-1">
          ${Math.round(rec.budget).toLocaleString()}{" "}
          <Text className="text-gray-500">/month</Text>
        </Text>
      </View>
      {/* About Card - NO SPACE
      <View className="bg-white rounded-xl border border-gray-200 p-6 w-full mb-3 min-h-[64px]">
        <Text className="font-bold mb-1">About</Text>
        <Text className="text-gray-700">{rec.bio || "No bio provided."}</Text>
      </View> */}
    </View>
  );
}
