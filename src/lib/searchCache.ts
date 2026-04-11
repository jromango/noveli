interface CacheEntry<T> {
  data: T
  timestamp: number
}

export class SearchCache<K, V> {
  private cache: Map<K, CacheEntry<V>> = new Map()
  private ttl: number // Time to live in milliseconds

  constructor(ttlMs: number = 10 * 60 * 1000) {
    // 10 minutes default
    this.ttl = ttlMs
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    })
  }

  get(key: K): V | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: K): boolean {
    return this.get(key) !== null
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const bookSearchCache = new SearchCache<string, any>(10 * 60 * 1000)
