export const initialProductsState = {
  status: 'idle',
  productsById: {},
  productIds: [],
  pendingById: {},
  undoStack: [],
  redoStack: [],
};

function setProductCategory(state, productId, category) {
  const product = state.productsById[productId];
  if (!product) return;
  state.productsById[productId] = { ...product, category };
}

export function productsReducer(state, action) {
  switch (action.type) {
    case 'load_start':
      return { ...state, status: 'loading', error: undefined };
    case 'load_success': {
      const byId = {};
      const ids = [];
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
      const next = {
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
      const next = { ...state, pendingById: { ...state.pendingById } };
      next.pendingById[action.productId] = undefined;
      return next;
    }
    case 'category_fail': {
      const pending = state.pendingById[action.productId];
      if (!pending || pending.mutationId !== action.mutationId) return state;

      const next = {
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
      const next = { ...state, productsById: { ...state.productsById } };
      for (const { productId, patch } of action.patches) {
        const existing = next.productsById[productId];
        if (!existing) continue;
        // External updates should not overwrite category edits.
        const { category: _ignoredCategory, ...rest } = patch ?? {};
        next.productsById[productId] = { ...existing, ...rest };
      }
      return next;
    }
    default:
      return state;
  }
}
