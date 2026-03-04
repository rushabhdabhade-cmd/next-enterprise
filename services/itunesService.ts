import { ITunesSearchResponse, SearchTrackParams, ITunesTrack } from "@/types/itunes"

const ITUNES_API_BASE = "https://itunes.apple.com/search"
const ITUNES_LOOKUP_BASE = "https://itunes.apple.com/lookup"

export async function searchTracks(
  params: SearchTrackParams
): Promise<ITunesSearchResponse> {
  try {
    const queryParams = new URLSearchParams({
      term: params.term,
      entity: params.entity || "song",
      limit: String(params.limit || 20),
    })

    const response = await fetch(`${ITUNES_API_BASE}?${queryParams}`, {
      method: "GET",
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
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
