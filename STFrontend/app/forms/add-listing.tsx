import React, { useState } from "react";
import { TouchableOpacity, View, Modal, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/contexts/AuthContext";
import ListingForm from "@/components/ListingForm";
import { apiPost } from "@/lib/api";
import { useRouter } from "expo-router";
import { useActiveRole } from "@/components/ActiveRoleContext";

export default function AddListingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { setRole, fetchResources } = useActiveRole();

  const handleSubmit = async (formData: any): Promise<void> => {
    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const payload = {
        ...formData,
        user_id: Number(formData.user_id),
        asking_price: Number(formData.asking_price),
        num_bedrooms: Number(formData.num_bedrooms),
        num_bathrooms: Number(formData.num_bathrooms),
        building_type_id: formData.building_type_id
          ? Number(formData.building_type_id)
          : undefined,
        amenities: formData.amenities,
        // photos: formData.photos.map((label: string) => ({
        //   url: label,
        //   label,
        // })),
        photos: formData.photos,
        start_date: formData.start_date,
        end_date: formData.end_date,
        target_gender: formData.target_gender,
        pet_friendly: Boolean(formData.pet_friendly),
        utilities_incl: Boolean(formData.utilities_incl),
        description: formData.description,
      };

      const response = await apiPost("/listings", payload);
      setMessage("Listing created!");
      setShowSuccessModal(true);
      if (response?.id) {
        await fetchResources();
        setRole({ isRenter: false, resourceId: response.id });
      }
    } catch (e: any) {
      if (e.message && e.message.includes("chk_term_length")) {
        setErrors((prev) => ({
          ...prev,
          check_constraint: "The term length should be at least a month.",
        }));
        setMessage("");
      } else if (e.message && e.message.includes("chk_start_date_future")) {
        setErrors((prev) => ({
          ...prev,
          check_constraint: "The start date must be in the future.",
        }));
        setMessage("");
      } else {
        setMessage(e.message || "Error creating listing");
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <TouchableOpacity onPress={() => router.back()} className="p-2 mx-2">
        <MaterialIcons name="arrow-back" size={24} color="#166534" />
      </TouchableOpacity>
      <ListingForm
        type="add"
        initialValues={{
          user_id: user?.id || 0,
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
          amenities: [],
          photos: [],
          raw_address: "",
        }}
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
        submitLabel="Create Listing"
        externalErrors={errors} // ← ✅ This is what's missing
        key={JSON.stringify(errors)} // optional: ensures fresh rerender
      />
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 32,
              borderRadius: 16,
              alignItems: "center",
              minWidth: 250,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}
            >
              Listing created!
            </Text>
            <TouchableOpacity
              className="mb-2 rounded-lg bg-green-800 px-4 py-3 items-center"
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/(tabs)");
              }}
            >
              <Text className="text-white font-bold text-lg">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

//OLD CODE AS A REFERENCE

// import React, { useState, useEffect } from "react";
// import { View, Text, ScrollView, TouchableOpacity } from "react-native";
// import { apiGet, apiPost } from "@/lib/api";
// import { useAuth } from "@/contexts/AuthContext";
// import Input from "@/components/ui/Input";
// import Button from "@/components/ui/Button";
// import Select from "@/components/ui/Select";
// import Checkbox from "@/components/ui/Checkbox";
// import MultiSelect from "@/components/ui/MultiSelect";
// import { AddressAutocomplete } from "@/components/AddressAutocomplete";
// import DateRangePicker from "@/components/ui/DateRangePicker";

// export default function AddListingScreen() {
//   const { user } = useAuth();
//   const [form, setForm] = useState({
//     user_id: user?.id || 0,
//     start_date: "",
//     end_date: "",
//     target_gender: "",
//     asking_price: "",
//     num_bedrooms: "",
//     num_bathrooms: "",
//     pet_friendly: false,
//     utilities_incl: false,
//     description: "",
//     building_type_id: "",
//     amenities: [] as number[],
//     photos: [] as string[],
//     raw_address: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const [amenities, setAmenities] = useState<
//     Array<{ value: number; label: string }>
//   >([]);
//   const [buildingTypes, setBuildingTypes] = useState<
//     Array<{ value: number; label: string }>
//   >([]);
//   const [genderOptions, setGenderOptions] = useState<
//     Array<{ value: string; label: string }>
//   >([]);

//   const loadAmenitiesOptions = async () => {
//     const data = await apiGet("/amenities");
//     setAmenities(
//       data.map((item: any) => ({
//         value: item.id,
//         label: item.name,
//       }))
//     );
//   };

//   const loadBuildingTypesOptions = async () => {
//     const data = await apiGet("/building-types");
//     setBuildingTypes(
//       data.map((item: any) => ({
//         value: item.id,
//         label: item.type,
//       }))
//     );
//   };

//   const loadGenderOptions = async () => {
//     const data = await apiGet("/genders");
//     setGenderOptions(
//       data.map((item: any) => ({
//         value: item.gender,
//         label: item.gender,
//       }))
//     );
//   };

//   useEffect(() => {
//     Promise.all([
//       loadAmenitiesOptions(),
//       loadBuildingTypesOptions(),
//       loadGenderOptions(),
//     ]);
//   }, []);

//   // Update user_id when user changes
//   useEffect(() => {
//     if (user) {
//       setForm((prev) => ({ ...prev, user_id: user.id }));
//     }
//   }, [user]);

//   const handleChange = (key: string, value: any) => {
//     setForm({ ...form, [key]: value });
//   };

//   const handleToggleAmenity = (id: number) => {
//     setForm((f) => ({
//       ...f,
//       amenities: f.amenities.includes(id)
//         ? f.amenities.filter((a) => a !== id)
//         : [...f.amenities, id],
//     }));
//   };
//   const handleTogglePhoto = (name: string) => {
//     setForm((f) => ({
//       ...f,
//       photos: f.photos.includes(name)
//         ? f.photos.filter((p) => p !== name)
//         : [...f.photos, name],
//     }));
//   };

//   const handleSubmit = async () => {
//     setLoading(true);
//     setMessage("");
//     const newErrors: { [key: string]: string } = {};

//     if (!form.raw_address) newErrors.raw_address = "Address is required.";
//     if (!form.start_date) newErrors.start_date = "Start date is required.";
//     if (!form.end_date) newErrors.end_date = "End date is required.";
//     if (!form.asking_price)
//       newErrors.asking_price = "Monthly rent is required.";
//     if (!form.num_bedrooms)
//       newErrors.num_bedrooms = "Number of bedrooms is required.";
//     if (!form.num_bathrooms)
//       newErrors.num_bathrooms = "Number of bathrooms is required.";
//     if (!form.building_type_id)
//       newErrors.building_type_id = "Building type is required.";

//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (form.start_date && !dateRegex.test(form.start_date)) {
//       newErrors.start_date = "Invalid date format (YYYY-MM-DD)";
//     }
//     if (form.end_date && !dateRegex.test(form.end_date)) {
//       newErrors.end_date = "Invalid date format (YYYY-MM-DD)";
//     }

//     if (
//       form.asking_price &&
//       (!/^[0-9]+(\.[0-9]+)?$/.test(form.asking_price) ||
//         Number(form.asking_price) <= 0)
//     ) {
//       newErrors.asking_price = "Rent must be a number";
//     }
//     if (
//       form.num_bedrooms &&
//       (!/^[0-9]+$/.test(form.num_bedrooms) || Number(form.num_bedrooms) <= 0)
//     ) {
//       newErrors.num_bedrooms = "Number of bedrooms must be a number";
//     }
//     if (
//       form.num_bathrooms &&
//       (!/^[0-9]+$/.test(form.num_bathrooms) || Number(form.num_bathrooms) <= 0)
//     ) {
//       newErrors.num_bathrooms = "Number of bathrooms must be number";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       setLoading(false);
//       return;
//     }
//     setErrors({});

//     try {
//       const payload = {
//         ...form,
//         user_id: Number(form.user_id),
//         asking_price: Number(form.asking_price),
//         num_bedrooms: Number(form.num_bedrooms),
//         num_bathrooms: Number(form.num_bathrooms),
//         building_type_id: form.building_type_id
//           ? Number(form.building_type_id)
//           : undefined,
//         amenities: form.amenities,
//         photos: form.photos.map((label) => ({ url: label, label })),
//         start_date: form.start_date,
//         end_date: form.end_date,
//         target_gender: form.target_gender,
//         pet_friendly: Boolean(form.pet_friendly),
//         utilities_incl: Boolean(form.utilities_incl),
//         description: form.description,
//       };
//       await apiPost("/listings", payload);
//       setMessage("Listing created!");
//     } catch (e: any) {
//       if (e.message && e.message.includes("chk_term_length")) {
//         setErrors((prev) => ({
//           ...prev,
//           check_constraint: "The term length should be at least a month.",
//         }));
//         setMessage("");
//       } else if (e.message && e.message.includes("chk_start_date_future")) {
//         setErrors((prev) => ({
//           ...prev,
//           check_constraint: "The start date must be in the future.",
//         }));
//         setMessage("");
//       } else {
//         setMessage(e.message || "Error creating listing");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddPhoto = () => {
//     // TODO: Implement photo picker/upload logic
//     alert("Add Photo button pressed!");
//   };

//   return (
//     <ScrollView
//       className="flex-1 bg-white p-8"
//       keyboardShouldPersistTaps="handled"
//     >
//       <View className="bg-white">
//         <Text className="text-4xl font-bold mb-6">Add a Listing</Text>
//         {/* Dates */}
//         <DateRangePicker
//           startDate={form.start_date}
//           endDate={form.end_date}
//           onStartDateChange={(date: string) => handleChange("start_date", date)}
//           onEndDateChange={(date: string) => handleChange("end_date", date)}
//           startDateError={errors.start_date}
//           endDateError={errors.end_date}
//           checkConstraintError={errors.check_constraint}
//           label="Term"
//         />
//         <View className="py-2">
//           <Text className="mb-1">Monthly Rent</Text>
//           <Input
//             placeholder="$"
//             value={form.asking_price}
//             onChangeText={(v: string) => handleChange("asking_price", v)}
//             className="mb-4"
//             keyboardType="numeric"
//           />
//           {errors.asking_price && (
//             <Text className="text-red-600 mb-2">{errors.asking_price}</Text>
//           )}
//         </View>
//         <View className="flex-row items-center mb-4">
//           <Checkbox
//             value={form.utilities_incl}
//             onValueChange={(v: boolean) => handleChange("utilities_incl", v)}
//             label="Utilities Included"
//           />
//         </View>
//         <View className="h-px bg-gray-200 my-4" />
//         {/* Address */}
//         <View className="py-2">
//           <Text className="mb-1">Address</Text>
//           <AddressAutocomplete
//             value={form.raw_address}
//             onSubmitCallback={(desc) => handleChange("raw_address", desc)}
//           />
//           {errors.raw_address && (
//             <Text className="text-red-600 mb-2">{errors.raw_address}</Text>
//           )}
//         </View>
//         <View className="py-2">
//           <Text className="mb-1">Bedrooms</Text>
//           <Input
//             placeholder="#"
//             value={form.num_bedrooms}
//             onChangeText={(v: string) => handleChange("num_bedrooms", v)}
//             className="mb-4"
//             keyboardType="numeric"
//           />
//           {errors.num_bedrooms && (
//             <Text className="text-red-600 mb-2">{errors.num_bedrooms}</Text>
//           )}
//         </View>
//         <View className="py-2">
//           <Text className="mb-1">Bathrooms</Text>
//           <Input
//             placeholder="#"
//             value={form.num_bathrooms}
//             onChangeText={(v: string) => handleChange("num_bathrooms", v)}
//             className="mb-4"
//             keyboardType="numeric"
//           />
//           {errors.num_bathrooms && (
//             <Text className="text-red-600 mb-2">{errors.num_bathrooms}</Text>
//           )}
//         </View>
//         <View className="py-2 z-[30]">
//           <Text className="mb-1">Building Type</Text>
//           <Select
//             placeholder="Select"
//             value={form.building_type_id}
//             onValueChange={(v) => handleChange("building_type_id", v)}
//             options={buildingTypes}
//           />
//           {errors.building_type_id && (
//             <Text className="text-red-600 mb-2">{errors.building_type_id}</Text>
//           )}
//         </View>
//         <View className="h-px bg-gray-200 my-4" />
//         <Text className="mb-1">Amenities</Text>
//         <View className="z-[20]">
//           <MultiSelect
//             placeholder="Add an amenity"
//             value={form.amenities}
//             onValueChange={(arr) => handleChange("amenities", arr)}
//             options={amenities}
//           />
//         </View>
//         <View className="flex-row flex-wrap mb-4">
//           {form.amenities.map((id) => {
//             const label = amenities.find((a) => a.value === id)?.label || id;
//             return (
//               <TouchableOpacity
//                 key={id}
//                 onPress={() => handleToggleAmenity(id)}
//                 className="bg-green-700 px-3 py-1 rounded-full mr-2 mb-2"
//               >
//                 <Text className="text-white text-sm">{label} ✕</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//         <Text className="mb-1">Target Gender</Text>
//         <View className="z-[10]">
//           <Select
//             placeholder="No preference"
//             value={form.target_gender}
//             onValueChange={(v) => handleChange("target_gender", String(v))}
//             options={genderOptions}
//             searchable={false}
//           />
//         </View>
//         <View className="flex-row items-center mb-4 mt-4">
//           <Checkbox
//             value={form.pet_friendly}
//             onValueChange={(v: boolean) => handleChange("pet_friendly", v)}
//             label="Pet Friendly"
//           />
//         </View>
//         <View className="py-2">
//           <Text className="mb-1">Description</Text>
//           <Input
//             placeholder="Text"
//             value={form.description}
//             onChangeText={(v: string) => handleChange("description", v)}
//             multiline
//             numberOfLines={3}
//           />
//         </View>
//         <Text className="mb-1">Photos</Text>
//         <Button onPress={handleAddPhoto} className="mb-2">
//           Add Photo
//         </Button>
//         <View className="flex-row flex-wrap mb-4">
//           {form.photos.map((name) => (
//             <TouchableOpacity
//               key={name}
//               onPress={() => handleTogglePhoto(name)}
//               className="bg-green-700 px-3 py-1 rounded-full mr-2 mb-2"
//             >
//               <Text className="text-white text-sm">{name} ✕</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <Button onPress={handleSubmit} disabled={loading}>
//           {loading ? "Submitting..." : "Create Listing"}
//         </Button>
//         {!!message && (
//           <Text className="mt-4 text-center text-green-700 font-bold">
//             {message}
//           </Text>
//         )}
//       </View>
//     </ScrollView>
//   );
// }
