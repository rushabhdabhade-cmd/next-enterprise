"use client"

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react"
import { ITunesTrack } from "@/types/itunes"

interface PlaybackContextType {
    currentTrack: ITunesTrack | null
    isPlaying: boolean
    progress: number
    currentTime: number
    duration: number
    volume: number
    playTrack: (track: ITunesTrack, newQueue?: ITunesTrack[]) => void
    pauseTrack: () => void
    togglePlay: () => void
    playNext: () => void
    playPrevious: () => void
    seek: (time: number) => void
    updateVolume: (val: number) => void
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined)

export function PlaybackProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<ITunesTrack | null>(null)
    const [queue, setQueue] = useState<ITunesTrack[]>([])
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.7)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const playTrack = (track: ITunesTrack, newQueue?: ITunesTrack[]) => {
        if (newQueue) setQueue(newQueue)

        if (currentTrack?.trackId === track.trackId) {
            if (audioRef.current) {
                audioRef.current.play()
                setIsPlaying(true)
            }
            return
        }

        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.onplay = null
            audioRef.current.onpause = null
            audioRef.current.ontimeupdate = null
            audioRef.current.onloadedmetadata = null
            audioRef.current.onended = null
        }

        const audio = new Audio(track.previewUrl)
        audio.volume = volume // Apply current volume

        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
        audio.onloadedmetadata = () => setDuration(audio.duration)
        audio.onended = () => {
            setIsPlaying(false)
            playNext()
        }

        audioRef.current = audio
        audio.play()
        setCurrentTrack(track)
        setIsPlaying(true)
    }

    const pauseTrack = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }

    const togglePlay = () => {
        if (isPlaying) {
            pauseTrack()
        } else if (audioRef.current) {
            audioRef.current.play()
            setIsPlaying(true)
        } else if (currentTrack) {
            playTrack(currentTrack)
        }
    }

    const playNext = () => {
        if (!currentTrack || queue.length === 0) return
        const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId)
        const nextIndex = (currentIndex + 1) % queue.length
        const nextTrack = queue[nextIndex]
        if (nextTrack) playTrack(nextTrack)
    }

    const playPrevious = () => {
        if (!currentTrack || queue.length === 0) return
        const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId)
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length
        const prevTrack = queue[prevIndex]
        if (prevTrack) playTrack(prevTrack)
    }

    const seek = (timePercent: number) => {
        if (audioRef.current && duration > 0) {
            const newTime = (timePercent / 100) * duration
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const updateVolume = (val: number) => {
        setVolume(val)
        if (audioRef.current) {
            audioRef.current.volume = val
        }
    }

    return (
        <PlaybackContext.Provider
            value={{
                currentTrack,
                isPlaying,
                progress,
                currentTime,
                duration,
                volume,
                playTrack,
                pauseTrack,
                togglePlay,
                playNext,
                playPrevious,
                seek,
                updateVolume
            }}
        >
            {children}
        </PlaybackContext.Provider>
    )
}

export function usePlayback() {
    const context = useContext(PlaybackContext)
    if (!context) {
        throw new Error("usePlayback must be used within a PlaybackProvider")
    }
    return context
}
