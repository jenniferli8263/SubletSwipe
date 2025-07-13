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
import { Background } from "@react-navigation/elements";
import ListingCardContent from "./ListingCardContent";
import RenterCardContent from "./RenterCardContent";

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
