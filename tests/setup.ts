import "@testing-library/jest-dom/vitest"

// Some Zustand persist setups expect localStorage to expose the full Web Storage
// interface synchronously. jsdom provides it, but ensure the methods are reliably
// callable for tests.
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {}
  const mock: Storage = {
    get length() {
      return Object.keys(store).length
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v)
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    },
  }
  Object.defineProperty(globalThis, "localStorage", { value: mock, configurable: true })
}
