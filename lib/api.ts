import { HotTrackWithMeta } from "@/types/hot"

/**
 * Client-side API helper for fetching trending tracks.
 */
export async function getHotTracks(): Promise<HotTrackWithMeta[]> {
    try {
        const response = await fetch('/api/hot')

        if (!response.ok) {
            throw new Error(`Failed to fetch hot tracks: ${response.statusText}`)
        }

        return await response.json() as HotTrackWithMeta[]
    } catch (error) {
        console.error("Error in getHotTracks:", error)
        return []
    }
}
