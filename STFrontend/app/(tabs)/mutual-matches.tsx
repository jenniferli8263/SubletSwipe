import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity} from "react-native";
import { apiGet } from "@/lib/api";

export default function MutualMatchesScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchesWithDetails = async () => {
        try {
        // replace hard coded renter
        const data = await apiGet("/mutual-matches/renter/250");
        const listingIds: number[] = data.listing_ids;

        if (listingIds.length === 0) {
            setMatches([]); 
        } else {
            const detailedListings = await Promise.all(
            listingIds.map((id) => apiGet(`/listings/${id}`))
            );
            setMatches(detailedListings);
        }
        } catch (e: any) {
        setError(e.message || "Failed to load matches.");
        } finally {
        setLoading(false);
        }
    };

    fetchMatchesWithDetails();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
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
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <ScrollView>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Your Matches
        </Text>

        {matches.map((match) => {
            const amenities =
                typeof match.amenities === "string"
                ? JSON.parse(match.amenities)
                : match.amenities || [];

            const photos =
                typeof match.photos === "string"
                    ? JSON.parse(match.photos)
                    : match.photos || [];


            return (
                <TouchableOpacity
                key={match.id}
                // placeholder
                // onPress={() => router.push(`/listing/${match.id}`)}
                activeOpacity={0.8}
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: 16,
                    backgroundColor: "#fff",
                }}
                >
                {photos && photos.length > 0 ? (
                    <Image
                    source={{ uri: photos[0].url }}
                    style={{
                        width: "100%",
                        height: 180,
                        backgroundColor: "#ddd",
                    }}
                    />
                ) : (
                    <View
                    style={{
                        width: "100%",
                        height: 180,
                        backgroundColor: "#eee",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    >
                    <Text style={{ fontSize: 12, color: "#666" }}>No Photos</Text>
                    </View>
                )}

                <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 2 }}>
                    {match.poster_name}
                    </Text>
                    <Text style={{ color: "#666", marginBottom: 4 }}>{match.poster_email}</Text>
                    <Text style={{ marginBottom: 4 }}>{match.address_string}</Text>
                    <Text style={{ color: "#444", marginBottom: 8 }}>{match.description}</Text>
                    <Text style={{ marginBottom: 4 }}>
                    ${match.asking_price?.toFixed(2)} · {match.building_type?.trim()}
                    </Text>
                    <Text style={{ marginBottom: 4 }}>
                    {match.num_bedrooms} bed · {match.num_bathrooms} bath
                    </Text>
                    <Text style={{ marginBottom: 4 }}>
                    {match.start_date} → {match.end_date}
                    </Text>
                    <Text style={{ marginBottom: 4 }}>
                    Pet Friendly: {match.pet_friendly ? "Yes" : "No"}
                    </Text>
                    <Text style={{ marginBottom: 4 }}>
                    Utilities Included: {match.utilities_incl ? "Yes" : "No"}
                    </Text>
                    {amenities.length > 0 && (
                    <Text style={{ marginTop: 6, color: "#555" }}>
                        Amenities: {amenities.join(", ")}
                    </Text>
                    )}
                </View>
                </TouchableOpacity>
            );
        })}
      </ScrollView>
    </View>
  );
}
