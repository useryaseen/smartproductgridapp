import type { Product } from '@/lib/types';

export type SortKey = 'price' | 'rating';
export type SortOrder = 'asc' | 'desc';

export function uniqueCategories(products: Product[]): string[] {
  const categories = new Set<string>();
  for (const product of products) categories.add(product.category);
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function formatCurrency(amount: number) {
  // Keep it simple and consistent across platforms (no Intl dependency surprises).
  return `$${amount.toFixed(2)}`;
}

export function formatRating(rate: number) {
  return rate.toFixed(1);
}

