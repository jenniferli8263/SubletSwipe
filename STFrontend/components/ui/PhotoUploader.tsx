import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { PhotoData } from "@/lib/imageUtils";
import Button from "./Button";
import Input from "./Input";

interface PhotoUploaderProps {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  className?: string;
}

const windowWidth = Dimensions.get("window").width;
const MODAL_SIZE = Math.min(windowWidth * 0.85, 350);
const SQUARE_SIZE = MODAL_SIZE * 0.7;

export default function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  className = "",
}: PhotoUploaderProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<PhotoData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Open modal for new photo
  const handleAddPhoto = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Maximum Photos Reached",
        `You can only upload up to ${maxPhotos} photos.`,
        [{ text: "OK" }]
      );
      return;
    }
    setCurrentPhoto(null);
    setEditingIndex(null);
    setModalVisible(true);
  };

  // Open modal for editing existing photo
  const handleEditPhoto = (index: number) => {
    setCurrentPhoto(photos[index]);
    setEditingIndex(index);
    setModalVisible(true);
  };

  // Pick image from library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Permission to access media library is required to upload photos.",
        [{ text: "OK" }]
      );
      return;
    }
    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const image = result.assets[0];
        setCurrentPhoto({
          uri: image.uri,
          label: currentPhoto?.label || "",
          base64: image.base64 || "",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image. Please try again.");
      console.error("Image picker error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Handle label change in modal
  const handleLabelChange = (label: string) => {
    if (currentPhoto) {
      setCurrentPhoto({ ...currentPhoto, label });
    }
  };

  // Upload (add or update) photo
  const handleUpload = async () => {
    if (!currentPhoto || !currentPhoto.uri) {
      Alert.alert("No photo selected", "Please select a photo to upload.");
      return;
    }
    const isNewPhoto = !currentPhoto.uri.startsWith("http");
    if (isNewPhoto && !currentPhoto.base64) {
      Alert.alert("No photo selected", "Please select a photo to upload.");
      return;
    }
    if (!currentPhoto.label.trim()) {
      Alert.alert("Label required", "Please enter a label for the photo.");
      return;
    }
    let photoToUpload = currentPhoto;
    // Check if base64 is over 10MB (Cloudinary's free plan limit)
    // 1 char base64 = 0.75 bytes, so 10MB = 10485760 bytes = 13981013 base64 chars
    const MAX_BASE64_LENGTH = 13981013;
    if (currentPhoto.base64.length > MAX_BASE64_LENGTH) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          currentPhoto.uri,
          [{ resize: { width: 1200, height: 1200 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );
        photoToUpload = {
          uri: manipResult.uri,
          label: currentPhoto.label,
          base64: manipResult.base64 || "",
        };
        if (photoToUpload.base64.length > MAX_BASE64_LENGTH) {
          Alert.alert(
            "Photo too large",
            "Could not compress photo under 10MB. Please choose a smaller image."
          );
          return;
        }
      } catch (err) {
        Alert.alert(
          "Compression failed",
          "Could not compress photo. Please try a different image."
        );
        return;
      }
    }
    let newPhotos = [...photos];
    if (editingIndex !== null) {
      newPhotos[editingIndex] = photoToUpload;
    } else {
      newPhotos.push(photoToUpload);
    }
    onPhotosChange(newPhotos);
    setModalVisible(false);
    setCurrentPhoto(null);
    setEditingIndex(null);
  };

  // Delete (clear) current photo in modal
  const handleDelete = () => {
    if (editingIndex !== null) {
      let newPhotos = [...photos];
      newPhotos.splice(editingIndex, 1);
      onPhotosChange(newPhotos);
    }
    setModalVisible(false);
    setCurrentPhoto(null);
    setEditingIndex(null);
    setUploadError(""); // Clear error on delete
  };

  // Clear error when modal is closed
  const handleCloseModal = () => {
    setModalVisible(false);
    setCurrentPhoto(null);
    setEditingIndex(null);
    // Optionally clear error here if you want error to disappear on close:
    // setUploadError("");
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
      {uploadError ? (
        <Text className="text-red-600 mb-2">{uploadError}</Text>
      ) : null}
      {/* Modal Overlay for Add/Edit Photo */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {/* Square area for image */}
            <Pressable
              className="bg-gray-100 my-4 rounded-lg flex flew-row items-center justify-center"
              style={[styles.square]}
              onPress={pickImage}
              disabled={uploading}
            >
              {currentPhoto && currentPhoto.uri ? (
                <Image
                  source={{ uri: currentPhoto.uri }}
                  style={styles.squareImg}
                />
              ) : (
                <Text style={{ color: "#888", textAlign: "center" }}>
                  Click here to add a photo
                </Text>
              )}
            </Pressable>
            {/* Label input */}
            <Input
              placeholder="Label"
              value={currentPhoto?.label || ""}
              onChangeText={handleLabelChange}
              className="mb-u"
              style={{ width: SQUARE_SIZE }}
            />
            {/* Upload & Delete buttons */}
            <View className="pt-4 w-full">
              <Button
                onPress={handleUpload}
                className="rounded-lg w-full border-green-800 border-2"
              >
                {editingIndex !== null ? "Update" : "Upload"}
              </Button>
              <View className="flex flex-row justify-between w-full pt-2">
                <Button
                  onPress={handleCloseModal}
                  className="flex-1 rounded-lg bg-white border-gray-400 border-2"
                >
                  <Text className="text-gray-500">Cancel</Text>
                </Button>
                <Button
                  onPress={handleDelete}
                  className="flex-1 ml-2 rounded-lg bg-white border-red-600 border-2"
                >
                  <Text className="text-red-600">Delete</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Display uploaded photos */}
      <View className="flex-row flex-wrap">
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={photo.uri + index}
            onPress={() => handleEditPhoto(index)}
            className="mb-3 mr-3 items-center"
          >
            <Image
              source={{ uri: photo.uri }}
              className="w-24 h-24 rounded-lg"
              style={{ resizeMode: "cover" }}
            />
            <Text className="mt-1 text-xs text-center max-w-[96px]">
              {photo.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: MODAL_SIZE,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    // borderRadius: 12,
    // backgroundColor: "#f3f3f3",
    // justifyContent: "center",
    // alignItems: "center",
    // overflow: "hidden",
  },
  squareImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
});
