export function uniqueCategories(products) {
  const categories = new Set();
  for (const product of products) categories.add(product.category);
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function formatCurrency(amount) {
  // Keep it simple and consistent across platforms (no Intl dependency surprises).
  return `$${amount.toFixed(2)}`;
}

export function formatRating(rate) {
  return rate.toFixed(1);
}
