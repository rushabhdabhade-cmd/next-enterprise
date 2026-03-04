"use client"

import React, { useState } from "react"
import { usePlayback } from "@/context/PlaybackContext"
import { formatDuration } from "@/services/itunesService"
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Volume1,
    VolumeX,
    Heart,
    Repeat,
    Shuffle,
    Maximize2
} from "lucide-react"

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

    const [isLiked, setIsLiked] = useState(false)
    const [isShuffle, setIsShuffle] = useState(false)
    const [isRepeat, setIsRepeat] = useState(false)

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

    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
            <div className="max-w-7xl mx-auto bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-3 md:p-4 transition-all duration-700 animate-in slide-in-from-bottom-10">
                <div className="flex items-center justify-between gap-4 md:gap-8">

                    {/* Left: Track Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative group flex-shrink-0">
                            <img
                                src={currentTrack.artworkUrl60}
                                alt={currentTrack.trackName}
                                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                            />
                            {isPlaying && (
                                <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center">
                                    <div className="flex gap-1 items-end h-3">
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]" />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-gray-950 dark:text-white truncate text-sm md:text-base mb-0.5 tracking-tight">
                                {currentTrack.trackName}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                                {currentTrack.artistName}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`ml-2 transition-all hover:scale-110 active:scale-90 ${isLiked ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600 hover:text-pink-500'}`}
                        >
                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* Center: Controls & Global Progress */}
                    <div className="flex flex-col items-center gap-3 flex-[2] max-w-2xl">
                        <div className="flex items-center gap-5 md:gap-8">
                            <button
                                onClick={() => setIsShuffle(!isShuffle)}
                                className={`transition-colors hidden sm:block ${isShuffle ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                <Shuffle size={16} />
                            </button>

                            <button
                                onClick={playPrevious}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                            >
                                <SkipBack fill="currentColor" size={24} />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" className="ml-1" size={20} />}
                            </button>

                            <button
                                onClick={playNext}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                            >
                                <SkipForward fill="currentColor" size={24} />
                            </button>

                            <button
                                onClick={() => setIsRepeat(!isRepeat)}
                                className={`transition-colors hidden sm:block ${isRepeat ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                <Repeat size={16} />
                            </button>
                        </div>

                        <div className="w-full flex items-center gap-3 group/progress">
                            <span className="text-[10px] tabular-nums font-bold text-gray-400 w-10 text-right">
                                {formatDuration(currentTime * 1000)}
                            </span>
                            <div
                                onClick={handleProgressClick}
                                className="flex-1 bg-gray-100 dark:bg-gray-800/50 h-1.5 rounded-full overflow-hidden cursor-pointer relative"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 h-full"
                                    style={{ width: `${progress}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-200 border-2 border-gray-950 dark:border-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-xl"
                                    style={{ left: `${progress}%`, marginLeft: '-8px' }}
                                />
                            </div>
                            <span className="text-[10px] tabular-nums font-bold text-gray-400 w-10 text-left">
                                {formatDuration(duration * 1000)}
                            </span>
                        </div>
                    </div>

                    {/* Right: Volume & Utilities */}
                    <div className="flex items-center justify-end gap-6 flex-1 hidden md:flex">
                        <div className="flex items-center gap-3 group/volume">
                            <VolumeIcon
                                size={18}
                                className="text-gray-400 group-hover/volume:text-gray-900 dark:group-hover/volume:text-white transition-colors cursor-pointer"
                                onClick={() => updateVolume(volume === 0 ? 0.7 : 0)}
                            />
                            <div className="w-24 relative flex items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-gray-950 dark:white hover:accent-pink-600 transition-all"
                                />
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
        </div>
    )
}
