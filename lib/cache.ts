import { revalidateTag, unstable_cache } from "next/cache"
import { getFavorites, getLibraries, getPlayHistory } from "@/lib/db"

// ─── Cache Tags ────────────────────────────────────────────────────────────────

export const cacheTags = {
  favorites: (userId: string) => `favorites-${userId}`,
  plays: (userId: string) => `plays-${userId}`,
  libraries: (userId: string) => `libraries-${userId}`,
  recommendations: (userId: string) => `recs-${userId}`,
} as const

// ─── TTLs (seconds) ────────────────────────────────────────────────────────────

export const TTL = {
  USER_DATA: 300,    // 5 min — favorites, play history
  HOT_TRACKS: 60,   // 1 min — PostHog trending
  ITUNES_META: 86400, // 24h — track/artist metadata
  ITUNES_CHARTS: 86400, // 24h — iTunes RSS charts
  ITUNES_SEARCH: 3600,  // 1h  — search results
  RECOMMENDATIONS: 1800, // 30 min — personalized recommendations
} as const

// ─── Cached DB Queries ─────────────────────────────────────────────────────────

/**
 * Cache favorites per user for 5 minutes.
 * Invalidate with: revalidateFavorites(userId)
 */
export function getCachedFavorites(userId: string) {
  return unstable_cache(
    async () => getFavorites(userId),
    ["favorites", userId],
    {
      revalidate: TTL.USER_DATA,
      tags: [cacheTags.favorites(userId)],
    }
  )()
}

/**
 * Cache play history per user+limit for 5 minutes.
 * Invalidate with: revalidatePlays(userId)
 */
export function getCachedPlayHistory(userId: string, limit: number) {
  return unstable_cache(
    async () => getPlayHistory(userId, limit),
    ["plays", userId, String(limit)],
    {
      revalidate: TTL.USER_DATA,
      tags: [cacheTags.plays(userId)],
    }
  )()
}

/**
 * Cache libraries per user for 5 minutes.
 * Invalidate with: revalidateLibraries(userId)
 */
export function getCachedLibraries(userId: string) {
  return unstable_cache(
    async () => getLibraries(userId),
    ["libraries", userId],
    {
      revalidate: TTL.USER_DATA,
      tags: [cacheTags.libraries(userId)],
    }
  )()
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export function getCachedRecommendations(userId: string) {
  return unstable_cache(
    async () => {
      const { generateRecommendationsForUser } = await import(
        "@/lib/recommendations/engine"
      )
      return generateRecommendationsForUser(userId)
    },
    ["recommendations", userId],
    {
      revalidate: TTL.RECOMMENDATIONS,
      tags: [cacheTags.recommendations(userId)],
    }
  )()
}

// ─── Invalidation Helpers ──────────────────────────────────────────────────────

export function revalidateFavorites(userId: string) {
  revalidateTag(cacheTags.favorites(userId))
}

export function revalidatePlays(userId: string) {
  revalidateTag(cacheTags.plays(userId))
}

export function revalidateLibraries(userId: string) {
  revalidateTag(cacheTags.libraries(userId))
}

export function revalidateRecommendations(userId: string) {
  revalidateTag(cacheTags.recommendations(userId))
}
