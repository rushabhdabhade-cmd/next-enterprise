"use client"

import { Film, Music, Play, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import LeftSidebar from "@/components/layout/LeftSidebar"
import Queue from "@/components/playback/Queue"
import { formatDuration, searchMusicVideos } from "@/services/itunesService"
import type { ITunesMusicVideo } from "@/types/itunes"

const trendingSearches = ["Pop Hits", "Hip Hop", "Rock Classics", "K-Pop", "Latin", "R&B", "Country", "Indie"]

export default function VideosPage() {
    const [videos, setVideos] = useState<ITunesMusicVideo[]>([])
    const [query, setQuery] = useState("")
    const [activeTag, setActiveTag] = useState("Pop Hits")
    const [loading, setLoading] = useState(true)
    const [playingVideo, setPlayingVideo] = useState<ITunesMusicVideo | null>(null)

    const fetchVideos = async (term: string) => {
        setLoading(true)
        const results = await searchMusicVideos(term, 30)
        setVideos(results)
        setLoading(false)
    }

    useEffect(() => {
        fetchVideos(activeTag)
    }, [activeTag])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setActiveTag("")
        fetchVideos(query)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />
            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

                    {/* Header */}
                    <header className="flex items-center justify-between mb-8 lg:mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
                                    <Film size={16} className="text-red-500" />
                                </div>
                                <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
                                    Music <span className="font-bold">Videos</span>
                                </h2>
                            </div>
                            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium ml-11 mt-1">
                                Watch music video previews
                            </p>
                        </div>
                    </header>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative max-w-2xl mb-6">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search music videos..."
                            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-gray-950 dark:text-white placeholder-gray-400 text-base font-light focus:ring-4 focus:ring-red-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Search
                        </button>
                    </form>

                    {/* Trending tags */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                        {trendingSearches.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => { setActiveTag(tag); setQuery("") }}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                    activeTag === tag
                                        ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                                        : "bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl mb-3" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    {!loading && videos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {videos.map((video, i) => (
                                <div
                                    key={`${video.trackId}-${i}`}
                                    style={{ animationDelay: `${i * 40}ms` }}
                                    className="group bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                                    onClick={() => setPlayingVideo(video)}
                                >
                                    <div className="aspect-video overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={video.artworkUrl100?.replace("100x100", "640x360")}
                                            alt={video.trackName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                                                <Play size={22} fill="currentColor" className="text-gray-950 ml-1" />
                                            </div>
                                        </div>
                                        <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                                            {formatDuration(video.trackTimeMillis)}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-red-500 transition-colors">{video.trackName}</h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{video.artistName}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-[9px] font-bold text-red-600 dark:text-red-400 uppercase">{video.primaryGenreName}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && videos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6">
                                <Film size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No videos found</h3>
                            <p className="text-gray-500 font-medium max-w-xs">Try searching for something else.</p>
                        </div>
                    )}
                </div>
            </main>
            <Queue />

            {/* Video player modal */}
            {playingVideo && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPlayingVideo(null)}>
                    <div className="relative w-full max-w-3xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
                        >
                            <X size={20} />
                        </button>
                        <div className="aspect-video bg-black">
                            {playingVideo.previewUrl ? (
                                <video
                                    src={playingVideo.previewUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Music size={48} className="text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">Preview not available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-white truncate">{playingVideo.trackName}</h3>
                            <p className="text-gray-400 font-medium mt-0.5">{playingVideo.artistName}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
