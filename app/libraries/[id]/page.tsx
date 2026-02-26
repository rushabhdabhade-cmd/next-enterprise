"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ListMusic, Play, Pause, Music, Heart, Trash2, ChevronLeft, Plus } from "lucide-react"
import LeftSidebar from "@/components/LeftSidebar"
import Queue from "@/components/Queue"
import { usePlayback } from "@/context/PlaybackContext"
import { useLibrary } from "@/context/LibraryContext"
import { formatDuration } from "@/services/itunesService"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import type { LibraryTrack } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

function libraryTrackToTrack(lt: LibraryTrack): ITunesTrack {
    return {
        trackId: lt.track_id,
        trackName: lt.track_name,
        artistName: lt.artist_name,
        collectionName: lt.collection_name ?? "",
        trackCensoredName: lt.track_name,
        artworkUrl30: lt.artwork_url ?? "",
        artworkUrl60: lt.artwork_url ?? "",
        artworkUrl100: lt.artwork_url ?? "",
        previewUrl: lt.preview_url ?? "",
        trackTimeMillis: lt.duration_ms ?? 0,
        primaryGenreName: lt.genre ?? "",
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

export default function LibraryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const libraryId = params.id as string
    const { isSignedIn, isLoaded } = useUser()
    const { currentTrack, isPlaying, playTrack, togglePlay, favorites, toggleFavorite } = usePlayback()
    const { libraries, removeFromLibrary } = useLibrary()
    const [tracks, setTracks] = useState<LibraryTrack[]>([])
    const [loading, setLoading] = useState(true)
    const [addLibraryTrack, setAddLibraryTrack] = useState<ITunesTrack | null>(null)

    const library = libraries.find((l) => l.id === libraryId)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) {
            setLoading(false)
            return
        }

        fetch(`/api/user/libraries/${libraryId}/tracks`)
            .then((r) => r.json() as Promise<{ tracks: LibraryTrack[] }>)
            .then(({ tracks }) => setTracks(tracks ?? []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn, libraryId])

    const handlePlay = (lt: LibraryTrack) => {
        const track = libraryTrackToTrack(lt)
        const queue = tracks.map(libraryTrackToTrack)
        if (currentTrack?.trackId === lt.track_id) {
            togglePlay()
        } else {
            playTrack(track, queue)
        }
    }

    const handleRemove = async (lt: LibraryTrack) => {
        const ok = await removeFromLibrary(libraryId, lt.track_id)
        if (ok) {
            setTracks((prev) => prev.filter((t) => t.track_id !== lt.track_id))
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />

            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-7xl mx-auto px-8 py-12 pb-32">
                    {/* Back button */}
                    <button
                        onClick={() => router.push("/libraries")}
                        className="group mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                        <span className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-800 group-hover:border-gray-900 dark:group-hover:border-white transition-colors">
                            <ChevronLeft size={14} />
                        </span>
                        All Libraries
                    </button>

                    {/* Header */}
                    <header className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                    <ListMusic size={16} className="text-purple-500" />
                                </div>
                                <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                                    <span className="font-bold">{library?.name ?? "Library"}</span>
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-11">
                                {loading ? "Loading..." : `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`}
                            </p>
                        </div>
                    </header>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    )}

                    {/* Not signed in */}
                    {!loading && !isSignedIn && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6">
                                <ListMusic size={32} className="text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Sign in to view this library
                            </h3>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && isSignedIn && tracks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
                                <Music size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                This library is empty
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                                Use the + button on any song to add it to this library.
                            </p>
                        </div>
                    )}

                    {/* Tracks grid */}
                    {!loading && tracks.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {tracks.map((lt, index) => {
                                const isCurrent = currentTrack?.trackId === lt.track_id
                                const isPlayingThis = isCurrent && isPlaying
                                const isFav = favorites.has(lt.track_id)

                                return (
                                    <div
                                        key={lt.id}
                                        style={{ animationDelay: `${index * 40}ms` }}
                                        className={`group relative bg-white dark:bg-gray-900/50 border rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 hover:-translate-y-1 ${
                                            isCurrent
                                                ? "border-purple-500/40 shadow-xl shadow-purple-500/10"
                                                : "border-gray-100 dark:border-gray-800"
                                        }`}
                                    >
                                        {/* Artwork */}
                                        <div className="relative aspect-square overflow-hidden">
                                            {lt.artwork_url ? (
                                                <img
                                                    src={lt.artwork_url}
                                                    alt={lt.track_name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <Music size={32} className="text-gray-300 dark:text-gray-600" />
                                                </div>
                                            )}

                                            {/* Play overlay */}
                                            <div
                                                onClick={() => handlePlay(lt)}
                                                className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer ${
                                                    isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                }`}
                                            >
                                                <div className="w-12 h-12 flex items-center justify-center bg-white text-gray-950 rounded-full shadow-2xl transition-transform active:scale-90 hover:scale-110">
                                                    {isPlayingThis ? (
                                                        <Pause size={20} fill="currentColor" />
                                                    ) : (
                                                        <Play size={20} fill="currentColor" className="ml-0.5" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Playing indicator */}
                                            {isPlayingThis && (
                                                <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full flex gap-0.5 items-end h-5">
                                                    <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]" style={{ height: "8px" }} />
                                                    <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" style={{ height: "8px" }} />
                                                    <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" style={{ height: "8px" }} />
                                                </div>
                                            )}

                                            {/* Remove from library */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemove(lt) }}
                                                className="absolute top-3 right-3 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 active:scale-90"
                                                title="Remove from library"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <h4 className={`font-bold text-sm tracking-tight truncate mb-1 ${isCurrent ? "text-purple-500" : "text-gray-950 dark:text-white"}`}>
                                                {lt.track_name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mb-3">
                                                {lt.artist_name}
                                            </p>

                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex-shrink-0">
                                                        {formatDuration(lt.duration_ms ?? 0)}
                                                    </span>
                                                    {lt.genre && (
                                                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                                                            {lt.genre}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => setAddLibraryTrack(libraryTrackToTrack(lt))}
                                                        className="text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:scale-110 active:scale-90 transition-all"
                                                        title="Add to another library"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleFavorite(libraryTrackToTrack(lt))}
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
                    )}
                </div>
            </main>

            <Queue />

            {addLibraryTrack && (
                <AddToLibraryModal
                    track={addLibraryTrack}
                    open={!!addLibraryTrack}
                    onOpenChange={(open) => { if (!open) setAddLibraryTrack(null) }}
                />
            )}
        </div>
    )
}
