import { HotTrackWithMeta } from "@/types/hot"

/**
 * Client-side API helper for fetching trending tracks.
 */
export async function getHotTracks(): Promise<HotTrackWithMeta[]> {
    try {
        const response = await fetch('/api/hot', {
            // Re-fetch every 60 seconds (Next.js client-side cached fetch if supported, 
            // or just standard fetch behavior here)
            next: { revalidate: 60 }
        } as any)

        if (!response.ok) {
            throw new Error(`Failed to fetch hot tracks: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Error in getHotTracks:", error)
        return []
    }
}
