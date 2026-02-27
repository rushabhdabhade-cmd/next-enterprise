"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Clock, Play, Pause, Music, Heart, Plus } from "lucide-react"
import { usePlayback } from "@/context/PlaybackContext"
import { formatDuration } from "@/services/itunesService"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import type { SongPlay } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

function playToTrack(play: SongPlay): ITunesTrack {
    return {
        trackId: play.track_id,
        trackName: play.track_name,
        artistName: play.artist_name,
        collectionName: play.collection_name ?? "",
        trackCensoredName: play.track_name,
        artworkUrl30: play.artwork_url ?? "",
        artworkUrl60: play.artwork_url ?? "",
        artworkUrl100: play.artwork_url ?? "",
        previewUrl: play.preview_url ?? "",
        trackTimeMillis: play.duration_ms ?? 0,
        primaryGenreName: play.genre ?? "",
        wrapperType: "track",
        kind: "song",
        artistId: 0,
        collectionId: 0,
        trackPrice: 0,
        collectionPrice: 0,
        releaseDate: "",
        country: "",
        currency: "",
        isStreamable: true,
    }
}

function deduplicateByTrack(plays: SongPlay[]): SongPlay[] {
    const seen = new Set<number>()
    return plays.filter((play) => {
        if (seen.has(play.track_id)) return false
        seen.add(play.track_id)
        return true
    })
}

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/4" />
            </div>
        </div>
    )
}

export default function RecentlyPlayedContent() {
    const { isSignedIn, isLoaded } = useUser()
    const { currentTrack, isPlaying, playTrack, togglePlay, favorites, toggleFavorite } = usePlayback()
    const [recentTracks, setRecentTracks] = useState<SongPlay[]>([])
    const [loading, setLoading] = useState(true)
    const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) { setLoading(false); return }

        fetch("/api/user/plays?limit=100")
            .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`)
                return r.json() as Promise<{ plays: SongPlay[] }>
            })
            .then(({ plays }) => setRecentTracks(deduplicateByTrack(plays ?? [])))
            .catch((err) => console.error("Failed to load play history:", err))
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn])

    const handlePlay = (play: SongPlay) => {
        const track = playToTrack(play)
        const queue = recentTracks.map(playToTrack)
        if (currentTrack?.trackId === play.track_id) {
            togglePlay()
        } else {
            playTrack(track, queue)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6">
                    <Clock size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to see recently played</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                    Your recently played songs will appear here after you sign in.
                </p>
            </div>
        )
    }

    if (recentTracks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
                    <Music size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nothing played yet</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                    Start listening and your recent songs will show up here.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recentTracks.map((play, index) => {
                    const isCurrent = currentTrack?.trackId === play.track_id
                    const isPlayingThis = isCurrent && isPlaying
                    const isFav = favorites.has(play.track_id)

                    return (
                        <div
                            key={play.track_id}
                            style={{ animationDelay: `${index * 40}ms` }}
                            className={`group relative bg-white dark:bg-gray-900/50 border rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 hover:-translate-y-1 ${
                                isCurrent
                                    ? "border-blue-500/40 shadow-xl shadow-blue-500/10"
                                    : "border-gray-100 dark:border-gray-800"
                            }`}
                        >
                            {/* Artwork */}
                            <div className="relative aspect-square overflow-hidden">
                                {play.artwork_url ? (
                                    <img
                                        src={play.artwork_url}
                                        alt={play.track_name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <Music size={32} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}

                                {/* Play overlay */}
                                <div
                                    onClick={() => handlePlay(play)}
                                    className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer ${
                                        isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    }`}
                                >
                                    <div className="w-12 h-12 flex items-center justify-center bg-white text-gray-950 rounded-full shadow-2xl transition-transform active:scale-90 hover:scale-110">
                                        {isPlayingThis
                                            ? <Pause size={20} fill="currentColor" />
                                            : <Play size={20} fill="currentColor" className="ml-0.5" />
                                        }
                                    </div>
                                </div>

                                {/* Currently playing indicator */}
                                {isPlayingThis && (
                                    <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full flex gap-0.5 items-end h-5">
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]" style={{ height: "8px" }} />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" style={{ height: "8px" }} />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" style={{ height: "8px" }} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h4 className={`font-bold text-sm tracking-tight truncate mb-1 ${isCurrent ? "text-blue-500" : "text-gray-950 dark:text-white"}`}>
                                    {play.track_name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mb-3">
                                    {play.artist_name}
                                </p>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex-shrink-0">
                                            {formatDuration(play.duration_ms ?? 0)}
                                        </span>
                                        {play.genre && (
                                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                                                {play.genre}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => setLibraryTrack(playToTrack(play))}
                                            className="text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:scale-110 active:scale-90 transition-all"
                                            title="Add to library"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleFavorite(playToTrack(play))}
                                            className={`hover:scale-110 active:scale-90 transition-all ${isFav ? "text-pink-500" : "text-gray-300 dark:text-gray-600 hover:text-pink-500"}`}
                                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {libraryTrack && (
                <AddToLibraryModal
                    track={libraryTrack}
                    open={!!libraryTrack}
                    onOpenChange={(open) => { if (!open) setLibraryTrack(null) }}
                />
            )}
        </>
    )
}
