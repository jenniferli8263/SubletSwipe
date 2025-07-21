import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { apiGet, apiPut } from "@/lib/api";
import ResourceInfoCard from "@/components/ResourceInfoCard";
import { useAuth } from "@/contexts/AuthContext";
import { router, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/ui/Button";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { useActiveRole } from "@/components/ActiveRoleContext";
import ButtonDropdown from "@/components/ui/ButtonDropdown";

/*
function RightActions(
  progress: SharedValue<number>,
  dragX: SharedValue<number>
) {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: dragX.value + 50 }],
    };
  });

  return (
    <Reanimated.View
      style={[{ flexDirection: "row", height: "100%" }, styleAnimation]}
    >
      <TouchableOpacity className="flex-1 bg-green-800 justify-center items-center">
        <MaterialIcons name="edit" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-red-800 justify-center items-center">
        <MaterialIcons name="delete" size={28} color="#fff" />
      </TouchableOpacity>
    </Reanimated.View>
  );
}
*/

function SectionCard({
  isRenter,
  resourceInfo,
  error,
  reloadRoles,
}: {
  isRenter: boolean;
  resourceInfo: any;
  error?: string;
  reloadRoles: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current; // -100 = offscreen left

  const handlePress = () => {
    setShowActions((prev) => !prev);
    Animated.timing(slideAnim, {
      toValue: showActions ? -100 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const { user } = useAuth();
  const router = useRouter();
  const activeRole = useActiveRole();
  const { setIsRenter, setResourceId } = useActiveRole();

  // Determine if this card is the currently equipped role
  const isActiveRole =
    !!resourceInfo &&
    ((isRenter &&
      activeRole.isRenter &&
      resourceInfo.id === activeRole.resourceId) ||
      (!isRenter &&
        !activeRole.isRenter &&
        resourceInfo.id === activeRole.resourceId));

  const update = async () => {
    if (isRenter) {
      //TODO: update renter page
    }
    if (!isRenter) {
      router.push({
        pathname: "/forms/update-listing",
        params: { listingId: resourceInfo.id },
      });
    }
  };
  const deactivate = async () => {
    try {
      if (isRenter) {
        await apiPut(`/renters/${resourceInfo.id}/deactivate/${user?.id}`);
      }
      if (!isRenter) {
        await apiPut(`/listings/${resourceInfo.id}/deactivate/${user?.id}`);
      }
      if (reloadRoles) reloadRoles();
    } catch (e) {
      console.error("Failed to deactivate", e);
    }
  };
  const setActive = () => {
    console.log(isRenter, resourceInfo.id);
    setIsRenter(isRenter);
    setResourceId(resourceInfo.id);
  };

  return (
    <View className="relative overflow-hidden rounded-xl bg-white">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        className="bg-white"
      >
        <ResourceInfoCard
          isRenter={isRenter}
          error={error}
          resourceInfo={resourceInfo}
          isActiveRole={isActiveRole}
        />
      </TouchableOpacity>
      <Animated.View
        style={{
          backgroundColor: "white",
          height: "100%",
          width: "75%",
          position: "absolute",
          left: 0,
          transform: [{ translateX: slideAnim }],
          flexDirection: "row",
          opacity: slideAnim.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 1],
          }),
        }}
        pointerEvents={showActions ? "auto" : "none"}
      >
        {/* Set Active button for listings only, if not already active */}
        <Pressable
          onPress={setActive}
          className={
            "flex-1 justify-center items-center px-4 h-full m-0 " +
            (!isActiveRole ? "bg-green-800" : "bg-gray-400")
          }
        >
          <MaterialIcons name="check-circle" size={28} color="#fff" />
        </Pressable>
        <Pressable
          onPress={update}
          className="flex-1 bg-blue-500 justify-center items-center px-4 h-full m-0"
        >
          <MaterialIcons name="edit" size={28} color="#fff" />
        </Pressable>
        <Pressable
          onPress={deactivate}
          className={
            "flex-1  justify-center items-center px-4 h-full m-0 " +
            (!isActiveRole && resourceInfo.is_active
              ? "bg-red-800"
              : "bg-gray-400")
          }
        >
          <MaterialIcons name="delete" size={28} color="#fff" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function UserRoles() {
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [listingsError, setListingsError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    isRenter,
    setIsRenter,
    renterProfileId,
    listingIds,
    setResourceId,
    resourceId,
  } = useActiveRole();

  const reloadRoles = () => {
    if (!userId) return;
    setLoading(true);
    let finished = 0;
    const fetchProfile = async () => {
      try {
        const profileIdData = await apiGet(`/users/${userId}/renter_profile`);
        const profileId = profileIdData.renter_profile_id;
        if (profileId) {
          const profileData = await apiGet(`/renters/${profileId}`);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (e: any) {
        setProfileError(e.message || "Error fetching renter profile");
      } finally {
        finished++;
        if (finished === 2) setLoading(false);
      }
    };
    const fetchListings = async () => {
      try {
        const idsData = await apiGet(`/users/${userId}/listings`);
        const listingIds = idsData.listing_ids ?? [];
        if (listingIds.length > 0) {
          const results = await Promise.all(
            listingIds.map((id: number) => apiGet(`/listings/${id}`))
          );
          setListings(results);
        } else {
          setListings([]);
        }
      } catch (e: any) {
        setListingsError(e.message || "Error fetching listings");
      } finally {
        finished++;
        if (finished === 2) setLoading(false);
      }
    };
    fetchProfile();
    fetchListings();
  };

  useEffect(() => {
    reloadRoles();
  }, [userId]);

  // Build resource options for dropdown
  const resourceOptions = [
    ...(renterProfileId !== null
      ? [
          {
            label: `Renter Profile ${renterProfileId}`,
            value: renterProfileId,
            type: "renter",
          },
        ]
      : []),
    ...listingIds.map((id) => ({
      label: `Listing ${id}`,
      value: id,
      type: "listing",
    })),
  ];

  if (!userId) return <Text>Please log in to view your roles.</Text>;
  if (loading) return <LoadingSpinner message="" />;

  return (
    <View className="w-full min-h-screen bg-white p-5">
      {/* Sticky Header with Back Button */}
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
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <MaterialIcons name="arrow-back" size={24} color="#166534" />
        </TouchableOpacity>
      </View>
      <View className="pt-16">
        {/* Renter Profile Section */}
        <View className="mb-4 mt-2">
          <Text className="uppercase text-gray-400 font-bold tracking-widest mb-2">
            Renter Profile
          </Text>
          {profileError ? (
            <SectionCard
              isRenter={true}
              resourceInfo={null}
              error={profileError}
              reloadRoles={reloadRoles}
            />
          ) : profile ? (
            <SectionCard
              isRenter={true}
              resourceInfo={profile}
              reloadRoles={reloadRoles}
            />
          ) : (
            <View className="items-center mt-2">
              <Button
                className={`mb-3 rounded-md w-full bg-green-800 px-4 py-3 items-center`}
                onPress={() => router.push("/forms/renter-profile-personal")}
              >
                Set Up Renter Profile
              </Button>
            </View>
          )}
        </View>
        {/* Listings Section */}
        <View>
          <Text className="uppercase text-gray-400 font-bold tracking-widest mb-2">
            Listings
          </Text>
          {listingsError ? (
            <SectionCard
              isRenter={false}
              resourceInfo={null}
              error={listingsError}
              reloadRoles={reloadRoles}
            />
          ) : listings.length === 0 ? (
            <View className="items-center mt-2">
              <Button
                className={`mb-3 rounded-md w-full bg-green-800 px-4 py-3 items-center`}
                onPress={() => router.push("/forms/add-listing")}
              >
                Create Listing
              </Button>
            </View>
          ) : (
            <>
              {listings.map((listing) => (
                <SectionCard
                  key={listing.id}
                  isRenter={false}
                  resourceInfo={listing}
                  reloadRoles={reloadRoles}
                />
              ))}
              <View className="items-center mt-2">
                <Button
                  className={`mb-3 rounded-md w-full bg-green-800 px-4 py-3 items-center`}
                  onPress={() => router.push("/forms/add-listing")}
                >
                  Create Listing
                </Button>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
