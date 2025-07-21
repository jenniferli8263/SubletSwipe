import { Tabs } from "expo-router";
import React from "react";
import { View, Text, type TextStyle } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { useColorScheme } from "@/hooks/useColorScheme";
import "../global.css";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

function TabBarMaterialIcon({
  name,
  focused,
}: {
  name: string;
  focused: boolean;
}) {
  const activeIconBgStyle = {
    position: "absolute" as const,
    width: 70,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    zIndex: 0,
    alignSelf: "center" as const,
  };
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {focused ? (
        <>
          <View style={activeIconBgStyle} />
          <MaterialIcons
            size={30}
            name={name as any}
            color={focused ? "#111" : "#888"}
            style={{ zIndex: 1 }}
          />
        </>
      ) : (
        <MaterialIcons
          size={30}
          name={name as any}
          color={focused ? "#111" : "#888"}
          style={{ zIndex: 1 }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const tabLabelStyle = (focused: boolean) =>
    ({
      color: focused ? "#111" : "#888",
      fontWeight: focused ? "bold" : "normal",
      fontSize: 12,
      marginTop: 4,
    } as TextStyle);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "white",
          paddingTop: 8,
          borderTopWidth: 1,
          borderColor: "#EEEEEE",
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarMaterialIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mutual-matches"
        options={{
          title: "Mutual Matches",
          tabBarIcon: ({ focused }) => (
            <TabBarMaterialIcon name="people" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account-management"
        options={{
          title: "Account Management",
          tabBarIcon: ({ focused }) => (
            <TabBarMaterialIcon name="account-circle" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
