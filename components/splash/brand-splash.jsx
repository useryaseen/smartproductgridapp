import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function BrandSplash({ visible }) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 240 : 160,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: visible ? 1 : 1.02,
        speed: 14,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  if (!visible) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale }],
            opacity,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/splogo.png")}
            style={styles.logo}
            contentFit="contain"
            transition={300}
          />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Smart Product Grid
        </Text>
        <Text style={[styles.sub, { color: colors.mutedText }]}>
          Fast search • filters • edits with undo/redo
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    marginTop: 18,
    fontFamily: Fonts.rounded,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sub: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
