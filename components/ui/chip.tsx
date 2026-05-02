import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const bg = selected ? colors.tint : colors.surface2;
  const fg = selected ? colors.surface : colors.text;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor: selected ? 'transparent' : colors.border },
        (pressed && !disabled) ? styles.pressed : undefined,
        disabled ? styles.disabled : undefined,
      ]}>
      <View style={styles.inner}>
        <Text style={[styles.text, { color: fg }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
  text: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});

