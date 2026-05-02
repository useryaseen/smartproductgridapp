import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Chip } from '@/components/ui/chip';

export function CategoryModal({
  visible,
  product,
  categories,
  onClose,
  onSelectCategory,
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  const title = useMemo(() => product?.title ?? '', [product?.title]);
  const current = product?.category ?? '';

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheetWrap, { paddingBottom: Math.max(14, 10 + insets.bottom) }]} pointerEvents="box-none">
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.header, { color: colors.text }]} numberOfLines={2}>
            Update category
          </Text>
          <Text style={[styles.sub, { color: colors.mutedText }]} numberOfLines={2}>
            {title}
          </Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.chips}
            showsVerticalScrollIndicator={false}>
            {categories.map((c) => (
              <Chip key={c} label={c} selected={c === current} onPress={() => onSelectCategory(c)} />
            ))}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              { borderColor: colors.border, backgroundColor: colors.surface2 },
              pressed ? styles.pressed : undefined,
            ]}>
            <Text style={[styles.closeText, { color: colors.text }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  sheet: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  header: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
  sub: { marginTop: 6, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600' },
  scroll: { marginTop: 12, maxHeight: 280 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 8 },
  closeBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  closeText: { fontFamily: Fonts.rounded, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.9 },
});
