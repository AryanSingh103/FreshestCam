import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Brand, Radius, Space, useThemeTokens } from "../../constants/theme";

/* ─── Corner bracket helper ──────────────────────────── */
function CornerBrackets({ size = 28, color = "#fff" }: { size?: number; color?: string }) {
  const common = { position: "absolute" as const, width: size, height: size, borderColor: color };
  return (
    <>
      <View style={[common, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 }]} />
      <View style={[common, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 }]} />
      <View style={[common, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 }]} />
      <View style={[common, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 }]} />
    </>
  );
}

export default function CameraScreen() {
  const t = useThemeTokens();
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter();

  /* pulse animation for scanning frame */
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  /* ─── Permission states ─────────────────────────────── */
  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: t.background }]}>
        <Ionicons name="scan-outline" size={48} color={t.tint} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>Initialising camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: t.background }]}>
        <View style={styles.permIcon}>
          <Ionicons name="camera" size={40} color="#fff" />
        </View>
        <Text style={[styles.permTitle, { color: t.text }]}>Camera Access</Text>
        <Text style={[styles.permSub, { color: t.textSecondary }]}>
          FreshCam needs your camera to scan produce and detect freshness in real time.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={requestPermission}
          style={styles.permBtn}
        >
          <Text style={styles.permBtnTxt}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ─── Capture ───────────────────────────────────────── */
  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: false });
    router.push({ pathname: "/result", params: { imageUri: photo.uri } });
  };

  /* ─── Camera UI ─────────────────────────────────────── */
  return (
    <View style={styles.root}>
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} onCameraReady={() => setIsReady(true)} />

      {/* dark overlay */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlayBar]} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerPill}>
          <Ionicons name="leaf" size={16} color={Brand.primary} />
          <Text style={styles.headerLabel}>FreshCam</Text>
        </View>
        <Text style={styles.headerHint}>Centre the produce & tap the shutter</Text>
      </View>

      {/* Scanning frame */}
      <Animated.View style={[styles.frame, { transform: [{ scale: pulse }] }]}>
        <CornerBrackets size={32} color="rgba(255,255,255,0.85)" />
      </Animated.View>

      {/* Bottom controls */}
      <View style={styles.bottom}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.shutter, !isReady && { opacity: 0.45 }]}
          onPress={takePicture}
          disabled={!isReady}
        >
          <View style={styles.shutterRing}>
            <View style={styles.shutterCore} />
          </View>
        </TouchableOpacity>
        <Text style={styles.shutterLabel}>{isReady ? "Tap to scan" : "Loading…"}</Text>
      </View>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const FRAME = 260;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  /* ── centered placeholder screens ── */
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Space.lg,
  },
  loadingText: { marginTop: 14, fontSize: 15 },

  /* ── permission screen ── */
  permIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Space.lg,
  },
  permTitle: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  permSub: { fontSize: 14, lineHeight: 21, textAlign: "center", marginBottom: Space.lg, maxWidth: 280 },
  permBtn: {
    backgroundColor: Brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: Radius.full,
  },
  permBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },

  /* ── overlay bars ── */
  overlayBar: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  /* ── header pill ── */
  header: {
    position: "absolute",
    top: 58,
    alignSelf: "center",
    alignItems: "center",
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  headerLabel: { color: "#fff", fontWeight: "700", fontSize: 15 },
  headerHint: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 8 },

  /* ── scanning frame ── */
  frame: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    marginTop: -(FRAME / 2),
    width: FRAME,
    height: FRAME,
    borderRadius: Radius.lg,
  },

  /* ── bottom controls ── */
  bottom: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
    alignItems: "center",
  },
  shutter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.primary,
  },
  shutterLabel: {
    marginTop: 12,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    letterSpacing: 0.4,
  },
});
