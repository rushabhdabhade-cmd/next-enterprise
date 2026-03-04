"use client"

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from "react"
import { ITunesTrack } from "@/types/itunes"

interface PlaybackContextType {
    currentTrack: ITunesTrack | null
    queue: ITunesTrack[]
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
    const queueRef = useRef<ITunesTrack[]>([])
    const currentTrackRef = useRef<ITunesTrack | null>(null)

    // Keep refs in sync for event listeners
    useEffect(() => {
        queueRef.current = queue
    }, [queue])

    useEffect(() => {
        currentTrackRef.current = currentTrack
    }, [currentTrack])

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const playTrack = useCallback((track: ITunesTrack, newQueue?: ITunesTrack[]) => {
        if (newQueue) {
            const slicedQueue = newQueue.slice(0, 20)
            setQueue(slicedQueue)
            queueRef.current = slicedQueue
        }

        if (currentTrackRef.current?.trackId === track.trackId && audioRef.current) {
            audioRef.current.play().catch(console.error)
            setIsPlaying(true)
            return
        }

        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = ""
            audioRef.current.load()
        }

        const audio = new Audio(track.previewUrl)
        audio.volume = volume
        audioRef.current = audio

        audio.addEventListener('play', () => setIsPlaying(true))
        audio.addEventListener('pause', () => setIsPlaying(false))
        audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
        audio.addEventListener('ended', () => {
            setIsPlaying(false)
            playNextAction()
        })

        audio.play().catch(err => {
            console.error("Playback failed:", err)
            playNextAction()
        })

        setCurrentTrack(track)
        currentTrackRef.current = track
        setIsPlaying(true)
    }, [volume])

    const playNextAction = useCallback(() => {
        const currentQueue = queueRef.current
        const track = currentTrackRef.current

        if (currentQueue.length === 0) return

        let nextTrack: ITunesTrack | undefined
        if (!track) {
            nextTrack = currentQueue[0]
        } else {
            const currentIndex = currentQueue.findIndex(t => t.trackId === track.trackId)
            const nextIndex = (currentIndex + 1) % currentQueue.length
            nextTrack = currentQueue[nextIndex]
        }

        if (nextTrack) {
            playTrack(nextTrack)
        }
    }, [playTrack])

    const playPrevious = useCallback(() => {
        const currentQueue = queueRef.current
        const track = currentTrackRef.current

        if (currentQueue.length === 0) return

        let prevTrack: ITunesTrack | undefined
        if (!track) {
            prevTrack = currentQueue[currentQueue.length - 1]
        } else {
            const currentIndex = currentQueue.findIndex(t => t.trackId === track.trackId)
            const prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length
            prevTrack = currentQueue[prevIndex]
        }

        if (prevTrack) {
            playTrack(prevTrack)
        }
    }, [playTrack])

    const pauseTrack = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }, [])

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pauseTrack()
        } else if (audioRef.current) {
            audioRef.current.play().catch(console.error)
            setIsPlaying(true)
        } else if (currentTrack) {
            playTrack(currentTrack)
        }
    }, [isPlaying, currentTrack, pauseTrack, playTrack])

    const seek = useCallback((timePercent: number) => {
        if (audioRef.current && duration > 0) {
            const newTime = (timePercent / 100) * duration
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }, [duration])

    const updateVolume = useCallback((val: number) => {
        setVolume(val)
        if (audioRef.current) {
            audioRef.current.volume = val
        }
    }, [])

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
        }
    }, [])

    return (
        <PlaybackContext.Provider
            value={{
                currentTrack,
                queue,
                isPlaying,
                progress,
                currentTime,
                duration,
                volume,
                playTrack,
                pauseTrack,
                togglePlay,
                playNext: playNextAction,
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
