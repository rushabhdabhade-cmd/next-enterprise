"use client"

import { useUser } from "@clerk/nextjs"
import { Heart, Music, Pause, Play, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import type { Favorite } from "@/lib/db"
import { getPageData, setPageData } from "@/lib/pageDataCache"
import { formatDuration } from "@/services/itunesService"
import { usePlaybackStore } from "@/store/usePlaybackStore"
import type { ITunesTrack } from "@/types/itunes"

function favoriteToTrack(fav: Favorite): ITunesTrack {
    return {
        trackId: fav.track_id,
        trackName: fav.track_name,
        artistName: fav.artist_name,
        collectionName: fav.collection_name ?? "",
        trackCensoredName: fav.track_name,
        artworkUrl30: fav.artwork_url ?? "",
        artworkUrl60: fav.artwork_url ?? "",
        artworkUrl100: fav.artwork_url ?? "",
        previewUrl: fav.preview_url ?? "",
        trackTimeMillis: fav.duration_ms ?? 0,
        primaryGenreName: fav.genre ?? "",
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

export default function FavoritesPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite } = usePlaybackStore()
    const cachedFavorites = getPageData<Favorite[]>("favorites")
    const [favorites, setFavorites] = useState<Favorite[]>(cachedFavorites ?? [])
    const [loading, setLoading] = useState(!cachedFavorites)
    const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) { setLoading(false); return }
        if (getPageData("favorites")) { setLoading(false); return }

        fetch("/api/user/favorites")
            .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`)
                return r.json() as Promise<{ favorites: Favorite[] }>
            })
            .then(({ favorites }) => {
                const data = favorites ?? []
                setPageData("favorites", data)
                setFavorites(data)
            })
            .catch((err) => console.error("Failed to load favorites:", err))
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn])

    // Remove from local list when unfavorited
    const handleUnfavorite = (fav: Favorite) => {
        toggleFavorite(favoriteToTrack(fav), !!isSignedIn)
        setFavorites((prev) => prev.filter((f) => f.track_id !== fav.track_id))
    }

    const handlePlay = (fav: Favorite, allFavs: Favorite[]) => {
        const track = favoriteToTrack(fav)
        const queue = allFavs.map(favoriteToTrack)
        if (currentTrack?.trackId === fav.track_id) {
            togglePlay()
        } else {
            playTrack(track, queue, !!isSignedIn)
        }
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

                {/* Header */}
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-pink-500/10 rounded-xl flex items-center justify-center">
                                <Heart size={16} className="text-pink-500" fill="currentColor" />
                            </div>
                            <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                                Your <span className="font-bold">Favorites</span>
                            </h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-11">
                            {loading ? "Loading…" : `${favorites.length} saved ${favorites.length === 1 ? "song" : "songs"}`}
                        </p>
                    </div>
                </header>

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Not signed in */}
                {!loading && !isSignedIn && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-pink-500/10 rounded-3xl flex items-center justify-center mb-6">
                            <Heart size={32} className="text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to see your favorites</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                            Your saved songs will appear here after you sign in.
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && isSignedIn && favorites.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
                            <Music size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                            Hit the heart icon on any song to save it here.
                        </p>
                    </div>
                )}

                {/* Favorites grid */}
                {!loading && favorites.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {favorites.map((fav, index) => {
                            const isCurrent = currentTrack?.trackId === fav.track_id
                            const isPlayingThis = isCurrent && isPlaying

                            return (
                                <div
                                    key={fav.id}
                                    style={{ animationDelay: `${index * 40}ms` }}
                                    className={`group relative bg-white dark:bg-gray-900/50 border rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 hover:-translate-y-1 ${isCurrent
                                        ? "border-pink-500/40 shadow-xl shadow-pink-500/10"
                                        : "border-gray-100 dark:border-gray-800"
                                        }`}
                                >
                                    {/* Artwork */}
                                    <div className="relative aspect-square overflow-hidden">
                                        {fav.artwork_url ? (
                                            <img
                                                src={fav.artwork_url}
                                                alt={fav.track_name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <Music size={32} className="text-gray-300 dark:text-gray-600" />
                                            </div>
                                        )}

                                        {/* Play overlay */}
                                        <div
                                            onClick={() => handlePlay(fav, favorites)}
                                            className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
                                        <h4 className={`font-bold text-sm tracking-tight truncate mb-1 ${isCurrent ? "text-pink-500" : "text-gray-950 dark:text-white"}`}>
                                            {fav.track_name}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mb-3">
                                            {fav.artist_name}
                                        </p>

                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex-shrink-0">
                                                    {formatDuration(fav.duration_ms ?? 0)}
                                                </span>
                                                {fav.genre && (
                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                                                        {fav.genre}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => setLibraryTrack(favoriteToTrack(fav))}
                                                    className="text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:scale-110 active:scale-90 transition-all"
                                                    title="Add to library"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleUnfavorite(fav)}
                                                    className="text-pink-500 hover:text-pink-600 hover:scale-110 active:scale-90 transition-all"
                                                    title="Remove from favorites"
                                                >
                                                    <Heart size={16} fill="currentColor" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
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
