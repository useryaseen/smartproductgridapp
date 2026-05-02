import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function BrandSplash({ visible }: { visible: boolean }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: visible ? 240 : 160, useNativeDriver: true }),
      Animated.spring(scale, { toValue: visible ? 1 : 1.02, speed: 14, bounciness: 6, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale, visible]);

  if (!visible) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale }], opacity }]}>
        <View style={[styles.logo, { backgroundColor: colors.tint }]}>
          <Text style={styles.logoText}>SP</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Smart Product Grid</Text>
        <Text style={[styles.sub, { color: colors.mutedText }]}>Fast search • filters • edits with undo/redo</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    alignItems: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontFamily: Fonts.rounded,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    marginTop: 14,
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '900',
  },
  sub: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
});
