import { ITunesSearchResponse, SearchTrackParams } from "@/types/itunes"

const ITUNES_API_BASE = "https://itunes.apple.com/search"

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
      headers: {
        "Content-Type": "application/json",
      },
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

export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
