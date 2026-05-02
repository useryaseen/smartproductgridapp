import type { Product } from '@/lib/types';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PendingMutation = {
  mutationId: string;
  fromCategory: string;
  toCategory: string;
  startedAt: number;
};

export type HistoryEntry = {
  productId: number;
  fromCategory: string;
  toCategory: string;
  at: number;
};

export type ProductsState = {
  status: LoadStatus;
  error?: string;
  productsById: Record<number, Product>;
  productIds: number[];
  pendingById: Record<number, PendingMutation | undefined>;
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
};

export type ProductsAction =
  | { type: 'load_start' }
  | { type: 'load_success'; products: Product[] }
  | { type: 'load_error'; message: string }
  | { type: 'undo_consumed'; entry: HistoryEntry }
  | { type: 'redo_consumed'; entry: HistoryEntry }
  | {
      type: 'category_optimistic';
      productId: number;
      mutationId: string;
      fromCategory: string;
      toCategory: string;
      pushHistory: boolean;
      clearRedo: boolean;
    }
  | { type: 'category_commit'; productId: number; mutationId: string }
  | { type: 'category_fail'; productId: number; mutationId: string; message: string }
  | { type: 'apply_external_patch'; patches: Array<{ productId: number; patch: Partial<Product> }> };

export const initialProductsState: ProductsState = {
  status: 'idle',
  productsById: {},
  productIds: [],
  pendingById: {},
  undoStack: [],
  redoStack: [],
};

function setProductCategory(state: ProductsState, productId: number, category: string) {
  const product = state.productsById[productId];
  if (!product) return;
  state.productsById[productId] = { ...product, category };
}

export function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case 'load_start':
      return { ...state, status: 'loading', error: undefined };
    case 'load_success': {
      const byId: Record<number, Product> = {};
      const ids: number[] = [];
      for (const p of action.products) {
        byId[p.id] = p;
        ids.push(p.id);
      }
      return {
        status: 'ready',
        error: undefined,
        productsById: byId,
        productIds: ids,
        pendingById: {},
        undoStack: [],
        redoStack: [],
      };
    }
    case 'load_error':
      return { ...state, status: 'error', error: action.message };
    case 'undo_consumed': {
      if (state.undoStack.length === 0) return state;
      const last = state.undoStack[state.undoStack.length - 1];
      if (
        last.productId !== action.entry.productId ||
        last.fromCategory !== action.entry.fromCategory ||
        last.toCategory !== action.entry.toCategory
      ) {
        return state;
      }
      return {
        ...state,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: state.redoStack.concat(action.entry),
      };
    }
    case 'redo_consumed': {
      if (state.redoStack.length === 0) return state;
      const last = state.redoStack[state.redoStack.length - 1];
      if (
        last.productId !== action.entry.productId ||
        last.fromCategory !== action.entry.fromCategory ||
        last.toCategory !== action.entry.toCategory
      ) {
        return state;
      }
      return {
        ...state,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: state.undoStack.concat(action.entry),
      };
    }
    case 'category_optimistic': {
      const next: ProductsState = {
        ...state,
        pendingById: { ...state.pendingById },
        undoStack: state.undoStack.slice(),
        redoStack: state.redoStack.slice(),
        productsById: { ...state.productsById },
      };

      setProductCategory(next, action.productId, action.toCategory);
      next.pendingById[action.productId] = {
        mutationId: action.mutationId,
        fromCategory: action.fromCategory,
        toCategory: action.toCategory,
        startedAt: Date.now(),
      };

      if (action.pushHistory) {
        next.undoStack.push({
          productId: action.productId,
          fromCategory: action.fromCategory,
          toCategory: action.toCategory,
          at: Date.now(),
        });
      }

      if (action.clearRedo) next.redoStack = [];

      return next;
    }
    case 'category_commit': {
      const pending = state.pendingById[action.productId];
      if (!pending || pending.mutationId !== action.mutationId) return state;
      const next: ProductsState = { ...state, pendingById: { ...state.pendingById } };
      next.pendingById[action.productId] = undefined;
      return next;
    }
    case 'category_fail': {
      const pending = state.pendingById[action.productId];
      if (!pending || pending.mutationId !== action.mutationId) return state;

      const next: ProductsState = {
        ...state,
        pendingById: { ...state.pendingById },
        productsById: { ...state.productsById },
      };

      // Roll back only if the UI still shows the optimistic category for this mutation.
      const product = next.productsById[action.productId];
      if (product && product.category === pending.toCategory) {
        setProductCategory(next, action.productId, pending.fromCategory);
      }

      next.pendingById[action.productId] = undefined;
      return next;
    }
    case 'apply_external_patch': {
      if (action.patches.length === 0) return state;
      const next: ProductsState = { ...state, productsById: { ...state.productsById } };
      for (const { productId, patch } of action.patches) {
        const existing = next.productsById[productId];
        if (!existing) continue;
        // External updates should not overwrite category edits.
        const { category: _ignoredCategory, ...rest } = patch as Partial<Product> & {
          category?: string;
        };
        next.productsById[productId] = { ...existing, ...rest };
      }
      return next;
    }
    default:
      return state;
  }
}
