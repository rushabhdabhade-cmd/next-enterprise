"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTrackById, formatDuration } from "@/services/itunesService"
import { ITunesTrack } from "@/types/itunes"
import { usePlayback } from "@/context/PlaybackContext"
import LeftSidebar from "@/components/LeftSidebar"

export default function TrackDetail() {
    const params = useParams()
    const router = useRouter()
    const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayback()
    const [track, setTrack] = useState<ITunesTrack | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrack = async () => {
            if (!params.id) return
            try {
                const data = await getTrackById(Number(params.id))
                setTrack(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchTrack()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin text-pink-600 text-4xl">💿</div>
            </div>
        )
    }

    if (!track) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Track not found</h1>
                <button onClick={() => router.back()} className="text-pink-600 hover:underline">Go back</button>
            </div>
        )
    }

    const isCurrent = currentTrack?.trackId === track.trackId

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-colors duration-300">
            <LeftSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors"
                    >
                        ← Back to results
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Massive Album Art */}
                        <div className="relative w-72 h-72 flex-shrink-0 group">
                            <img
                                src={track.artworkUrl100.replace("100x100", "600x600")}
                                alt={track.trackName}
                                className="w-full h-full rounded-3xl object-cover shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/20 backdrop-blur-sm rounded-3xl inset-0 absolute" />
                            </div>
                        </div>

                        {/* Track metadata */}
                        <div className="flex-1 py-4">
                            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                {track.trackName}
                            </h1>
                            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
                                {track.artistName}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">
                                    <span className="text-xs text-gray-400 block uppercase tracking-wider">Album</span>
                                    <span className="font-medium">{track.collectionName}</span>
                                </div>
                                <div className="bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">
                                    <span className="text-xs text-gray-400 block uppercase tracking-wider">Duration</span>
                                    <span className="font-medium">{formatDuration(track.trackTimeMillis)}</span>
                                </div>
                                <div className="bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">
                                    <span className="text-xs text-gray-400 block uppercase tracking-wider">Genre</span>
                                    <span className="font-medium">{track.primaryGenreName}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => isCurrent ? togglePlay() : playTrack(track)}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {(isCurrent && isPlaying) ? "⏸ Pause Preview" : "▶ Play Preview"}
                                </button>
                                <button className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-gray-700 rounded-2xl font-bold hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                                    ❤️ Favorite
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                        <h2 className="text-xl font-bold mb-4 italic text-purple-600 dark:text-purple-400">About this track</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Released on the album <strong>{track.collectionName}</strong>, this track by <strong>{track.artistName}</strong> is part of the <strong>{track.primaryGenreName}</strong> collection.
                            Preview it above or explore more tracks from the same artist in your discovery tab.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
