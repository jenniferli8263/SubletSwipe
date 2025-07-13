import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import MultiSelect from "@/components/ui/MultiSelect";
import { AddressAutocomplete } from "../../components/AddressAutocomplete";

import * as ImagePicker from "expo-image-picker";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/ddmbdyidp/image/upload";
const UPLOAD_PRESET = "sublettinder_photoupload";

export default function AddListingScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    user_id: user?.id || 0,
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
    photos: [] as {url: string, label: string}[],
    raw_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [amenities, setAmenities] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [buildingTypes, setBuildingTypes] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [genderOptions, setGenderOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const loadAmenitiesOptions = async () => {
    const data = await apiGet("/amenities");
    setAmenities(
      data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }))
    );
  };

  const loadBuildingTypesOptions = async () => {
    const data = await apiGet("/building-types");
    setBuildingTypes(
      data.map((item: any) => ({
        value: item.id,
        label: item.type,
      }))
    );
  };

  const loadGenderOptions = async () => {
    const data = await apiGet("/genders");
    setGenderOptions(
      data.map((item: any) => ({
        value: item.gender,
        label: item.gender,
      }))
    );
  };

  useEffect(() => {
    Promise.all([
      loadAmenitiesOptions(),
      loadBuildingTypesOptions(),
      loadGenderOptions(),
    ]);
  }, []);

  // Update user_id when user changes
  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, user_id: user.id }));
    }
  }, [user]);

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
  // const handleTogglePhoto = (name: string) => {
  //   setForm((f) => ({
  //     ...f,
  //     photos: f.photos.includes(name)
  //       ? f.photos.filter((p) => p !== name)
  //       : [...f.photos, name],
  //   }));
  // };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    const newErrors: { [key: string]: string } = {};

    if (!form.raw_address) newErrors.raw_address = "Address is required.";
    if (!form.start_date) newErrors.start_date = "Start date is required.";
    if (!form.end_date) newErrors.end_date = "End date is required.";
    if (!form.asking_price)
      newErrors.asking_price = "Monthly rent is required.";
    if (!form.num_bedrooms)
      newErrors.num_bedrooms = "Number of bedrooms is required.";
    if (!form.num_bathrooms)
      newErrors.num_bathrooms = "Number of bathrooms is required.";
    if (!form.building_type_id)
      newErrors.building_type_id = "Building type is required.";

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (form.start_date && !dateRegex.test(form.start_date)) {
      newErrors.start_date = "Invalid date format (YYYY-MM-DD)";
    }
    if (form.end_date && !dateRegex.test(form.end_date)) {
      newErrors.end_date = "Invalid date format (YYYY-MM-DD)";
    }

    if (
      form.asking_price &&
      (!/^[0-9]+(\.[0-9]+)?$/.test(form.asking_price) ||
        Number(form.asking_price) <= 0)
    ) {
      newErrors.asking_price = "Rent must be a number";
    }
    if (
      form.num_bedrooms &&
      (!/^[0-9]+$/.test(form.num_bedrooms) || Number(form.num_bedrooms) <= 0)
    ) {
      newErrors.num_bedrooms = "Number of bedrooms must be a number";
    }
    if (
      form.num_bathrooms &&
      (!/^[0-9]+$/.test(form.num_bathrooms) || Number(form.num_bathrooms) <= 0)
    ) {
      newErrors.num_bathrooms = "Number of bathrooms must be number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    setErrors({});

    try {
      const payload = {
        ...form,
        user_id: Number(form.user_id),
        asking_price: Number(form.asking_price),
        num_bedrooms: Number(form.num_bedrooms),
        num_bathrooms: Number(form.num_bathrooms),
        building_type_id: form.building_type_id
          ? Number(form.building_type_id)
          : undefined,
        amenities: form.amenities,
        photos: form.photos,
        start_date: form.start_date,
        end_date: form.end_date,
        target_gender: form.target_gender || "prefer not to say",
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

  async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  }

  const handleAddPhoto = async () => {
    // Step 1: Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    // Step 2: Let user pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      mediaTypes: ['images'], // not sure if this might give undefined behaviour because the previous line said "MediaTypeOptions" is deprecated
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];
      const uri = image.uri;
      let fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg'; // Try to extract extension
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        heic: 'image/heic',
        webp: 'image/webp',
      };

      const mimeType = mimeMap[fileExt] ?? 'image/jpeg';
      const base64String = image.base64;
      fileExt = mimeType.split('/')[1];

      if (!base64String) {
        alert("Could not get image data.");
        return;
      }

      const photo = {
        uri,
        type: mimeType,
        name: `photo.${fileExt}`,
      };
      console.log("Photo object before upload:", photo);

      // Step 3: Upload to Cloudinary
      // const formData = new FormData();
      // const formData = new FormData();
      // formData.append("file", {
      //   uri: photo.uri,
      //   type: photo.type,
      //   name: photo.name,
      // } as any);
      // const blob = await uriToBlob(photo.uri);
      // formData.append("file", blob, photo.name);
      // formData.append("upload_preset", UPLOAD_PRESET);
      // formData.append("folder", "sublettinder/listingphotos");
      // Upload using base64
      const formData = new FormData();
      formData.append("file", `data:${mimeType};base64,${base64String}`);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "sublettinder/listingphotos");

      try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Cloudinary upload response:", data);

        if (!data.secure_url) {
          throw new Error("Upload failed");
        }

        // Step 4: Save URL to form
        setForm((f) => ({
          ...f,
          photos: [...f.photos, { url: data.secure_url, label: "" }],
        }));
        console.log("Photo added:", data.secure_url);
      } catch (error) {
        alert("Failed to upload image.");
        console.error("Cloudinary upload error:", error);
      }
    }
    // alert("Add Photo button pressed!");
  };

  return (
    <ScrollView
      className="flex-1 bg-white p-8"
      keyboardShouldPersistTaps="handled"
    >
      <View className="bg-white">
        <Text className="text-4xl font-bold mb-6">Add a Listing</Text>
        {/* Dates */}
        <View className="py-2">
          <Text className="mb-1">Start Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={form.start_date}
            onChangeText={(v: string) => handleChange("start_date", v)}
            className="mb-4"
          />
          {errors.start_date && (
            <Text className="text-red-600 mb-2">{errors.start_date}</Text>
          )}
        </View>
        <View className="py-2">
          <Text className="mb-1">End Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={form.end_date}
            onChangeText={(v: string) => handleChange("end_date", v)}
            className="mb-4"
          />
          {errors.end_date && (
            <Text className="text-red-600 mb-2">{errors.end_date}</Text>
          )}
        </View>
        <View className="py-2">
          <Text className="mb-1">Monthly Rent</Text>
          <Input
            placeholder="$"
            value={form.asking_price}
            onChangeText={(v: string) => handleChange("asking_price", v)}
            className="mb-4"
            keyboardType="numeric"
          />
          {errors.asking_price && (
            <Text className="text-red-600 mb-2">{errors.asking_price}</Text>
          )}
        </View>
        <View className="flex-row items-center mb-4">
          <Checkbox
            value={form.utilities_incl}
            onValueChange={(v: boolean) => handleChange("utilities_incl", v)}
            label="Utilities Included"
          />
        </View>
        <View className="h-px bg-gray-200 my-4" />
        {/* Address */}
        <View className="py-2">
          <Text className="mb-1">Address</Text>
          <AddressAutocomplete
            value={form.raw_address}
            onSubmitCallback={(desc) => handleChange("raw_address", desc)}
          />
          {errors.raw_address && (
            <Text className="text-red-600 mb-2">{errors.raw_address}</Text>
          )}
        </View>
        <View className="py-2">
          <Text className="mb-1">Bedrooms</Text>
          <Input
            placeholder="#"
            value={form.num_bedrooms}
            onChangeText={(v: string) => handleChange("num_bedrooms", v)}
            className="mb-4"
            keyboardType="numeric"
          />
          {errors.num_bedrooms && (
            <Text className="text-red-600 mb-2">{errors.num_bedrooms}</Text>
          )}
        </View>
        <View className="py-2">
          <Text className="mb-1">Bathrooms</Text>
          <Input
            placeholder="#"
            value={form.num_bathrooms}
            onChangeText={(v: string) => handleChange("num_bathrooms", v)}
            className="mb-4"
            keyboardType="numeric"
          />
          {errors.num_bathrooms && (
            <Text className="text-red-600 mb-2">{errors.num_bathrooms}</Text>
          )}
        </View>
        <View className="py-2 z-[30]">
          <Text className="mb-1">Building Type</Text>
          <Select
            placeholder="Select"
            value={form.building_type_id}
            onValueChange={(v) => handleChange("building_type_id", v)}
            options={buildingTypes}
          />
          {errors.building_type_id && (
            <Text className="text-red-600 mb-2">{errors.building_type_id}</Text>
          )}
        </View>
        <View className="h-px bg-gray-200 my-4" />
        <Text className="mb-1">Amenities</Text>
        <View className="z-[20]">
          <MultiSelect
            placeholder="Add an amenity"
            value={form.amenities}
            onValueChange={(arr) => handleChange("amenities", arr)}
            options={amenities}
          />
        </View>
        <View className="flex-row flex-wrap mb-4">
          {form.amenities.map((id) => {
            const label = amenities.find((a) => a.value === id)?.label || id;
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
        <View className="z-[10]">
          <Select
            placeholder="No preference"
            value={form.target_gender}
            onValueChange={(v) => handleChange("target_gender", String(v))}
            options={genderOptions}
            searchable={false}
          />
        </View>
        <View className="flex-row items-center mb-4 mt-4">
          <Checkbox
            value={form.pet_friendly}
            onValueChange={(v: boolean) => handleChange("pet_friendly", v)}
            label="Pet Friendly"
          />
        </View>
        <View className="py-2">
          <Text className="mb-1">Description</Text>
          <Input
            placeholder="Text"
            value={form.description}
            onChangeText={(v: string) => handleChange("description", v)}
            multiline
            numberOfLines={3}
          />
        </View>
        <Text className="mb-1">Photos</Text>
        <Button onPress={handleAddPhoto} className="mb-2">
          Add Photo
        </Button>
        <View className="flex-row flex-wrap mb-4">
          {/* {form.photos.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => handleTogglePhoto(name)}
              className="bg-green-700 px-3 py-1 rounded-full mr-2 mb-2"
            >
              <Text className="text-white text-sm">{name} ✕</Text>
            </TouchableOpacity>
          ))} */}
          {/* {form.photos.map((url) => (
            <Image
              key={url}
              source={{ uri: url }}
              style={{ width: 100, height: 100, marginBottom: 10, borderRadius: 8 }}
            />
          ))} */}
          {form.photos.map((photo, index) => (
            <View key={photo.url} style={{ marginBottom: 12 }}>
              <Image
                source={{ uri: photo.url }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <TextInput
                placeholder="Enter label (e.g., Living Room)"
                value={photo.label}
                onChangeText={(text) => {
                  const newPhotos = [...form.photos];
                  newPhotos[index].label = text;
                  setForm({ ...form, photos: newPhotos });
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 8,
                  marginTop: 4,
                  width: 200,
                }}
              />
            </View>
          ))}

        </View>
        <Button onPress={handleSubmit} disabled={loading}>
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
