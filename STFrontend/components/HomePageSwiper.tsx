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
import { useRouter } from "expo-router";
import ListingCardContent from "./ListingCardContent";
import RenterCardContent from "./RenterCardContent";
import Button from "./ui/Button";

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
  onFetchRecommendations?: () => Promise<void>;
  resourceId?: number;
}

export default function HomePageSwiper({
  matches,
  loading,
  error,
  swiperRef,
  isRenter,
  onFetchRecommendations,
  resourceId,
}: HomePageSwiperProps) {
  const [showOutOfMatches, setShowOutOfMatches] = useState(false);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const bottomBarHeight = useBottomTabBarHeight();

  const handleSwipeLeft = (i: number) => {
    console.log("swiped left on ", matches[i]);
  };

  const handleSwipeRight = (i: number) => {
    console.log("swiped right on ", matches[i]);
  };

  const handleGetRecommendations = async () => {
    if (!onFetchRecommendations) return;

    setRecommendationsLoading(true);
    try {
      await onFetchRecommendations();
      setShowOutOfMatches(false);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  if (loading || recommendationsLoading) {
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
        <View className="absolute inset-0 justify-center items-center z-10 bg-white">
          <View className="items-center px-8">
            <Text className="text-2xl font-bold text-gray-400 text-center mb-6">
              Out of {isRenter ? "listings" : "renters"} :(
            </Text>

            {/* Show recommendation button only for renters */}
            {isRenter && onFetchRecommendations && (
              <Button
                onPress={handleGetRecommendations}
                disabled={recommendationsLoading}
                className="bg-green-500 px-6 py-3 rounded-full"
                activeOpacity={0.8}
              >
                {recommendationsLoading
                  ? "Loading..."
                  : "See what others are swiping on"}
              </Button>
            )}
          </View>
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
            renderCard={(match: any) => (
              <SwiperCard
                match={match}
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
  match,
  swiperRef,
  isRenter,
  height,
}: {
  match: any;
  swiperRef: React.RefObject<any>;
  isRenter: boolean;
  height: number;
}) {
  const router = useRouter();
  return (
    <View
      style={{ top: -24, height }}
      className="w-[90vw] max-w-xl bg-white rounded-2xl p-7 flex flex-col shadow-md mx-auto justify-center mb-10"
    >
      {/* Content area, clips overflow*/}
      <TouchableOpacity
        style={{ flex: 1, overflow: "hidden" }}
        activeOpacity={0.85}
        onPress={() => router.push(`/listing-details/${match.id}`)}
      >
        {isRenter ? (
          <ListingCardContent match={match} />
        ) : (
          <RenterCardContent match={match} />
        )}
      </TouchableOpacity>
      {/* Buttons*/}
      <View className="flex-row justify-center w-full mt-2 mb-0">
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mx-4"
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <MaterialIcons size={28} name="highlight-off" color="#505050" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mx-4"
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <MaterialIcons size={28} name="favorite-border" color="#505050" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
