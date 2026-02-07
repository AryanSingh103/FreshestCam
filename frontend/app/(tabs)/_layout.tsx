import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Radius, useThemeTokens } from "../../constants/theme";

export default function TabsLayout() {
  const t = useThemeTokens();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.tabIconSelected,
        tabBarInactiveTintColor: t.tabIconDefault,
        tabBarStyle: {
          backgroundColor: t.tabBar,
          borderTopColor: t.tabBarBorder,
          borderTopWidth: 0.5,
          paddingTop: 6,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          paddingBottom: Platform.OS === "ios" ? 0 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="camera"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "scan" : "scan-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: "Tips",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bulb" : "bulb-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
