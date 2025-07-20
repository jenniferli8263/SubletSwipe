import React, { useEffect, useState, useCallback, useRef } from "react";
import { apiGet } from "@/lib/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

import { useActiveRole } from "../../components/ActiveRoleContext";
import HomePageSwiper from "../../components/HomePageSwiper";
import { View, TouchableOpacity, Text } from "react-native";

export default function TabsHome() {
  const { isRenter, resourceId } = useActiveRole();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const swiperRef = useRef<any>(null);
  const { user, signOut } = useAuth();

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
      setMatches(data.recommendations || []);
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
      {/* Header with Logout Button */}
      <View className="flex-row justify-end items-center px-4 pt-4 pb-2">
        <TouchableOpacity
          onPress={signOut}
          className="p-2 rounded-full bg-gray-100"
          accessibilityLabel="Logout"
        >
          <MaterialIcons name="logout" size={24} color="#166534" />
        </TouchableOpacity>
      </View>
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
