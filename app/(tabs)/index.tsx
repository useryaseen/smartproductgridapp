import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandSplash } from '@/components/splash/brand-splash';
import { IconButton } from '@/components/ui/icon-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Chip } from '@/components/ui/chip';
import { Toast } from '@/components/ui/toast';

import { fetchProducts, simulateUpdateCategory } from '@/lib/fakeStore';
import { clamp, SortKey, SortOrder, uniqueCategories } from '@/lib/product-utils';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { CategoryModal } from '@/components/products/category-modal';
import { initialProductsState, productsReducer } from '@/features/products/store';

type ToastState = { visible: boolean; message: string; kind: 'success' | 'error' | 'info' };

export default function ProductsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [state, dispatch] = useReducer(productsReducer, initialProductsState);

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', kind: 'info' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showBrandSplash, setShowBrandSplash] = useState(true);
  const brandSplashMin = useRef(true);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  function showToast(message: string, kind: ToastState['kind'] = 'info') {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, kind });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200);
  }

  useEffect(() => {
    const minTimer = setTimeout(() => {
      brandSplashMin.current = false;
      if (state.status === 'ready' || state.status === 'error') setShowBrandSplash(false);
    }, 850);
    return () => clearTimeout(minTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'load_start' });
    fetchProducts(controller.signal)
      .then((products) => dispatch({ type: 'load_success', products }))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Failed to load products';
        dispatch({ type: 'load_error', message });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (brandSplashMin.current) return;
    if (state.status === 'ready' || state.status === 'error') setShowBrandSplash(false);
  }, [state.status]);

  const categories = useMemo(() => {
    if (state.status !== 'ready') return [];
    const all = state.productIds.map((id) => state.productsById[id]);
    return uniqueCategories(all);
  }, [state.productIds, state.productsById, state.status]);

  const products = useMemo(() => {
    if (state.status !== 'ready') return [];
    const q = query.trim().toLowerCase();
    const list = state.productIds.map((id) => state.productsById[id]);
    const filtered = list.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q);
    });

    const sorted = filtered.slice().sort((a, b) => {
      const va = sortKey === 'price' ? a.price : a.rating.rate;
      const vb = sortKey === 'price' ? b.price : b.rating.rate;
      return sortOrder === 'asc' ? va - vb : vb - va;
    });

    return sorted;
  }, [categoryFilter, query, sortKey, sortOrder, state.productIds, state.productsById, state.status]);

  function startCategoryUpdate(params: {
    productId: number;
    fromCategory: string;
    toCategory: string;
    pushHistory: boolean;
    clearRedo: boolean;
  }) {
    const mutationId = `${params.productId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    dispatch({
      type: 'category_optimistic',
      productId: params.productId,
      mutationId,
      fromCategory: params.fromCategory,
      toCategory: params.toCategory,
      pushHistory: params.pushHistory,
      clearRedo: params.clearRedo,
    });

    simulateUpdateCategory({ productId: params.productId, nextCategory: params.toCategory })
      .then((res) => {
        if (!res.ok) {
          dispatch({ type: 'category_fail', productId: params.productId, mutationId, message: res.message });
          showToast(res.message, 'error');
          return;
        }
        dispatch({ type: 'category_commit', productId: params.productId, mutationId });
        showToast('Category updated', 'success');
      })
      .catch(() => {
        dispatch({ type: 'category_fail', productId: params.productId, mutationId, message: 'Update failed' });
        showToast('Update failed. Please try again.', 'error');
      });
  }

  function onEditCategory(product: Product) {
    setSelectedProduct(product);
    setCategoryModalOpen(true);
  }

  function onSelectCategory(nextCategory: string) {
    if (!selectedProduct) return;
    if (nextCategory === selectedProduct.category) {
      setCategoryModalOpen(false);
      return;
    }
    startCategoryUpdate({
      productId: selectedProduct.id,
      fromCategory: selectedProduct.category,
      toCategory: nextCategory,
      pushHistory: true,
      clearRedo: true,
    });
    setCategoryModalOpen(false);
  }

  function onUndo() {
    const entry = state.undoStack[state.undoStack.length - 1];
    if (!entry) return;
    const product = state.productsById[entry.productId];
    if (!product) return;
    dispatch({ type: 'undo_consumed', entry });
    startCategoryUpdate({
      productId: entry.productId,
      fromCategory: product.category,
      toCategory: entry.fromCategory,
      pushHistory: false,
      clearRedo: false,
    });
  }

  function onRedo() {
    const entry = state.redoStack[state.redoStack.length - 1];
    if (!entry) return;
    const product = state.productsById[entry.productId];
    if (!product) return;
    dispatch({ type: 'redo_consumed', entry });
    startCategoryUpdate({
      productId: entry.productId,
      fromCategory: product.category,
      toCategory: entry.toCategory,
      pushHistory: false,
      clearRedo: false,
    });
  }

  useEffect(() => {
    if (state.status !== 'ready') return;
    const interval = setInterval(() => {
      const current = stateRef.current;
      if (current.status !== 'ready' || current.productIds.length === 0) return;

      const count = clamp(1 + Math.floor(Math.random() * 3), 1, 3);
      const patches: { productId: number; patch: Partial<Product> }[] = [];

      for (let i = 0; i < count; i++) {
        const id = current.productIds[Math.floor(Math.random() * current.productIds.length)];
        const p = current.productsById[id];
        if (!p) continue;

        const nextPrice = clamp(p.price * (0.96 + Math.random() * 0.08), 1, 9999);
        const nextRate = clamp(p.rating.rate + (Math.random() * 0.6 - 0.3), 0, 5);
        patches.push({
          productId: id,
          patch: {
            price: Number(nextPrice.toFixed(2)),
            rating: { ...p.rating, rate: Number(nextRate.toFixed(1)) },
          },
        });
      }

      dispatch({ type: 'apply_external_patch', patches });
    }, 8000);
    return () => clearInterval(interval);
  }, [state.status]);

  const header = (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.hTitle, { color: colors.text }]}>Smart Product Grid</Text>
          <Text style={[styles.hSub, { color: colors.mutedText }]}>
            {state.status === 'ready' ? `${products.length} products` : 'Loading products…'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton icon="arrow.uturn.left" accessibilityLabel="Undo" onPress={onUndo} disabled={state.undoStack.length === 0} />
          <IconButton icon="arrow.uturn.right" accessibilityLabel="Redo" onPress={onRedo} disabled={state.redoStack.length === 0} />
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.icon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title…"
          placeholderTextColor={colors.icon}
          style={[styles.search, { color: colors.text }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" style={styles.clearBtn}>
            <Text style={[styles.clearText, { color: colors.mutedText }]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        <Chip label="All" selected={categoryFilter === 'All'} onPress={() => setCategoryFilter('All')} />
        {categories.map((c) => (
          <Chip key={c} label={c} selected={categoryFilter === c} onPress={() => setCategoryFilter(c)} />
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Chip
          label={`Sort: ${sortKey === 'price' ? 'Price' : 'Rating'} ${sortOrder === 'asc' ? '↑' : '↓'}`}
          selected
          onPress={() => {
            if (sortKey === 'price' && sortOrder === 'asc') {
              setSortKey('price');
              setSortOrder('desc');
            } else if (sortKey === 'price' && sortOrder === 'desc') {
              setSortKey('rating');
              setSortOrder('desc');
            } else if (sortKey === 'rating' && sortOrder === 'desc') {
              setSortKey('rating');
              setSortOrder('asc');
            } else {
              setSortKey('price');
              setSortOrder('asc');
            }
          }}
        />
        <Chip label={viewMode === 'grid' ? 'Grid' : 'List'} selected onPress={() => setViewMode((m) => (m === 'grid' ? 'list' : 'grid'))} />
      </View>
    </View>
  );

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      {header}

      {state.status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.centerText, { color: colors.mutedText }]}>Loading products…</Text>
        </View>
      ) : null}

      {state.status === 'error' ? (
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Couldn’t load products</Text>
          <Text style={[styles.centerText, { color: colors.mutedText }]}>{state.error}</Text>
          <Pressable
            onPress={() => {
              dispatch({ type: 'load_start' });
              fetchProducts()
                .then((p) => dispatch({ type: 'load_success', products: p }))
                .catch((e: unknown) => dispatch({ type: 'load_error', message: e instanceof Error ? e.message : 'Failed to load products' }));
            }}
            style={({ pressed }) => [
              styles.retry,
              { backgroundColor: colors.tint },
              pressed ? styles.pressed : undefined,
            ]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {state.status === 'ready' ? (
        <FlatList
          data={products}
          key={viewMode}
          keyExtractor={(item) => String(item.id)}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={viewMode === 'grid' ? styles.column : undefined}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              viewMode={viewMode}
              pending={Boolean(state.pendingById[item.id])}
              onEditCategory={onEditCategory}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.errorTitle, { color: colors.text }]}>No results</Text>
              <Text style={[styles.centerText, { color: colors.mutedText }]}>Try a different search or category.</Text>
            </View>
          }
        />
      ) : null}

      <CategoryModal
        visible={categoryModalOpen}
        product={selectedProduct}
        categories={categories.length ? categories : ['electronics', "women's clothing", "men's clothing", 'jewelery']}
        onClose={() => setCategoryModalOpen(false)}
        onSelectCategory={onSelectCategory}
      />

      <Toast visible={toast.visible} kind={toast.kind} message={toast.message} />
      <BrandSplash visible={showBrandSplash} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingTop: 10, paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  headerActions: { flexDirection: 'row', gap: 8 },
  hTitle: { fontFamily: Fonts.rounded, fontSize: 20, fontWeight: '900' },
  hSub: { marginTop: 2, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  search: { flex: 1, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600' },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  clearText: { fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '800' },

  filtersRow: { gap: 10, paddingRight: 8 },
  sortRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },

  listContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  column: { gap: 12 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, gap: 10 },
  centerText: { textAlign: 'center', fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600' },
  errorTitle: { fontFamily: Fonts.rounded, fontSize: 16, fontWeight: '900' },

  retry: { marginTop: 6, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  retryText: { color: '#fff', fontFamily: Fonts.rounded, fontSize: 14, fontWeight: '900' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
