import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Toast({
  message,
  kind = 'info',
  visible,
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 160 : 140,
      useNativeDriver: true,
    }).start();
  }, [opacity, visible]);

  const bg =
    kind === 'error' ? colors.danger : kind === 'success' ? colors.success : colors.surface;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { opacity, bottom: 18 + insets.bottom }]}>
      <View style={[styles.card, { backgroundColor: bg, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: kind === 'info' ? colors.text : colors.surface }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  card: {
    maxWidth: 680,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  text: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
});
