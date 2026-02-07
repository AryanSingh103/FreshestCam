/**
 * FreshCam Design System
 * Strict palette — do not add new colors outside this file.
 */

import { useColorScheme } from "react-native";

// ─── Brand palette ──────────────────────────────────────────
export const Brand = {
  primary: "#4CAF50",
  primaryDark: "#388E3C",
  primaryLight: "#81C784",
  accent: "#FFC107",
  danger: "#E53935",
  info: "#2196F3",
  success: "#66BB6A",
} as const;

// ─── Per-scheme tokens ──────────────────────────────────────
export const Colors = {
  light: {
    text: "#11181C",
    textSecondary: "#6B7280",
    background: "#F8F9FB",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    border: "#E5E7EB",
    tint: Brand.primary,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: Brand.primary,
    shadow: "#00000018",
    tabBar: "#FFFFFF",
    tabBarBorder: "#E5E7EB",
    overlay: "rgba(0,0,0,0.04)",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    background: "#0B0F14",
    surface: "#1A1D21",
    card: "#1E2227",
    border: "#2D3139",
    tint: Brand.primaryLight,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: Brand.primaryLight,
    shadow: "#00000050",
    tabBar: "#151718",
    tabBarBorder: "#2D3139",
    overlay: "rgba(255,255,255,0.04)",
  },
  // Semantic / brand-level — usable in both modes
  ...Brand,
} as const;

// ─── Spacing / Radius tokens ────────────────────────────────
export const Space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

// ─── Theme hook (returns scheme-aware tokens) ───────────────
export type SchemeTokens = typeof Colors.light;

export function useThemeTokens(): SchemeTokens {
  const scheme = useColorScheme() ?? "light";
  return Colors[scheme];
}

// ─── Flat colors kept for backwards-compat in result.tsx ────
export const FlatColors = {
  text: Colors.light.text,
  textSecondary: Colors.light.textSecondary,
  background: Colors.light.background,
  primary: Brand.primary,
  accent: Brand.accent,
  danger: Brand.danger,
  success: Brand.success,
  info: Brand.info,
  card: Colors.light.card,
  shadow: Colors.light.shadow,
  surface: Colors.light.surface,
};