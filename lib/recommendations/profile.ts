import type { Favorite, SongPlay } from "@/lib/db"
import type {
  AffinityScore,
  ArtistCoOccurrence,
  TrackFrequency,
  UserTasteProfile,
} from "@/types/recommendations"

// ─── Hyperparameters ─────────────────────────────────────────────────────────

const HP = {
  FAVORITE_WEIGHT: 5.0,      // Explicit signal — strongest
  PLAY_BASE_WEIGHT: 1.0,     // Implicit signal
  FREQUENCY_BOOST: 0.5,      // Extra weight per repeat play (log-scaled)
  RECENCY_HALF_LIFE: 21,     // Days — recent plays matter more
  WARM_THRESHOLD: 5,
  HOT_THRESHOLD: 20,
  SEED_TRACK_COUNT: 5,       // Top N tracks to use as "seeds"
  SESSION_GAP_MINUTES: 30,   // Plays within this gap = same session (for co-occurrence)
} as const

// ─── Math Utilities ──────────────────────────────────────────────────────────

/** Exponential decay: e^(-ln(2) * daysAgo / halfLife) */
function recencyDecay(dateStr: string): number {
  const daysAgo = (Date.now() - new Date(dateStr).getTime()) / 86_400_000
  return Math.exp((-Math.LN2 * Math.max(0, daysAgo)) / HP.RECENCY_HALF_LIFE)
}

/** Shannon entropy normalized to 0-1 (measures distribution uniformity) */
function normalizedEntropy(probabilities: number[]): number {
  if (probabilities.length <= 1) return 0
  const maxEntropy = Math.log2(probabilities.length)
  if (maxEntropy === 0) return 0
  const entropy = probabilities.reduce((sum, p) => {
    if (p <= 0) return sum
    return sum - p * Math.log2(p)
  }, 0)
  return entropy / maxEntropy
}

// ─── Aggregation Helpers ─────────────────────────────────────────────────────

interface RawAccumulator {
  raw: number
  tracks: Set<number>
}

function getOrCreate(map: Map<string, RawAccumulator>, key: string): RawAccumulator {
  let entry = map.get(key)
  if (!entry) {
    entry = { raw: 0, tracks: new Set() }
    map.set(key, entry)
  }
  return entry
}

/** Convert raw scores → AffinityScore[] with both max-normalization and probability distribution */
function buildAffinityList(scores: Map<string, RawAccumulator>): AffinityScore[] {
  const entries = Array.from(scores.entries())
  if (entries.length === 0) return []

  const maxRaw = Math.max(...entries.map(([, v]) => v.raw))
  const totalRaw = entries.reduce((sum, [, v]) => sum + v.raw, 0)
  if (maxRaw === 0 || totalRaw === 0) return []

  return entries
    .map(([name, { raw, tracks }]) => ({
      name,
      score: raw / maxRaw,                // Max-normalized (top item = 1.0)
      probability: raw / totalRaw,         // Probability distribution (sums to 1.0)
      rawScore: raw,
      trackCount: tracks.size,
    }))
    .sort((a, b) => b.score - a.score)
}

// ─── Track Frequency Aggregation ─────────────────────────────────────────────

function aggregateTrackFrequencies(
  plays: SongPlay[],
  favorites: Favorite[]
): TrackFrequency[] {
  const freqMap = new Map<
    number,
    { artistName: string; genre: string | null; count: number; lastPlayed: string }
  >()

  for (const play of plays) {
    const existing = freqMap.get(play.track_id)
    if (existing) {
      existing.count++
      if (play.played_at > existing.lastPlayed) existing.lastPlayed = play.played_at
    } else {
      freqMap.set(play.track_id, {
        artistName: play.artist_name,
        genre: play.genre,
        count: 1,
        lastPlayed: play.played_at,
      })
    }
  }

  // Boost frequency for favorited tracks
  for (const fav of favorites) {
    const existing = freqMap.get(fav.track_id)
    if (existing) {
      existing.count += 3 // Favorite = 3 implicit plays
    } else {
      freqMap.set(fav.track_id, {
        artistName: fav.artist_name,
        genre: fav.genre,
        count: 3,
        lastPlayed: fav.saved_at,
      })
    }
  }

  return Array.from(freqMap.entries())
    .map(([trackId, data]) => ({
      trackId,
      artistName: data.artistName,
      genre: data.genre,
      playCount: data.count,
      lastPlayed: data.lastPlayed,
      // Weighted score: log-scaled frequency × recency
      recencyWeight:
        (1 + HP.FREQUENCY_BOOST * Math.log2(data.count)) * recencyDecay(data.lastPlayed),
    }))
    .sort((a, b) => b.recencyWeight - a.recencyWeight)
}

// ─── Co-Occurrence Graph ─────────────────────────────────────────────────────

/** Identify artists that appear together within listening sessions */
function buildCoOccurrences(plays: SongPlay[]): ArtistCoOccurrence[] {
  if (plays.length < 2) return []

  // Sort by timestamp ascending
  const sorted = [...plays].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  )

  // Split into sessions based on time gap
  const sessions: SongPlay[][] = []
  let currentSession: SongPlay[] = [sorted[0]!]
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]!
    const prev = sorted[i - 1]!
    const gap =
      (new Date(current.played_at).getTime() -
        new Date(prev.played_at).getTime()) /
      60_000
    if (gap > HP.SESSION_GAP_MINUTES) {
      sessions.push(currentSession)
      currentSession = []
    }
    currentSession.push(current)
  }
  sessions.push(currentSession)

  // Count co-occurrences per artist pair within sessions
  const coMap = new Map<string, Map<string, number>>()
  for (const session of sessions) {
    const sessionArtists = Array.from(new Set(session.map((p) => p.artist_name)))
    for (let i = 0; i < sessionArtists.length; i++) {
      for (let j = i + 1; j < sessionArtists.length; j++) {
        const a = sessionArtists[i] as string
        const b = sessionArtists[j] as string
        if (!coMap.has(a)) coMap.set(a, new Map())
        if (!coMap.has(b)) coMap.set(b, new Map())
        const aMap = coMap.get(a)!
        const bMap = coMap.get(b)!
        aMap.set(b, (aMap.get(b) ?? 0) + 1)
        bMap.set(a, (bMap.get(a) ?? 0) + 1)
      }
    }
  }

  // Convert to sorted list
  return Array.from(coMap.entries())
    .map(([artist, coArtistsMap]) => {
      const sorted = Array.from(coArtistsMap.entries()).sort((a, b) => b[1] - a[1])
      return {
        artist,
        coArtists: sorted.map(([name]) => name),
        strength: sorted.reduce((sum, [, count]) => sum + count, 0),
      }
    })
    .sort((a, b) => b.strength - a.strength)
}

// ─── Main Profile Builder ────────────────────────────────────────────────────

export function buildUserProfile(
  userId: string,
  plays: SongPlay[],
  favorites: Favorite[]
): UserTasteProfile {
  const genreScores = new Map<string, RawAccumulator>()
  const artistScores = new Map<string, RawAccumulator>()

  // ── Process favorites (strong explicit signal) ──
  for (const fav of favorites) {
    if (fav.genre) {
      const g = getOrCreate(genreScores, fav.genre)
      g.raw += HP.FAVORITE_WEIGHT
      g.tracks.add(fav.track_id)
    }
    const a = getOrCreate(artistScores, fav.artist_name)
    a.raw += HP.FAVORITE_WEIGHT
    a.tracks.add(fav.track_id)
  }

  // ── Process plays (implicit signal, frequency + recency weighted) ──
  // Aggregate plays per track first to apply frequency boost
  const trackFreqs = aggregateTrackFrequencies(plays, favorites)

  // Use aggregated frequency data for genre/artist scoring
  for (const freq of trackFreqs) {
    const weight = freq.recencyWeight * HP.PLAY_BASE_WEIGHT
    if (freq.genre) {
      const g = getOrCreate(genreScores, freq.genre)
      g.raw += weight
      g.tracks.add(freq.trackId)
    }
    const a = getOrCreate(artistScores, freq.artistName)
    a.raw += weight
    a.tracks.add(freq.trackId)
  }

  const genres = buildAffinityList(genreScores)
  const artists = buildAffinityList(artistScores)

  // Build probability vectors (Map for O(1) lookup during cosine similarity)
  const genreVector = new Map(genres.map((g) => [g.name, g.probability]))
  const artistVector = new Map(artists.map((a) => [a.name, a.probability]))

  // Exploration score: Shannon entropy of genre distribution
  const explorationScore = normalizedEntropy(genres.map((g) => g.probability))

  // Seed tracks: top N by weighted frequency (for "more like this" discovery)
  const seedTrackIds = trackFreqs.slice(0, HP.SEED_TRACK_COUNT).map((t) => t.trackId)

  // Co-occurrence graph
  const artistCoOccurrences = buildCoOccurrences(plays)

  // Profile strength
  const totalSignals = plays.length + favorites.length
  let profileStrength: UserTasteProfile["profileStrength"] = "cold"
  if (totalSignals >= HP.HOT_THRESHOLD) profileStrength = "hot"
  else if (totalSignals >= HP.WARM_THRESHOLD) profileStrength = "warm"

  return {
    userId,
    genres,
    artists,
    genreVector,
    artistVector,
    trackFrequencies: trackFreqs,
    seedTrackIds,
    artistCoOccurrences,
    totalPlays: plays.length,
    totalFavorites: favorites.length,
    uniqueArtists: artistScores.size,
    uniqueGenres: genreScores.size,
    profileStrength,
    explorationScore,
    generatedAt: new Date().toISOString(),
  }
}
