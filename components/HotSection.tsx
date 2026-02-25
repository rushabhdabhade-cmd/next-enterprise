"use client"

import { useEffect, useState } from "react"
import { getHotTracks } from "@/lib/api"
import { HotTrackWithMeta } from "@/types/hot"
import { Flame, TrendingUp, Music, AlertCircle } from "lucide-react"

export default function HotSection() {
    const [tracks, setTracks] = useState<HotTrackWithMeta[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

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
                        <h3 className="text-2xl font-bold text-gray-950 dark:text-white leading-none">Global Heatmap</h3>
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">Real-time Trending</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {tracks.map((track, idx) => (
                    <div
                        key={track.trackId}
                        className="group relative bg-white dark:bg-gray-900 rounded-[32px] p-4 border border-gray-100 dark:border-gray-800 hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/5 active:scale-95 cursor-pointer"
                    >
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-md">
                            <img
                                src={track.artworkUrl100.replace('100x100', '400x400')}
                                alt={track.trackName}
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

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

                        <h4 className="font-bold text-gray-950 dark:text-white truncate text-sm mb-1">{track.trackName}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{track.artistName}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
