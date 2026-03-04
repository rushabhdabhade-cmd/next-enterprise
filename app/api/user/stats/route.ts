import { auth } from "@clerk/nextjs/server"
import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"
import { cacheTags, TTL } from "@/lib/cache"
import { supabaseAdmin } from "@/lib/supabase"

export interface UserStats {
    totalPlays: number
    totalListeningMs: number
    totalFavorites: number
    totalLibraries: number
    topArtists: { name: string; count: number; artwork: string | null }[]
    topGenres: { name: string; count: number }[]
    topTracks: { trackId: number; name: string; artist: string; artwork: string | null; count: number }[]
    dailyPlays: { date: string; count: number }[]
    uniqueArtists: number
    uniqueGenres: number
}

async function fetchUserStats(userId: string): Promise<UserStats> {
    // Fetch all plays (up to 10000 for stats aggregation)
    const { data: plays } = await supabaseAdmin
        .from("song_plays")
        .select("track_id, track_name, artist_name, artwork_url, genre, duration_ms, played_at")
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(10000)

    const { count: favCount } = await supabaseAdmin
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)

    const { count: libCount } = await supabaseAdmin
        .from("libraries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)

    const allPlays = plays ?? []

    // Total listening time
    const totalListeningMs = allPlays.reduce((sum, p) => sum + (p.duration_ms || 0), 0)

    // Top artists
    const artistMap = new Map<string, { count: number; artwork: string | null }>()
    allPlays.forEach((p) => {
        const existing = artistMap.get(p.artist_name) || { count: 0, artwork: null }
        existing.count++
        if (!existing.artwork && p.artwork_url) existing.artwork = p.artwork_url
        artistMap.set(p.artist_name, existing)
    })
    const topArtists = Array.from(artistMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, data]) => ({ name, count: data.count, artwork: data.artwork }))

    // Top genres
    const genreMap = new Map<string, number>()
    allPlays.forEach((p) => {
        if (p.genre) genreMap.set(p.genre, (genreMap.get(p.genre) || 0) + 1)
    })
    const topGenres = Array.from(genreMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

    // Top tracks
    const trackMap = new Map<number, { name: string; artist: string; artwork: string | null; count: number }>()
    allPlays.forEach((p) => {
        const existing = trackMap.get(p.track_id) || { name: p.track_name, artist: p.artist_name, artwork: p.artwork_url, count: 0 }
        existing.count++
        trackMap.set(p.track_id, existing)
    })
    const topTracks = Array.from(trackMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([trackId, data]) => ({ trackId, ...data }))

    // Daily plays (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyMap = new Map<string, number>()

    // Initialize all 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
        dailyMap.set(date.toISOString().split("T")[0]!, 0)
    }

    allPlays.forEach((p) => {
        const date = (p.played_at ?? "").split("T")[0]
        if (dailyMap.has(date)) {
            dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
        }
    })

    const dailyPlays = Array.from(dailyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }))

    // Unique counts
    const uniqueArtists = new Set(allPlays.map((p) => p.artist_name)).size
    const uniqueGenres = new Set(allPlays.filter((p) => p.genre).map((p) => p.genre)).size

    return {
        totalPlays: allPlays.length,
        totalListeningMs,
        totalFavorites: favCount ?? 0,
        totalLibraries: libCount ?? 0,
        topArtists,
        topGenres,
        topTracks,
        dailyPlays,
        uniqueArtists,
        uniqueGenres,
    }
}

export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const stats = await unstable_cache(
            () => fetchUserStats(userId),
            ["stats", userId],
            { revalidate: TTL.USER_DATA, tags: [cacheTags.stats(userId)] }
        )()

        return NextResponse.json(stats)
    } catch (error) {
        console.error("[api/user/stats] Error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
