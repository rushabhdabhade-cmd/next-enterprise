"use client"

import { Check, ChevronLeft, Heart, Loader2, Pause, Play, Plus, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import AISummary from "@/components/AISummary"
import { usePlayback } from "@/context/PlaybackContext"
import { trackAISummaryExposure } from "@/lib/analytics"
import { useFeatureFlag } from "@/lib/featureFlags"
import { getCachedTrack } from "@/lib/trackNavigationCache"
import { formatDuration } from "@/services/itunesService"
import { ITunesTrack } from "@/types/itunes"

export default function TrackDetailClient({ trackId }: { trackId: number }) {
    const router = useRouter()
    const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayback()
    const showAISummary = useFeatureFlag("ai-summaries")

    const [track, setTrack] = useState<ITunesTrack | null>(() => getCachedTrack(trackId))
    const [loading, setLoading] = useState(!track)
    const [showLibraryModal, setShowLibraryModal] = useState(false)
    const [copied, setCopied] = useState(false)

    // Fallback: fetch client-side only for direct URL visits (no cache)
    useEffect(() => {
        if (track) return
        fetch(`https://itunes.apple.com/lookup?id=${trackId}`)
            .then((res) => res.json() as Promise<{ results?: ITunesTrack[] }>)
            .then((data) => {
                if (data.results?.[0]) setTrack(data.results[0])
            })
            .finally(() => setLoading(false))
    }, [trackId, track])

    // Track PostHog exposure once the flag resolves to true
    useEffect(() => {
        if (showAISummary === true && track) {
            trackAISummaryExposure(String(track.trackId))
        }
    }, [showAISummary, track])

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-pink-500" />
            </div>
        )
    }

    if (!track) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-lg">Track not found</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-pink-500 text-white rounded-full text-sm font-semibold hover:bg-pink-400 transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

    const isCurrent = currentTrack?.trackId === track.trackId
    const highResArtwork = track.artworkUrl100.replace("100x100", "800x800")

    const handleShareTrack = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/track/${track.trackId}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <>
            <div className="relative overflow-hidden min-h-full">
                {/* Dynamic Background Glow */}
                <div
                    className="absolute inset-0 opacity-20 dark:opacity-30 blur-[120px] pointer-events-none transition-all duration-1000"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, #db2777 0%, transparent 60%)`,
                    }}
                />

                <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-12 relative z-10">
                    {/* Navigation */}
                    <button
                        onClick={() => router.back()}
                        className="group mb-8 md:mb-12 flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                        <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-800 group-hover:border-gray-900 dark:group-hover:border-white transition-colors">
                            <ChevronLeft size={16} />
                        </span>
                        Back to Discovery
                    </button>

                    <div className="flex flex-col lg:flex-row gap-8 md:gap-16 items-center lg:items-end">
                        {/* Minimalist Artwork Display */}
                        <div className="relative w-full max-w-[280px] md:max-w-[440px] aspect-square flex-shrink-0 group">
                            <div className="absolute inset-0 bg-pink-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <img
                                src={highResArtwork}
                                alt={track.trackName}
                                className="w-full h-full rounded-3xl md:rounded-[40px] object-cover shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] relative z-10 transition-transform duration-700 hover:scale-[1.03]"
                            />
                        </div>

                        {/* Typography Centric Metadata */}
                        <div className="flex-1 mb-4 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-4 md:mb-6">
                                <span className="w-1 h-1 rounded-full bg-pink-500" />
                                {track.primaryGenreName}
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tight text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight">
                                {track.trackName}
                            </h1>

                            <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 font-light mb-6 md:mb-10">
                                by <span className="text-gray-900 dark:text-white font-medium hover:text-pink-600 cursor-pointer transition-colors">{track.artistName}</span>
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4">
                                <button
                                    onClick={() => isCurrent ? togglePlay() : playTrack(track)}
                                    className="px-6 py-3 md:px-10 md:py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base group"
                                >
                                    <span>
                                        {(isCurrent && isPlaying) ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                    </span>
                                    {(isCurrent && isPlaying) ? 'Pause' : 'Listen Now'}
                                </button>

                                <button className="w-11 h-11 md:w-14 md:h-14 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-200 dark:hover:border-pink-800 transition-all">
                                    <Heart size={20} className="text-gray-400 hover:text-pink-500" />
                                </button>

                                <button
                                    onClick={() => setShowLibraryModal(true)}
                                    className="w-11 h-11 md:w-14 md:h-14 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                                >
                                    <Plus size={20} className="text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                                </button>

                                <button
                                    onClick={handleShareTrack}
                                    className="w-11 h-11 md:w-14 md:h-14 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                                    title="Copy share link"
                                >
                                    {copied ? (
                                        <Check size={20} className="text-green-500" />
                                    ) : (
                                        <Share2 size={20} className="text-gray-400 hover:text-pink-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid Information */}
                    <div className="mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 border-t border-gray-100 dark:border-gray-900 pt-8 md:pt-16">
                        <div className="space-y-2 md:space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Release Date</h3>
                            <p className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                                {new Date(track.releaseDate).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="space-y-2 md:space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Album</h3>
                            <p className="text-base md:text-lg text-gray-900 dark:text-gray-100 italic">
                                {track.collectionName}
                            </p>
                        </div>

                        <div className="space-y-2 md:space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Record Label Info</h3>
                            <p className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                                {track.country} • {track.currency}
                            </p>
                        </div>
                    </div>

                    {/* Minimalist Bio/Stats */}
                    <div className="mt-12 md:mt-24 p-6 md:p-12 rounded-3xl md:rounded-[40px] bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                        <div className="w-16 h-1 w-12 bg-pink-500/20 rounded-full mb-8" />
                        <p className="max-w-2xl text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-light italic">
                            &ldquo;This {track.primaryGenreName} masterpiece spans {formatDuration(track.trackTimeMillis)} of acoustic excellence. Originally part of {track.collectionName}, it stands as a testament to {track.artistName}&apos;s distinctive sound signature.&rdquo;
                        </p>
                    </div>

                    {/* ai-summaries feature flag — renders AI insight panel when enabled */}
                    {showAISummary && (
                        <AISummary trackId={String(track.trackId)} />
                    )}
                </div>
            </div>

            {showLibraryModal && (
                <AddToLibraryModal
                    track={track}
                    open={showLibraryModal}
                    onOpenChange={setShowLibraryModal}
                />
            )}
        </>
    )
}
