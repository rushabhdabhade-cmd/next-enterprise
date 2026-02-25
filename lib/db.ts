import { supabaseAdmin } from "@/lib/supabase"
import type { ITunesTrack } from "@/types/itunes"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SongPlay {
    id: string
    user_id: string
    track_id: number
    track_name: string
    artist_name: string
    collection_name: string | null
    artwork_url: string | null
    preview_url: string | null
    genre: string | null
    duration_ms: number | null
    played_at: string
}

export interface Favorite {
    id: string
    user_id: string
    track_id: number
    track_name: string
    artist_name: string
    collection_name: string | null
    artwork_url: string | null
    preview_url: string | null
    genre: string | null
    duration_ms: number | null
    saved_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trackPayload(track: ITunesTrack) {
    return {
        track_id: track.trackId,
        track_name: track.trackName,
        artist_name: track.artistName,
        collection_name: track.collectionName ?? null,
        artwork_url: track.artworkUrl100 ?? null,
        preview_url: track.previewUrl ?? null,
        genre: track.primaryGenreName ?? null,
        duration_ms: track.trackTimeMillis ?? null,
    }
}

// ─── Song Plays ───────────────────────────────────────────────────────────────

export async function recordPlay(userId: string, track: ITunesTrack) {
    const { error } = await supabaseAdmin
        .from("song_plays")
        .insert({ user_id: userId, ...trackPayload(track) })

    if (error) console.error("[db] recordPlay error:", error.message)
    return !error
}

export async function getPlayHistory(userId: string, limit = 50): Promise<SongPlay[]> {
    const { data, error } = await supabaseAdmin
        .from("song_plays")
        .select("*")
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(limit)

    if (error) console.error("[db] getPlayHistory error:", error.message)
    return data ?? []
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function addFavorite(userId: string, track: ITunesTrack) {
    const { error } = await supabaseAdmin
        .from("favorites")
        .upsert({ user_id: userId, ...trackPayload(track) }, { onConflict: "user_id,track_id" })

    if (error) console.error("[db] addFavorite error:", error.message)
    return !error
}

export async function removeFavorite(userId: string, trackId: number) {
    const { error } = await supabaseAdmin
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("track_id", trackId)

    if (error) console.error("[db] removeFavorite error:", error.message)
    return !error
}

export async function getFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabaseAdmin
        .from("favorites")
        .select("*")
        .eq("user_id", userId)
        .order("saved_at", { ascending: false })

    if (error) console.error("[db] getFavorites error:", error.message)
    return data ?? []
}

export async function isFavorited(userId: string, trackId: number): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("track_id", trackId)
        .maybeSingle()

    if (error) console.error("[db] isFavorited error:", error.message)
    return !!data
}
