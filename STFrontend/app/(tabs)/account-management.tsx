import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { UserCircle2 } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext"; // Adjust import path if needed
import { useActiveRole } from "@/components/ActiveRoleContext"; // Adjust import path if needed
import { apiGet } from "@/lib/api";
import ResourceInfoCard from "@/components/ResourceInfoCard";
import { useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { apiDelete } from "@/lib/api";


const AccountSidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    isRenter,
    setIsRenter,
    renterProfileId,
    listingIds,
    setResourceId,
    resourceId,
  } = useActiveRole();

  const [resourceInfo, setResourceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);


  const router = useRouter();

  useEffect(() => {
    const url = `/${isRenter ? "renters" : "listings"}/${resourceId}`;
    const fetchResourceInfo = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const data = await apiGet(url);
        setResourceInfo(data);
      } catch (e: any) {
        setError(e.message || "Error fetching resource info");
      } finally {
        setLoading(false);
      }
    };
    fetchResourceInfo();
  }, [user, isRenter, resourceId]);

  const menuItems = ["Manage Roles", "Settings"];

  const handlePress = (item: string) => {
    if (item === "Manage Roles") {
      router.push("/user-details/user-roles");
    } else {
      console.log("Clicked:", item);
    }
  };

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

  return (
    <View className="w-full min-h-screen bg-white p-8 relative">
      <View className="flex-row justify-between align-middle mb-8">
        <View className="flex-row items-center gap-3 mx-2">
          <UserCircle2 size={32} color="black" />
          <View>
            <Text className="font-semibold text-2xl">
              {user ? `${user.first_name} ${user.last_name}` : "Guest User"}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-end items-center px-2 pt-2 pb-2">
          <TouchableOpacity
            onPress={signOut}
            className="p-2 rounded-full bg-gray-100"
            accessibilityLabel="Logout"
          >
            <MaterialIcons name="logout" size={24} color="#166534" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="font-bold p-2">Current Role:</Text>
      <View className="pb-4">
        <ResourceInfoCard
          isRenter={isRenter}
          resourceInfo={resourceInfo}
          error={error}
        />
      </View>
      {/* Removed Switch Roles ButtonDropdown here */}
      <Button
        className={`mb-3 rounded-md w-full py-3 items-center text-green-800`}
        onPress={() => router.push("/user-details/user-roles")}
      >
        Manage Roles
      </Button>

      <Button
        className="rounded-md bg-white border border-red-600 py-3 items-center"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-red-600 font-bold text-lg">Delete Account</Text>
      </Button>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}>
          <View className="bg-white rounded-lg p-6 mx-4 w-80">
            <Text className="text-lg font-semibold mb-4">
              Are you sure you want to delete your account?
            </Text>

            <View className="flex-row justify-end space-x-4">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 rounded-md border border-gray-300"
              >
                <Text className="text-gray-700">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  setModalVisible(false);
                  try {
                    if (!user) throw new Error("User not logged in");
                    await apiDelete(`/users/${user.id}`);
                    console.log("User deleted successfully");
                    signOut();
                    router.push("/");
                  } catch (error: any) {
                    console.error("Failed to delete user:", error.message || error);
                  }
                }}
                className="px-4 py-2 rounded-md bg-red-600"
              >
                <Text className="text-white font-bold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountSidebar;
