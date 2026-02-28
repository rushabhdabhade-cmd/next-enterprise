/**
 * Client-side page data cache.
 * Stores fetched data in memory so re-visiting a page renders content
 * instantly instead of showing a loading skeleton and refetching.
 *
 * Data expires after DEFAULT_TTL (5 minutes) to stay reasonably fresh.
 */

const cache = new Map<string, { data: unknown; ts: number }>()

const DEFAULT_TTL = 5 * 60 * 1000

export function getPageData<T>(key: string, ttlMs = DEFAULT_TTL): T | null {
    const entry = cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.ts > ttlMs) {
        cache.delete(key)
        return null
    }
    return entry.data as T
}

export function setPageData(key: string, data: unknown): void {
    cache.set(key, { data, ts: Date.now() })
}
