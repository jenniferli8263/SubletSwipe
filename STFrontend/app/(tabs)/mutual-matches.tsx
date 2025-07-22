import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { apiGet } from "@/lib/api";
import ListingCardContent from "@/components/ListingCardContent";
import RenterCardContent from "@/components/RenterCardContent";
import { useActiveRole } from "@/components/ActiveRoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function MutualMatchesScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isRenter, resourceId } = useActiveRole();
  const { user } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchMatchesWithDetails = async () => {
        // console.log("fetchMatchesWithDetails called");
        // console.log("user:", user, "type:", typeof user);
        // console.log("resourceId:", resourceId, "type:", typeof resourceId);
        // console.log("isRenter:", isRenter, "type:", typeof isRenter);

        // if (!user || resourceId === 0) {
        //   console.log("Early return - missing user or resourceId is 0");
        //   console.log("!user:", !user);
        //   console.log("resourceId === 0:", resourceId === 0);
        //   return;
        // }

        try {
          // Use current user's resourceId instead of hardcoded value
          // console.log(
          //   `/mutual-matches/${isRenter ? "renter" : "listing"}/${resourceId}`
          // );
          const data = await apiGet(
            `/mutual-matches/${isRenter ? "renter" : "listing"}/${resourceId}`
          );
          //console.log("API response:", data);

          // Handle different response structures based on user role
          let listingIds: number[] = [];
          let renterProfileIds: number[] = [];

          if (isRenter) {
            // Renters get listing_ids in response
            listingIds = data.listing_ids || [];
          } else {
            // Landlords get renter_profile_ids
            renterProfileIds = data.renter_profile_ids || [];
            //console.log("Renter profile IDs:", renterProfileIds);
          }

          if (
            (isRenter && listingIds.length === 0) ||
            (!isRenter && renterProfileIds.length === 0)
          ) {
            setMatches([]);
          } else {
            if (isRenter) {
              // For renters: fetch detailed listing information
              const detailedListings = await Promise.all(
                listingIds.map((id) => apiGet(`/listings/${id}`))
              );
              // Simplified photo parsing for each listing
              const listingsWithPhotoUrl = detailedListings.map((match) => {
                const photos =
                  typeof match.photos === "string"
                    ? JSON.parse(match.photos)
                    : match.photos || [];
                return {
                  ...match,
                  photo_url:
                    photos && photos.length > 0 ? photos[0].url : undefined,
                };
              });
              setMatches(listingsWithPhotoUrl);
            } else {
              // For landlords: fetch detailed renter information
              const detailedRenters = await Promise.all(
                renterProfileIds.map((id) => apiGet(`/renters/${id}`))
              );
              // console.log("Detailed renters data:", detailedRenters);
              // console.log("First renter match structure:", detailedRenters[0]);

              // Transform renter data to match RenterCardContent expected format
              const transformedRenters = detailedRenters.map((renter) => ({
                ...renter,
                renter_first_name: renter.first_name,
                renter_last_name: renter.last_name,
                renter_profile_photo: renter.profile_photo,
              }));

              setMatches(transformedRenters);
            }
          }
        } catch (e: any) {
          setError(e.message || "Failed to load matches.");
        } finally {
          setLoading(false);
        }
      };

      fetchMatchesWithDetails();
    }, [user, resourceId, isRenter])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!resourceId) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Loading user data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg">{error}</Text>
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
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-bold mt-8 mb-3 text-center">
        Your Matches
      </Text>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {matches.map((match) => (
          <View
            key={match.id}
            className="w-[90vw] max-w-xl bg-white rounded-2xl p-7 flex flex-col shadow-md mt-4 mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              width: Dimensions.get("window").width * 0.85,
              alignSelf: "center",
              // maxWidth: 448,
            }}
          >
            {/* Landlord Contact Info - only show for renters viewing listings */}
            {isRenter && (
              <View className="mb-4 flex-row items-center">
                {match.profile_photo && match.profile_photo !== "NaN" ? (
                  <View className="mr-3">
                    <Image
                      source={{ uri: match.profile_photo }}
                      className="w-12 h-12 rounded-full bg-gray-200"
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                    />
                  </View>
                ) : (
                  <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 justify-center items-center">
                    <Text className="text-xl text-gray-500 font-bold">
                      {match.first_name ? match.first_name[0] : "?"}
                    </Text>
                  </View>
                )}
                <View>
                  <Text className="text-xl font-bold text-gray-900">
                    {match.first_name} {match.last_name}
                  </Text>
                  {match.email && (
                    <Text className="text-base text-gray-500 mt-0.5">
                      {match.email}
                    </Text>
                  )}
                </View>
              </View>
            )}
            {isRenter ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={{ flex: 1, overflow: "hidden" }}
                onPress={() => router.push(`/listing-details/${match.id}`)}
              >
                <ListingCardContent match={match} />
              </TouchableOpacity>
            ) : (
              <RenterCardContent match={match} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
