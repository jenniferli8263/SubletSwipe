import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { apiPut } from "@/lib/api";

let Input: React.ComponentType<any>, Button: React.ComponentType<any>;
try {
  Input = require("@/components/ui/input").Input;
  Button = require("@/components/ui/button").Button;
} catch {
  Input = (props: any) => (
    <TextInput
      {...props}
      style={[
        {
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          borderRadius: 4,
          marginBottom: 8,
        },
        props.style,
      ]}
    />
  );
  Button = (props: any) => (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={props.disabled}
      style={[
        {
          backgroundColor: props.disabled ? "#ccc" : "#ef4444",
          padding: 12,
          borderRadius: 4,
          alignItems: "center",
          marginBottom: 8,
        },
        props.style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>
        {props.children}
      </Text>
    </TouchableOpacity>
  );
}

export default function DeactivateListingScreen() {
  const [listingId, setListingId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      await apiPut(`/listings/${listingId}/deactivate/${userId}`);
      setMessage("Listing deactivated!");
    } catch (e: any) {
      setMessage(e.message || "Error deactivating listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Deactivate Listing</Text>
      <Input
        placeholder="Listing ID"
        value={listingId}
        onChangeText={(v: string) => setListingId(v)}
        className="mb-2"
      />
      <Input
        placeholder="User ID"
        value={userId}
        onChangeText={(v: string) => setUserId(v)}
        className="mb-2"
      />
      <Button
        onPress={handleSubmit}
        disabled={loading || !listingId || !userId}
        className="mt-2"
      >
        {loading ? "Deactivating..." : "Deactivate Listing"}
      </Button>
      {!!message && (
        <Text className="mt-4 text-center text-red-500">{message}</Text>
      )}
    </View>
  );
}
