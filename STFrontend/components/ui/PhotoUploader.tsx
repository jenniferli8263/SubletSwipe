import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { PhotoData } from "@/lib/imageUtils";
import Button from "./Button";
import Input from "./Input";

interface PhotoUploaderProps {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  className?: string;
}

export default function PhotoUploader({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 10,
  className = ""
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Permission to access media library is required to upload photos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const handleAddPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Maximum Photos Reached",
        `You can only upload up to ${maxPhotos} photos.`,
        [{ text: "OK" }]
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true
      });

      if (!result.canceled && result.assets.length > 0) {
        const image = result.assets[0];
        const uri = image.uri;
        const base64 = image.base64;

        if (!base64) {
          Alert.alert("Error", "Could not get image data.");
          return;
        }

        const newPhoto: PhotoData = {
          uri,
          label: "",
          base64
        };

        onPhotosChange([...photos, newPhoto]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image. Please try again.");
      console.error("Image picker error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (uri: string) => {
    onPhotosChange(photos.filter(photo => photo.uri !== uri));
  };

  const handlePhotoLabelChange = (uri: string, label: string) => {
    const updatedPhotos = photos.map(photo => 
      photo.uri === uri ? { ...photo, label } : photo
    );
    onPhotosChange(updatedPhotos);
  };

  return (
    <View className={className}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-medium">Photos</Text>
        <Text className="text-sm text-gray-500">
          {photos.length}/{maxPhotos}
        </Text>
      </View>
      
      <Button 
        onPress={handleAddPhoto} 
        disabled={uploading || photos.length >= maxPhotos}
        className="mb-4"
      >
        {uploading ? "Selecting..." : "Add Photo"}
      </Button>

      {photos.length > 0 && (
        <View className="flex-row flex-wrap">
          {photos.map((photo, index) => (
            <View 
              key={photo.uri} 
              className="mb-3 mr-3 relative"
            >
              <Image
                source={{ uri: photo.uri }}
                className="w-24 h-24 rounded-lg"
                style={{ resizeMode: "cover" }}
              />
              
              <TouchableOpacity
                onPress={() => handleDeletePhoto(photo.uri)}
                className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </TouchableOpacity>

              <Input
                placeholder="Label (e.g., Living Room)"
                value={photo.label}
                onChangeText={(text) => handlePhotoLabelChange(photo.uri, text)}
                className="mt-2 w-24 text-xs"
                style={{ fontSize: 12 }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
} 