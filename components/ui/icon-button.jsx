import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function IconButton({
  icon,
  onPress,
  disabled,
  accessibilityLabel,
  variant = 'ghost',
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const fg = variant === 'solid' ? colors.surface : colors.text;
  const bg = variant === 'solid' ? colors.tint : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'solid' ? { backgroundColor: bg } : undefined,
        (pressed && !disabled) ? styles.pressed : undefined,
        disabled ? styles.disabled : undefined,
      ]}>
      <View style={styles.inner}>
        <IconSymbol name={icon} size={20} color={disabled ? colors.icon : fg} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
