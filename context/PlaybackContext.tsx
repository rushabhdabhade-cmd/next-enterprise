"use client"

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { ITunesTrack } from "@/types/itunes"
import { trackTrackPlayed, trackTrackPaused, trackTrackFavorited } from "@/lib/analytics"

interface PlaybackContextType {
    currentTrack: ITunesTrack | null
    queue: ITunesTrack[]
    isPlaying: boolean
    progress: number
    currentTime: number
    duration: number
    volume: number
    isShuffle: boolean
    isRepeat: boolean
    favorites: Set<number>
    playTrack: (track: ITunesTrack, newQueue?: ITunesTrack[]) => void
    pauseTrack: () => void
    togglePlay: () => void
    playNext: () => void
    playPrevious: () => void
    seek: (time: number) => void
    updateVolume: (val: number) => void
    toggleShuffle: () => void
    toggleRepeat: () => void
    toggleFavorite: (track: ITunesTrack) => void
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined)

export function PlaybackProvider({ children }: { children: ReactNode }) {
    const { user, isSignedIn } = useUser()

    const [currentTrack, setCurrentTrack] = useState<ITunesTrack | null>(null)
    const [queue, setQueue] = useState<ITunesTrack[]>([])
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.7)
    const [isShuffle, setIsShuffle] = useState(false)
    const [isRepeat, setIsRepeat] = useState(false)
    const [originalQueue, setOriginalQueue] = useState<ITunesTrack[]>([])
    const [favorites, setFavorites] = useState<Set<number>>(new Set())

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const queueRef = useRef<ITunesTrack[]>([])
    const originalQueueRef = useRef<ITunesTrack[]>([])
    const currentTrackRef = useRef<ITunesTrack | null>(null)
    const isShuffleRef = useRef(false)
    const isRepeatRef = useRef(false)
    const isSignedInRef = useRef(false)
    const favoritesRef = useRef<Set<number>>(new Set())

    // Keep refs in sync
    useEffect(() => { queueRef.current = queue }, [queue])
    useEffect(() => { originalQueueRef.current = originalQueue }, [originalQueue])
    useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])
    useEffect(() => { isShuffleRef.current = isShuffle }, [isShuffle])
    useEffect(() => { isRepeatRef.current = isRepeat }, [isRepeat])
    useEffect(() => { isSignedInRef.current = !!isSignedIn }, [isSignedIn])
    useEffect(() => { favoritesRef.current = favorites }, [favorites])

    // Load favorites from DB when user signs in
    useEffect(() => {
        if (!isSignedIn) {
            setFavorites(new Set())
            return
        }
        fetch("/api/user/favorites")
            .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`)
                return r.json() as Promise<{ trackIds: number[] }>
            })
            .then(({ trackIds }) => setFavorites(new Set<number>(trackIds)))
            .catch((err) => console.error("Failed to load favorites:", err))
    }, [isSignedIn, user?.id])

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const playTrackRef = useRef<(track: ITunesTrack, newQueue?: ITunesTrack[]) => void>(() => {})
    const playNextRef = useRef<() => void>(() => {})

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
            playTrackRef.current(nextTrack)
        }
    }, [])

    playNextRef.current = playNextAction

    const playTrack = useCallback((track: ITunesTrack, newQueue?: ITunesTrack[]) => {
        if (newQueue) {
            const slicedQueue = newQueue.slice(0, 20)
            setQueue(slicedQueue)
            setOriginalQueue(slicedQueue)
            queueRef.current = slicedQueue
            originalQueueRef.current = slicedQueue

            if (isShuffleRef.current) {
                const otherTracks = slicedQueue.filter(t => t.trackId !== track.trackId)
                for (let i = otherTracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1))
                    const temp = otherTracks[i]!
                    otherTracks[i] = otherTracks[j]!
                    otherTracks[j] = temp
                }
                const shuffled = [track, ...otherTracks]
                setQueue(shuffled)
                queueRef.current = shuffled
            }
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

        audio.addEventListener('play', () => {
            setIsPlaying(true)
            if (currentTrackRef.current) {
                trackTrackPlayed({
                    id: String(currentTrackRef.current.trackId),
                    artist: currentTrackRef.current.artistName,
                    title: currentTrackRef.current.trackName
                })
            }
        })
        audio.addEventListener('pause', () => {
            setIsPlaying(false)
            if (currentTrackRef.current) {
                trackTrackPaused(String(currentTrackRef.current.trackId), audio.currentTime)
            }
        })
        audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
        audio.addEventListener('ended', () => {
            if (isRepeatRef.current) {
                audio.currentTime = 0
                audio.play().catch(console.error)
            } else {
                playNextRef.current()
            }
        })

        audio.play().catch(err => {
            console.error("Playback failed:", err)
            playNextRef.current()
        })

        // Record play to DB for authenticated users
        if (isSignedInRef.current) {
            fetch("/api/user/plays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(track),
            }).catch(() => {})
        }

        setCurrentTrack(track)
        currentTrackRef.current = track
        setIsPlaying(true)
    }, [volume])

    playTrackRef.current = playTrack

    const toggleFavorite = useCallback((track: ITunesTrack) => {
        const trackId = track.trackId
        const isFav = favoritesRef.current.has(trackId)

        // Optimistic UI update
        setFavorites(prev => {
            const next = new Set(prev)
            if (isFav) next.delete(trackId)
            else next.add(trackId)
            return next
        })

        trackTrackFavorited(String(trackId), !isFav)

        if (!isSignedInRef.current) return

        if (isFav) {
            fetch("/api/user/favorites", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackId }),
            }).catch(() => {})
        } else {
            fetch("/api/user/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(track),
            }).catch(() => {})
        }
    }, [])

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

    const toggleShuffle = useCallback(() => {
        setIsShuffle(prev => {
            const nextShuffle = !prev
            const currentQueue = [...queueRef.current]

            if (nextShuffle) {
                if (currentQueue.length > 0) {
                    setOriginalQueue(currentQueue)
                    originalQueueRef.current = currentQueue

                    const track = currentTrackRef.current
                    const otherTracks = currentQueue.filter(t => t.trackId !== track?.trackId)

                    for (let i = otherTracks.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1))
                        const temp = otherTracks[i]!
                        otherTracks[i] = otherTracks[j]!
                        otherTracks[j] = temp
                    }

                    const newQueue = track ? [track, ...otherTracks] : otherTracks
                    setQueue(newQueue)
                    queueRef.current = newQueue
                }
            } else {
                if (originalQueueRef.current.length > 0) {
                    setQueue(originalQueueRef.current)
                    queueRef.current = originalQueueRef.current
                }
            }
            return nextShuffle
        })
    }, [])

    const toggleRepeat = () => setIsRepeat(prev => !prev)

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
                isShuffle,
                isRepeat,
                favorites,
                playTrack,
                pauseTrack,
                togglePlay,
                playNext: playNextAction,
                playPrevious,
                seek,
                updateVolume,
                toggleShuffle,
                toggleRepeat,
                toggleFavorite,
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
