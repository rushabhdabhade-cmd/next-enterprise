"use client"

import { useEffect, useState } from "react"
import { getHotTracks } from "@/lib/api"
import { HotTrackWithMeta } from "@/types/hot"
import { usePlayback } from "@/context/PlaybackContext"
import { trackTrackSelected } from "@/lib/analytics"
import { Flame, TrendingUp, Play, Pause, Music, AlertCircle, Plus } from "lucide-react"
import AddToLibraryModal from "@/components/AddToLibraryModal"

export default function HotSection() {
    const [tracks, setTracks] = useState<HotTrackWithMeta[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback()
    const [libraryTrack, setLibraryTrack] = useState<HotTrackWithMeta | null>(null)

    const handlePlay = (e: React.MouseEvent, track: HotTrackWithMeta) => {
        e.stopPropagation()

        // Track analytics
        trackTrackSelected({
            id: String(track.trackId),
            artist: track.artistName,
            genre: track.primaryGenreName
        })

        if (currentTrack?.trackId === track.trackId) {
            togglePlay()
        } else {
            playTrack(track, tracks)
        }
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const data = await getHotTracks()
            if (data.length === 0 && !loading) {
                // Could be error or just empty
            }
            setTracks(data)
            setLoading(false)
        }

        load()
        const interval = setInterval(load, 60000) // Re-fetch every 60s
        return () => clearInterval(interval)
    }, [])

    if (loading && tracks.length === 0) {
        return (
            <section className="mb-16">
                <div className="flex items-center gap-2 mb-8">
                    <Flame className="text-orange-500 animate-pulse" size={24} />
                    <h3 className="text-2xl font-bold dark:text-white">Trending Now</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-3xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ))}
                </div>
            </section>
        )
    }

    if (error || (tracks.length === 0 && !loading)) {
        return null // Gracefully degrade if no trending data
    }

    return (
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-950 dark:text-white leading-none">Global Trending</h3>
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">Real-time Trending</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {tracks.map((track, idx) => {
                    const isCurrent = currentTrack?.trackId === track.trackId
                    const isPlayingThis = isCurrent && isPlaying

                    return (
                        <div
                            key={track.trackId}
                            onClick={(e) => handlePlay(e, track)}
                            className={`group relative bg-white dark:bg-gray-900 rounded-[32px] p-4 border transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/5 active:scale-95 cursor-pointer ${isCurrent ? "border-orange-500/50" : "border-gray-100 dark:border-gray-800 hover:border-orange-500/30"
                                }`}
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-md">
                                <img
                                    src={track.artworkUrl100.replace('100x100', '400x400')}
                                    alt={track.trackName}
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 h-full w-full"
                                />
                                <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                    <div className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white rounded-full shadow-2xl transition-transform active:scale-90 scale-0 group-hover:scale-100 duration-300">
                                        {isPlayingThis ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                    </div>
                                </div>

                                {/* Trending Rank Badge */}
                                <div className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center text-xs font-black text-white border border-white/10">
                                    #{idx + 1}
                                </div>

                                {/* Score Badge */}
                                <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-orange-500 rounded-lg flex items-center gap-1 shadow-lg">
                                    <Flame size={12} className="text-white" />
                                    <span className="text-[10px] font-black text-white">{track.trendingScore}</span>
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                    <h4 className={`font-bold truncate text-sm mb-1 ${isCurrent ? "text-orange-500" : "text-gray-950 dark:text-white"}`}>
                                        {track.trackName}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{track.artistName}</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setLibraryTrack(track) }}
                                    className="mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                                >
                                    <Plus size={16} />
                                </button>
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
        </section>
    )
}
