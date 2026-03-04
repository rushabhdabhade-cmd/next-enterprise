# Recommendation Engine Documentation

## Overview

The "For You" section delivers personalized music recommendations using a content-based scoring engine that runs entirely server-side in Node.js. It analyzes each user's play history and favorites to build a taste profile, then scores candidate tracks from multiple sources using techniques inspired by information retrieval and machine learning: cosine similarity, probability distributions, co-occurrence graphs, Shannon entropy, exponential decay, and multi-pool blending with diversity constraints.

No external ML services are required. The entire pipeline runs within Next.js API routes and is cached with `unstable_cache`.

---

## Architecture

```
                        +---------------------+
                        |   ForYouSection.tsx  |   (Client Component)
                        |   "For You" tab UI  |
                        +---------+-----------+
                                  |
                          fetch("/api/user/recommendations")
                                  |
                        +---------v-----------+
                        |   API Route (GET)   |   app/api/user/recommendations/route.ts
                        |   Auth + Cache      |
                        +---------+-----------+
                                  |
                      getCachedRecommendations(userId)
                          (30-min unstable_cache)
                                  |
                        +---------v-----------+
                        |  Recommendation     |   lib/recommendations/engine.ts
                        |  Engine             |
                        +---------+-----------+
                                  |
                    +-------------+-------------+
                    |                           |
          +---------v---------+     +----------v----------+
          |  Profile Builder  |     |  Candidate Fetcher  |
          |  profile.ts       |     |  (4 parallel pools) |
          +-------------------+     +---------------------+
                    |                           |
          +--------+--------+        +---------+---------+
          |                 |        |         |         |
     Play History     Favorites   iTunes   /api/hot  Top Charts
     (Supabase)      (Supabase)   Search   (PostHog)  (RSS)
```

### File Map

| File | Role |
|------|------|
| `types/recommendations.ts` | All TypeScript interfaces |
| `lib/recommendations/profile.ts` | User taste profile builder |
| `lib/recommendations/engine.ts` | Scoring engine + candidate fetching + pool blending |
| `lib/cache.ts` | Cache layer (30-min TTL for recommendations) |
| `app/api/user/recommendations/route.ts` | Authenticated API endpoint |
| `lib/api.ts` | Client-side fetch helper |
| `components/ForYouSection.tsx` | Frontend UI component |

---

## Step 1: User Taste Profile

**File:** `lib/recommendations/profile.ts`
**Function:** `buildUserProfile(userId, plays, favorites) -> UserTasteProfile`

### 1.1 Data Sources

| Source | Table | Key Fields | Signal Type |
|--------|-------|------------|-------------|
| Play History | `song_plays` | track_id, artist_name, genre, played_at | Implicit (behavioral) |
| Favorites | `favorites` | track_id, artist_name, genre, saved_at | Explicit (intentional) |

### 1.2 Hyperparameters

```
FAVORITE_WEIGHT     = 5.0    # Each favorited track contributes 5x
PLAY_BASE_WEIGHT    = 1.0    # Base weight per play
FREQUENCY_BOOST     = 0.5    # Log-scaled boost for repeat plays
RECENCY_HALF_LIFE   = 21     # Days until a play's weight halves
SESSION_GAP_MINUTES = 30     # Max gap between plays in same "session"
SEED_TRACK_COUNT    = 5      # Number of seed tracks for discovery
WARM_THRESHOLD      = 5      # Minimum signals for "warm" profile
HOT_THRESHOLD       = 20     # Minimum signals for "hot" profile
```

### 1.3 Track Frequency Aggregation

Raw play history contains one entry per play. The profile builder first aggregates these into per-track frequencies:

```
For each unique track:
  playCount = number of times played
  lastPlayed = most recent play timestamp
  recencyWeight = (1 + 0.5 * log2(playCount)) * e^(-ln2 * daysAgo / 21)
```

**Why log-scaled frequency?** Playing a song 100x vs 10x shows preference, but not 10x stronger. Log dampens this: `log2(1) = 0`, `log2(4) = 2`, `log2(16) = 4`, `log2(100) = 6.6`.

**Favorites get a frequency boost:** Each favorited track receives +3 to its play count, making favoriting equivalent to ~3 additional plays.

### 1.4 Genre & Artist Scoring

Two parallel scoring pipelines produce affinity lists:

```
For each favorite:
  genreScores[genre]   += 5.0  (FAVORITE_WEIGHT)
  artistScores[artist] += 5.0

For each aggregated track frequency:
  weight = recencyWeight * 1.0  (PLAY_BASE_WEIGHT)
  genreScores[genre]   += weight
  artistScores[artist] += weight
```

### 1.5 Dual Normalization

Each affinity list is normalized two ways:

| Normalization | Formula | Purpose |
|---------------|---------|---------|
| **Max-normalized** (`score`) | `rawScore / max(allRawScores)` | Top item = 1.0, relative ranking |
| **Probability** (`probability`) | `rawScore / sum(allRawScores)` | Sums to 1.0, used as probability vector for cosine similarity |

**Example:**

```
Genre scores: { Pop: 25, Rock: 15, Jazz: 10 }
Total = 50, Max = 25

Pop:  score = 1.0,  probability = 0.50
Rock: score = 0.6,  probability = 0.30
Jazz: score = 0.4,  probability = 0.20
```

### 1.6 Probability Vectors (for Cosine Similarity)

The `probability` values are stored in `Map<string, number>` structures:

- `genreVector`: genre name -> probability (used in cosine similarity scoring)
- `artistVector`: artist name -> probability (used in familiarity scoring)

These act as the user's representation in genre-space and artist-space, analogous to user embeddings in neural recommendation systems.

### 1.7 Co-Occurrence Graph (for Discovery)

The profile builder identifies which artists appear together in listening sessions:

```
1. Sort all plays by timestamp
2. Split into sessions (gap > 30 minutes = new session)
3. Within each session, find all unique artist pairs
4. Count how often each pair co-occurs across all sessions
5. Build adjacency list: artist -> [co-occurring artists, sorted by frequency]
```

**Example:**
```
Session 1: [Drake, The Weeknd, Drake, Ariana Grande]
Session 2: [The Weeknd, Dua Lipa]
Session 3: [Drake, The Weeknd]

Co-occurrences:
  Drake <-> The Weeknd: 2 times
  Drake <-> Ariana Grande: 1 time
  The Weeknd <-> Ariana Grande: 1 time
  The Weeknd <-> Dua Lipa: 1 time
```

This graph powers the **Discovery pool** — finding artists the user hasn't listened to directly but who co-occur with their favorites in other users' sessions.

### 1.8 Exploration Score (Shannon Entropy)

Measures how diverse the user's genre distribution is:

```
H(genres) = -SUM(p * log2(p)) for each genre probability p
explorationScore = H(genres) / log2(numGenres)   # Normalized to 0-1
```

| Score | Meaning | Effect on Recommendations |
|-------|---------|--------------------------|
| 0.0 | Listens to only one genre | Low novelty bonus, more familiar tracks |
| 0.5 | Moderate variety | Balanced mix |
| 1.0 | Perfectly uniform across genres | High novelty bonus, more discovery |

### 1.9 Profile Strength

| Strength | Total Signals | Behavior |
|----------|---------------|----------|
| `cold` | 0-4 plays + favorites | No personalized search; trending + top charts only |
| `warm` | 5-19 | 4 iTunes searches (2 genres + 2 artists); 30% trending mix |
| `hot` | 20+ | 6 iTunes searches (3 genres + 3 artists); full personalization |

---

## Step 2: Candidate Fetching (Multi-Pool)

**File:** `lib/recommendations/engine.ts`

The engine fetches candidates from 4 independent pools in parallel:

### Pool 1: Personalized (Genre + Artist Search)

```
Search iTunes for: top N genres + top N artists
  hot:  3 genres + 3 artists = 6 searches
  warm: 2 genres + 2 artists = 4 searches
  cold: skipped
```

Each `searchTracks()` call returns up to 200 results and is cached for 1 hour by the iTunes service. Genre searches append "music" to the term (e.g., "Pop music") for broader results.

### Pool 2: Discovery ("Fans Also Like")

Uses the co-occurrence graph from the user profile:

```
1. Find artists in co-occurrence graph that are NOT in user's known artists
2. Take up to 3 discovery artists
3. Search iTunes for each

Fallback (if no co-occurrence data):
  - Search "[top genre] [current year]" for current hits in familiar genres
  - Search "[top artist] similar" for related artists
```

### Pool 3: Trending

Fetches from the `/api/hot` endpoint (PostHog analytics — top 10 tracks by `track_selected` events in last 24h). All trending tracks are passed through to scoring; the scoring function handles genre-based prioritization.

### Pool 4: Serendipity (Adjacent Genres)

Surfaces tracks from genres the user hasn't explored much:

```
1. Find genres with score < 0.3 but > 0 (low affinity, not unknown)
2. Search iTunes for "[genre] popular"
3. Also fetch from getTopTracks() RSS feeds, filtered to genres
   outside the user's top 3
```

This pool enables genre exploration and prevents the "filter bubble" problem.

### Exclusion Filtering

After fetching, all pools are filtered against an exclusion set:

```
excludeIds = Set(all played trackIds + all favorited trackIds)
```

If fewer than 10 candidates survive, the filter is relaxed to only exclude favorites (allowing replays of previously heard tracks).

---

## Step 3: Scoring Algorithm

### 3.1 Score Components (0-100 scale)

| Component | Max Points | Algorithm |
|-----------|-----------|-----------|
| **Genre Match** | 30 | Cosine similarity between track's genre (one-hot) and user's genre probability vector |
| **Artist Familiarity** | 25 | User's probability for this artist (from artistVector) |
| **Discovery Bonus** | 15 | Rewards new artists in genres the user likes; scaled by exploration score |
| **Trending Bonus** | 10 | Flat bonus if track is in current hot tracks |
| **Freshness Bonus** | 10 | Tiered by release date: <=30d=10, <=90d=7, <=1yr=3, else 0 |
| **Popularity Score** | 10 | Based on user's own play frequency for this artist |
| **Diversity Penalty** | -50 max | Genre penalty (-3 per track after 5th) + Artist penalty (-15 per track after 2nd) |

### 3.2 Cosine Similarity (Genre Scoring)

The user's genre preferences are a probability vector in genre-space. Each candidate track is a one-hot vector (it belongs to exactly one genre). The cosine similarity simplifies to:

```
cos(track, user) = user[trackGenre] / ||user||

Where:
  user[trackGenre] = probability of that genre in user's profile
  ||user|| = L2 norm = sqrt(sum(p^2 for all genre probabilities))
```

**Why cosine similarity over exact matching?** A user who listens to 50% Pop, 30% Rock, 20% Jazz should see Pop tracks score higher than Rock, which scores higher than Jazz — proportionally, not all-or-nothing.

### 3.3 Artist Novelty / Discovery Bonus

```
if artist is already in user's profile:
  novelty = 0  (no bonus for familiar artists)
else:
  genreAffinity = user's probability for this track's genre
  explorationMultiplier = 0.5 + explorationScore * 0.5
  novelty = genreAffinity * explorationMultiplier
  discoveryBonus = novelty * 15
```

This means: a new artist in a genre the user loves gets a high discovery bonus. Users with high exploration scores (diverse listeners) get even higher novelty rewards.

### 3.4 Diversity Penalties

Applied during the two-pass scoring to prevent repetitive results:

**Genre penalty:** Kicks in after 5 tracks of the same genre
```
penalty = -min(15, max(0, (genreCount - 5) * 3))
```

**Artist penalty:** Kicks in after 2 tracks of the same artist (stricter)
```
penalty = -min(35, max(0, (artistCount - 2) * 15))
```

This ensures the final 20 tracks span multiple artists and genres.

### 3.5 Two-Pass Scoring

```
Pass 1: Score all candidates WITHOUT diversity penalties
         Sort by score descending

Pass 2: Walk through sorted list top-to-bottom
         Track genre/artist counts
         Re-score WITH diversity penalties based on position
         Re-sort
```

This prevents the order-dependence of single-pass diversity enforcement.

### 3.6 Reason Generation

Each scored track gets a human-readable explanation, prioritized by:

```
1. Discovery pool + high discovery bonus -> "Fans of {top artist} also like this"
2. Serendipity pool                      -> "Explore {genre}"
3. High artist score (>15)               -> "Because you listen to {artist}"
4. High genre score (>18)                -> "Because you like {genre}"
5. High discovery bonus (>8)             -> "New artist in {genre}"
6. Trending bonus                        -> "Trending now"
7. High freshness (>=7)                  -> "Fresh release in {genre}"
8. High popularity (>5)                  -> "Based on your listening history"
9. Cold profile                          -> "Popular right now"
10. Default                              -> "You might like this"
```

---

## Step 4: Pool Blending

Instead of ranking all tracks in a single list, the engine blends tracks from each pool according to target quotas:

### Blending Ratios (out of 20 tracks)

| Profile Strength | Personalized | Discovery | Trending | Serendipity |
|-----------------|-------------|-----------|----------|-------------|
| **Hot** (20+ signals) | 8 | 5 | 4 | 3 |
| **Warm** (5-19) | 6 | 4 | 6 | 4 |
| **Cold** (0-4) | 0 | 0 | 10 | 10 |

### Blending Algorithm (Greedy Interleave)

```
1. Sort each pool by score descending
2. Pick top N from each pool (per quota), skipping duplicates
3. If total < 20, fill from highest-scoring remaining across all pools
4. Final sort by score descending
5. Return top 20
```

This guarantees every recommendation batch contains a mix of familiar favorites, new discoveries, trending hits, and genre exploration — even when one pool dominates on pure score.

---

## Step 5: Caching & Invalidation

### Cache Configuration

| Resource | TTL | Tag Pattern | Technology |
|----------|-----|-------------|------------|
| Recommendations | 30 min | `recs-{userId}` | `unstable_cache` |
| Play History | 5 min | `plays-{userId}` | `unstable_cache` |
| Favorites | 5 min | `favorites-{userId}` | `unstable_cache` |
| iTunes Search | 1 hour | — | `next: { revalidate }` fetch cache |
| iTunes Charts | 24 hours | — | `next: { revalidate }` fetch cache |
| Trending (PostHog) | 1 min | — | `next: { revalidate }` fetch cache |

### Invalidation Triggers

Recommendations are revalidated when the user's behavior changes:

| User Action | API Route | Invalidation |
|-------------|-----------|--------------|
| Play a track | `POST /api/user/plays` | `revalidatePlays()` + `revalidateRecommendations()` |
| Favorite a track | `POST /api/user/favorites` | `revalidateFavorites()` + `revalidateRecommendations()` |
| Unfavorite a track | `DELETE /api/user/favorites` | `revalidateFavorites()` + `revalidateRecommendations()` |

This uses Next.js stale-while-revalidate: the old recommendations are served immediately while new ones generate in the background.

---

## Step 6: Frontend (ForYouSection)

**File:** `components/ForYouSection.tsx`

### Component States

| State | Condition | UI |
|-------|-----------|-----|
| Not signed in | `isLoaded && !isSignedIn` | Sign-in prompt with pink LogIn icon |
| Loading | `loading === true` | Header + `CatalogLoadingSkeleton` |
| Empty / Error | No recommendations returned | "Keep exploring" message |
| Success | Recommendations loaded | Header + reason pills + `CatalogGrid` |

### Header Subtitles by Profile Strength

| Strength | Subtitle Example |
|----------|-----------------|
| `hot` | "Based on your love of Pop, Hip-Hop/Rap, Alternative" |
| `warm` | "Getting to know you -- you seem to like Drake & The Weeknd" |
| `cold` | "Popular picks to get you started" |

### Reason Pills (Color-Coded by Source)

| Source | Color | Example Reason |
|--------|-------|----------------|
| Personalized | Pink | "Because you listen to Drake" |
| Discovery | Purple | "Fans of Drake also like this" |
| Trending | Orange | "Trending now" |
| Serendipity | Blue | "Explore Country" |

The component extracts up to 5 unique reasons from the top 10 recommendations, color-coded by their candidate pool source.

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| 0 plays, 0 favorites | `cold` profile -> trending + top charts, no personalized search |
| All plays same artist | Artist diversity penalty (-15 per track after 2nd) limits to ~2-3 tracks from that artist |
| All plays same genre | Genre diversity penalty + serendipity pool ensures genre variety |
| iTunes search fails | `Promise.allSettled` pattern; failed searches return empty; other pools compensate |
| All candidates already played | Exclusion filter relaxed to only exclude favorites |
| User not signed in | API returns 401; frontend shows sign-in prompt |
| Very new user (1-4 signals) | `cold` profile; shows curated top charts + trending as starting point |

---

## Performance

| Metric | Value |
|--------|-------|
| Cache hit response | ~5ms (served from `unstable_cache`) |
| Cold cache miss | ~1-2s (6 parallel iTunes searches + profile computation) |
| Memory per generation | ~500KB (500 candidates * ~1KB each) |
| Final output | 20 tracks with full score breakdowns |
| iTunes API efficiency | Shared 1h fetch cache across users with same genre searches |
| Profile computation | ~1-5ms (pure in-memory, no I/O) |

---

## API Reference

### `GET /api/user/recommendations`

**Authentication:** Required (Clerk)

**Response:** `200 OK`

```json
{
  "recommendations": [
    {
      "track": { "trackId": 123, "trackName": "...", "artistName": "...", ... },
      "score": 85.4,
      "breakdown": {
        "genreScore": 28.5,
        "artistScore": 22.0,
        "discoveryBonus": 0,
        "trendingBonus": 10,
        "freshnessBonus": 7,
        "diversityPenalty": 0,
        "popularityScore": 8.2
      },
      "reason": "Because you listen to Drake",
      "source": "personalized"
    }
  ],
  "profile": {
    "topGenres": ["Hip-Hop/Rap", "Pop", "R&B/Soul"],
    "topArtists": ["Drake", "The Weeknd", "Ariana Grande"],
    "strength": "hot",
    "explorationScore": 0.72
  },
  "generatedAt": "2026-02-27T10:30:00.000Z"
}
```

**Error responses:**
- `401 Unauthorized` — not signed in
- `500 Internal Server Error` — recommendation generation failed
