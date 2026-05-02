const API_BASE = 'https://fakestoreapi.com';

export async function fetchProducts(signal) {
  const res = await fetch(`${API_BASE}/products`, { signal });
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  return await res.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateUpdateCategory(params) {
  const delayMs = 450 + Math.floor(Math.random() * 900);
  await sleep(delayMs);

  if (params.signal?.aborted) {
    return { ok: false, code: 'UNKNOWN', message: 'Request canceled' };
  }

  // ~18% failure rate to simulate flaky networks / server hiccups.
  const shouldFail = Math.random() < 0.18;
  if (shouldFail) {
    const variants = [
      { ok: false, code: 'NETWORK', message: 'Network error. Please try again.' },
      { ok: false, code: 'CONFLICT', message: 'Update conflict detected. Try again.' },
      { ok: false, code: 'UNKNOWN', message: 'Server error. Please retry.' },
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  return { ok: true };
}
