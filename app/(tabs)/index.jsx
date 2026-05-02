import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { BrandSplash } from "@/components/splash/brand-splash";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Toast } from "@/components/ui/toast";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { CategoryModal } from "@/components/products/category-modal";
import { ProductCard } from "@/components/products/product-card";
import {
  initialProductsState,
  productsReducer,
} from "@/features/products/store";
import { fetchProducts, simulateUpdateCategory } from "@/lib/fakeStore";
import { clamp, uniqueCategories } from "@/lib/product-utils";

export default function ProductsScreen() {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  const [state, dispatch] = useReducer(productsReducer, initialProductsState);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortKey, setSortKey] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("list");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    kind: "info",
  });
  const toastTimer = useRef(null);

  const [showBrandSplash, setShowBrandSplash] = useState(true);
  const brandSplashMin = useRef(true);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  function showToast(message, kind = "info") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, kind });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2200,
    );
  }

  useEffect(() => {
    const minTimer = setTimeout(() => {
      brandSplashMin.current = false;
      if (state.status === "ready" || state.status === "error") {
        setShowBrandSplash(false);
      }
    }, 1200);

    // Force hide splash after 3 seconds max
    const forceHideTimer = setTimeout(() => {
      setShowBrandSplash(false);
    }, 3000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(forceHideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: "load_start" });
    fetchProducts(controller.signal)
      .then((products) => dispatch({ type: "load_success", products }))
      .catch((e) => {
        const message =
          e instanceof Error ? e.message : "Failed to load products";
        dispatch({ type: "load_error", message });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (brandSplashMin.current) return;
    if (state.status === "ready" || state.status === "error")
      setShowBrandSplash(false);
  }, [state.status]);

  const categories = useMemo(() => {
    if (state.status !== "ready") return [];
    const all = state.productIds.map((id) => state.productsById[id]);
    return uniqueCategories(all);
  }, [state.productIds, state.productsById, state.status]);

  const products = useMemo(() => {
    if (state.status !== "ready") return [];
    const q = query.trim().toLowerCase();
    const list = state.productIds.map((id) => state.productsById[id]);
    const filtered = list.filter((p) => {
      if (categoryFilter !== "All" && p.category !== categoryFilter)
        return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q);
    });

    const sorted = filtered.slice().sort((a, b) => {
      const va = sortKey === "price" ? a.price : a.rating.rate;
      const vb = sortKey === "price" ? b.price : b.rating.rate;
      return sortOrder === "asc" ? va - vb : vb - va;
    });

    return sorted;
  }, [
    categoryFilter,
    query,
    sortKey,
    sortOrder,
    state.productIds,
    state.productsById,
    state.status,
  ]);

  function startCategoryUpdate(params) {
    const mutationId = `${params.productId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    dispatch({
      type: "category_optimistic",
      productId: params.productId,
      mutationId,
      fromCategory: params.fromCategory,
      toCategory: params.toCategory,
      pushHistory: params.pushHistory,
      clearRedo: params.clearRedo,
    });

    simulateUpdateCategory({
      productId: params.productId,
      nextCategory: params.toCategory,
    })
      .then((res) => {
        if (!res.ok) {
          dispatch({
            type: "category_fail",
            productId: params.productId,
            mutationId,
            message: res.message,
          });
          showToast(res.message, "error");
          return;
        }
        dispatch({
          type: "category_commit",
          productId: params.productId,
          mutationId,
        });
        showToast("Category updated", "success");
      })
      .catch(() => {
        dispatch({
          type: "category_fail",
          productId: params.productId,
          mutationId,
          message: "Update failed",
        });
        showToast("Update failed. Please try again.", "error");
      });
  }

  function onEditCategory(product) {
    setSelectedProduct(product);
    setCategoryModalOpen(true);
  }

  function onRefetchProducts() {
    dispatch({ type: "load_start" });
    setShowBrandSplash(true);
    const controller = new AbortController();
    fetchProducts(controller.signal)
      .then((products) => {
        dispatch({ type: "load_success", products });
        setTimeout(() => setShowBrandSplash(false), 600);
      })
      .catch((e) => {
        const message =
          e instanceof Error ? e.message : "Failed to load products";
        dispatch({ type: "load_error", message });
        setShowBrandSplash(false);
      });
    return () => controller.abort();
  }

  function onSelectCategory(nextCategory) {
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
    dispatch({ type: "undo_consumed", entry });
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
    dispatch({ type: "redo_consumed", entry });
    startCategoryUpdate({
      productId: entry.productId,
      fromCategory: product.category,
      toCategory: entry.toCategory,
      pushHistory: false,
      clearRedo: false,
    });
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    const interval = setInterval(() => {
      const current = stateRef.current;
      if (current.status !== "ready" || current.productIds.length === 0) return;

      const count = clamp(1 + Math.floor(Math.random() * 3), 1, 3);
      const patches = [];

      for (let i = 0; i < count; i++) {
        const id =
          current.productIds[
            Math.floor(Math.random() * current.productIds.length)
          ];
        const p = current.productsById[id];
        if (!p) continue;

        const nextPrice = clamp(
          p.price * (0.96 + Math.random() * 0.08),
          1,
          9999,
        );
        const nextRate = clamp(
          p.rating.rate + (Math.random() * 0.6 - 0.3),
          0,
          5,
        );
        patches.push({
          productId: id,
          patch: {
            price: Number(nextPrice.toFixed(2)),
            rating: { ...p.rating, rate: Number(nextRate.toFixed(1)) },
          },
        });
      }

      dispatch({ type: "apply_external_patch", patches });
    }, 8000);
    return () => clearInterval(interval);
  }, [state.status]);

  const header = (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(10, insets.top + 6),
        },
      ]}
    >
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.hTitle, { color: colors.text }]}>
            Smart Product Grid
          </Text>
          <Text style={[styles.hSub, { color: colors.mutedText }]}>
            {state.status === "ready"
              ? `${products.length} products`
              : state.status === "loading"
                ? "Loading products…"
                : "Failed to load"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="arrow.clockwise"
            accessibilityLabel="Refetch"
            onPress={onRefetchProducts}
            variant="solid"
          />
          <IconButton
            icon="arrow.uturn.left"
            accessibilityLabel="Undo"
            onPress={onUndo}
            disabled={state.undoStack.length === 0}
            variant="solid"
          />
          <IconButton
            icon="arrow.uturn.right"
            accessibilityLabel="Redo"
            onPress={onRedo}
            disabled={state.redoStack.length === 0}
            variant="solid"
          />
        </View>
      </View>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
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
        <IconSymbol name="magnifyingglass" size={28} color={colors.icon} />
        {query.length > 0 ? (
          <Pressable
            onPress={() => setQuery("")}
            accessibilityRole="button"
            style={styles.clearBtn}
          >
            <Text style={[styles.clearText, { color: colors.mutedText }]}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <Chip
          label="All"
          selected={categoryFilter === "All"}
          onPress={() => setCategoryFilter("All")}
        />
        {categories.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={categoryFilter === c}
            onPress={() => setCategoryFilter(c)}
          />
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Chip
          label={`Sort: ${sortKey === "price" ? "Price" : "Rating"} ${sortOrder === "asc" ? "↑" : "↓"}`}
          selected
          onPress={() => {
            if (sortKey === "price" && sortOrder === "asc") {
              setSortKey("price");
              setSortOrder("desc");
            } else if (sortKey === "price" && sortOrder === "desc") {
              setSortKey("rating");
              setSortOrder("desc");
            } else if (sortKey === "rating" && sortOrder === "desc") {
              setSortKey("rating");
              setSortOrder("asc");
            } else {
              setSortKey("price");
              setSortOrder("asc");
            }
          }}
        />
        {/* <Chip
          label={viewMode === "grid" ? "Grid" : "List"}
          selected
          onPress={() => setViewMode((m) => (m === "grid" ? "list" : "grid"))}
        /> */}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.page, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {header}

      {state.status === "loading" ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.centerText, { color: colors.mutedText }]}>
            Loading products…
          </Text>
        </View>
      ) : null}

      {state.status === "error" ? (
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Couldn’t load products
          </Text>
          <Text style={[styles.centerText, { color: colors.mutedText }]}>
            {state.error}
          </Text>
          <Pressable
            onPress={onRefetchProducts}
            style={({ pressed }) => [
              styles.retry,
              { backgroundColor: colors.tint },
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : null}

      {state.status === "ready" ? (
        <FlatList
          data={products}
          key={viewMode}
          keyExtractor={(item) => String(item.id)}
          numColumns={viewMode === "grid" ? 2 : 1}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 24 + insets.bottom + 72 },
          ]}
          columnWrapperStyle={viewMode === "grid" ? styles.column : undefined}
          keyboardShouldPersistTaps="handled"
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
              <Text style={[styles.errorTitle, { color: colors.text }]}>
                No results
              </Text>
              <Text style={[styles.centerText, { color: colors.mutedText }]}>
                Try a different search or category.
              </Text>
            </View>
          }
        />
      ) : null}

      <CategoryModal
        visible={categoryModalOpen}
        product={selectedProduct}
        categories={
          categories.length
            ? categories
            : ["electronics", "women's clothing", "men's clothing", "jewelery"]
        }
        onClose={() => setCategoryModalOpen(false)}
        onSelectCategory={onSelectCategory}
      />

      <Toast
        visible={toast.visible}
        kind={toast.kind}
        message={toast.message}
      />
      <BrandSplash visible={showBrandSplash} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
  },
  headerActions: { flexDirection: "row", gap: 10 },
  hTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  hSub: {
    marginTop: 3,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  search: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  clearText: { fontFamily: Fonts.rounded, fontSize: 12, fontWeight: "700" },

  filtersRow: { gap: 10, paddingRight: 8, paddingLeft: 0 },
  sortRow: { flexDirection: "row", gap: 10, justifyContent: "space-between" },

  listContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  column: { gap: 14 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  centerText: {
    textAlign: "center",
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  errorTitle: { fontFamily: Fonts.rounded, fontSize: 18, fontWeight: "900" },

  retry: {
    marginTop: 8,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  retryText: {
    color: "#fff",
    fontFamily: Fonts.rounded,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
