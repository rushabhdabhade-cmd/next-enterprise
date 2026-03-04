/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITunesMusicVideo, ITunesPodcast, ITunesSearchResponse, ITunesTrack, SearchTrackParams } from "@/types/itunes"

const ITUNES_API_BASE = "https://itunes.apple.com/search"
const ITUNES_LOOKUP_BASE = "https://itunes.apple.com/lookup"

// Maximum content pool for 20 pages (400 tracks)
export async function getTopTracks(): Promise<ITunesTrack[]> {
  try {
    console.log("Fetching global track pool for 20-page pagination...")

    // We fetch a wide variety of feeds to ensure we have way more than 400 tracks after deduplication
    const feeds = [
      "https://itunes.apple.com/us/rss/topsongs/limit=200/json",
      "https://itunes.apple.com/us/rss/topsongs/limit=200/genre=14/json", // Pop
      "https://itunes.apple.com/us/rss/topsongs/limit=200/genre=18/json", // Hip-Hop/Rap
      "https://itunes.apple.com/us/rss/topsongs/limit=200/genre=20/json", // Alternative
      "https://itunes.apple.com/us/rss/topsongs/limit=200/genre=21/json", // Rock
      "https://itunes.apple.com/us/rss/topsongs/limit=200/genre=4/json",  // Country
      "https://itunes.apple.com/us/rss/topsongs/limit=200/genre=17/json", // Dance
      "https://itunes.apple.com/us/rss/newreleases/limit=200/json"        // New
    ]

    const responses = await Promise.all(
      feeds.map(url => fetch(url, { next: { revalidate: 86400 } }).catch(() => null))
    )

    const dataObjects = await Promise.all(
      responses.map(res => res && res.ok ? res.json() : { feed: { entry: [] } })
    ) as any[]

    const allEntries = dataObjects.flatMap(data => data.feed?.entry || [])

    if (allEntries.length === 0) {
      console.warn("No entries found in RSS feeds")
      return []
    }

    // Map and deduplicate by trackId
    const seenIds = new Set<string>()
    const mappedTracks: ITunesTrack[] = []

    allEntries.forEach((entry: any, index: number) => {
      try {
        if (!entry) return

        const trackIdStr = entry.id?.attributes?.["im:id"] || entry.id?.label?.split('/').pop()?.split('?')[0] || `auto-${index}`
        if (seenIds.has(trackIdStr)) return
        seenIds.add(trackIdStr)

        const links = Array.isArray(entry.link) ? entry.link : (entry.link ? [entry.link] : [])
        const previewLink = links.find((l: any) => l.attributes?.title === "Preview" || l.attributes?.rel === "enclosure")

        mappedTracks.push({
          trackId: parseInt(trackIdStr, 10) || 1000000 + index,
          artistName: entry["im:artist"]?.label || "Unknown Artist",
          trackName: entry["im:name"]?.label || "Unknown Track",
          collectionName: entry["im:collection"]?.["im:name"]?.label || entry["im:collection"]?.label || "Unknown Album",
          previewUrl: previewLink?.attributes?.href || entry.link?.attributes?.href || "",
          artworkUrl30: entry["im:image"]?.[0]?.label || "",
          artworkUrl60: entry["im:image"]?.[1]?.label || "",
          artworkUrl100: entry["im:image"]?.[2]?.label || "",
          releaseDate: entry["im:releaseDate"]?.label || "",
          primaryGenreName: entry.category?.attributes?.label || "Music",
          trackTimeMillis: parseInt(previewLink?.["im:duration"]?.label || "0", 10) || 0,
          wrapperType: "track",
          kind: "song",
          artistId: 0,
          collectionId: 0,
          trackPrice: 0,
          collectionPrice: 0,
          country: "USA",
          currency: "USD",
          isStreamable: true
        } as ITunesTrack)
      } catch (_err) {
        // Skip malformed
      }
    })

    console.log(`Successfully mapped ${mappedTracks.length} unique tracks from 8 RSS sources`)
    // Shuffle the entire pool to ensure variety across pages
    return mappedTracks.sort(() => 0.5 - Math.random())
  } catch (error) {
    console.error("Critical failure in getTopTracks:", error)
    return []
  }
}

export async function searchTracks(
  params: SearchTrackParams
): Promise<ITunesSearchResponse> {
  try {
    const queryParams = new URLSearchParams({
      term: params.term,
      entity: params.entity || "song",
      limit: "200",
    })

    const response = await fetch(`${ITUNES_API_BASE}?${queryParams}`, {
      method: "GET",
      next: { revalidate: 3600 }, // cache search results for 1 hour
    })

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.statusText}`)
    }

    const data = (await response.json()) as ITunesSearchResponse
    return data
  } catch (error) {
    console.error("Failed to search tracks:", error)
    throw error
  }
}

export async function getTrackById(id: number): Promise<ITunesTrack | null> {
  try {
    const response = await fetch(`${ITUNES_LOOKUP_BASE}?id=${id}`, {
      method: "GET",
      next: { revalidate: 86400 }, // track metadata is stable for 24h
    })

    if (!response.ok) {
      throw new Error(`iTunes Lookup error: ${response.statusText}`)
    }

    const data = (await response.json()) as ITunesSearchResponse
    return data.results[0] || null
  } catch (error) {
    console.error("Failed to lookup track:", error)
    throw error
  }
}

export function formatDuration(milliseconds: number): string {
  if (!milliseconds) return "0:00"
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// ─── Podcasts ───────────────────────────────────────────────────────────────

export async function searchPodcasts(
  term: string,
  limit = 20
): Promise<ITunesPodcast[]> {
  try {
    const queryParams = new URLSearchParams({
      term,
      entity: "podcast",
      limit: String(limit),
    })

    const response = await fetch(`${ITUNES_API_BASE}?${queryParams}`, {
      method: "GET",
      next: { revalidate: 3600 },
    })

    if (!response.ok) throw new Error(`iTunes API error: ${response.statusText}`)

    const data = await response.json() as { results: ITunesPodcast[] }
    return data.results
  } catch (error) {
    console.error("Failed to search podcasts:", error)
    return []
  }
}

export async function getTopPodcasts(limit = 20): Promise<ITunesPodcast[]> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/us/rss/toppodcasts/limit=${limit}/json`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) throw new Error(`RSS error: ${response.statusText}`)

    const data = await response.json() as { feed?: { entry?: any[] } }
    const entries = data.feed?.entry || []

    return entries.map((entry: any, index: number) => ({
      wrapperType: "track",
      kind: "podcast",
      collectionId: parseInt(entry.id?.attributes?.["im:id"] || `${index}`, 10),
      trackId: parseInt(entry.id?.attributes?.["im:id"] || `${index}`, 10),
      artistName: entry["im:artist"]?.label || "Unknown",
      collectionName: entry["im:name"]?.label || "Unknown Podcast",
      trackName: entry["im:name"]?.label || "Unknown Podcast",
      artworkUrl100: entry["im:image"]?.[2]?.label || "",
      artworkUrl600: (entry["im:image"]?.[2]?.label || "").replace("170x170", "600x600"),
      feedUrl: "",
      trackCount: parseInt(entry["im:contentType"]?.attributes?.term || "0", 10),
      releaseDate: entry["im:releaseDate"]?.label || "",
      primaryGenreName: entry.category?.attributes?.label || "Podcasts",
      contentAdvisoryRating: entry["im:contentType"]?.attributes?.label || "",
      genres: [],
      collectionViewUrl: entry.link?.attributes?.href || "",
    })) as ITunesPodcast[]
  } catch (error) {
    console.error("Failed to fetch top podcasts:", error)
    return []
  }
}

// ─── Music Videos ───────────────────────────────────────────────────────────

export async function searchMusicVideos(
  term: string,
  limit = 30
): Promise<ITunesMusicVideo[]> {
  try {
    const queryParams = new URLSearchParams({
      term,
      entity: "musicVideo",
      limit: String(limit),
    })

    const response = await fetch(`${ITUNES_API_BASE}?${queryParams}`, {
      method: "GET",
      next: { revalidate: 3600 },
    })

    if (!response.ok) throw new Error(`iTunes API error: ${response.statusText}`)

    const data = await response.json() as { results: ITunesMusicVideo[] }
    return data.results
  } catch (error) {
    console.error("Failed to search music videos:", error)
    return []
  }
}

// ─── Charts by Genre & Country ──────────────────────────────────────────────

export async function getTopTracksByGenre(
  genreId: string,
  country = "us",
  limit = 100
): Promise<ITunesTrack[]> {
  try {
    const genrePath = genreId && genreId !== "all" ? `/genre=${genreId}` : ""
    const url = `https://itunes.apple.com/${country}/rss/topsongs/limit=${limit}${genrePath}/json`

    const response = await fetch(url, { next: { revalidate: 86400 } })
    if (!response.ok) throw new Error(`RSS error: ${response.statusText}`)

    const data = await response.json() as { feed?: { entry?: any[] } }
    const entries = data.feed?.entry || []

    return entries.map((entry: any, index: number) => {
      const trackIdStr = entry.id?.attributes?.["im:id"] || `auto-${index}`
      const links = Array.isArray(entry.link) ? entry.link : entry.link ? [entry.link] : []
      const previewLink = links.find((l: any) => l.attributes?.title === "Preview" || l.attributes?.rel === "enclosure")

      return {
        trackId: parseInt(trackIdStr, 10) || 1000000 + index,
        artistName: entry["im:artist"]?.label || "Unknown Artist",
        trackName: entry["im:name"]?.label || "Unknown Track",
        collectionName: entry["im:collection"]?.["im:name"]?.label || entry["im:collection"]?.label || "Unknown Album",
        previewUrl: previewLink?.attributes?.href || entry.link?.attributes?.href || "",
        artworkUrl30: entry["im:image"]?.[0]?.label || "",
        artworkUrl60: entry["im:image"]?.[1]?.label || "",
        artworkUrl100: entry["im:image"]?.[2]?.label || "",
        releaseDate: entry["im:releaseDate"]?.label || "",
        primaryGenreName: entry.category?.attributes?.label || "Music",
        trackTimeMillis: parseInt(previewLink?.["im:duration"]?.label || "0", 10) || 0,
        wrapperType: "track",
        kind: "song",
        artistId: 0,
        collectionId: 0,
        trackPrice: 0,
        collectionPrice: 0,
        country: country.toUpperCase(),
        currency: "USD",
        isStreamable: true,
        trackCensoredName: entry["im:name"]?.label || "Unknown Track",
      } as ITunesTrack
    })
  } catch (error) {
    console.error("Failed to fetch top tracks by genre:", error)
    return []
  }
}
