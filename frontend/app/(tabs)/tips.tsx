import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand, Radius, Space, useThemeTokens } from "../../constants/theme";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ─── Data ────────────────────────────────────────────── */
const TIPS = [
  {
    emoji: "🍌",
    title: "Banana Rescue",
    summary: "Too ripe? Freeze peeled bananas for smoothies or banana bread.",
    detail:
      "Peel overripe bananas, break into halves, and freeze in a zip-lock bag. They'll keep for up to 3 months and blend into the creamiest smoothies ever.",
  },
  {
    emoji: "🍓",
    title: "Berry Care",
    summary: "Rinse berries in a vinegar bath to extend fridge life by days.",
    detail:
      "Mix 1 part white vinegar with 3 parts cold water and soak berries for 2 minutes. Drain, pat dry, and store in a paper-towel-lined container in the fridge.",
  },
  {
    emoji: "🥑",
    title: "Avocado Timing",
    summary: "Ripen on the counter; refrigerate once perfectly ripe.",
    detail:
      "Place unripe avocados in a paper bag with a banana to speed things up. Once they yield to gentle pressure, move them to the fridge to pause ripening for up to 3 extra days.",
  },
  {
    emoji: "🧊",
    title: "Freeze Smartly",
    summary: "Most fruits freeze beautifully — just spread on a tray first.",
    detail:
      "Flash-freeze fruit pieces on a parchment-lined tray for 1–2 hours, then transfer to bags. This prevents clumping and makes it easy to grab just what you need.",
  },
  {
    emoji: "🍎",
    title: "Apple Trick",
    summary: "Store apples away from other produce to prevent early ripening.",
    detail:
      "Apples release ethylene gas which accelerates ripening in nearby fruit and veg. Keep them in a separate drawer or a sealed bag in the fridge.",
  },
  {
    emoji: "🌍",
    title: "Reduce Waste",
    summary: "Plan meals around ripeness to cut food waste by up to 30 %.",
    detail:
      "Check your fruit bowl every morning and build meals around what needs to be used soonest. Overripe fruit → smoothies or jam. Perfectly ripe → eat fresh. Unripe → plan for later in the week.",
  },
];

/* ─── Collapsible Tip Card ────────────────────────────── */
function TipCard({
  emoji,
  title,
  summary,
  detail,
}: (typeof TIPS)[number]) {
  const t = useThemeTokens();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggle}
      style={[styles.card, { backgroundColor: t.card, shadowColor: t.shadow }]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: t.text }]}>{title}</Text>
          <Text style={[styles.cardSummary, { color: t.textSecondary }]}>{summary}</Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={t.icon}
        />
      </View>
      {open && (
        <Text style={[styles.cardDetail, { color: t.textSecondary }]}>{detail}</Text>
      )}
    </TouchableOpacity>
  );
}

/* ─── Screen ──────────────────────────────────────────── */
export default function TipsScreen() {
  const t = useThemeTokens();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Freshness Hacks</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Tap a card to reveal the full tip
        </Text>
      </View>

      {TIPS.map((tip, i) => (
        <TipCard key={i} {...tip} />
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="leaf" size={16} color={Brand.primary} />
        <Text style={[styles.footerTxt, { color: t.textSecondary }]}>
          FreshCam — making every bite count
        </Text>
      </View>
    </ScrollView>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  /* Header */
  header: {
    paddingTop: 62,
    paddingHorizontal: Space.md + 4,
    paddingBottom: Space.md,
  },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4 },

  /* Card */
  card: {
    marginHorizontal: Space.md,
    marginBottom: Space.sm + 4,
    padding: Space.md,
    borderRadius: Radius.md,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoji: { fontSize: 30, marginRight: Space.sm + 4 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSummary: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  cardDetail: {
    marginTop: Space.sm + 4,
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 44, // align with text (emoji width + margin)
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: Space.md,
    paddingBottom: Space.lg,
  },
  footerTxt: { fontSize: 13, fontStyle: "italic" },
});
