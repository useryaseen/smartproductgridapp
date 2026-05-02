import type { Product } from '@/lib/types';

const API_BASE = 'https://fakestoreapi.com';

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, { signal });
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  return (await res.json()) as Product[];
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export type SimulatedUpdateResult =
  | { ok: true }
  | { ok: false; message: string; code: 'NETWORK' | 'CONFLICT' | 'UNKNOWN' };

export async function simulateUpdateCategory(params: {
  productId: number;
  nextCategory: string;
  signal?: AbortSignal;
}): Promise<SimulatedUpdateResult> {
  const delayMs = 450 + Math.floor(Math.random() * 900);
  await sleep(delayMs);

  if (params.signal?.aborted) {
    return { ok: false, code: 'UNKNOWN', message: 'Request canceled' };
  }

  // ~18% failure rate to simulate flaky networks / server hiccups.
  const shouldFail = Math.random() < 0.18;
  if (shouldFail) {
    const variants: SimulatedUpdateResult[] = [
      { ok: false, code: 'NETWORK', message: 'Network error. Please try again.' },
      { ok: false, code: 'CONFLICT', message: 'Update conflict detected. Try again.' },
      { ok: false, code: 'UNKNOWN', message: 'Server error. Please retry.' },
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  return { ok: true };
}

