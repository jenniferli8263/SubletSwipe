import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { apiPost } from "@/lib/api";

// Explicitly type Input and Button as React.ComponentType<any>
let Input: React.ComponentType<any>,
  Button: React.ComponentType<any>,
  Select: React.ComponentType<any>,
  Checkbox: React.ComponentType<any>;
try {
  Input = require("@/components/ui/input").Input;
  Button = require("@/components/ui/button").Button;
  Select = require("@/components/ui/select").Select;
  Checkbox = require("@/components/ui/checkbox").Checkbox;
} catch {
  Input = (props: any) => (
    <TextInput
      {...props}
      style={[
        {
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          backgroundColor: "#fafafa",
        },
        props.style,
      ]}
      placeholderTextColor="#888"
    />
  );
  Button = (props: any) => (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={props.disabled}
      style={[
        {
          backgroundColor: props.disabled ? "#ccc" : "#15803d",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 8,
        },
        props.style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
        {props.children}
      </Text>
    </TouchableOpacity>
  );
  Select = (props: any) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fafafa",
      }}
    >
      <Text style={{ padding: 12, color: "#888" }}>{props.placeholder}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onValueChange}
        placeholder={props.placeholder}
        style={{ padding: 12 }}
      />
    </View>
  );
  Checkbox = (props: any) => (
    <TouchableOpacity
      onPress={() => props.onValueChange(!props.value)}
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderWidth: 2,
          borderColor: "#15803d",
          borderRadius: 4,
          backgroundColor: props.value ? "#15803d" : "#fff",
          marginRight: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {props.value ? (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>
        ) : null}
      </View>
      <Text>{props.label}</Text>
    </TouchableOpacity>
  );
}

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Non-binary", value: "non-binary" },
  { label: "Prefer not to say", value: "prefer not to say" },
  { label: "Other", value: "other" },
];
const buildingTypes = [
  { label: "Apartment", value: 1 },
  { label: "House", value: 2 },
  { label: "Condo", value: 3 },
];
const amenitiesList = [
  { label: "WiFi", value: 1 },
  { label: "AC", value: 2 },
  { label: "Laundry", value: 3 },
  { label: "Parking", value: 4 },
  { label: "Gym", value: 5 },
];
const photoOptions = [
  { label: "Hallway.jpg", value: "hallway.jpg" },
  { label: "Kitchen.jpg", value: "kitchen.jpg" },
  { label: "Bedroom.jpg", value: "bedroom.jpg" },
];

export default function AddListingScreen() {
  const [form, setForm] = useState({
    user_id: "",
    locations_id: "",
    start_date: "",
    end_date: "",
    target_gender: "",
    asking_price: "",
    num_bedrooms: "",
    num_bathrooms: "",
    pet_friendly: false,
    utilities_incl: false,
    description: "",
    building_type_id: "",
    amenities: [] as number[],
    photos: [] as string[],
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleToggleAmenity = (id: number) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(id)
        ? f.amenities.filter((a) => a !== id)
        : [...f.amenities, id],
    }));
  };
  const handleTogglePhoto = (name: string) => {
    setForm((f) => ({
      ...f,
      photos: f.photos.includes(name)
        ? f.photos.filter((p) => p !== name)
        : [...f.photos, name],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        user_id: Number(form.user_id),
        locations_id: Number(form.locations_id),
        asking_price: Number(form.asking_price),
        num_bedrooms: Number(form.num_bedrooms),
        num_bathrooms: Number(form.num_bathrooms),
        building_type_id: form.building_type_id
          ? Number(form.building_type_id)
          : undefined,
        amenities: form.amenities,
        photos: form.photos.map((label) => ({ url: label, label })),
        start_date: form.start_date,
        end_date: form.end_date,
        target_gender: form.target_gender,
        pet_friendly: Boolean(form.pet_friendly),
        utilities_incl: Boolean(form.utilities_incl),
        description: form.description,
      };
      await apiPost("/listings", payload);
      setMessage("Listing created!");
    } catch (e: any) {
      setMessage(e.message || "Error creating listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-8">
      <View className="bg-white rounded-2xl shadow p-6">
        <Text className="text-4xl font-bold mb-6">Add a Listing</Text>
        {/* Dates */}
        <Text className="mb-1">Start Date</Text>
        <Input
          placeholder="YYYY-MM-DD"
          value={form.start_date}
          onChangeText={(v: string) => handleChange("start_date", v)}
          className="mb-4"
        />
        <Text className="mb-1">End Date</Text>
        <Input
          placeholder="YYYY-MM-DD"
          value={form.end_date}
          onChangeText={(v: string) => handleChange("end_date", v)}
          className="mb-4"
        />
        <Text className="mb-1">Monthly Rent</Text>
        <Input
          placeholder="$"
          value={form.asking_price}
          onChangeText={(v: string) => handleChange("asking_price", v)}
          className="mb-4"
          keyboardType="numeric"
        />
        <View className="flex-row items-center mb-4">
          <Checkbox
            value={form.utilities_incl}
            onValueChange={(v) => handleChange("utilities_incl", v)}
            label="Utilities Included"
          />
        </View>
        <View className="h-px bg-gray-200 my-4" />
        {/* Address */}
        <Text className="mb-1">Address</Text>
        <Input
          placeholder="Search"
          value={form.address}
          onChangeText={(v: string) => handleChange("address", v)}
          className="mb-4"
        />
        <Text className="mb-1">Bedrooms</Text>
        <Input
          placeholder="#"
          value={form.num_bedrooms}
          onChangeText={(v: string) => handleChange("num_bedrooms", v)}
          className="mb-4"
          keyboardType="numeric"
        />
        <Text className="mb-1">Bathrooms</Text>
        <Input
          placeholder="#"
          value={form.num_bathrooms}
          onChangeText={(v: string) => handleChange("num_bathrooms", v)}
          className="mb-4"
          keyboardType="numeric"
        />
        <Text className="mb-1">Building Type</Text>
        <Select
          placeholder="Select"
          value={form.building_type_id}
          onValueChange={(v: string) => handleChange("building_type_id", v)}
          options={buildingTypes}
        />
        <View className="h-px bg-gray-200 my-4" />
        {/* Amenities */}
        <Text className="mb-1">Amenities</Text>
        <Select
          placeholder="Add an amenity"
          value={""}
          onValueChange={(v: string) => handleToggleAmenity(Number(v))}
          options={amenitiesList.filter(
            (a) => !form.amenities.includes(a.value)
          )}
        />
        <View className="flex-row flex-wrap mb-4">
          {form.amenities.map((id) => {
            const label =
              amenitiesList.find((a) => a.value === id)?.label || id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => handleToggleAmenity(id)}
                className="bg-green-700 px-3 py-1 rounded-full mr-2 mb-2"
              >
                <Text className="text-white text-sm">{label} ✕</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text className="mb-1">Target Gender</Text>
        <Select
          placeholder="No preference"
          value={form.target_gender}
          onValueChange={(v: string) => handleChange("target_gender", v)}
          options={genderOptions}
        />
        <View className="flex-row items-center mb-4">
          <Checkbox
            value={form.pet_friendly}
            onValueChange={(v) => handleChange("pet_friendly", v)}
            label="Pet Friendly"
          />
        </View>
        <Text className="mb-1">Description</Text>
        <Input
          placeholder="Text"
          value={form.description}
          onChangeText={(v: string) => handleChange("description", v)}
          className="mb-4"
          multiline
          numberOfLines={3}
        />
        <Text className="mb-1">Photos</Text>
        <Select
          placeholder="Add a photo"
          value={""}
          onValueChange={(v: string) => handleTogglePhoto(v)}
          options={photoOptions.filter((p) => !form.photos.includes(p.value))}
        />
        <View className="flex-row flex-wrap mb-4">
          {form.photos.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => handleTogglePhoto(name)}
              className="bg-green-700 px-3 py-1 rounded-full mr-2 mb-2"
            >
              <Text className="text-white text-sm">{name} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button
          onPress={handleSubmit}
          disabled={loading}
          className="mt-2 w-full rounded-full h-12 justify-center items-center text-lg"
        >
          {loading ? "Submitting..." : "Create Listing"}
        </Button>
        {!!message && (
          <Text className="mt-4 text-center text-green-700 font-bold">
            {message}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
