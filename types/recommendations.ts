import { ITunesTrack } from "./itunes"

// ─── Profile Types ───────────────────────────────────────────────────────────

export interface AffinityScore {
  name: string
  score: number        // Normalized 0-1 (max-normalized)
  probability: number  // Probability distribution (sums to 1.0 across all entries)
  rawScore: number
  trackCount: number
}

/** Track play frequency — aggregated from raw play history */
export interface TrackFrequency {
  trackId: number
  artistName: string
  genre: string | null
  playCount: number
  lastPlayed: string       // ISO timestamp
  recencyWeight: number    // Exponential decay-weighted score
}

/** Artists that co-occur in user's listening — basis for "fans also like" */
export interface ArtistCoOccurrence {
  artist: string
  coArtists: string[]      // Other artists played in same sessions
  strength: number         // Co-occurrence frequency
}

export interface UserTasteProfile {
  userId: string

  // Affinity lists (sorted descending)
  genres: AffinityScore[]
  artists: AffinityScore[]

  // Probability distribution vectors (for cosine similarity)
  genreVector: Map<string, number>   // genre → probability
  artistVector: Map<string, number>  // artist → probability

  // Frequency data
  trackFrequencies: TrackFrequency[]
  seedTrackIds: number[]             // Top tracks by weighted frequency (for "more like this")

  // Co-occurrence graph (for discovery)
  artistCoOccurrences: ArtistCoOccurrence[]

  // Metadata
  totalPlays: number
  totalFavorites: number
  uniqueArtists: number
  uniqueGenres: number
  profileStrength: "cold" | "warm" | "hot"
  explorationScore: number  // 0-1: how diverse is user's listening? (entropy-based)
  generatedAt: string
}

// ─── Scoring Types ───────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  genreScore: number         // 0-30 (cosine similarity based)
  artistScore: number        // 0-25 (familiarity)
  discoveryBonus: number     // 0-15 (new artist in familiar genre)
  trendingBonus: number      // 0-10
  freshnessBonus: number     // 0-10
  diversityPenalty: number   // 0 to -50
  popularityScore: number    // 0-10 (from play frequency data)
}

/** Which pool this candidate came from */
export type CandidateSource =
  | "personalized"   // Genre/artist search
  | "discovery"      // Co-occurrence / "fans also like"
  | "trending"       // Hot tracks matching user genres
  | "serendipity"    // Adjacent genres for exploration
  | "coldstart"      // Top charts fallback

export interface ScoredTrack {
  track: ITunesTrack
  score: number
  breakdown: ScoreBreakdown
  reason: string
  source: CandidateSource
}

export interface RecommendationsResponse {
  recommendations: ScoredTrack[]
  profile: {
    topGenres: string[]
    topArtists: string[]
    strength: "cold" | "warm" | "hot"
    explorationScore: number
  }
  generatedAt: string
}
