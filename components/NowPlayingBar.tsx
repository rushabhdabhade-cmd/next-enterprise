"use client"

import React from "react"
import { usePlayback } from "@/context/PlaybackContext"
import { formatDuration } from "@/services/itunesService"

export default function NowPlayingBar() {
    const {
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        updateVolume
    } = usePlayback()

    if (!currentTrack) return null

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = e.currentTarget
        const rect = bar.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percent = (x / rect.width) * 100
        seek(percent)
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateVolume(parseFloat(e.target.value))
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-purple-100/50 dark:border-gray-800/50 p-4 z-50 shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-full">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Track Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative group">
                        <img
                            src={currentTrack.artworkUrl60}
                            alt={currentTrack.trackName}
                            className="w-12 h-12 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        {isPlaying && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm hover:text-pink-600 transition-colors cursor-default">
                            {currentTrack.trackName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {currentTrack.artistName}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={playPrevious}
                            className="text-gray-400 hover:text-pink-600 transition-all text-xl active:scale-90"
                            title="Previous"
                        >
                            ⏮
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 flex items-center justify-center bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-all active:scale-95 hover:scale-110 shadow-pink-500/20"
                        >
                            {isPlaying ? "⏸" : "▶"}
                        </button>
                        <button
                            onClick={playNext}
                            className="text-gray-400 hover:text-pink-600 transition-all text-xl active:scale-90"
                            title="Next"
                        >
                            ⏭
                        </button>
                    </div>

                    <div className="w-full max-w-md flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 w-8 text-right font-medium">
                            {formatDuration(currentTime * 1000)}
                        </span>
                        <div
                            onClick={handleProgressClick}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden cursor-pointer group relative"
                        >
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-600 h-full transition-all duration-200"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                style={{ left: `${progress}%`, marginLeft: '-6px' }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400 w-8 text-left font-medium">
                            {formatDuration(duration * 1000)}
                        </span>
                    </div>
                </div>

                {/* Extra Info & Volume */}
                <div className="flex items-center justify-end gap-6 flex-1 text-sm text-gray-500">
                    <div className="flex items-center gap-3 group/volume">
                        <span className="text-gray-400 group-hover/volume:text-pink-500 transition-colors">
                            {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                        </span>
                        <div className="w-24 relative flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-pink-600 hover:accent-pink-500 transition-all"
                            />
                        </div>
                    </div>
                    <button className="hover:text-pink-500 transition-colors text-lg active:scale-90" title="Favorite">
                        ❤️
                    </button>
                </div>
            </div>
        </div>
    )
}
