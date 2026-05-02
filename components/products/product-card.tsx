import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import type { Product } from '@/lib/types';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency, formatRating } from '@/lib/product-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function ProductCard({
  product,
  viewMode,
  onEditCategory,
  pending,
}: {
  product: Product;
  viewMode: 'grid' | 'list';
  onEditCategory: (product: Product) => void;
  pending?: boolean;
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const containerStyle = useMemo(
    () => (viewMode === 'grid' ? styles.gridCard : styles.listCard),
    [viewMode]
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onEditCategory(product)}
      style={({ pressed }) => [
        styles.card,
        containerStyle,
        { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
        pressed ? styles.pressed : undefined,
      ]}>
      <View style={styles.topRow}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="contain"
            transition={180}
          />
        </View>
        <View style={styles.meta}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={viewMode === 'grid' ? 2 : 1}>
            {product.title}
          </Text>
          <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(product.price)}</Text>
          <View style={styles.subRow}>
            <View style={[styles.pill, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Text style={[styles.pillText, { color: colors.mutedText }]} numberOfLines={1}>
                {product.category}
              </Text>
            </View>

            <View style={styles.rating}>
              <IconSymbol name="star.fill" size={16} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.mutedText }]}>
                {formatRating(product.rating.rate)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <IconSymbol name="pencil" size={16} color={colors.icon} />
          <Text style={[styles.footerText, { color: colors.mutedText }]}>Edit category</Text>
        </View>
        {pending ? <ActivityIndicator size="small" color={colors.tint} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  gridCard: { flex: 1, minHeight: 204 },
  listCard: { width: '100%' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },

  topRow: { flexDirection: 'row', gap: 12 },
  imageWrap: {
    width: 84,
    height: 84,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 80, height: 80 },
  meta: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  price: {
    marginTop: 6,
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
  subRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontFamily: Fonts.rounded,
    fontSize: 12,
    fontWeight: '700',
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '800' },

  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },
});

