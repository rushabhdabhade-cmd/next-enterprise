"use client"

import { BarChart3, Globe, Heart, Music, Pause, Play, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import { usePlaybackStore } from "@/store/usePlaybackStore"
import { getPageData, setPageData } from "@/lib/pageDataCache"
import { formatDuration, getTopTracksByGenre } from "@/services/itunesService"
import type { ITunesTrack } from "@/types/itunes"

const countries = [
    { code: "us", name: "United States", flag: "🇺🇸" },
    { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
    { code: "ca", name: "Canada", flag: "🇨🇦" },
    { code: "au", name: "Australia", flag: "🇦🇺" },
    { code: "de", name: "Germany", flag: "🇩🇪" },
    { code: "fr", name: "France", flag: "🇫🇷" },
    { code: "jp", name: "Japan", flag: "🇯🇵" },
    { code: "in", name: "India", flag: "🇮🇳" },
    { code: "br", name: "Brazil", flag: "🇧🇷" },
]

const genres = [
    { id: "all", name: "All Genres" },
    { id: "14", name: "Pop" },
    { id: "18", name: "Hip-Hop" },
    { id: "21", name: "Rock" },
    { id: "20", name: "Alternative" },
    { id: "6", name: "Country" },
    { id: "17", name: "Dance" },
    { id: "7", name: "Electronic" },
]

export default function ChartsPage() {
    const { isSignedIn } = useUser()
    const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite, favorites } = usePlaybackStore()
    const [selectedCountry, setSelectedCountry] = useState("us")
    const [selectedGenre, setSelectedGenre] = useState("all")
    const initialCache = getPageData<ITunesTrack[]>("charts:us:all")
    const [tracks, setTracks] = useState<ITunesTrack[]>(initialCache ?? [])
    const [loading, setLoading] = useState(!initialCache)
    const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)

    useEffect(() => {
        const key = `charts:${selectedCountry}:${selectedGenre}`
        const cached = getPageData<ITunesTrack[]>(key)
        if (cached) {
            setTracks(cached)
            setLoading(false)
            return
        }
        setLoading(true)
        getTopTracksByGenre(selectedGenre, selectedCountry, 100)
            .then((data) => {
                setPageData(key, data)
                setTracks(data)
            })
            .catch(() => setTracks([]))
            .finally(() => setLoading(false))
    }, [selectedCountry, selectedGenre])

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

                {/* Header */}
                <header className="flex items-center justify-between mb-8 lg:mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center">
                                <BarChart3 size={16} className="text-orange-500" />
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
                                Top <span className="font-bold">Charts</span>
                            </h2>
                        </div>
                        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium ml-11 mt-1">
                            Trending tracks around the world
                        </p>
                    </div>
                </header>

                {/* Country selector */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    <Globe size={14} className="text-gray-400 flex-shrink-0" />
                    {countries.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => setSelectedCountry(c.code)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedCountry === c.code
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                                : "bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <span>{c.flag}</span> {c.name}
                        </button>
                    ))}
                </div>

                {/* Genre tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {genres.map((g) => (
                        <button
                            key={g.id}
                            onClick={() => setSelectedGenre(g.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedGenre === g.id
                                ? "bg-gray-950 dark:bg-white text-white dark:text-gray-950 shadow-lg"
                                : "bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {g.name}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="space-y-2">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl animate-pulse">
                                <div className="w-8 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chart list */}
                {!loading && tracks.length > 0 && (
                    <div className="space-y-1">
                        {tracks.map((track, i) => {
                            const rank = i + 1
                            const isCurrent = currentTrack?.trackId === track.trackId
                            const isPlayingThis = isCurrent && isPlaying
                            const isFav = favorites.has(track.trackId)

                            return (
                                <div
                                    key={track.trackId}
                                    style={{ animationDelay: `${i * 20}ms` }}
                                    className={`group flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-2 fill-mode-both cursor-pointer ${isCurrent
                                        ? "bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                        }`}
                                    onClick={() => isCurrent ? togglePlay() : playTrack(track, tracks, !!isSignedIn)}
                                >
                                    {/* Rank */}
                                    <span className={`w-8 text-center font-black text-sm tabular-nums ${rank <= 3 ? "text-orange-500" : "text-gray-300 dark:text-gray-600"
                                        }`}>
                                        {rank}
                                    </span>

                                    {/* Artwork */}
                                    <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden flex-shrink-0">
                                        {track.artworkUrl100 ? (
                                            <img src={track.artworkUrl100} alt={track.trackName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <Music size={16} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                            {isPlayingThis ? <Pause size={14} fill="white" className="text-white" /> : <Play size={14} fill="white" className="text-white ml-0.5" />}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className={`font-bold text-sm truncate ${isCurrent ? "text-orange-500" : "text-gray-900 dark:text-white"}`}>
                                            {track.trackName}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
                                    </div>

                                    {/* Genre badge */}
                                    <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                                        {track.primaryGenreName}
                                    </span>

                                    {/* Duration */}
                                    <span className="text-[10px] font-bold text-gray-400 tabular-nums w-10 text-right hidden sm:block">
                                        {formatDuration(track.trackTimeMillis)}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => toggleFavorite(track, !!isSignedIn)} className={`p-1.5 transition-all ${isFav ? "text-pink-500" : "text-gray-300 hover:text-pink-500"}`}>
                                            <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                                        </button>
                                        <button onClick={() => setLibraryTrack(track)} className="p-1.5 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Empty */}
                {!loading && tracks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mb-6">
                            <BarChart3 size={32} className="text-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No charts available</h3>
                        <p className="text-gray-500 font-medium max-w-xs">Try selecting a different country or genre.</p>
                    </div>
                )}
            </div>

            {libraryTrack && (
                <AddToLibraryModal track={libraryTrack} open={!!libraryTrack} onOpenChange={(open) => { if (!open) setLibraryTrack(null) }} />
            )}
        </>
    )
}
