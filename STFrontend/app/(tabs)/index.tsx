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
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const swiperRef = useRef<any>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const url = `/${isRenter ? "renters" : "listings"}/${resourceId}/${
      isRenter ? "listing_recs" : "renter_recs"
    }`;
    console.log(url);
    const fetchRecs = async () => {
      if (!user) return;

      setLoading(true);
      setError("");
      try {
        const data = await apiGet(url);
        console.log(data);
        setRecs(data.recs || []);
      } catch (e: any) {
        setError(e.message || "Error fetching recs");
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [user, isRenter]);

  return (
    <View className="flex-1 bg-white">
      <HomePageSwiper
        recs={recs}
        loading={loading}
        error={error}
        swiperRef={swiperRef}
        isRenter={isRenter}
      />
    </View>
  );
}
