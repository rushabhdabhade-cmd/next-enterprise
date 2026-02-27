"use client"

import { useState, useEffect } from "react"
import { Podcast, Search, ExternalLink, Music } from "lucide-react"
import LeftSidebar from "@/components/layout/LeftSidebar"
import Queue from "@/components/playback/Queue"
import { getTopPodcasts, searchPodcasts } from "@/services/itunesService"
import type { ITunesPodcast } from "@/types/itunes"

export default function PodcastsPage() {
    const [topPodcasts, setTopPodcasts] = useState<ITunesPodcast[]>([])
    const [searchResults, setSearchResults] = useState<ITunesPodcast[]>([])
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        getTopPodcasts(20)
            .then(setTopPodcasts)
            .finally(() => setLoading(false))
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setSearching(true)
        const results = await searchPodcasts(query, 30)
        setSearchResults(results)
        setSearching(false)
    }

    const featured = topPodcasts[0]
    const gridPodcasts = searchResults.length > 0 ? searchResults : topPodcasts

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />
            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

                    {/* Header */}
                    <header className="flex items-center justify-between mb-8 lg:mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                    <Podcast size={16} className="text-emerald-500" />
                                </div>
                                <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
                                    Top <span className="font-bold">Podcasts</span>
                                </h2>
                            </div>
                            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium ml-11 mt-1">
                                Discover trending shows and episodes
                            </p>
                        </div>
                    </header>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative max-w-2xl mb-10">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search podcasts by name or topic..."
                            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-gray-950 dark:text-white placeholder-gray-400 text-base font-light focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={searching || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Search
                        </button>
                    </form>

                    {/* Featured podcast */}
                    {!loading && featured && searchResults.length === 0 && (
                        <a
                            href={featured.collectionViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block mb-10 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/5 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/10 border border-emerald-500/10 dark:border-emerald-800/20"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-10">
                                <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                    <img src={featured.artworkUrl100?.replace("100x100", "600x600")} alt={featured.trackName} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Featured Podcast</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-2">{featured.trackName}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">{featured.artistName}</p>
                                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm group-hover:scale-[1.02] transition-transform">
                                        <ExternalLink size={14} /> Listen on Apple Podcasts
                                    </span>
                                </div>
                            </div>
                        </a>
                    )}

                    {/* Section title */}
                    {searchResults.length > 0 && (
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Search Results <span className="text-gray-400 font-medium text-sm ml-1">{searchResults.length}</span>
                            </h3>
                            <button
                                onClick={() => { setSearchResults([]); setQuery("") }}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                            >
                                Clear search
                            </button>
                        </div>
                    )}

                    {!loading && searchResults.length === 0 && topPodcasts.length > 0 && (
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                            Trending Now <span className="text-gray-400 font-medium text-sm ml-1">{topPodcasts.length}</span>
                        </h3>
                    )}

                    {/* Loading */}
                    {(loading || searching) && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-3xl mb-3" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    {!loading && !searching && gridPodcasts.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                            {gridPodcasts.map((pod, i) => (
                                <a
                                    key={`${pod.trackId}-${i}`}
                                    href={pod.collectionViewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ animationDelay: `${i * 40}ms` }}
                                    className="group bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <div className="aspect-square overflow-hidden relative">
                                        {pod.artworkUrl100 ? (
                                            <img src={pod.artworkUrl100.replace("100x100", "400x400")} alt={pod.trackName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <Music size={32} className="text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={12} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">{pod.trackName}</h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{pod.artistName}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">{pod.primaryGenreName}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !searching && gridPodcasts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6">
                                <Podcast size={32} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No podcasts found</h3>
                            <p className="text-gray-500 font-medium max-w-xs">Try searching for a different topic.</p>
                        </div>
                    )}
                </div>
            </main>
            <Queue />
        </div>
    )
}
