"use client"

import React, { useEffect, useState } from "react"
import { useFeatureFlag } from "@/lib/featureFlags"
import { trackLayoutExposure, trackTrackSelected } from "@/lib/analytics"
import { usePlayback } from "@/context/PlaybackContext"
import { ITunesTrack } from "@/types/itunes"
import { Pause, Play, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import AddToLibraryModal from "@/components/AddToLibraryModal"

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
    const { playTrack, togglePlay, currentTrack, isPlaying } = usePlayback()
    const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)

    const handlePlay = (e: React.MouseEvent, track: ITunesTrack) => {
        e.stopPropagation() // prevent card navigation
        trackTrackSelected({ id: String(track.trackId), artist: track.artistName, genre: track.primaryGenreName })
        if (currentTrack?.trackId === track.trackId) {
            togglePlay()
        } else {
            playTrack(track, tracks)
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {tracks.map((track) => {
                const isCurrent = currentTrack?.trackId === track.trackId
                const isPlayingThis = isCurrent && isPlaying

                return (
                    <div
                        key={track.trackId}
                        onClick={() => router.push(`/track/${track.trackId}`)}
                        className={`group relative bg-white dark:bg-gray-900 rounded-[40px] p-4 border transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 ${
                            isCurrent
                                ? "border-pink-500/50"
                                : "border-gray-100 dark:border-gray-800 hover:border-pink-500/30"
                        }`}
                    >
                        <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6">
                            <img
                                src={track.artworkUrl100.replace("100x100", "600x600")}
                                alt={track.trackName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 flex items-end p-6 ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                <button
                                    onClick={(e) => handlePlay(e, track)}
                                    className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover:scale-110 active:scale-95"
                                >
                                    {isPlayingThis
                                        ? <Pause fill="currentColor" size={22} />
                                        : <Play fill="currentColor" size={22} className="ml-0.5" />
                                    }
                                </button>
                            </div>
                        </div>
                        <div className="px-2 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className={`text-xl font-bold mb-1 truncate ${isCurrent ? "text-pink-500" : "text-gray-950 dark:text-white"}`}>
                                    {track.trackName}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{track.artistName}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLibraryTrack(track) }}
                                className="mt-1 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                )
            })}

            {libraryTrack && (
                <AddToLibraryModal
                    track={libraryTrack}
                    open={!!libraryTrack}
                    onOpenChange={(open) => { if (!open) setLibraryTrack(null) }}
                />
            )}
        </div>
    )
}

function OldCatalogGrid({ tracks }: Props) {
    const router = useRouter()
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {tracks.map((track) => (
                <div
                    key={track.trackId}
                    onClick={() => router.push(`/track/${track.trackId}`)}
                    className="group cursor-pointer"
                >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                        <img
                            src={track.artworkUrl100}
                            alt={track.trackName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h4 className="text-sm font-bold truncate">{track.trackName}</h4>
                    <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
                </div>
            ))}
        </div>
    )
}

// Exported so page.tsx can show the same skeleton while iTunes tracks are loading
export function CatalogLoadingSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
            ))}
        </div>
    )
}
