"use client"

import { useUser } from "@clerk/nextjs"
import { Clock, Heart, ListMusic, Music, Play, TrendingUp, User } from "lucide-react"
import { useEffect, useState } from "react"
import type { UserStats } from "@/app/api/user/stats/route"
import { getPageData, setPageData } from "@/lib/pageDataCache"

function formatHours(ms: number) {
    const hours = Math.floor(ms / 3600000)
    const mins = Math.floor((ms % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
}

export default function ProfilePage() {
    const { isSignedIn, isLoaded, user } = useUser()
    const cachedStats = getPageData<UserStats>("user:stats")
    const [stats, setStats] = useState<UserStats | null>(cachedStats)
    const [loading, setLoading] = useState(!cachedStats)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) { setLoading(false); return }
        if (getPageData("user:stats")) { setLoading(false); return }

        fetch("/api/user/stats")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data) setPageData("user:stats", data)
                setStats(data as UserStats)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn])

    const statCards = stats ? [
        { label: "Total Plays", value: stats.totalPlays.toLocaleString(), icon: Play, color: "pink" },
        { label: "Listening Time", value: formatHours(stats.totalListeningMs), icon: Clock, color: "blue" },
        { label: "Favorites", value: stats.totalFavorites.toLocaleString(), icon: Heart, color: "red" },
        { label: "Libraries", value: stats.totalLibraries.toLocaleString(), icon: ListMusic, color: "purple" },
    ] : []

    const colors: Record<string, string> = {
        pink: "bg-pink-500/10 text-pink-500",
        blue: "bg-blue-500/10 text-blue-500",
        red: "bg-red-500/10 text-red-500",
        purple: "bg-purple-500/10 text-purple-500",
    }

    return (
                <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

                    {/* Header */}
                    <header className="mb-10 lg:mb-14">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                <User size={16} className="text-indigo-500" />
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
                                Your <span className="font-bold">Profile</span>
                            </h2>
                        </div>
                    </header>

                    {/* Not signed in */}
                    {!loading && !isSignedIn && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6">
                                <User size={32} className="text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to view your profile</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">Your listening stats and profile will appear here.</p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 animate-pulse">
                                <div className="w-20 h-20 rounded-3xl bg-gray-200 dark:bg-gray-800" />
                                <div className="space-y-3"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-48" /><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-32" /></div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-900 rounded-3xl animate-pulse" />)}
                            </div>
                        </div>
                    )}

                    {/* Profile content */}
                    {!loading && isSignedIn && stats && (
                        <>
                            {/* User info */}
                            <div className="flex items-center gap-5 mb-10 p-6 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl border border-indigo-500/10 dark:border-indigo-800/20">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-indigo-500/10 flex-shrink-0">
                                    {user?.imageUrl ? (
                                        <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-indigo-500" /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                        {user?.fullName ?? user?.firstName ?? "Music Lover"}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {user?.primaryEmailAddress?.emailAddress}
                                    </p>
                                    {user?.createdAt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stat cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-12">
                                {statCards.map((card, i) => (
                                    <div
                                        key={card.label}
                                        style={{ animationDelay: `${i * 60}ms` }}
                                        className="p-5 md:p-6 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[card.color]}`}>
                                            <card.icon size={18} />
                                        </div>
                                        <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{card.value}</p>
                                        <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{card.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Top genres & artists */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                {/* Top Genres */}
                                {stats.topGenres.length > 0 && (
                                    <div className="p-6 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                                            <Music size={16} className="text-pink-500" /> Top Genres
                                        </h3>
                                        <div className="space-y-4">
                                            {stats.topGenres.map((genre, i) => {
                                                const maxCount = stats.topGenres[0]?.count ?? 1
                                                const percent = (genre.count / maxCount) * 100
                                                const genreColors = ["bg-pink-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500"]
                                                return (
                                                    <div key={genre.name}>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{genre.name}</span>
                                                            <span className="text-xs text-gray-400 font-bold tabular-nums">{genre.count} plays</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${genreColors[i % genreColors.length]} rounded-full transition-all duration-700`}
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Top Artists */}
                                {stats.topArtists.length > 0 && (
                                    <div className="p-6 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                                            <TrendingUp size={16} className="text-indigo-500" /> Top Artists
                                        </h3>
                                        <div className="space-y-3">
                                            {stats.topArtists.map((artist, i) => (
                                                <div key={artist.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <span className="w-6 text-center font-black text-sm text-gray-300 dark:text-gray-600">{i + 1}</span>
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                        {artist.artwork ? (
                                                            <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-gray-400" /></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{artist.name}</h4>
                                                        <p className="text-xs text-gray-500">{artist.count} plays</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
    )
}
