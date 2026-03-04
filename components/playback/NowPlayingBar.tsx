"use client"

import {
    Heart,
    Maximize2,
    Pause,
    Play,
    Plus,
    Repeat,
    Shuffle,
    SkipBack,
    SkipForward,
    Volume1,
    Volume2,
    VolumeX
} from "lucide-react"
import React, { useState } from "react" // useState kept for isExpanded
import { useUser } from "@clerk/nextjs"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import { usePlaybackStore } from "@/store/usePlaybackStore"
import { formatDuration } from "@/services/itunesService"

export default function NowPlayingBar() {
    const { isSignedIn } = useUser()
    const {
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        isShuffle,
        isRepeat,
        favorites,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        updateVolume,
        toggleShuffle,
        toggleRepeat,
        toggleFavorite,
    } = usePlaybackStore()
    const [isExpanded, setIsExpanded] = useState(false)
    const [showLibraryModal, setShowLibraryModal] = useState(false)

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

    if (isExpanded) {
        return (
            <div className="fixed bottom-6 right-6 z-[60] animate-in zoom-in-95 duration-300">
                <div className="w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
                    {/* Top: Artwork & Header */}
                    <div className="p-6 pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Now Playing</span>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                            >
                                <Maximize2 size={16} className="rotate-180" />
                            </button>
                        </div>
                        <div className="relative group mb-6">
                            <img
                                src={currentTrack.artworkUrl100 || currentTrack.artworkUrl60}
                                alt={currentTrack.trackName}
                                className="w-full aspect-square rounded-[24px] object-cover shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
                            />
                            {isPlaying && (
                                <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full">
                                    <div className="flex gap-1 items-end h-3">
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]" />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center mb-6 px-2">
                            <h4 className="font-bold text-gray-950 dark:text-white text-lg mb-1 line-clamp-1">
                                {currentTrack.trackName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-1">
                                {currentTrack.artistName}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 mb-8">
                            <div
                                onClick={handleProgressClick}
                                className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden cursor-pointer group/progress"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] tabular-nums font-bold text-gray-400">
                                <span>{formatDuration(currentTime * 1000)}</span>
                                <span>{formatDuration(duration * 1000)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={toggleShuffle}
                                    className={`transition-colors ${isShuffle ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600'}`}
                                >
                                    <Shuffle size={18} />
                                </button>
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={playPrevious}
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                                    >
                                        <SkipBack fill="currentColor" size={24} />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className="w-14 h-14 flex items-center justify-center bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" className="ml-1" size={24} />}
                                    </button>
                                    <button
                                        onClick={playNext}
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                                    >
                                        <SkipForward fill="currentColor" size={24} />
                                    </button>
                                </div>
                                <button
                                    onClick={toggleRepeat}
                                    className={`transition-colors ${isRepeat ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600'}`}
                                >
                                    <Repeat size={18} />
                                </button>
                            </div>

                            {/* Volume Slider in Mini Mode */}
                            <div className="flex items-center gap-3 px-2">
                                <VolumeIcon size={16} className="text-gray-400" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
            <div className="max-w-7xl mx-auto bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-3 md:p-4 transition-all duration-700 animate-in slide-in-from-bottom-10">
                <div className="flex items-center gap-3 md:gap-8">

                    {/* Left: Track Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-shrink-0 max-w-[40%] md:max-w-none md:flex-1">
                        <div className="relative group flex-shrink-0">
                            <img
                                src={currentTrack.artworkUrl60}
                                alt={currentTrack.trackName}
                                className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                            />
                            {isPlaying && (
                                <div className="absolute inset-0 bg-black/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                                    <div className="flex gap-1 items-end h-3">
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]" />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
                                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 hidden sm:block">
                            <h4 className="font-bold text-gray-950 dark:text-white truncate text-sm md:text-base mb-0.5 tracking-tight">
                                {currentTrack.trackName}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                                {currentTrack.artistName}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleFavorite(currentTrack, !!isSignedIn)}
                            className={`ml-1 transition-all hover:scale-110 active:scale-90 hidden sm:block ${favorites.has(currentTrack.trackId) ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600 hover:text-pink-500'}`}
                        >
                            <Heart size={18} fill={favorites.has(currentTrack.trackId) ? "currentColor" : "none"} />
                        </button>
                        <button
                            onClick={() => setShowLibraryModal(true)}
                            className="ml-1 text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 active:scale-90 hidden sm:block"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Center: Controls & Global Progress */}
                    <div className="flex flex-col items-center gap-2 md:gap-3 flex-1 md:flex-[2] md:max-w-2xl">
                        <div className="flex items-center gap-4 md:gap-8">
                            <button
                                onClick={toggleShuffle}
                                className={`transition-colors hidden sm:block ${isShuffle ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600'}`}
                            >
                                <Shuffle size={16} />
                            </button>

                            <button
                                onClick={playPrevious}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                            >
                                <SkipBack fill="currentColor" size={20} />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPlaying ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" className="ml-0.5" size={18} />}
                            </button>

                            <button
                                onClick={playNext}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                            >
                                <SkipForward fill="currentColor" size={20} />
                            </button>

                            <button
                                onClick={toggleRepeat}
                                className={`transition-colors hidden sm:block ${isRepeat ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600'}`}
                            >
                                <Repeat size={16} />
                            </button>
                        </div>

                        <div className="w-full flex items-center gap-2 md:gap-3 group/progress">
                            <span className="text-[10px] tabular-nums font-bold text-gray-400 w-8 md:w-10 text-right hidden sm:block">
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
                            <span className="text-[10px] tabular-nums font-bold text-gray-400 w-8 md:w-10 text-left hidden sm:block">
                                {formatDuration(duration * 1000)}
                            </span>
                        </div>
                    </div>

                    {/* Right: Volume & Utilities */}
                    <div className="hidden md:flex items-center justify-end gap-6 flex-1">
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
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 active:scale-90"
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {showLibraryModal && currentTrack && (
                <AddToLibraryModal
                    track={currentTrack}
                    open={showLibraryModal}
                    onOpenChange={setShowLibraryModal}
                />
            )}
        </div>
    )
}
