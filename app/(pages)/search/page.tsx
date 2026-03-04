"use client"

import { useUser } from "@clerk/nextjs"
import type { LucideIcon } from "lucide-react"
import { Disc3, ExternalLink, Film, Heart, Music, Pause, Play, Plus, Podcast, Search, User, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import { formatDuration, searchMusicVideos, searchPodcasts, searchTracks } from "@/services/itunesService"
import { usePlaybackStore } from "@/store/usePlaybackStore"
import type { ITunesMusicVideo, ITunesPodcast, ITunesTrack } from "@/types/itunes"

type FilterType = "all" | "song" | "album" | "artist" | "podcast" | "musicVideo"

const filters: { id: FilterType; label: string; icon: LucideIcon }[] = [
    { id: "all", label: "All", icon: Search },
    { id: "song", label: "Songs", icon: Music },
    { id: "album", label: "Albums", icon: Disc3 },
    { id: "artist", label: "Artists", icon: User },
    { id: "podcast", label: "Podcasts", icon: Podcast },
    { id: "musicVideo", label: "Videos", icon: Film },
]

export default function SearchPage() {
    return (
        <Suspense fallback={null}>
            <SearchPageContent />
        </Suspense>
    )
}

function SearchPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { isSignedIn } = useUser()
    const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite, favorites } = usePlaybackStore()

    const initialQuery = searchParams.get("q") || ""
    const initialType = (searchParams.get("type") as FilterType) || "all"

    const [query, setQuery] = useState(initialQuery)
    const [activeFilter, setActiveFilter] = useState<FilterType>(initialType)
    const [songs, setSongs] = useState<ITunesTrack[]>([])
    const [albums, setAlbums] = useState<ITunesTrack[]>([])
    const [artists, setArtists] = useState<ITunesTrack[]>([])
    const [podcasts, setPodcasts] = useState<ITunesPodcast[]>([])
    const [videos, setVideos] = useState<ITunesMusicVideo[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)
    const [playingVideo, setPlayingVideo] = useState<ITunesMusicVideo | null>(null)

    const handleSearch = useCallback(async (term: string) => {
        if (!term.trim()) return
        setLoading(true)
        setSearched(true)

        router.replace(`/search?q=${encodeURIComponent(term)}&type=${activeFilter}`, { scroll: false })

        try {
            if (activeFilter === "all" || activeFilter === "song") {
                const res = await searchTracks({ term, entity: "song", limit: 30 })
                setSongs(res.results)
            }
            if (activeFilter === "all" || activeFilter === "album") {
                const res = await searchTracks({ term, entity: "album", limit: 20 })
                setAlbums(res.results)
            }
            if (activeFilter === "all" || activeFilter === "artist") {
                const res = await searchTracks({ term, entity: "artist", limit: 20 })
                setArtists(res.results)
            }
            if (activeFilter === "all" || activeFilter === "podcast") {
                const res = await searchPodcasts(term, 20)
                setPodcasts(res)
            }
            if (activeFilter === "all" || activeFilter === "musicVideo") {
                const res = await searchMusicVideos(term, 20)
                setVideos(res)
            }
        } catch (err) {
            console.error("Search error:", err)
        } finally {
            setLoading(false)
        }
    }, [activeFilter, router])

    useEffect(() => {
        if (initialQuery) handleSearch(initialQuery)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSearch(query)
    }

    const handleFilterChange = (f: FilterType) => {
        setActiveFilter(f)
        if (query.trim()) {
            // Re-search with new filter after state update
            setTimeout(() => handleSearch(query), 0)
        }
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

                {/* Header */}
                <header className="mb-8 lg:mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-pink-500/10 rounded-xl flex items-center justify-center">
                            <Search size={16} className="text-pink-500" />
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
                            Search <span className="font-bold">Music</span>
                        </h2>
                    </div>

                    {/* Search input */}
                    <form onSubmit={handleSubmit} className="relative max-w-2xl">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search songs, artists, albums, podcasts..."
                            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-gray-950 dark:text-white placeholder-gray-400 text-base font-light tracking-tight focus:ring-4 focus:ring-pink-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl font-bold text-sm disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Search
                        </button>
                    </form>
                </header>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => handleFilterChange(f.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === f.id
                                ? "bg-gray-950 dark:bg-white text-white dark:text-gray-950 shadow-lg"
                                : "bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <f.icon size={14} />
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl animate-pulse">
                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-xl flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty / initial state */}
                {!loading && !searched && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-pink-500/10 rounded-3xl flex items-center justify-center mb-6">
                            <Search size={32} className="text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Discover something new
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                            Search for your favorite songs, artists, albums, podcasts, or music videos.
                        </p>
                    </div>
                )}

                {/* Songs */}
                {!loading && searched && (activeFilter === "all" || activeFilter === "song") && songs.length > 0 && (
                    <section className="mb-12">
                        {activeFilter === "all" && (
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Music size={16} className="text-pink-500" /> Songs
                                <span className="text-xs font-medium text-gray-400 ml-1">{songs.length}</span>
                            </h3>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {songs.map((track, i) => {
                                const isCurrent = currentTrack?.trackId === track.trackId
                                const isPlayingThis = isCurrent && isPlaying
                                const isFav = favorites.has(track.trackId)
                                return (
                                    <div
                                        key={track.trackId}
                                        style={{ animationDelay: `${i * 30}ms` }}
                                        className={`group flex items-center gap-3 p-3 rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-2 fill-mode-both cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 ${isCurrent ? "bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800/30" : ""
                                            }`}
                                        onClick={() => isCurrent ? togglePlay() : playTrack(track, songs, !!isSignedIn)}
                                    >
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={track.artworkUrl100} alt={track.trackName} className="w-full h-full object-cover" />
                                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                                {isPlayingThis ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className={`font-bold text-sm truncate ${isCurrent ? "text-pink-500" : "text-gray-900 dark:text-white"}`}>{track.trackName}</h4>
                                            <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => toggleFavorite(track, !!isSignedIn)} className={`p-1.5 transition-all ${isFav ? "text-pink-500" : "text-gray-300 hover:text-pink-500"}`}>
                                                <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                                            </button>
                                            <button onClick={() => setLibraryTrack(track)} className="p-1.5 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 tabular-nums flex-shrink-0">{formatDuration(track.trackTimeMillis)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Albums */}
                {!loading && searched && (activeFilter === "all" || activeFilter === "album") && albums.length > 0 && (
                    <section className="mb-12">
                        {activeFilter === "all" && (
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Disc3 size={16} className="text-purple-500" /> Albums
                                <span className="text-xs font-medium text-gray-400 ml-1">{albums.length}</span>
                            </h3>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                            {albums.map((album, i) => (
                                <div
                                    key={album.collectionId}
                                    style={{ animationDelay: `${i * 40}ms` }}
                                    className="group bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <div className="aspect-square overflow-hidden">
                                        <img src={album.artworkUrl100?.replace("100x100", "400x400")} alt={album.collectionName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{album.collectionName}</h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{album.artistName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Artists */}
                {!loading && searched && (activeFilter === "all" || activeFilter === "artist") && artists.length > 0 && (
                    <section className="mb-12">
                        {activeFilter === "all" && (
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User size={16} className="text-indigo-500" /> Artists
                                <span className="text-xs font-medium text-gray-400 ml-1">{artists.length}</span>
                            </h3>
                        )}
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                            {artists.map((artist, i) => (
                                <div
                                    key={artist.artistId}
                                    style={{ animationDelay: `${i * 40}ms` }}
                                    className="group flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                                >
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 mb-3 group-hover:scale-105 transition-transform shadow-lg">
                                        {artist.artworkUrl100 ? (
                                            <img src={artist.artworkUrl100.replace("100x100", "400x400")} alt={artist.artistName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate w-full">{artist.artistName}</h4>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Artist</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Podcasts */}
                {!loading && searched && (activeFilter === "all" || activeFilter === "podcast") && podcasts.length > 0 && (
                    <section className="mb-12">
                        {activeFilter === "all" && (
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Podcast size={16} className="text-emerald-500" /> Podcasts
                                <span className="text-xs font-medium text-gray-400 ml-1">{podcasts.length}</span>
                            </h3>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                            {podcasts.map((pod, i) => (
                                <a
                                    key={pod.trackId}
                                    href={pod.collectionViewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ animationDelay: `${i * 40}ms` }}
                                    className="group bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <div className="aspect-square overflow-hidden relative">
                                        <img src={pod.artworkUrl100?.replace("100x100", "400x400")} alt={pod.trackName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={12} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{pod.trackName}</h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{pod.artistName}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[9px] font-bold text-emerald-600 uppercase">{pod.primaryGenreName}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Music Videos */}
                {!loading && searched && (activeFilter === "all" || activeFilter === "musicVideo") && videos.length > 0 && (
                    <section className="mb-12">
                        {activeFilter === "all" && (
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Film size={16} className="text-red-500" /> Music Videos
                                <span className="text-xs font-medium text-gray-400 ml-1">{videos.length}</span>
                            </h3>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {videos.map((video, i) => (
                                <div
                                    key={video.trackId}
                                    style={{ animationDelay: `${i * 40}ms` }}
                                    className="group bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                                    onClick={() => setPlayingVideo(video)}
                                >
                                    <div className="aspect-video overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                                        <img src={video.artworkUrl100?.replace("100x100", "640x360")} alt={video.trackName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                                <Play size={20} fill="currentColor" className="text-gray-950 ml-0.5" />
                                            </div>
                                        </div>
                                        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                                            {formatDuration(video.trackTimeMillis)}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{video.trackName}</h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{video.artistName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* No results */}
                {!loading && searched && songs.length === 0 && albums.length === 0 && artists.length === 0 && podcasts.length === 0 && videos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
                            <Music size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                            Try searching for something else or check your spelling.
                        </p>
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
        </>
    )
}
