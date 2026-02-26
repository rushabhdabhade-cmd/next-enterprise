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

export interface Library {
    id: string
    user_id: string
    name: string
    description: string | null
    cover_url: string | null
    created_at: string
    updated_at: string
}

export interface LibraryWithCount extends Library {
    track_count: number
}

export interface LibraryTrack {
    id: string
    library_id: string
    track_id: number
    track_name: string
    artist_name: string
    collection_name: string | null
    artwork_url: string | null
    preview_url: string | null
    genre: string | null
    duration_ms: number | null
    added_at: string
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

// ─── Libraries ───────────────────────────────────────────────────────────────

export async function getLibraries(userId: string): Promise<LibraryWithCount[]> {
    const { data, error } = await supabaseAdmin
        .from("libraries")
        .select("*, library_tracks(count)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) console.error("[db] getLibraries error:", error.message)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((lib: any) => ({
        id: lib.id as string,
        user_id: lib.user_id as string,
        name: lib.name as string,
        description: lib.description as string | null,
        cover_url: lib.cover_url as string | null,
        created_at: lib.created_at as string,
        updated_at: lib.updated_at as string,
        track_count: (lib.library_tracks?.[0]?.count as number) ?? 0,
    }))
}

export async function createLibrary(
    userId: string,
    name: string,
    description?: string
): Promise<Library | null> {
    const { data, error } = await supabaseAdmin
        .from("libraries")
        .insert({ user_id: userId, name, description: description ?? null })
        .select()
        .single()

    if (error) console.error("[db] createLibrary error:", error.message)
    return data ?? null
}

export async function updateLibrary(
    libraryId: string,
    userId: string,
    updates: { name?: string; description?: string }
): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from("libraries")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", libraryId)
        .eq("user_id", userId)

    if (error) console.error("[db] updateLibrary error:", error.message)
    return !error
}

export async function deleteLibrary(libraryId: string, userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from("libraries")
        .delete()
        .eq("id", libraryId)
        .eq("user_id", userId)

    if (error) console.error("[db] deleteLibrary error:", error.message)
    return !error
}

export async function getLibraryTracks(
    libraryId: string,
    userId: string
): Promise<LibraryTrack[]> {
    const { data: lib } = await supabaseAdmin
        .from("libraries")
        .select("id")
        .eq("id", libraryId)
        .eq("user_id", userId)
        .maybeSingle()

    if (!lib) return []

    const { data, error } = await supabaseAdmin
        .from("library_tracks")
        .select("*")
        .eq("library_id", libraryId)
        .order("added_at", { ascending: false })

    if (error) console.error("[db] getLibraryTracks error:", error.message)
    return data ?? []
}

export async function addTrackToLibrary(
    libraryId: string,
    userId: string,
    track: ITunesTrack
): Promise<boolean> {
    const { data: lib } = await supabaseAdmin
        .from("libraries")
        .select("id")
        .eq("id", libraryId)
        .eq("user_id", userId)
        .maybeSingle()

    if (!lib) return false

    const { error } = await supabaseAdmin
        .from("library_tracks")
        .upsert(
            { library_id: libraryId, ...trackPayload(track) },
            { onConflict: "library_id,track_id" }
        )

    if (error) console.error("[db] addTrackToLibrary error:", error.message)
    return !error
}

export async function removeTrackFromLibrary(
    libraryId: string,
    userId: string,
    trackId: number
): Promise<boolean> {
    const { data: lib } = await supabaseAdmin
        .from("libraries")
        .select("id")
        .eq("id", libraryId)
        .eq("user_id", userId)
        .maybeSingle()

    if (!lib) return false

    const { error } = await supabaseAdmin
        .from("library_tracks")
        .delete()
        .eq("library_id", libraryId)
        .eq("track_id", trackId)

    if (error) console.error("[db] removeTrackFromLibrary error:", error.message)
    return !error
}
