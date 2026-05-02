// import { Image } from "expo-image";
// import { useMemo } from "react";
// import {
//   ActivityIndicator,
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";

// import { IconSymbol } from "@/components/ui/icon-symbol";
// import { Colors, Fonts } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { formatCurrency, formatRating } from "@/lib/product-utils";

// export function ProductCard({ product, viewMode, onEditCategory, pending }) {
//   const scheme = useColorScheme() ?? "light";
//   const colors = Colors[scheme];

//   const containerStyle = useMemo(
//     () => (viewMode === "grid" ? styles.gridCard : styles.listCard),
//     [viewMode],
//   );

//   return (
//     <Pressable
//       accessibilityRole="button"
//       onPress={() => onEditCategory(product)}
//       style={({ pressed }) => [
//         styles.card,
//         containerStyle,
//         {
//           backgroundColor: colors.surface,
//           borderColor: colors.border,
//           shadowColor: colors.shadow,
//         },
//         pressed ? styles.pressed : undefined,
//       ]}
//     >
//       <View style={styles.topRow}>
//         <View
//           style={[
//             styles.imageWrap,
//             { backgroundColor: colors.surface2, borderColor: colors.border },
//           ]}
//         >
//           <Image
//             source={{ uri: product.image }}
//             style={styles.image}
//             contentFit="contain"
//             transition={180}
//           />
//         </View>
//         <View style={styles.meta}>
//           <Text
//             style={[styles.title, { color: colors.text }]}
//             numberOfLines={viewMode === "grid" ? 2 : 1}
//           >
//             {product.title}
//           </Text>
//           <View style={styles.priceRatingRow}>
//             <Text style={[styles.price, { color: colors.text }]}>
//               {formatCurrency(product.price)}
//             </Text>
//             <View style={styles.rating}>
//               <IconSymbol name="star.fill" size={14} color={colors.warning} />
//               <Text style={[styles.ratingText, { color: colors.mutedText }]}>
//                 {formatRating(product.rating.rate)}
//               </Text>
//             </View>
//           </View>
//           <View
//             style={[
//               styles.pill,
//               { backgroundColor: colors.surface2, borderColor: colors.border },
//             ]}
//           >
//             <Text
//               style={[styles.pillText, { color: colors.mutedText }]}
//               numberOfLines={1}
//             >
//               {product.category}
//             </Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.footer}>
//         <View style={styles.footerLeft}>
//           <View style={[styles.iconBg, { backgroundColor: colors.surface2 }]}>
//             <IconSymbol name="pencil" size={14} color={colors.tint} />
//           </View>
//           <Text style={[styles.footerText, { color: colors.mutedText }]}>
//             Edit category
//           </Text>
//         </View>
//         {pending ? (
//           <ActivityIndicator size="small" color={colors.tint} />
//         ) : null}
//       </View>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     borderWidth: 1,
//     borderRadius: 20,
//     padding: 14,
//     shadowOpacity: 0.12,
//     shadowRadius: 14,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 5,
//     overflow: "hidden",
//   },
//   gridCard: { flex: 1, minHeight: 240 },
//   listCard: { width: "100%" },
//   pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },

//   topRow: { flexDirection: "row", gap: 14 },
//   imageWrap: {
//     width: 92,
//     height: 92,
//     borderRadius: 18,
//     overflow: "hidden",
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//   },
//   image: { width: 86, height: 86 },

//   meta: { flex: 1, minWidth: 0, justifyContent: "space-between" },

//   title: {
//     fontFamily: Fonts.sans,
//     fontSize: 15,
//     fontWeight: "700",
//     lineHeight: 19,
//     marginBottom: 6,
//   },

//   priceRatingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 8,
//     gap: 8,
//   },

//   price: {
//     fontFamily: Fonts.rounded,
//     fontSize: 17,
//     fontWeight: "800",
//     letterSpacing: -0.2,
//   },

//   rating: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//     backgroundColor: "rgba(217, 119, 6, 0.06)",
//   },
//   ratingText: { fontFamily: Fonts.rounded, fontSize: 12, fontWeight: "700" },

//   pill: {
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//   },
//   pillText: {
//     fontFamily: Fonts.rounded,
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   footer: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(0, 0, 0, 0.04)",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   footerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
//   iconBg: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   footerText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: "600" },
// });

import { Image } from "expo-image";
import { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatCurrency, formatRating } from "@/lib/product-utils";

export function ProductCard({ product, viewMode, onEditCategory, pending }) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const containerStyle = useMemo(
    () => (viewMode === "grid" ? styles.gridCard : styles.listCard),
    [viewMode],
  );

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Gradient border effect for premium look
  const gradientBorder = useMemo(() => {
    if (product.price > 100) return styles.premiumBorder;
    if (product.rating.rate > 4.5) return styles.featuredBorder;
    return null;
  }, [product.price, product.rating.rate]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onEditCategory(product)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          containerStyle,
          gradientBorder,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.topRow}>
          <View
            style={[
              styles.imageWrap,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              contentFit="contain"
              transition={280}
              cachePolicy="memory-disk"
            />
          </View>

          <View style={styles.meta}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={viewMode === "grid" ? 2 : 1}
            >
              {product.title}
            </Text>

            <View style={styles.priceRatingRow}>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.tint }]}>
                  {formatCurrency(product.price)}
                </Text>
                {product.rating.count > 100 && (
                  <View style={styles.bestsellerBadge}>
                    <Text style={styles.bestsellerText}>Bestseller</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.rating,
                  { backgroundColor: colors.warning + "12" },
                ]}
              >
                <IconSymbol name="star.fill" size={13} color={colors.warning} />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {formatRating(product.rating.rate)}
                </Text>
                <Text style={[styles.ratingCount, { color: colors.mutedText }]}>
                  ({product.rating.count})
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.pill,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                },
              ]}
            >
              <IconSymbol name="folder" size={12} color={colors.tint} />
              <Text
                style={[styles.pillText, { color: colors.text }]}
                numberOfLines={1}
              >
                {product.category}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border + "30" }]}>
          <View style={styles.footerLeft}>
            <View
              style={[styles.iconBg, { backgroundColor: colors.tint + "12" }]}
            >
              <IconSymbol name="pencil" size={14} color={colors.tint} />
            </View>
            <Text style={[styles.footerText, { color: colors.tint }]}>
              Edit category
            </Text>
          </View>
          {pending ? (
            <ActivityIndicator size="small" color={colors.tint} />
          ) : (
            <View style={styles.hoverIcon}>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={colors.mutedText}
              />
            </View>
          )}
        </View>

        {/* Loading overlay */}
        {pending && (
          <View
            style={[
              styles.loadingOverlay,
              { backgroundColor: colors.surface + "CC" },
            ]}
          >
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    position: "relative",
  },
  premiumBorder: {
    borderWidth: 2,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#f59e0b",
  },
  featuredBorder: {
    borderWidth: 1,
    borderColor: "transparent",
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  gridCard: { flex: 1, minHeight: 280 },
  listCard: { width: "100%", marginBottom: 12 },

  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: "#fff",
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: "700",
  },

  topRow: { flexDirection: "row", gap: 16 },
  imageWrap: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: 88, height: 88 },

  meta: { flex: 1, minWidth: 0, justifyContent: "space-between", gap: 8 },

  title: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 21,
    letterSpacing: -0.3,
  },

  priceRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  price: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  bestsellerBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestsellerText: {
    color: "#fff",
    fontFamily: Fonts.sans,
    fontSize: 9,
    fontWeight: "700",
  },

  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: Fonts.rounded,
    fontSize: 13,
    fontWeight: "700",
  },
  ratingCount: {
    fontFamily: Fonts.rounded,
    fontSize: 10,
    fontWeight: "500",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillText: {
    fontFamily: Fonts.rounded,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  footer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
  },
  hoverIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  },
});
