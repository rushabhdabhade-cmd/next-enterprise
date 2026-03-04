"use client"

import { ChevronRight, Heart, Pause, Play, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import { usePlaybackStore } from "@/store/usePlaybackStore"
import { trackLayoutExposure, trackTrackSelected } from "@/lib/analytics"
import { useFeatureFlag } from "@/lib/featureFlags"
import { formatDuration } from "@/services/itunesService"
import { setCachedTrack } from "@/lib/trackNavigationCache"
import { ITunesTrack } from "@/types/itunes"

interface Props {
    tracks: ITunesTrack[]
}

/**
 * CatalogGrid component implementing A/B testing logic.
 * Swaps between New and Old layouts based on the 'new-catalog-layout' flag.
 */
export default function CatalogGrid({ tracks }: Props) {
    const isNewLayout = useFeatureFlag("new-catalog-layout")

    useEffect(() => {
        // Only track exposure once the flag is loaded
        if (isNewLayout !== undefined) {
            trackLayoutExposure(isNewLayout ? "new" : "old")
        }
    }, [isNewLayout])

    // While loading flag, show a skeleton or nothing to prevent flicker
    if (isNewLayout === undefined) return <CatalogLoadingSkeleton />

    return isNewLayout ? <NewCatalogGrid tracks={tracks} /> : <OldCatalogGrid tracks={tracks} />
}

function NewCatalogGrid({ tracks }: Props) {
    const router = useRouter()
    const { isSignedIn } = useUser()
    const { playTrack, togglePlay, currentTrack, isPlaying, favorites, toggleFavorite } = usePlaybackStore()
    const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)

    const handlePlay = (e: React.MouseEvent, track: ITunesTrack) => {
        e.stopPropagation()
        trackTrackSelected({ id: String(track.trackId), artist: track.artistName, genre: track.primaryGenreName })
        if (currentTrack?.trackId === track.trackId) {
            togglePlay()
        } else {
            playTrack(track, tracks, !!isSignedIn)
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.map((track, index) => {
                    const isCurrent = currentTrack?.trackId === track.trackId
                    const isPlayingThis = isCurrent && isPlaying

                    return (
                        <div
                            key={track.trackId}
                            onClick={() => { setCachedTrack(track); router.push(`/track/${track.trackId}`) }}
                            style={{ animationDelay: `${index * 40}ms` }}
                            className={`group relative flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${isCurrent
                                ? "bg-gray-50 dark:bg-gray-800/80 border-pink-500/30 shadow-lg shadow-pink-500/5"
                                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700"
                                }`}
                        >
                            {/* Artwork with play overlay */}
                            <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                                <img
                                    src={track.artworkUrl100}
                                    alt={track.trackName}
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    onClick={(e) => handlePlay(e, track)}
                                    className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl transition-opacity ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                        }`}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center bg-white text-gray-950 rounded-full shadow-lg transition-transform active:scale-90">
                                        {isPlayingThis
                                            ? <Pause size={14} fill="currentColor" />
                                            : <Play size={14} fill="currentColor" className="ml-0.5" />
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Track info + badges */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm truncate ${isCurrent ? "text-pink-500" : "text-gray-950 dark:text-white"}`}>
                                    {track.trackName}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                                    {track.artistName}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                                        {formatDuration(track.trackTimeMillis)}
                                    </span>
                                    {index % 4 === 0 && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-500 text-[9px] font-bold uppercase tracking-tight">
                                            Hot
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions — heart & plus */}
                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(track, !!isSignedIn) }}
                                    className={`transition-all hover:scale-110 ${favorites.has(track.trackId)
                                        ? "text-pink-500"
                                        : "text-gray-300 dark:text-gray-600 hover:text-pink-500"
                                        }`}
                                >
                                    <Heart size={16} fill={favorites.has(track.trackId) ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setLibraryTrack(track) }}
                                    className="text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Navigation indicator */}
                            <ChevronRight size={14} className="flex-shrink-0 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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

function OldCatalogGrid({ tracks }: Props) {
    const router = useRouter()
    const { isSignedIn } = useUser()
    const { playTrack, togglePlay, currentTrack, isPlaying, favorites, toggleFavorite } = usePlaybackStore()
    const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)

    const handlePlay = (e: React.MouseEvent, track: ITunesTrack) => {
        e.stopPropagation()
        trackTrackSelected({ id: String(track.trackId), artist: track.artistName, genre: track.primaryGenreName })
        if (currentTrack?.trackId === track.trackId) {
            togglePlay()
        } else {
            playTrack(track, tracks, !!isSignedIn)
        }
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                {tracks.map((track) => {
                    const isCurrent = currentTrack?.trackId === track.trackId
                    const isPlayingThis = isCurrent && isPlaying

                    return (
                        <div
                            key={track.trackId}
                            onClick={() => { setCachedTrack(track); router.push(`/track/${track.trackId}`) }}
                            className={`group cursor-pointer ${isCurrent ? "scale-[1.03]" : ""} transition-transform`}
                        >
                            <div className={`relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 ${isCurrent ? "ring-2 ring-pink-500/50" : ""
                                }`}>
                                <img
                                    src={track.artworkUrl100}
                                    alt={track.trackName}
                                    className="w-full h-full object-cover"
                                />
                                {/* Play overlay */}
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    }`}>
                                    <button
                                        onClick={(e) => handlePlay(e, track)}
                                        className="w-10 h-10 bg-white text-gray-950 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95"
                                    >
                                        {isPlayingThis
                                            ? <Pause size={16} fill="currentColor" />
                                            : <Play size={16} fill="currentColor" className="ml-0.5" />
                                        }
                                    </button>
                                </div>
                                {/* Favorite + Library actions */}
                                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(track, !!isSignedIn) }}
                                        className={`w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 ${favorites.has(track.trackId) ? "text-pink-500" : "text-white/80 hover:text-pink-500"
                                            }`}
                                    >
                                        <Heart size={13} fill={favorites.has(track.trackId) ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setLibraryTrack(track) }}
                                        className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <h4 className={`text-sm font-bold truncate flex-1 ${isCurrent ? "text-pink-500" : ""}`}>{track.trackName}</h4>
                                <ChevronRight size={12} className="flex-shrink-0 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
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

// Exported so page.tsx can show the same skeleton while iTunes tracks are loading
export function CatalogLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    )
}
