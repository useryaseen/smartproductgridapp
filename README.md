# Smart Product Grid

Small Expo (React Native) app that displays and manages products using `https://fakestoreapi.com/products`.

## Features (matches requirements)

- Product list in a professional card grid (toggle Grid/List)
- Shows title, price, category, rating
- Search by title
- Filter by category
- Sorting by price or rating (tap the sort chip to cycle)
- Edit category (tap a product → pick a category)
- Undo / Redo last category changes
- Simulated API behavior for category updates:
  - random delay
  - occasional failures
  - optimistic UI + rollback on failure
- Periodic data updates (price/rating) while keeping UI consistent

## Approach & decisions

- **Reducer state + history**: `features/products/store.js` stores products, per-product pending mutations, and undo/redo stacks.
- **Optimistic edits**: category updates apply immediately, then resolve via a simulated request (`lib/fakeStore.js`).
- **Rapid updates**: each edit gets a `mutationId`; stale responses are ignored so the latest edit wins.
- **Failures**: failures roll back only if the UI still shows the optimistic category for that mutation.
- **Incoming updates**: a timer periodically patches `price` / `rating` only (never overwrites `category`).



## Run locally

```bash
npm install
npx expo start
```

