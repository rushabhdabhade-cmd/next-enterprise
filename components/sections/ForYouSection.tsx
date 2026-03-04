"use client"

import { useUser } from "@clerk/nextjs"
import { LogIn, Music, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import CatalogGrid, { CatalogLoadingSkeleton } from "@/components/catalog/CatalogGrid"
import { getRecommendations } from "@/lib/api"
import type { RecommendationsResponse } from "@/types/recommendations"

export default function ForYouSection() {
    const { isSignedIn, isLoaded } = useUser()
    const [data, setData] = useState<RecommendationsResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) { setLoading(false); return }

        const load = async () => {
            setLoading(true)
            const result = await getRecommendations()
            setData(result)
            setLoading(false)
        }
        load()
    }, [isLoaded, isSignedIn])

    // Not signed in
    if (isLoaded && !isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-pink-500/10 rounded-3xl flex items-center justify-center mb-6">
                    <LogIn size={32} className="text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in for personalized picks</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                    Play and favorite some tracks, and we&apos;ll curate a playlist just for you.
                </p>
            </div>
        )
    }

    // Loading
    if (loading) {
        return (
            <section>
                <ForYouHeader topGenres={[]} topArtists={[]} strength="cold" />
                <CatalogLoadingSkeleton />
            </section>
        )
    }

    // No data / error
    if (!data || data.recommendations.length === 0) {
        return (
            <section>
                <ForYouHeader topGenres={[]} topArtists={[]} strength="cold" />
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-[32px] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <div className="w-16 h-16 bg-white dark:bg-gray-950 rounded-3xl flex items-center justify-center shadow-xl mb-6">
                        <Music size={28} className="text-pink-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Keep exploring</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm font-medium leading-relaxed">
                        Play and favorite more tracks so our algorithm can learn your taste.
                    </p>
                </div>
            </section>
        )
    }

    const tracks = data.recommendations.map((r) => r.track)

    // Collect unique reasons with source colors
    const reasonSet = new Set<string>()
    const reasons: { text: string; source: string }[] = []
    for (const r of data.recommendations.slice(0, 10)) {
        if (!reasonSet.has(r.reason)) {
            reasonSet.add(r.reason)
            reasons.push({ text: r.reason, source: r.source })
            if (reasons.length >= 5) break
        }
    }

    const sourceColors: Record<string, string> = {
        personalized: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
        discovery: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        trending: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        serendipity: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        coldstart: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    }

    return (
        <section>
            <ForYouHeader
                topGenres={data.profile.topGenres}
                topArtists={data.profile.topArtists}
                strength={data.profile.strength}
            />

            {/* Reason pills — color-coded by recommendation source */}
            {reasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {reasons.map(({ text, source }) => (
                        <span
                            key={text}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold ${sourceColors[source] ?? sourceColors.coldstart}`}
                        >
                            {text}
                        </span>
                    ))}
                </div>
            )}

            <CatalogGrid tracks={tracks} />
        </section>
    )
}

function ForYouHeader({
    topGenres,
    topArtists,
    strength,
}: {
    topGenres: string[]
    topArtists: string[]
    strength: "cold" | "warm" | "hot"
}) {
    let subtitle = "Discovering your taste..."
    if (strength === "hot" && topGenres.length > 0) {
        subtitle = `Based on your love of ${topGenres.join(", ")}`
    } else if (strength === "warm" && topArtists.length > 0) {
        subtitle = `Getting to know you — you seem to like ${topArtists.slice(0, 2).join(" & ")}`
    } else if (strength === "cold") {
        subtitle = "Popular picks to get you started"
    }

    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Sparkles className="text-white" size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-950 dark:text-white leading-none">For You</h3>
                    <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mt-1">{subtitle}</p>
                </div>
            </div>
        </div>
    )
}
