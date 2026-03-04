/**
 * 📈 Trending Algorithm: Hot Section
 * 
 * How it works:
 * 1. Queries PostHog Insights API for 'track_selected' events group by 'track_id'.
 * 2. Filters for events in the last 24 hours to ensure recency.
 * 3. Ranks tracks based on absolute event count (popularity).
 * 4. Limits output to Top 10 tracks to keep the UI focused.
 * 
 * Why last 24 hours: 
 * Captures what's currently "hot" without being skewed by historical data 
 * or short-term bursts that happened weeks ago.
 * 
 * Ranking Logic:
 * Simple count-based ranking for v1. 
 * 
 * Future Improvements:
 * - Unique User Weighting: Use distinct_id count to prevent spamming from a single user.
 * - Recency Decay: Give more weight to events from the last 2 hours vs 22 hours ago.
 * - Genre-based Clustering: Diversify the 'Hot' section to not be dominated by a single genre.
 */

import { NextResponse } from "next/server"
import { env } from "@/env.mjs"
import { HotTrack, HotTrackWithMeta } from "@/types/hot"

// Route is dynamic — freshness handled by fetch-level caches below
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log("Trending: Fetching top tracks from PostHog...")

        // 1. Query PostHog for 'track_selected' events in the last 24h
        // Using HogQL for precise aggregation
        const query = {
            query: {
                kind: "HogQLQuery",
                query: `
                    SELECT 
                        properties.track_id as trackId,
                        count() as count
                    FROM events
                    WHERE 
                        event = 'track_selected'
                        AND timestamp > now() - INTERVAL 24 HOUR
                        AND properties.track_id IS NOT NULL
                    GROUP BY trackId
                    ORDER BY count DESC
                    LIMIT 10
                `
            }
        }

        const phHost = env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
        const phUrl = `${phHost}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`

        const phResponse = await fetch(phUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.POSTHOG_API_KEY}`
            },
            body: JSON.stringify(query),
            next: { revalidate: 60 } // Cache results for 1 minute
        })

        if (!phResponse.ok) {
            const errBody = await phResponse.text()
            console.error("PostHog API Error:", errBody)
            throw new Error(`PostHog query failed: ${phResponse.statusText}`)
        }

        const phData = await phResponse.json() as { results: [trackId: string, count: number][] };
        const results = phData.results || []

        if (results.length === 0) {
            console.log("Trending: No events found in last 24h.")
            return NextResponse.json([])
        }

        console.log("Trending: Aggregated results from PostHog:", results)

        const hotTracks: HotTrack[] = results.map(row => ({
            trackId: String(row[0]),
            count: Number(row[1])
        }))

        // 2. Fetch metadata from iTunes for these tracks
        console.log(`Trending: Fetching metadata for ${hotTracks.length} tracks...`)

        const metaResults = await Promise.all(
            hotTracks.map(async (item) => {
                try {
                    const itunesRes = await fetch(
                        `https://itunes.apple.com/lookup?id=${item.trackId}`,
                        { next: { revalidate: 86400 } } // track metadata is stable for 24h
                    )
                    if (!itunesRes.ok) return null
                    const itunesData = await itunesRes.json() as { results: import("@/types/itunes").ITunesTrack[] };
                    const track = itunesData.results?.[0]
                    if (!track) return null

                    return {
                        ...track,
                        trendingScore: item.count
                    } as HotTrackWithMeta
                } catch (err) {
                    console.error(`Metadata fail for ${item.trackId}:`, err)
                    return null
                }
            })
        )

        const finalTracks = metaResults.filter((t): t is HotTrackWithMeta => t !== null)

        console.log(`Trending: Returning ${finalTracks.length} hot tracks.`)
        return NextResponse.json(finalTracks)

    } catch (error) {
        console.error("Critical error in /api/hot:", error)
        return NextResponse.json({ error: "Failed to generate trending report" }, { status: 500 })
    }
}
