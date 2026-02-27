import { getCachedFavorites, getCachedPlayHistory } from "@/lib/cache"
import { searchTracks, getTopTracks } from "@/services/itunesService"
import { buildUserProfile } from "./profile"
import type { ITunesTrack } from "@/types/itunes"
import type { HotTrackWithMeta } from "@/types/hot"
import type {
  UserTasteProfile,
  ScoredTrack,
  ScoreBreakdown,
  CandidateSource,
  RecommendationsResponse,
} from "@/types/recommendations"

// ─── Blending Ratios (how many of each pool in final 20) ────────────────────

const POOL_RATIOS = {
  hot:  { personalized: 8, discovery: 5, trending: 4, serendipity: 3 },
  warm: { personalized: 6, discovery: 4, trending: 6, serendipity: 4 },
  cold: { personalized: 0, discovery: 0, trending: 10, serendipity: 10 },
} as const

// ─── Candidate Fetching (Multi-Pool) ────────────────────────────────────────

async function fetchTrendingTracks(): Promise<HotTrackWithMeta[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/hot`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return (await res.json()) as HotTrackWithMeta[]
  } catch {
    return []
  }
}

/** Pool 1: Genre + Artist searches (existing behavior, improved) */
async function fetchPersonalizedPool(
  profile: UserTasteProfile
): Promise<ITunesTrack[]> {
  const genreCount = profile.profileStrength === "hot" ? 3 : 2
  const artistCount = profile.profileStrength === "hot" ? 3 : 2

  const searches = [
    ...profile.genres.slice(0, genreCount).map((g) =>
      searchTracks({ term: `${g.name} music`, entity: "song" }).catch(() => ({ resultCount: 0, results: [] }))
    ),
    ...profile.artists.slice(0, artistCount).map((a) =>
      searchTracks({ term: a.name, entity: "song" }).catch(() => ({ resultCount: 0, results: [] }))
    ),
  ]

  const results = await Promise.all(searches)
  return deduplicateTracks(results.flatMap((r) => r.results))
}

/** Pool 2: Discovery — "fans also like" via co-occurrence graph */
async function fetchDiscoveryPool(
  profile: UserTasteProfile
): Promise<ITunesTrack[]> {
  // Find artists the user hasn't listened to much but co-occur with their favorites
  const knownArtists = new Set(profile.artists.map((a) => a.name))
  const discoveryArtists: string[] = []

  for (const co of profile.artistCoOccurrences) {
    for (const coArtist of co.coArtists) {
      if (!knownArtists.has(coArtist) && !discoveryArtists.includes(coArtist)) {
        discoveryArtists.push(coArtist)
        if (discoveryArtists.length >= 3) break
      }
    }
    if (discoveryArtists.length >= 3) break
  }

  // If no co-occurrence data, search for "similar to [top artist] [top genre]"
  if (discoveryArtists.length === 0 && profile.artists.length > 0) {
    const topArtist = profile.artists[0]!.name
    const topGenre = profile.genres[0]?.name ?? "music"
    const searches = [
      searchTracks({ term: `${topGenre} ${new Date().getFullYear()}`, entity: "song" })
        .catch(() => ({ resultCount: 0, results: [] })),
      searchTracks({ term: `${topArtist} similar`, entity: "song" })
        .catch(() => ({ resultCount: 0, results: [] })),
    ]
    const results = await Promise.all(searches)
    return deduplicateTracks(results.flatMap((r) => r.results))
  }

  const searches = discoveryArtists.map((artist) =>
    searchTracks({ term: artist, entity: "song" }).catch(() => ({ resultCount: 0, results: [] }))
  )
  const results = await Promise.all(searches)
  return deduplicateTracks(results.flatMap((r) => r.results))
}

/** Pool 3: Trending tracks filtered to user's genre preferences */
function filterTrendingPool(
  trendingTracks: HotTrackWithMeta[],
  profile: UserTasteProfile
): ITunesTrack[] {
  if (profile.profileStrength === "cold") return trendingTracks
  // Score trending tracks by genre affinity and return all (scoring handles the rest)
  return trendingTracks.filter(
    (t) => profile.genreVector.has(t.primaryGenreName) || true // keep all, scoring prioritizes
  )
}

/** Pool 4: Serendipity — adjacent genres user hasn't explored much */
async function fetchSerendipityPool(
  profile: UserTasteProfile
): Promise<ITunesTrack[]> {
  // Find genres the user has low affinity for but aren't completely unknown
  // Or use a broader "top tracks" pool for genuine discovery
  const lowAffinityGenres = profile.genres
    .filter((g) => g.score < 0.3 && g.score > 0)
    .slice(0, 2)
    .map((g) => g.name)

  // If user is very narrow, add completely new genres from top charts
  const topTracks = await getTopTracks()
  const topGenres = new Set(profile.genres.slice(0, 3).map((g) => g.name))

  // Pick tracks from genres the user doesn't dominate
  const serendipityTracks = topTracks.filter(
    (t) => !topGenres.has(t.primaryGenreName)
  )

  if (lowAffinityGenres.length > 0) {
    const searches = lowAffinityGenres.map((genre) =>
      searchTracks({ term: `${genre} popular`, entity: "song" }).catch(() => ({ resultCount: 0, results: [] }))
    )
    const results = await Promise.all(searches)
    const searched = deduplicateTracks(results.flatMap((r) => r.results))
    return [...searched, ...serendipityTracks.slice(0, 50)]
  }

  return serendipityTracks.slice(0, 100)
}

function deduplicateTracks(tracks: ITunesTrack[]): ITunesTrack[] {
  const seen = new Set<number>()
  return tracks.filter((t) => {
    if (seen.has(t.trackId)) return false
    seen.add(t.trackId)
    return true
  })
}

// ─── Cosine Similarity ───────────────────────────────────────────────────────

/** Cosine similarity between user's genre probability vector and a track's genre */
function genreCosineSimilarity(
  trackGenre: string,
  userGenreVector: Map<string, number>
): number {
  // Track is a one-hot vector in genre space
  // cos(track, user) = user[trackGenre] / (1 * ||user||)
  // Since track is one-hot, this simplifies to user's probability for this genre
  // normalized by the magnitude of the user vector
  const userProb = userGenreVector.get(trackGenre) ?? 0
  if (userProb === 0) return 0

  // Compute L2 norm of user vector
  let normSq = 0
  userGenreVector.forEach((p) => { normSq += p * p })
  const norm = Math.sqrt(normSq)
  if (norm === 0) return 0

  // cos(θ) = dot(track, user) / (||track|| * ||user||)
  // ||track|| = 1 (one-hot), dot = userProb
  return userProb / norm
}

/** Artist familiarity: how well does the user know this artist? */
function artistFamiliarity(
  trackArtist: string,
  userArtistVector: Map<string, number>
): number {
  return userArtistVector.get(trackArtist) ?? 0
}

/** Artist novelty: is this a new-but-related artist? (discovery reward) */
function artistNoveltyBonus(
  trackArtist: string,
  trackGenre: string,
  profile: UserTasteProfile
): number {
  const isKnown = profile.artistVector.has(trackArtist)
  if (isKnown) return 0 // No novelty for known artists

  // Reward new artists in genres the user likes
  const genreAffinity = profile.genreVector.get(trackGenre) ?? 0
  if (genreAffinity <= 0) return 0

  // Higher exploration score → user likes variety → bigger novelty bonus
  const explorationMultiplier = 0.5 + profile.explorationScore * 0.5
  return genreAffinity * explorationMultiplier
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

interface DiversityCounts {
  genres: Map<string, number>
  artists: Map<string, number>
}

function scoreTrack(
  track: ITunesTrack,
  source: CandidateSource,
  profile: UserTasteProfile,
  trendingIds: Set<number>,
  diversity: DiversityCounts
): ScoredTrack {
  // 1. Genre score via cosine similarity (0-30)
  const genreSim = genreCosineSimilarity(track.primaryGenreName, profile.genreVector)
  const genreScore = genreSim * 30

  // 2. Artist familiarity (0-25)
  const familiarity = artistFamiliarity(track.artistName, profile.artistVector)
  const artistScore = familiarity * 25

  // 3. Discovery bonus: new artist in familiar genre (0-15)
  const novelty = artistNoveltyBonus(track.artistName, track.primaryGenreName, profile)
  const discoveryBonus = novelty * 15

  // 4. Trending bonus (0-10)
  const trendingBonus = trendingIds.has(track.trackId) ? 10 : 0

  // 5. Freshness bonus (0-10)
  let freshnessBonus = 0
  if (track.releaseDate) {
    const daysSince = (Date.now() - new Date(track.releaseDate).getTime()) / 86_400_000
    if (daysSince <= 30) freshnessBonus = 10
    else if (daysSince <= 90) freshnessBonus = 7
    else if (daysSince <= 365) freshnessBonus = 3
  }

  // 6. Popularity score from play frequency data (0-10)
  // Tracks from artists with high play frequency get a boost
  const artistFreq = profile.trackFrequencies
    .filter((f) => f.artistName === track.artistName)
    .reduce((sum, f) => sum + f.recencyWeight, 0)
  const popularityScore = Math.min(10, artistFreq * 5)

  // 7. Diversity penalties
  const genreCount = diversity.genres.get(track.primaryGenreName) ?? 0
  const artistCount = diversity.artists.get(track.artistName) ?? 0
  const genrePenalty = -Math.min(15, Math.max(0, (genreCount - 5) * 3))
  const artistPenalty = -Math.min(35, Math.max(0, (artistCount - 2) * 15))
  const diversityPenalty = genrePenalty + artistPenalty

  const raw =
    genreScore + artistScore + discoveryBonus + trendingBonus +
    freshnessBonus + popularityScore + diversityPenalty
  const score = Math.max(0, Math.min(100, raw))

  const breakdown: ScoreBreakdown = {
    genreScore,
    artistScore,
    discoveryBonus,
    trendingBonus,
    freshnessBonus,
    diversityPenalty,
    popularityScore,
  }

  return {
    track,
    score,
    breakdown,
    reason: generateReason(breakdown, track, source, profile),
    source,
  }
}

function generateReason(
  b: ScoreBreakdown,
  track: ITunesTrack,
  source: CandidateSource,
  profile: UserTasteProfile
): string {
  // Discovery pool gets special reasons
  if (source === "discovery" && b.discoveryBonus > 5) {
    return `Fans of ${profile.artists[0]?.name ?? "your favorites"} also like this`
  }
  if (source === "serendipity") return `Explore ${track.primaryGenreName}`
  if (b.artistScore > 15) return `Because you listen to ${track.artistName}`
  if (b.genreScore > 18) return `Because you like ${track.primaryGenreName}`
  if (b.discoveryBonus > 8) return `New artist in ${track.primaryGenreName}`
  if (b.trendingBonus > 0) return "Trending now"
  if (b.freshnessBonus >= 7) return `Fresh release in ${track.primaryGenreName}`
  if (b.popularityScore > 5) return `Based on your listening history`
  if (profile.profileStrength === "cold") return "Popular right now"
  return "You might like this"
}

// ─── Pool Blending (Greedy Interleave) ───────────────────────────────────────

/** Pick top N from each scored pool, interleave for diversity */
function blendPools(
  pools: { source: CandidateSource; tracks: ScoredTrack[] }[],
  ratios: Record<string, number>,
  total: number
): ScoredTrack[] {
  const result: ScoredTrack[] = []
  const seen = new Set<number>()

  // Sort each pool by score descending
  for (const pool of pools) {
    pool.tracks.sort((a, b) => b.score - a.score)
  }

  // Pick from each pool according to ratios
  for (const pool of pools) {
    const quota = ratios[pool.source] ?? 0
    let picked = 0
    for (const item of pool.tracks) {
      if (picked >= quota) break
      if (!seen.has(item.track.trackId)) {
        seen.add(item.track.trackId)
        result.push(item)
        picked++
      }
    }
  }

  // If we haven't hit total, fill from the highest-scoring remaining across all pools
  if (result.length < total) {
    const allRemaining = pools
      .flatMap((p) => p.tracks)
      .filter((t) => !seen.has(t.track.trackId))
      .sort((a, b) => b.score - a.score)

    for (const item of allRemaining) {
      if (result.length >= total) break
      if (!seen.has(item.track.trackId)) {
        seen.add(item.track.trackId)
        result.push(item)
      }
    }
  }

  // Final sort by score
  result.sort((a, b) => b.score - a.score)
  return result.slice(0, total)
}

// ─── Main Orchestrator ───────────────────────────────────────────────────────

export async function generateRecommendationsForUser(
  userId: string
): Promise<RecommendationsResponse> {
  // ── Step 1: Fetch user data in parallel ────────────────────────────────────
  const [plays, favorites, trendingTracks] = await Promise.all([
    getCachedPlayHistory(userId, 200),
    getCachedFavorites(userId),
    fetchTrendingTracks(),
  ])

  // ── Step 2: Build rich user profile ────────────────────────────────────────
  const profile = buildUserProfile(userId, plays, favorites)
  const trendingIds = new Set(trendingTracks.map((t) => t.trackId))

  // ── Step 3: Build exclusion set (already consumed) ─────────────────────────
  const excludeIds = new Set<number>([
    ...plays.map((p) => p.track_id),
    ...favorites.map((f) => f.track_id),
  ])

  // ── Step 4: Fetch candidate pools in parallel ──────────────────────────────
  let personalizedRaw: ITunesTrack[] = []
  let discoveryRaw: ITunesTrack[] = []
  let serendipityRaw: ITunesTrack[] = []

  if (profile.profileStrength !== "cold") {
    ;[personalizedRaw, discoveryRaw, serendipityRaw] = await Promise.all([
      fetchPersonalizedPool(profile),
      fetchDiscoveryPool(profile),
      fetchSerendipityPool(profile),
    ])
  } else {
    serendipityRaw = await getTopTracks().then((t) => t.slice(0, 100))
  }

  const trendingRaw = filterTrendingPool(trendingTracks, profile)

  // ── Step 5: Filter exclusions from all pools ───────────────────────────────
  const filterExclusions = (tracks: ITunesTrack[]) =>
    tracks.filter((t) => !excludeIds.has(t.trackId))

  const personalizedFiltered = filterExclusions(personalizedRaw)
  const discoveryFiltered = filterExclusions(discoveryRaw)
  const trendingFiltered = filterExclusions(trendingRaw)
  const serendipityFiltered = filterExclusions(serendipityRaw)

  // ── Step 6: Score each pool with diversity tracking ────────────────────────
  const emptyDiv: DiversityCounts = { genres: new Map(), artists: new Map() }

  const scorePool = (tracks: ITunesTrack[], source: CandidateSource): ScoredTrack[] => {
    // First pass: score without diversity
    const initial = tracks.map((t) => scoreTrack(t, source, profile, trendingIds, emptyDiv))
    initial.sort((a, b) => b.score - a.score)

    // Second pass: apply diversity penalties based on position
    const div: DiversityCounts = { genres: new Map(), artists: new Map() }
    return initial.map((item) => {
      const g = item.track.primaryGenreName
      const a = item.track.artistName
      div.genres.set(g, (div.genres.get(g) ?? 0) + 1)
      div.artists.set(a, (div.artists.get(a) ?? 0) + 1)
      return scoreTrack(item.track, source, profile, trendingIds, div)
    })
  }

  const scoredPools = [
    { source: "personalized" as CandidateSource, tracks: scorePool(personalizedFiltered, "personalized") },
    { source: "discovery" as CandidateSource, tracks: scorePool(discoveryFiltered, "discovery") },
    { source: "trending" as CandidateSource, tracks: scorePool(trendingFiltered, "trending") },
    { source: "serendipity" as CandidateSource, tracks: scorePool(serendipityFiltered, "serendipity") },
  ]

  // ── Step 7: Blend pools according to profile strength ratios ───────────────
  const ratios = POOL_RATIOS[profile.profileStrength]
  const recommendations = blendPools(scoredPools, ratios, 20)

  // ── Step 8: If too few results, relax exclusions ───────────────────────────
  if (recommendations.length < 10) {
    const favIds = new Set(favorites.map((f) => f.track_id))
    const relaxed = [...personalizedRaw, ...discoveryRaw, ...trendingRaw, ...serendipityRaw]
      .filter((t) => !favIds.has(t.trackId))

    const relaxedScored = scorePool(deduplicateTracks(relaxed), "personalized")
    const relaxedPool = [{ source: "personalized" as CandidateSource, tracks: relaxedScored }]
    const filled = blendPools(relaxedPool, { personalized: 20 }, 20)

    // Merge, keeping existing, filling remaining
    const existingIds = new Set(recommendations.map((r) => r.track.trackId))
    for (const item of filled) {
      if (recommendations.length >= 20) break
      if (!existingIds.has(item.track.trackId)) {
        recommendations.push(item)
      }
    }
  }

  return {
    recommendations,
    profile: {
      topGenres: profile.genres.slice(0, 3).map((g) => g.name),
      topArtists: profile.artists.slice(0, 3).map((a) => a.name),
      strength: profile.profileStrength,
      explorationScore: profile.explorationScore,
    },
    generatedAt: new Date().toISOString(),
  }
}
