"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { History, Play, Pause, Music, Heart } from "lucide-react"
import LeftSidebar from "@/components/LeftSidebar"
import Queue from "@/components/Queue"
import { usePlayback } from "@/context/PlaybackContext"
import { formatDuration } from "@/services/itunesService"
import type { SongPlay } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

function playToTrack(play: SongPlay): ITunesTrack {
    return {
        trackId: play.track_id,
        trackName: play.track_name,
        artistName: play.artist_name,
        collectionName: play.collection_name ?? "",
        trackCensoredName: play.track_name,
        artworkUrl30: play.artwork_url ?? "",
        artworkUrl60: play.artwork_url ?? "",
        artworkUrl100: play.artwork_url ?? "",
        previewUrl: play.preview_url ?? "",
        trackTimeMillis: play.duration_ms ?? 0,
        primaryGenreName: play.genre ?? "",
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

function getDateLabel(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)

    const playDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (playDay.getTime() === today.getTime()) return "Today"
    if (playDay.getTime() === yesterday.getTime()) return "Yesterday"
    if (playDay.getTime() > weekAgo.getTime()) return "This Week"
    return "Earlier"
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffMin < 1) return "just now"
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

const DATE_ORDER = ["Today", "Yesterday", "This Week", "Earlier"]

export default function HistoryPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { currentTrack, isPlaying, playTrack, togglePlay, favorites, toggleFavorite } = usePlayback()
    const [plays, setPlays] = useState<SongPlay[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) { setLoading(false); return }

        fetch("/api/user/plays?limit=200")
            .then((r) => r.json() as Promise<{ plays: SongPlay[] }>)
            .then(({ plays }) => setPlays(plays ?? []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn])

    // Group plays by date section
    const grouped = plays.reduce<Record<string, SongPlay[]>>((acc, play) => {
        const label = getDateLabel(play.played_at)
        if (!acc[label]) acc[label] = []
        acc[label]!.push(play)
        return acc
    }, {})

    const handlePlay = (play: SongPlay, groupPlays: SongPlay[]) => {
        const track = playToTrack(play)
        const queue = groupPlays.map(playToTrack)
        if (currentTrack?.trackId === play.track_id) {
            togglePlay()
        } else {
            playTrack(track, queue)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />

            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-7xl mx-auto px-8 py-12 pb-32">

                    {/* Header */}
                    <header className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-violet-500/10 rounded-xl flex items-center justify-center">
                                    <History size={16} className="text-violet-500" />
                                </div>
                                <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                                    Play <span className="font-bold">History</span>
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-11">
                                {loading ? "Loading…" : `${plays.length} ${plays.length === 1 ? "play" : "plays"} recorded`}
                            </p>
                        </div>
                    </header>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {/* Not signed in */}
                    {!loading && !isSignedIn && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mb-6">
                                <History size={32} className="text-violet-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to see your history</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                                Your listening history will appear here after you sign in.
                            </p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && isSignedIn && plays.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
                                <Music size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No plays yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                                Songs you listen to will appear here.
                            </p>
                        </div>
                    )}

                    {/* Grouped sections */}
                    {!loading && plays.length > 0 && (
                        <div className="space-y-12">
                            {DATE_ORDER.filter((label) => grouped[label]?.length).map((label) => {
                                const groupPlays = grouped[label]!
                                return (
                                    <section key={label}>
                                        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-5">
                                            {label}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {groupPlays.map((play, index) => {
                                                const isCurrent = currentTrack?.trackId === play.track_id
                                                const isPlayingThis = isCurrent && isPlaying
                                                const isFav = favorites.has(play.track_id)

                                                return (
                                                    <div
                                                        key={play.id}
                                                        style={{ animationDelay: `${index * 40}ms` }}
                                                        className={`group relative bg-white dark:bg-gray-900/50 border rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 hover:-translate-y-1 ${
                                                            isCurrent
                                                                ? "border-violet-500/40 shadow-xl shadow-violet-500/10"
                                                                : "border-gray-100 dark:border-gray-800"
                                                        }`}
                                                    >
                                                        {/* Artwork */}
                                                        <div className="relative aspect-square overflow-hidden">
                                                            {play.artwork_url ? (
                                                                <img
                                                                    src={play.artwork_url}
                                                                    alt={play.track_name}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                    <Music size={32} className="text-gray-300 dark:text-gray-600" />
                                                                </div>
                                                            )}

                                                            {/* Play overlay */}
                                                            <div
                                                                onClick={() => handlePlay(play, groupPlays)}
                                                                className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer ${
                                                                    isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                                }`}
                                                            >
                                                                <div className="w-12 h-12 flex items-center justify-center bg-white text-gray-950 rounded-full shadow-2xl transition-transform active:scale-90 hover:scale-110">
                                                                    {isPlayingThis
                                                                        ? <Pause size={20} fill="currentColor" />
                                                                        : <Play size={20} fill="currentColor" className="ml-0.5" />
                                                                    }
                                                                </div>
                                                            </div>

                                                            {/* Currently playing indicator */}
                                                            {isPlayingThis && (
                                                                <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full flex gap-0.5 items-end h-5">
                                                                    <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]" style={{ height: "8px" }} />
                                                                    <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" style={{ height: "8px" }} />
                                                                    <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" style={{ height: "8px" }} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="p-4">
                                                            <h4 className={`font-bold text-sm tracking-tight truncate mb-1 ${isCurrent ? "text-violet-500" : "text-gray-950 dark:text-white"}`}>
                                                                {play.track_name}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mb-3">
                                                                {play.artist_name}
                                                            </p>

                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex-shrink-0">
                                                                        {formatDuration(play.duration_ms ?? 0)}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/20 text-[9px] font-bold text-violet-400 uppercase tracking-tighter truncate">
                                                                        {formatRelativeTime(play.played_at)}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => toggleFavorite(playToTrack(play))}
                                                                    className={`flex-shrink-0 hover:scale-110 active:scale-90 transition-all ${isFav ? "text-pink-500" : "text-gray-300 dark:text-gray-600 hover:text-pink-500"}`}
                                                                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                                                                >
                                                                    <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Queue />

            <style jsx>{`
                @keyframes music-bar {
                    0%, 100% { height: 4px; }
                    50% { height: 10px; }
                }
            `}</style>
        </div>
    )
}
