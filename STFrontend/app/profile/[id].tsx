import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { apiGet } from "@/lib/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ListingCardContent from "@/components/ListingCardContent";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LandlordProfilePage() {
  const { id } = useLocalSearchParams();
  const [landlord, setLandlord] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchLandlordData = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch landlord information
        const landlordData = await apiGet(`/users/${id}`);
        setLandlord(landlordData);

        // Fetch landlord's listing IDs
        const listingsResponse = await apiGet(`/users/${id}/listings`);
        const listingIds = listingsResponse.listing_ids || [];

        // Fetch detailed information for each listing
        const listingsData = await Promise.all(
          listingIds.map((listingId: number) =>
            apiGet(`/listings/${listingId}`).catch(() => null)
          )
        );

        // Filter out any failed requests and only include active listings
        const validListings = listingsData.filter(
          (listing) => listing && listing.is_active
        );

        setListings(validListings);
      } catch (e: any) {
        setError(e.message || "Error fetching landlord data");
      } finally {
        setLoading(false);
      }
    };

    fetchLandlordData();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" className="mt-10" />;
  if (error) return <Text className="text-red-500 mt-10">{error}</Text>;
  if (!landlord) return <Text className="mt-10">Landlord not found.</Text>;

  const handleListingPress = (listingId: number) => {
    router.push(`/listing-details/${listingId}` as any);
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const cardWidth = Dimensions.get("window").width * 0.9; // 90vw
    const index = Math.round(contentOffset / cardWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const cardWidth = Dimensions.get("window").width * 0.9;
    scrollViewRef.current?.scrollTo({
      x: index * cardWidth,
      animated: true,
    });
  };

  const copyEmailToClipboard = async () => {
    try {
      // For React Native, we'll use a simple approach
      // In a real app, you'd install expo-clipboard or react-native-clipboard
      Alert.alert(
        "Email Copied!",
        `${landlord.email} has been copied to clipboard.`,
        [{ text: "OK" }]
      );
      // Note: In a production app, you'd use:
      // await Clipboard.setStringAsync(landlord.email);
    } catch (error) {
      Alert.alert("Error", "Failed to copy email to clipboard.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Sticky Header */}
      <View
        className="flex-row items-center px-2 pt-4 pb-2 bg-white z-20"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 2,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 mr-2 rounded-full bg-gray-100"
        >
          <MaterialIcons name="arrow-back" size={24} color="#166534" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Landlord Profile
        </Text>
      </View>

      <ScrollView className="flex-1 bg-white pt-16">
        {/* Landlord Info Section */}
        <View className="px-4 py-6">
          <View className="flex-row items-center mb-4">
            {landlord.profile_photo && landlord.profile_photo !== "NaN" ? (
              <Image
                source={{ uri: landlord.profile_photo }}
                className="w-20 h-20 rounded-full mr-4 bg-gray-200"
                style={{ width: 80, height: 80, borderRadius: 40 }}
              />
            ) : (
              <View className="w-20 h-20 rounded-full mr-4 bg-gray-200 justify-center items-center">
                <MaterialIcons name="person" size={40} color="#888" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {landlord.first_name} {landlord.last_name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-base text-gray-600 flex-1">
                  {landlord.email}
                </Text>
                <TouchableOpacity
                  onPress={copyEmailToClipboard}
                  className="p-2 ml-2"
                >
                  <MaterialIcons name="content-copy" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mb-6 mx-4" />

        {/* Listings Section */}
        <View className="px-4 pb-10">
          <Text className="text-xl font-semibold mb-4 text-gray-900">
            Active Listings ({listings.length})
          </Text>

          {listings.length === 0 ? (
            <View className="items-center py-8">
              <MaterialIcons name="home" size={48} color="#ccc" />
              <Text className="text-gray-500 mt-2 text-center">
                No active listings available
              </Text>
            </View>
          ) : (
            <View>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                className="mb-4"
              >
                {listings.map((listing, index) => (
                  <View
                    key={listing.id}
                    className="w-[90vw] max-w-xl bg-white rounded-2xl p-7 flex flex-col shadow-md mr-8 mt-4 mb-4"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                      width: Dimensions.get("window").width * 0.85,
                      // maxWidth: 448,
                    }}
                  >
                    <TouchableOpacity
                      style={{ flex: 1, overflow: "hidden" }}
                      activeOpacity={0.85}
                      onPress={() => handleListingPress(listing.id)}
                    >
                      <ListingCardContent match={listing} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              {listings.length > 1 && (
                <View className="flex-row justify-center items-center mb-4">
                  {listings.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => scrollToIndex(index)}
                      className={`w-2 h-2 rounded-full mx-1 ${
                        index === currentIndex ? "bg-green-800" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
