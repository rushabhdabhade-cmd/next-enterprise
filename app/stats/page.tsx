"use client"

import { useUser } from "@clerk/nextjs"
import { Clock, Disc3, Music, Play, Sparkles, TrendingUp, User, Users } from "lucide-react"
import { useEffect, useState } from "react"
import type { UserStats } from "@/app/api/user/stats/route"
import LeftSidebar from "@/components/layout/LeftSidebar"
import Queue from "@/components/playback/Queue"

function formatHours(ms: number) {
    const hours = Math.floor(ms / 3600000)
    const mins = Math.floor((ms % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
}

function getPersonality(stats: UserStats): { label: string; desc: string; emoji: string } {
    if (stats.uniqueGenres >= 8) return { label: "Genre Explorer", desc: "You love discovering new genres", emoji: "🌍" }
    if (stats.uniqueArtists >= 20 && stats.totalPlays >= 100) return { label: "Music Marathon", desc: "You can't stop listening", emoji: "🏃" }
    if (stats.uniqueArtists <= 5 && stats.totalPlays >= 50) return { label: "Loyal Fan", desc: "You stick to your favorites", emoji: "💎" }
    if (stats.totalPlays >= 200) return { label: "Power Listener", desc: "Music is your superpower", emoji: "⚡" }
    if (stats.totalPlays >= 50) return { label: "Music Enthusiast", desc: "Building your taste profile", emoji: "🎵" }
    return { label: "Rising Star", desc: "Just getting started", emoji: "🌟" }
}

export default function StatsPage() {
    const { isSignedIn, isLoaded } = useUser()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) { setLoading(false); return }

        fetch("/api/user/stats")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => setStats(data as UserStats))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn])

    const personality = stats ? getPersonality(stats) : null
    const maxDailyPlays = stats ? Math.max(...stats.dailyPlays.map((d) => d.count), 1) : 1

    const heroCards = stats ? [
        { label: "Tracks Played", value: stats.totalPlays.toLocaleString(), icon: Play, gradient: "from-pink-500 to-rose-600" },
        { label: "Hours Listened", value: formatHours(stats.totalListeningMs), icon: Clock, gradient: "from-blue-500 to-indigo-600" },
        { label: "Unique Artists", value: stats.uniqueArtists.toLocaleString(), icon: Users, gradient: "from-purple-500 to-violet-600" },
        { label: "Genres Explored", value: stats.uniqueGenres.toLocaleString(), icon: Disc3, gradient: "from-emerald-500 to-teal-600" },
    ] : []

    const genreColors = [
        "from-pink-500 to-rose-500",
        "from-purple-500 to-violet-500",
        "from-blue-500 to-indigo-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-amber-500",
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />
            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

                    {/* Header */}
                    <header className="mb-10 lg:mb-14">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-violet-500/10 rounded-xl flex items-center justify-center">
                                <TrendingUp size={16} className="text-violet-500" />
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
                                Your Music{" "}
                                <span className="font-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                                    Wrapped
                                </span>
                            </h2>
                        </div>
                        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium ml-11">
                            Your listening journey, by the numbers
                        </p>
                    </header>

                    {/* Not signed in */}
                    {!loading && !isSignedIn && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mb-6">
                                <TrendingUp size={32} className="text-violet-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to see your stats</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">Your listening stats and wrapped will appear here.</p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-100 dark:bg-gray-900 rounded-3xl animate-pulse" />)}
                            </div>
                            <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-3xl animate-pulse" />
                        </div>
                    )}

                    {/* Stats content */}
                    {!loading && isSignedIn && stats && (
                        <>
                            {/* Personality badge */}
                            {personality && (
                                <div className="mb-8 p-6 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/5 dark:from-violet-900/20 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl border border-violet-500/10 dark:border-violet-800/20 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 fill-mode-both">
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg text-3xl">
                                            {personality.emoji}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <Sparkles size={14} className="text-violet-500" />
                                                <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Your Listening Personality</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{personality.label}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{personality.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Hero stat cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
                                {heroCards.map((card, i) => (
                                    <div
                                        key={card.label}
                                        style={{ animationDelay: `${i * 80}ms` }}
                                        className="relative overflow-hidden p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                                    >
                                        <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`} />
                                        <card.icon size={20} className="text-gray-400 mb-3" />
                                        <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{card.value}</p>
                                        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{card.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Top Artists */}
                            {stats.topArtists.length > 0 && (
                                <div className="mb-10 p-6 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Users size={16} className="text-purple-500" /> Your Top Artists
                                    </h3>
                                    <div className="space-y-3">
                                        {stats.topArtists.map((artist, i) => {
                                            const maxCount = stats.topArtists[0]?.count ?? 1
                                            const percent = (artist.count / maxCount) * 100
                                            return (
                                                <div
                                                    key={artist.name}
                                                    style={{ animationDelay: `${i * 60}ms` }}
                                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-in fade-in slide-in-from-left-4 fill-mode-both"
                                                >
                                                    <span className={`w-8 text-center font-black text-lg ${i < 3 ? "text-purple-500" : "text-gray-300 dark:text-gray-600"}`}>{i + 1}</span>
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                        {artist.artwork ? (
                                                            <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center"><User size={18} className="text-gray-400" /></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{artist.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-400 tabular-nums whitespace-nowrap">{artist.count} plays</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Top Genres */}
                            {stats.topGenres.length > 0 && (
                                <div className="mb-10 p-6 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Music size={16} className="text-pink-500" /> Top Genres
                                    </h3>
                                    <div className="space-y-4">
                                        {stats.topGenres.map((genre, i) => {
                                            const totalPlays = stats.topGenres.reduce((sum, g) => sum + g.count, 0)
                                            const percent = Math.round((genre.count / totalPlays) * 100)
                                            return (
                                                <div key={genre.name} style={{ animationDelay: `${i * 60}ms` }} className="animate-in fade-in slide-in-from-left-4 fill-mode-both">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{genre.name}</span>
                                                        <span className="text-xs font-bold text-gray-400">{percent}%</span>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${genreColors[i % genreColors.length]} rounded-full transition-all duration-1000`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Listening Activity */}
                            {stats.dailyPlays.length > 0 && (
                                <div className="mb-10 p-6 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-blue-500" /> Listening Activity
                                        <span className="text-xs text-gray-400 font-medium ml-1">Last 30 days</span>
                                    </h3>
                                    <div className="flex items-end gap-[3px] h-32">
                                        {stats.dailyPlays.map((day) => {
                                            const height = day.count > 0 ? Math.max((day.count / maxDailyPlays) * 100, 4) : 2
                                            return (
                                                <div
                                                    key={day.date}
                                                    className="flex-1 group relative"
                                                >
                                                    <div
                                                        className={`w-full rounded-t-sm transition-all duration-300 ${
                                                            day.count > 0
                                                                ? "bg-gradient-to-t from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
                                                                : "bg-gray-100 dark:bg-gray-800"
                                                        }`}
                                                        style={{ height: `${height}%` }}
                                                    />
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        {day.count} plays
                                                        <br />
                                                        <span className="text-gray-400 dark:text-gray-500 font-medium">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[10px] text-gray-400 font-medium">30 days ago</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Today</span>
                                    </div>
                                </div>
                            )}

                            {/* Top Tracks */}
                            {stats.topTracks.length > 0 && (
                                <div className="p-6 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Play size={16} className="text-orange-500" /> Most Played Tracks
                                    </h3>
                                    <div className="space-y-2">
                                        {stats.topTracks.map((track, i) => (
                                            <div
                                                key={track.trackId}
                                                style={{ animationDelay: `${i * 40}ms` }}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                                            >
                                                <span className={`w-6 text-center font-black text-sm ${i < 3 ? "text-orange-500" : "text-gray-300 dark:text-gray-600"}`}>{i + 1}</span>
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                    {track.artwork ? (
                                                        <img src={track.artwork} alt={track.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><Music size={14} className="text-gray-400" /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{track.name}</h4>
                                                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 tabular-nums">
                                                    {track.count}x
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Queue />
        </div>
    )
}
