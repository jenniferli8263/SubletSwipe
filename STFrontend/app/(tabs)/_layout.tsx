import { Tabs } from "expo-router";
import React from "react";
import { View, Text, type TextStyle } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import "../global.css";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const activeIconBgStyle = {
    position: 'absolute' as const,
    width: 70,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    zIndex: 0,
    alignSelf: 'center' as const,
  };

  const tabLabelStyle = (focused: boolean) => ({
    color: focused ? '#111' : '#888',
    fontWeight: focused ? 'bold' : 'normal',
    fontSize: 12,
    marginTop: 4,
  } as TextStyle);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused ? (
                <>
                  <View style={activeIconBgStyle} />
                  <IconSymbol size={30} name="house.fill" color={focused ? '#111' : '#888'} style={{ zIndex: 1 }} />
                </>
              ) : (
                <IconSymbol size={30} name="house" color={focused ? '#111' : '#888'} style={{ zIndex: 1 }} />
              )}
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={tabLabelStyle(focused)}>Home</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="deactivate-listing"
        options={{
          title: "Deactivate",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused ? (
                <>
                  <View style={activeIconBgStyle} />
                  <IconSymbol size={30} name="minus.circle.fill" color={focused ? '#111' : '#888'} style={{ zIndex: 1 }} />
                </>
              ) : (
                <IconSymbol size={30} name="minus.circle" color={focused ? '#111' : '#888'} style={{ zIndex: 1 }} />
              )}
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={tabLabelStyle(focused)}>Deactivate</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mutual-matches"
        options={{
          title: "Mutual Matches",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused ? (
                <>
                  <View style={activeIconBgStyle} />
                  <IconSymbol size={30} name="person.2.fill" color={focused ? '#111' : '#888'} style={{ zIndex: 1 }} />
                </>
              ) : (
                <IconSymbol size={30} name="person.2" color={focused ? '#111' : '#888'} style={{ zIndex: 1 }} />
              )}
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={tabLabelStyle(focused)}>Matches</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="account-management"
        options={{
          title: "Account Management",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="mappin.and.ellipse" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

