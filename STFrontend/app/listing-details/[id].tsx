import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiGet } from "@/lib/api";
import ImageCarousel from "@/components/ImageCarousel";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MapView, { Marker } from "react-native-maps";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ListingDetailsPage() {
  const { id } = useLocalSearchParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    apiGet(`/listings/${id}`)
      .then((data) => setListing(data))
      .catch((e) => setError(e.message || "Error fetching listing"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator size="large" className="mt-10" />;
  if (error) return <Text className="text-red-500 mt-10">{error}</Text>;
  if (!listing) return <Text className="mt-10">Listing not found.</Text>;

  // Parse photos field
  let photos: any[] = [];
  if (listing.photos) {
    if (typeof listing.photos === "string") {
      try {
        photos = JSON.parse(listing.photos);
      } catch {
        photos = [];
      }
    } else if (Array.isArray(listing.photos)) {
      photos = listing.photos;
    }
  }
  // Parse amenities field
  let amenities: string[] = [];
  if (listing.amenities) {
    if (typeof listing.amenities === "string") {
      try {
        amenities = JSON.parse(listing.amenities);
      } catch {
        amenities = [];
      }
    } else if (Array.isArray(listing.amenities)) {
      amenities = listing.amenities;
    }
  }
  console.log(listing);

  const handleOpenMaps = () => {
    if (listing.latitude && listing.longitude) {
      const lat = listing.latitude;
      const lng = listing.longitude;
      const label = encodeURIComponent(
        listing.address_string || "Listing Location"
      );
      let url = "";
      if (Platform.OS === "ios") {
        url = `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`;
      } else {
        url = `geo:${lat},${lng}?q=${label}`;
      }
      Linking.openURL(url);
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
          Listing Details
        </Text>
      </View>
      <ScrollView className="flex-1 bg-white pt-16">
        {/* Image carousel */}
        <ImageCarousel photos={photos} />
        {/* Main Details Section */}
        <View className="px-4 py-6">
          <Text className="text-3xl font-extrabold mb-1 text-gray-900">
            {listing.first_name ? `${listing.first_name}'s Place` : "Place"}
          </Text>
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="location-on" size={16} color="#888" />
            <Text className="ml-1 text-base text-gray-600">
              {listing.address_string}
            </Text>
          </View>
          <View className="flex-row items-end mb-2">
            <Text className="text-3xl font-extrabold text-green-800">
              ${Math.round(listing.asking_price).toLocaleString()}
            </Text>
            <Text className="text-lg text-gray-500 font-semibold ml-1">
              /month
            </Text>
          </View>
          <View className="flex-row items-center mb-6">
            <MaterialIcons name="calendar-today" size={18} color="#888" />
            <Text className="ml-1 text-base text-gray-700">
              {formatDate(listing.start_date)} – {formatDate(listing.end_date)}
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <View className="flex-row items-center mr-4">
              <MaterialIcons name="king-bed" size={18} color="#888" />
              <Text className="ml-1 text-base text-gray-700">
                {listing.num_bedrooms} Beds
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="bathtub" size={18} color="#888" />
              <Text className="ml-1 text-base text-gray-700">
                {listing.num_bathrooms} Baths
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="apartment" size={18} color="#888" />
            <Text className="ml-1 text-base text-gray-700">
              {listing.building_type}
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="pets" size={18} color="#888" />
            <Text className="ml-1 text-base text-gray-700">
              Pet Friendly: {listing.pet_friendly ? "Yes" : "No"}
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="bolt" size={18} color="#888" />
            <Text className="ml-1 text-base text-gray-700">
              Utilities Included: {listing.utilities_incl ? "Yes" : "No"}
            </Text>
          </View>
          {listing.target_gender && (
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="wc" size={18} color="#888" />
              <Text className="ml-1 text-base text-gray-700">
                Preferred Gender:{" "}
                {listing.target_gender.charAt(0).toUpperCase() +
                  listing.target_gender.slice(1)}
              </Text>
            </View>
          )}
        </View>
        {/* Divider */}
        <View className="h-px bg-gray-200 mb-6 mx-4" />
        {/* Description Section */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-2 text-gray-900">
            Description
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed">
            {listing.description}
          </Text>
        </View>
        {amenities.length > 0 && (
          <>
            {/* Divider */}
            <View className="h-px bg-gray-200 mb-6 mx-4" />
            {/* Amenities Section */}
            <View className="px-4 mb-6">
              <Text className="text-lg font-semibold mb-2 text-gray-900">
                Amenities
              </Text>
              <View className="flex-row flex-wrap">
                {amenities.map((a: string, idx: number) => (
                  <Text
                    key={idx}
                    className="bg-green-700 text-white px-3 py-1 rounded-full mr-2 mb-2 text-xs font-semibold"
                  >
                    {a}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}
        {/* Divider */}
        <View className="h-px bg-gray-200 mb-6 mx-4" />
        {/* Inline Map Section */}
        {listing.latitude && listing.longitude && (
          <View className="px-4 mb-6" style={{ height: 200 }}>
            <Text className="text-lg font-semibold mb-2 text-gray-900">
              Location
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenMaps}
              style={{ borderRadius: 12, overflow: "hidden" }}
            >
              <MapView
                style={{ width: "100%", height: 160 }}
                initialRegion={{
                  latitude: listing.latitude,
                  longitude: listing.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                pointerEvents="none"
              >
                <Marker
                  coordinate={{
                    latitude: listing.latitude,
                    longitude: listing.longitude,
                  }}
                />
              </MapView>
            </TouchableOpacity>
          </View>
        )}
        {/* Divider */}
        <View className="h-px bg-gray-200 mb-6 mx-4" />
        {/* Seller Details Section */}
        <View className="px-4 pb-10">
          <Text className="text-lg font-semibold mb-3 text-gray-900">
            Seller Details
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/profile/${listing.user_id}` as any)}
            className="flex-row items-center"
          >
            {listing.profile_photo !== "NaN" ? (
              <Image
                source={{ uri: listing.profile_photo }}
                className="w-12 h-12 rounded-full mr-4 bg-gray-200"
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <View className="w-12 h-12 rounded-full mr-4 bg-gray-200 justify-center items-center">
                <MaterialIcons name="person" size={24} color="#888" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-base text-gray-900 font-bold">
                {listing.first_name} {listing.last_name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Tap to view profile
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
