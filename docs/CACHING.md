# Caching Strategy

This document describes every caching layer in the app, the rationale behind each TTL, and how invalidation works.

---

## Overview

The app uses three caching mechanisms, each suited to a different layer:

| Mechanism | Where it works | Use case |
|---|---|---|
| `next: { revalidate: N }` on `fetch()` | **Server-side** HTTP fetches | External API calls (iTunes, PostHog) |
| `export const revalidate = N` on a route/page | **Route-level ISR** | Cache an entire page or API route response |
| `unstable_cache()` from `next/cache` | **Server-side** DB/function results | Supabase queries per-user |

> **Important:** `next: { revalidate }` inside a `fetch()` call **only works in server-side contexts** (Server Components, Route Handlers, Server Actions). It is silently ignored in client-side `fetch` calls.

---

## Cache Locations

### 1. iTunes RSS Charts — `services/itunesService.ts` → `getTopTracks()`

```
TTL: 86400s (24 hours)
Mechanism: next: { revalidate: 86400 } on each fetch()
```

Fetches 8 iTunes RSS feeds (200 songs each) to build the home page discovery pool. Charts update at most once daily, so 24-hour caching is appropriate.

**Before:** `cache: 'no-store'` — every home page load triggered 8 fresh HTTP requests.
**After:** Next.js deduplicates and reuses cached feed responses for up to 24 hours server-wide.

---

### 2. iTunes Track Lookup — `services/itunesService.ts` → `getTrackById()`

```
TTL: 86400s (24 hours)
Mechanism: next: { revalidate: 86400 } on fetch()
```

Called by the track detail page (`/track/[id]`). Track metadata (title, artist, artwork, album) is stable and almost never changes.

---

### 3. iTunes Search — `services/itunesService.ts` → `searchTracks()`

```
TTL: 3600s (1 hour)
Mechanism: next: { revalidate: 3600 } on fetch()
```

Caches search results per query term. New music releases won't appear immediately, but 1-hour staleness is acceptable for a search experience.

---

### 4. Trending Tracks (Hot Section) — `app/api/hot/route.ts`

```
TTL: 60s (1 minute)
Mechanism: export const revalidate = 60  (route-level ISR)
           + next: { revalidate: 60 } on PostHog fetch
           + next: { revalidate: 86400 } on iTunes metadata lookups
```

The `/api/hot` route does two things:
1. Queries PostHog for `track_selected` events in the last 24 hours
2. Looks up track metadata from iTunes for the top 10 results

The route-level `revalidate = 60` means the **entire response** is cached for 60 seconds. All client-side polls from `HotSection.tsx` within that window get the cached response instantly. The iTunes metadata lookups inside are additionally cached for 24 hours so repeated calls for the same track IDs don't hit iTunes.

**Before:** `export const dynamic = 'force-dynamic'` forced a full re-execution on every request, making the `next: { revalidate: 60 }` on the PostHog fetch the only partial mitigation.
**After:** The whole route is ISR-cached. Client polling still works but the server only re-executes once per minute.

---

### 5. User Favorites — `app/api/user/favorites/route.ts`

```
TTL: 300s (5 minutes)
Mechanism: unstable_cache() per userId
Cache key: ["favorites", userId]
Cache tag: favorites-{userId}
Invalidated: immediately on POST (add) and DELETE (remove)
```

`getCachedFavorites(userId)` wraps the Supabase query in `unstable_cache`. Each user gets their own isolated cache entry. When a user adds or removes a favorite, `revalidateFavorites(userId)` calls `revalidateTag("favorites-{userId}")` which immediately purges only that user's cache entry.

**Flow:**
```
GET /api/user/favorites
  └─ getCachedFavorites(userId)     ← returns cached result if < 5 min old
       └─ getFavorites(userId)      ← only hits Supabase on cache miss

POST /api/user/favorites
  ├─ addFavorite(userId, track)     ← writes to Supabase
  └─ revalidateFavorites(userId)    ← purges cache tag → next GET hits DB fresh

DELETE /api/user/favorites
  ├─ removeFavorite(userId, trackId) ← writes to Supabase
  └─ revalidateFavorites(userId)    ← purges cache tag → next GET hits DB fresh
```

---

### 6. User Play History — `app/api/user/plays/route.ts`

```
TTL: 300s (5 minutes)
Mechanism: unstable_cache() per userId + limit
Cache key: ["plays", userId, limit]
Cache tag: plays-{userId}
Invalidated: on POST (new play recorded)
```

`getCachedPlayHistory(userId, limit)` caches the Supabase query. Because the limit is part of the cache key, requests for the history page (`limit=200`) and recently-played page (`limit=100`) are stored as separate entries but share the same invalidation tag.

**Flow:**
```
GET /api/user/plays?limit=200
  └─ getCachedPlayHistory(userId, 200) ← cache hit if < 5 min old

POST /api/user/plays
  ├─ recordPlay(userId, track)         ← writes to Supabase
  └─ revalidatePlays(userId)           ← purges plays-{userId} tag
       └─ both limit=200 and limit=100 entries are invalidated together
```

---

### 7. Track Detail Page — `app/track/[id]/page.tsx`

```
TTL: 86400s (24 hours)
Mechanism: export const revalidate = 86400 (page-level ISR)
```

The page is now a **Server Component** that fetches track data at build/request time and caches the rendered output for 24 hours. The interactive parts (play button, router navigation) are in `TrackDetailClient.tsx` which is a Client Component receiving the pre-fetched `track` as a prop.

**Before:** Client Component with `useEffect` → fetch on every page visit, no server cache, full loading spinner on each navigation.
**After:** Server-rendered with ISR. First visitor triggers a Supabase+iTunes fetch; subsequent visitors within 24 hours get the cached server response instantly.

---

## Central Cache Module — `lib/cache.ts`

All `unstable_cache` wrappers and `revalidateTag` helpers are centralised here. Import from this file rather than calling `unstable_cache` / `revalidateTag` directly in route handlers.

```typescript
import {
  getCachedFavorites,
  getCachedPlayHistory,
  revalidateFavorites,
  revalidatePlays,
  TTL,
  cacheTags,
} from "@/lib/cache"
```

### TTL constants

| Constant | Value | Used for |
|---|---|---|
| `TTL.USER_DATA` | 300s | Favorites, play history |
| `TTL.HOT_TRACKS` | 60s | PostHog trending |
| `TTL.ITUNES_META` | 86400s | Track/artist lookup |
| `TTL.ITUNES_CHARTS` | 86400s | RSS feed charts |
| `TTL.ITUNES_SEARCH` | 3600s | Search results |

---

## What is NOT cached (intentionally)

| Endpoint / function | Reason |
|---|---|
| `POST /api/user/plays` | Write operation — fire and forget |
| `POST /api/user/favorites` | Write operation |
| `DELETE /api/user/favorites` | Write operation |
| `POST /api/auth/sync-user` | Runs once per session, no benefit |
| `POST /api/webhooks/clerk` | Webhook receiver — must always execute |
| PostHog analytics events (`lib/analytics.ts`) | Fire-and-forget tracking |
| Feature flags (`lib/featureFlags.ts`) | PostHog SDK handles its own caching |

---

## Adding Cache to New Endpoints

### For a new external API call (server-side):
```typescript
const res = await fetch("https://api.example.com/data", {
  next: { revalidate: TTL.ITUNES_META }, // pick appropriate TTL from lib/cache.ts
})
```

### For a new Supabase read:
```typescript
// In lib/cache.ts — add a new cached wrapper:
export function getCachedSomething(userId: string) {
  return unstable_cache(
    async () => getSomethingFromDB(userId),
    ["something", userId],
    {
      revalidate: TTL.USER_DATA,
      tags: [`something-${userId}`],
    }
  )()
}

export function revalidateSomething(userId: string) {
  revalidateTag(`something-${userId}`)
}
```

### For a new page:
```typescript
// At the top of the Server Component page file:
export const revalidate = 3600 // seconds
```

---

## Verification

To confirm caching is active during development, watch the server logs:

- **Cache hit:** `HIT` in the fetch log (no outbound network request)
- **Cache miss/revalidate:** `MISS` or `REVALIDATED` — triggers a fresh fetch
- **Supabase:** Check Supabase dashboard → "Logs" — fewer DB queries per minute confirms `unstable_cache` is working
- **PostHog:** Check PostHog → "Activity" — query frequency should drop to ~1/min for the trending endpoint

In production (`next build && next start`), the `.next/cache` directory holds the ISR cache. Route-level cache entries appear in the build output table with their revalidation interval.
