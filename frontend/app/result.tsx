import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Brand, Colors, Radius, Space, useThemeTokens } from "../constants/theme";

/* ─── Freshness Meter (horizontal bar) ────────────────── */
function FreshnessMeter({ level, label }: { level: number; label: string }) {
  const t = useThemeTokens();
  const barColor =
    level >= 70 ? Brand.primary : level >= 40 ? Brand.accent : Brand.danger;

  return (
    <View style={{ marginTop: Space.sm }}>
      <View style={[meterStyles.track, { backgroundColor: t.border }]}>
        <View style={[meterStyles.fill, { width: `${Math.min(level, 100)}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[meterStyles.label, { color: t.textSecondary }]}>{label}</Text>
    </View>
  );
}

const meterStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  label: { fontSize: 11, marginTop: 4, textAlign: "right" },
});

/* ─── Ripeness badge colour ───────────────────────────── */
function ripenessColor(ripeness: string) {
  switch (ripeness?.toLowerCase()) {
    case "fresh":
    case "ripe":
      return Brand.primary;
    case "unripe":
      return Brand.accent;
    case "overripe":
    case "spoiled":
      return Brand.danger;
    default:
      return "#9E9E9E";
  }
}

function ripenessScore(ripeness: string): number {
  switch (ripeness?.toLowerCase()) {
    case "fresh":
      return 95;
    case "ripe":
      return 75;
    case "unripe":
      return 50;
    case "overripe":
      return 25;
    case "spoiled":
      return 8;
    default:
      return 50;
  }
}

/* ══════════════════════════════════════════════════════════
   ResultScreen
   ══════════════════════════════════════════════════════════ */
export default function ResultScreen() {
  const t = useThemeTokens();
  const scheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imageUri) analyzeImage(imageUri);
  }, [imageUri]);

  /* ─── API call (unchanged logic) ────────────────────── */
  const analyzeImage = async (uri: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", { uri, type: "image/jpeg", name: "image.jpg" } as any);

      const res = await fetch(
        "https://proautomation-aerographical-dayton.ngrok-free.dev/predict?include_nutrition=true",
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      data.error ? setError(data.error) : setResult(data);
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      setError(err.message || "Failed to analyse image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Loading state ─────────────────────────────────── */
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.tint} />
        <Text style={[styles.centerLabel, { color: t.textSecondary }]}>Analysing freshness…</Text>
      </View>
    );
  }

  /* ─── Error state ───────────────────────────────────── */
  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <View style={styles.errorIcon}>
          <Ionicons name="warning" size={32} color="#fff" />
        </View>
        <Text style={[styles.errorTitle, { color: t.text }]}>Something went wrong</Text>
        <Text style={[styles.errorMsg, { color: t.textSecondary }]}>{error}</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryTxt}>Go Back & Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ─── Success ───────────────────────────────────────── */
  const ripeness = result?.ripeness ?? "Unknown";
  const badgeColor = ripenessColor(ripeness);
  const freshnessLevel = ripenessScore(ripeness);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Image card ── */}
      <View style={[styles.imgCard, { backgroundColor: t.card, shadowColor: t.shadow }]}>
        <Image source={{ uri: imageUri }} style={styles.img} />
      </View>

      {result && !result.error ? (
        <View style={styles.body}>
          {/* ── Title row ── */}
          <View style={styles.titleRow}>
            <Text style={[styles.fruitName, { color: t.text }]}>
              {result.fruit_name || "Unknown"}
            </Text>
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeTxt}>{ripeness}</Text>
            </View>
          </View>

          {/* ── Freshness Meter ── */}
          <View style={[styles.card, { backgroundColor: t.card, shadowColor: t.shadow }]}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Freshness Meter</Text>
            <FreshnessMeter level={freshnessLevel} label={`${freshnessLevel}%`} />
          </View>

          {/* ── Confidence ── */}
          <View style={[styles.card, { backgroundColor: t.card, shadowColor: t.shadow }]}>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, { color: t.textSecondary }]}>Confidence</Text>
              <Text style={[styles.metricValue, { color: t.text }]}>{result.confidence ?? "—"}%</Text>
            </View>
          </View>

          {/* ── Nutrition ── */}
          {result.nutrition && (
            <View style={[styles.card, { backgroundColor: t.card, shadowColor: t.shadow }]}>
              <Text style={[styles.cardTitle, { color: t.text }]}>Nutrition Facts</Text>
              <View style={styles.nutriGrid}>
                {[
                  { v: result.nutrition.calories, l: "Calories" },
                  { v: `${result.nutrition.carbs_g}g`, l: "Carbs" },
                  { v: `${result.nutrition.fiber_g}g`, l: "Fiber" },
                  { v: `${result.nutrition.protein_g}g`, l: "Protein" },
                ].map((n, i) => (
                  <View key={i} style={[styles.nutriCell, { backgroundColor: t.overlay }]}>
                    <Text style={[styles.nutriVal, { color: t.text }]}>{n.v}</Text>
                    <Text style={[styles.nutriLbl, { color: t.textSecondary }]}>{n.l}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Environmental Impact ── */}
          {result.environmental_impact && (
            <View style={[styles.card, { backgroundColor: t.card, shadowColor: t.shadow }]}>
              <Text style={[styles.cardTitle, { color: t.text }]}>🌍 Environmental Impact</Text>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLbl, { color: t.textSecondary }]}>Carbon</Text>
                <Text style={[styles.infoVal, { color: t.text }]}>
                  {result.environmental_impact.carbon_footprint_kg} kg CO₂
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: t.border }]} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLbl, { color: t.textSecondary }]}>Water</Text>
                <Text style={[styles.infoVal, { color: t.text }]}>
                  {result.environmental_impact.water_usage_liters} litres
                </Text>
              </View>
            </View>
          )}

          {/* ── Action buttons (side-by-side) ── */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionPrimary]}
              onPress={() => router.back()}
            >
              <Ionicons name="scan" size={18} color="#fff" />
              <Text style={styles.actionPrimaryTxt}>Scan Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionOutline, { borderColor: t.border }]}
              onPress={() => router.back()}
            >
              <Ionicons name="book-outline" size={18} color={t.tint} />
              <Text style={[styles.actionOutlineTxt, { color: t.tint }]}>Storage Tips</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.center, { paddingTop: 60 }]}>
          <Text style={[styles.errorMsg, { color: t.textSecondary }]}>
            {result?.error || "No predictions returned."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  /* Center states */
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Space.lg },
  centerLabel: { marginTop: 14, fontSize: 15 },

  /* Error */
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Brand.danger,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Space.md,
  },
  errorTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  errorMsg: { fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 300 },
  retryBtn: {
    marginTop: Space.lg,
    backgroundColor: Brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: Radius.full,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },

  /* Image */
  imgCard: {
    marginHorizontal: Space.md,
    marginTop: Space.md,
    borderRadius: Radius.lg,
    overflow: "hidden",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  img: { width: "100%", height: 280 },

  /* Body */
  body: { paddingHorizontal: Space.md, marginTop: Space.md },

  /* Title row */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Space.sm,
  },
  fruitName: { fontSize: 26, fontWeight: "700" },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  badgeTxt: { color: "#fff", fontWeight: "700", fontSize: 12, textTransform: "capitalize" },

  /* Generic card */
  card: {
    marginTop: Space.sm + 4,
    padding: Space.md,
    borderRadius: Radius.md,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: Space.sm },

  /* Metric */
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricLabel: { fontSize: 14 },
  metricValue: { fontSize: 22, fontWeight: "700" },

  /* Nutrition */
  nutriGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  nutriCell: {
    width: "47%",
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  nutriVal: { fontSize: 16, fontWeight: "700" },
  nutriLbl: { fontSize: 12, marginTop: 3 },

  /* Info rows */
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 },
  infoLbl: { fontSize: 13 },
  infoVal: { fontSize: 13, fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth },

  /* Actions */
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: Space.lg,
  },
  actionPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Brand.primary,
    paddingVertical: 15,
    borderRadius: Radius.md,
  },
  actionPrimaryTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    paddingVertical: 15,
    borderRadius: Radius.md,
  },
  actionOutlineTxt: { fontWeight: "700", fontSize: 15 },
});
