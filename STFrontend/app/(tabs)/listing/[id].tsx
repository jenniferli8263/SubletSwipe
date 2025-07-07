import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { apiGet } from "@/lib/api";

let Card: React.ComponentType<any>;
try {
  Card = require("@/components/ui/card").Card;
} catch {
  Card = (props: any) => (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          backgroundColor: "#fff",
        },
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
}

export default function ListingDetailsScreen() {
  const [inputId, setInputId] = useState("");
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchListing = async () => {
    if (!inputId) return;
    setLoading(true);
    setError("");
    setListing(null);
    try {
      const data = await apiGet(`/listings/${inputId}`);
      setListing(data);
    } catch (e: any) {
      setError(e.message || "Error fetching listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <View className="mb-4">
        <Text className="mb-2 text-lg">Enter Listing ID</Text>
        <TextInput
          placeholder="Enter Listing ID"
          value={inputId}
          onChangeText={setInputId}
          keyboardType="numeric"
          className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
        />
        <TouchableOpacity
          onPress={fetchListing}
          disabled={!inputId || loading}
          style={{
            backgroundColor: inputId ? "#2563eb" : "#ccc",
            padding: 12,
            borderRadius: 4,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {loading ? "Loading..." : "Enter"}
          </Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" className="my-4" />}
      {error ? <Text className="text-red-500 my-4">{error}</Text> : null}
      {listing && (
        <Card>
          <Text className="text-2xl font-bold mb-2">Listing #{listing.id}</Text>
          <Text className="text-lg mb-1">{listing.address_string}</Text>
          <Text className="mb-1">
            Price:{" "}
            <Text className="font-bold">${listing.asking_price}/month</Text>
          </Text>
          <Text className="mb-1">
            Dates: {listing.start_date} - {listing.end_date}
          </Text>
          <Text className="mb-1">
            Beds: {listing.num_bedrooms} | Baths: {listing.num_bathrooms}
          </Text>
          <Text className="mb-1">
            Pet Friendly: {listing.pet_friendly ? "Yes" : "No"}
          </Text>
          <Text className="mb-1">
            Utilities Included: {listing.utilities_incl ? "Yes" : "No"}
          </Text>
          <Text className="mb-1">Building Type: {listing.building_type}</Text>
          <Text className="mb-1">Description:</Text>
          <Text className="mb-2">{listing.description}</Text>
          {listing.photos &&
            Array.isArray(listing.photos) &&
            listing.photos.length > 0 && (
              <ScrollView horizontal className="mb-2">
                {listing.photos.map((photo: any, idx: number) => (
                  <Image
                    key={idx}
                    source={{ uri: photo.url }}
                    style={{
                      width: 120,
                      height: 90,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  />
                ))}
              </ScrollView>
            )}
          {listing.amenities &&
            Array.isArray(listing.amenities) &&
            listing.amenities.length > 0 && (
              <View className="flex-row flex-wrap mb-2">
                {listing.amenities.map((a: string, idx: number) => (
                  <Text
                    key={idx}
                    className="bg-green-200 text-green-800 px-2 py-1 rounded mr-2 mb-2 text-xs"
                  >
                    {a}
                  </Text>
                ))}
              </View>
            )}
        </Card>
      )}
    </ScrollView>
  );
}
