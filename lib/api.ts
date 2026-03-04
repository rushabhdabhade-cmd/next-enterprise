import { HotTrackWithMeta } from "@/types/hot"
import { RecommendationsResponse } from "@/types/recommendations"

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

/**
 * Client-side API helper for fetching personalized recommendations.
 */
export async function getRecommendations(): Promise<RecommendationsResponse | null> {
    try {
        const response = await fetch('/api/user/recommendations')

        if (!response.ok) {
            if (response.status === 401) return null
            throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
        }

        return await response.json() as RecommendationsResponse
    } catch (error) {
        console.error("Error in getRecommendations:", error)
        return null
    }
}
