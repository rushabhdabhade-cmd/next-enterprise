"use client"

import React, { useEffect } from "react"
import { useFeatureFlag } from "@/lib/featureFlags"
import { trackLayoutExposure } from "@/lib/analytics"
import { ITunesTrack } from "@/types/itunes"
import { Play, Music } from "lucide-react"
import { useRouter } from "next/navigation"

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
    if (isNewLayout === undefined) return <LoadingGrid />

    return isNewLayout ? <NewCatalogGrid tracks={tracks} /> : <OldCatalogGrid tracks={tracks} />
}

function NewCatalogGrid({ tracks }: Props) {
    const router = useRouter()
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {tracks.map((track) => (
                <div
                    key={track.trackId}
                    onClick={() => router.push(`/track/${track.trackId}`)}
                    className="group relative bg-white dark:bg-gray-900 rounded-[40px] p-4 border border-gray-100 dark:border-gray-800 hover:border-pink-500/30 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-pink-500/10"
                >
                    <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6">
                        <img
                            src={track.artworkUrl100.replace("100x100", "600x600")}
                            alt={track.trackName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                            <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <Play fill="currentColor" size={24} className="ml-1" />
                            </div>
                        </div>
                    </div>
                    <div className="px-2">
                        <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-1 truncate">{track.trackName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{track.artistName}</p>
                    </div>
                </div>
            ))}
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

function LoadingGrid() {
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
