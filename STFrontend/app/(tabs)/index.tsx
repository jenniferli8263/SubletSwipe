import React, { useEffect, useState, useCallback, useRef } from "react";
import { apiGet } from "@/lib/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

import { useActiveRole } from "../../components/ActiveRoleContext";
import HomePageSwiper from "../../components/HomePageSwiper";
import { View } from "react-native";

export default function TabsHome() {
  const { isRenter, resourceId } = useActiveRole();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const swiperRef = useRef<any>(null);
  const { user } = useAuth();

  const fetchMatches = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      const url = `/${isRenter ? "renters" : "listings"}/${resourceId}/${
        isRenter ? "listing_matches" : "renter_matches"
      }`;
      console.log(url);
      const data = await apiGet(url);
      console.log(data);
      setMatches(data.matches || []);
    } catch (e: any) {
      setError(e.message || "Error fetching matches");
    } finally {
      setLoading(false);
    }
  }, [user, isRenter, resourceId]);

  const fetchRecommendations = useCallback(async () => {
    if (!isRenter || !resourceId) return;

    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/listings/recommendations/${resourceId}`);
      console.log("Recommendations:", data);

      // Process recommendations to parse photos field
      const processedRecommendations = (data.recommendations || []).map(
        (listing: any) => {
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

          // Extract first photo URL for ListingCardContent
          let photoUrl = null;
          if (photos.length > 0 && photos[0].url) {
            photoUrl = photos[0].url;
          }

          console.log("Processed listing:", {
            id: listing.id,
            photos: photos,
            photoUrl: photoUrl,
          });

          return {
            ...listing,
            photos: photos,
            photo_url: photoUrl,
          };
        }
      );

      setMatches(processedRecommendations);
    } catch (e: any) {
      setError(e.message || "Error fetching recommendations");
    } finally {
      setLoading(false);
    }
  }, [isRenter, resourceId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return (
    <View className="flex-1 bg-white">
      <HomePageSwiper
        matches={matches}
        loading={loading}
        error={error}
        swiperRef={swiperRef}
        isRenter={isRenter}
        onFetchRecommendations={isRenter ? fetchRecommendations : undefined}
        resourceId={resourceId}
      />
    </View>
  );
}
