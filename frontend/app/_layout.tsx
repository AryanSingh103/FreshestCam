import React from "react";
import { Stack } from "expo-router";
import { Brand, useThemeTokens } from "../constants/theme";

export default function Layout() {
  const t = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.background },
        headerTintColor: t.text,
        contentStyle: { backgroundColor: t.background },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: "Result",
          headerStyle: { backgroundColor: Brand.primary },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
