import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AboutScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.logo, { backgroundColor: colors.tint }]}>
            <Text style={styles.logoText}>SP</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Smart Product Grid</Text>
          <Text style={[styles.sub, { color: colors.mutedText }]}>
            Product management demo powered by FakeStoreAPI.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.h, { color: colors.text }]}>What’s inside</Text>
          <Text style={[styles.p, { color: colors.mutedText }]}>
            - Search by title{'\n'}- Filter by category{'\n'}- Sort by price or rating{'\n'}- Edit category with
            optimistic UI{'\n'}- Undo/Redo{'\n'}- Simulated delay + failures{'\n'}- Periodic data refresh (price/rating)
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.h, { color: colors.text }]}>Notes</Text>
          <Text style={[styles.p, { color: colors.mutedText }]}>
            Category edits are simulated locally with delay and random failures. External updates only change
            price/rating so they don’t overwrite your category edits.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingBottom: 28 },
  hero: {
    margin: 16,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontFamily: Fonts.rounded,
    fontSize: 22,
    fontWeight: '900',
  },
  title: { marginTop: 12, fontFamily: Fonts.rounded, fontSize: 18, fontWeight: '900' },
  sub: { marginTop: 6, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  h: { fontFamily: Fonts.rounded, fontSize: 16, fontWeight: '900' },
  p: { marginTop: 10, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', lineHeight: 19 },
});
