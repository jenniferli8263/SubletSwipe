import React, { useRef, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ImageCarouselProps {
  photos: { url: string }[];
}

export default function ImageCarousel({ photos }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [justOpened, setJustOpened] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const modalScrollRef = useRef<ScrollView>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setModalVisible(true);
    setJustOpened(true);
  };

  const onModalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setModalIndex(index);
    setActiveIndex(index); // Keep main carousel in sync
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Keep main carousel in sync with modalIndex while modal is open
  useEffect(() => {
    if (modalVisible && scrollRef.current) {
      scrollRef.current.scrollTo({
        x: activeIndex * screenWidth,
        animated: false,
      });
    }
  }, [activeIndex, modalVisible]);

  useEffect(() => {
    if (modalVisible && justOpened && modalScrollRef.current) {
      modalScrollRef.current.scrollTo({
        x: modalIndex * screenWidth,
        animated: false,
      });
      setJustOpened(false);
    }
  }, [modalVisible, justOpened, modalIndex]);

  if (!photos || photos.length === 0) {
    return (
      <View className="w-full h-[340px] bg-gray-200 justify-center items-center">
        <MaterialIcons name="photo-camera" size={64} color="#888" />
        <Text className="mt-4 text-gray-500 text-lg font-semibold">
          No Photos Available
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Main Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ width: screenWidth, height: 340 }}
      >
        {photos.map((photo, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.9}
            onPress={() => openModal(idx)}
          >
            <Image
              source={{ uri: photo.url }}
              style={{
                width: screenWidth,
                height: 340,
                resizeMode: "cover",
              }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Indicators */}
      <View className="flex-row justify-center items-center mt-2">
        {photos.map((_, idx) => (
          <View
            key={idx}
            className={`mx-1 rounded-full ${
              activeIndex === idx ? "bg-green-800" : "bg-gray-300"
            }`}
            style={{ width: 10, height: 10 }}
          />
        ))}
      </View>
      {/* Fullscreen Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <View
            style={{
              position: "absolute",
              top: 48,
              left: 0,
              right: 0,
              zIndex: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
            }}
          >
            <TouchableOpacity
              onPress={closeModal}
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: 24,
                padding: 6,
              }}
            >
              <MaterialIcons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 4,
              }}
            >
              {photos.length > 0 ? `${modalIndex + 1} of ${photos.length}` : ""}
            </Text>
            <View style={{ width: 44 }} />
          </View>
          {/* Swipable Images */}
          <ScrollView
            ref={modalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onModalScroll}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
          >
            {photos.map((photo, idx) => (
              <View
                key={idx}
                style={{
                  width: screenWidth,
                  height: screenHeight,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: photo.url }}
                  style={{
                    width: screenWidth,
                    height: screenHeight,
                    resizeMode: "contain",
                  }}
                />
              </View>
            ))}
          </ScrollView>
          {/* Modal Indicators */}
          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {photos.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 4,
                  backgroundColor: modalIndex === idx ? "#22c55e" : "#ccc",
                }}
              />
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
