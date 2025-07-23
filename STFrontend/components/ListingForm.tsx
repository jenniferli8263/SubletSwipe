import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import MultiSelect from "@/components/ui/MultiSelect";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import DateRangePicker from "@/components/ui/DateRangePicker";
import PhotoUploader from "@/components/ui/PhotoUploader";
import {
  PhotoData,
  UploadedPhoto,
  uploadPhotosToCloudinary,
  deletePhotosFromCloudinary,
} from "@/lib/imageUtils";

export interface ListingFormData {
  user_id: number;
  start_date: string;
  end_date: string;
  target_gender: string;
  asking_price: string;
  num_bedrooms: string;
  num_bathrooms: string;
  pet_friendly: boolean;
  utilities_incl: boolean;
  description: string;
  building_type_id: string;
  amenities: number[];
  photos: PhotoData[]; // Only PhotoData in form state
  raw_address: string;
}

interface ListingFormProps {
  type: string;
  initialValues: ListingFormData;
  onSubmit: (values: ListingFormData) => Promise<void>;
  loading?: boolean;
  message?: string;
  submitLabel?: string;
  externalErrors?: { [key: string]: string }; // ✅ NEW
}

export default function ListingForm({
  type,
  initialValues,
  onSubmit,
  loading = false,
  message = "",
  submitLabel = "Submit",
  externalErrors,
}: ListingFormProps) {
  const [form, setForm] = useState<ListingFormData>(initialValues);
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [amenitiesData, buildingTypesData, genderData] =
          await Promise.all([
            apiGet("/amenities"),
            apiGet("/building-types"),
            apiGet("/genders"),
          ]);

        setAmenities(
          amenitiesData.map((item: any) => ({
            value: item.id,
            label: item.name,
          }))
        );
        setBuildingTypes(
          buildingTypesData.map((item: any) => ({
            value: item.id,
            label: item.type,
          }))
        );
        setGenderOptions(
          genderData.map((item: any) => ({
            value: item.gender,
            label: item.gender,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch options", err);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (externalErrors) {
      setErrors((prev) => ({ ...prev, ...externalErrors }));
    }
  }, [externalErrors]);

  const handleChange = (key: keyof ListingFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleToggleAmenity = (id: number) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const handlePhotosChange = (photos: PhotoData[]) => {
    setForm((prev) => ({ ...prev, photos }));
  };

  // const handleTogglePhoto = (name: string) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     photos: prev.photos.includes(name)
  //       ? prev.photos.filter((p) => p !== name)
  //       : [...prev.photos, name],
  //   }));
  // };

  const handleLocalSubmit = async () => {
    console.log("ListingForm: handleLocalSubmit called", { type, form });
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
    if (!form.target_gender)
      newErrors.target_gender = "Please select a preferred gender.";

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
      newErrors.num_bathrooms = "Number of bathrooms must be a number";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("ListingForm: validation errors", newErrors);
      setErrors(newErrors);
      return;
    }

    let uploadedPhotos: UploadedPhoto[] = [];
    try {
      // For updates, don't upload existing photos - let the parent handle it
      if (type === "update") {
        console.log("ListingForm: update mode, calling onSubmit directly");
        setErrors({});
        await onSubmit(form);
      } else {
        // For new listings, upload all photos
        console.log("ListingForm: add mode, uploading photos");
        uploadedPhotos = await uploadPhotosToCloudinary(form.photos);
        setErrors({});
        await onSubmit({ ...form, photos: uploadedPhotos as any });
      }
    } catch (error) {
      console.log("ListingForm: error in handleLocalSubmit", error);
      // console.error("Submit failed, cleaning up uploaded photos…", error);
      console.log("uploadedPhotos in catch:", uploadedPhotos);
      await deletePhotosFromCloudinary(uploadedPhotos);
      setForm((prev) => ({ ...prev, photos: [] })); // <-- Clear photos
      setErrors({
        form: "Failed to create listing. Photos have been deleted.",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 p-8"
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-4xl font-bold mb-6">
            {type === "add" ? "Add a Listing" : "Update a Listing"}
          </Text>
          <DateRangePicker
            startDate={form.start_date}
            endDate={form.end_date}
            onStartDateChange={(date: string) =>
              handleChange("start_date", date)
            }
            onEndDateChange={(date: string) => handleChange("end_date", date)}
            startDateError={errors.start_date}
            endDateError={errors.end_date}
            checkConstraintError={errors.check_constraint}
            label="Term"
          />
          <View className="py-2">
            <Text className="mb-1 font-medium">Monthly Rent</Text>
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
          <View className="py-2">
            <Text className="mb-1 font-medium">Address</Text>
            <AddressAutocomplete
              value={form.raw_address}
              onSubmitCallback={(desc) => handleChange("raw_address", desc)}
              disabled={type === "update"} // Make read-only during update
            />
            {errors.raw_address && (
              <Text className="text-red-600 mb-2">{errors.raw_address}</Text>
            )}
          </View>
          {/* Bedrooms and Bathrooms side by side */}
          <View className="flex-row gap-4 mt-2">
            <View className="flex-1">
              <Text className="mb-1 font-medium">Bedrooms</Text>
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
            <View className="flex-1">
              <Text className="mb-1 font-medium">Bathrooms</Text>
              <Input
                placeholder="#"
                value={form.num_bathrooms}
                onChangeText={(v: string) => handleChange("num_bathrooms", v)}
                className="mb-4"
                keyboardType="numeric"
              />
              {errors.num_bathrooms && (
                <Text className="text-red-600 mb-2">
                  {errors.num_bathrooms}
                </Text>
              )}
            </View>
          </View>
          <View className="py-2 z-[30]">
            <Text className="mb-1 font-medium">Building Type</Text>
            <Select
              placeholder="Select"
              value={parseInt(form.building_type_id)}
              onValueChange={(v) => handleChange("building_type_id", v)}
              options={buildingTypes}
              disabled={type === "update"} // disable on update
            />
            {errors.building_type_id && (
              <Text className="text-red-600 mb-2">
                {errors.building_type_id}
              </Text>
            )}
          </View>
          <View className="h-px bg-gray-200 my-4" />
          <Text className="mb-1 font-medium">Amenities</Text>
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
          <Text className="mb-1 font-medium">Preferred Gender</Text>
          <View className="z-[10]">
            <Select
              placeholder="No preference"
              value={form.target_gender}
              onValueChange={(v) => handleChange("target_gender", String(v))}
              options={genderOptions}
              searchable={false}
            />
            {errors.target_gender && (
              <Text className="text-red-600 mb-2">{errors.target_gender}</Text>
            )}
          </View>
          <View className="flex-row items-center mb-4 mt-4">
            <Checkbox
              value={form.pet_friendly}
              onValueChange={(v: boolean) => handleChange("pet_friendly", v)}
              label="Pet Friendly"
            />
          </View>
          <View className="py-2">
            <Text className="mb-1 font-medium">Description</Text>
            <Input
              placeholder="Text"
              value={form.description}
              onChangeText={(v: string) => handleChange("description", v)}
              multiline
              numberOfLines={3}
            />
          </View>
          <PhotoUploader
            photos={form.photos}
            onPhotosChange={handlePhotosChange}
            maxPhotos={20}
            className="mb-4"
          />
          {!!message && (
            <Text className="mt-4 text-center text-green-700 font-bold">
              {message}
            </Text>
          )}
        </ScrollView>
        <View className="absolute bottom-0 left-0 right-0 p-8 bg-white">
          <Button onPress={handleLocalSubmit} disabled={loading}>
            {loading ? "Submitting..." : submitLabel}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
