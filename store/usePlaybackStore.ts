import { create } from "zustand"
import { ITunesTrack } from "@/types/itunes"
import { trackTrackPlayed, trackTrackPaused, trackTrackFavorited } from "@/lib/analytics"

interface PlaybackState {
    currentTrack: ITunesTrack | null
    queue: ITunesTrack[]
    originalQueue: ITunesTrack[]
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    isShuffle: boolean
    isRepeat: boolean
    favorites: Set<number>
    progress: number

    // Actions
    setCurrentTrack: (track: ITunesTrack | null) => void
    setQueue: (queue: ITunesTrack[]) => void
    setIsPlaying: (playing: boolean) => void
    setCurrentTime: (time: number) => void
    setDuration: (duration: number) => void
    setVolume: (volume: number) => void
    setShuffle: (shuffle: boolean) => void
    setRepeat: (repeat: boolean) => void
    setFavorites: (favorites: Set<number>) => void

    playTrack: (track: ITunesTrack, newQueue?: ITunesTrack[], isSignedIn?: boolean) => void
    pauseTrack: () => void
    togglePlay: () => void
    playNext: () => void
    playPrevious: () => void
    seek: (time: number) => void
    updateVolume: (val: number) => void
    toggleShuffle: () => void
    toggleRepeat: () => void
    toggleFavorite: (track: ITunesTrack, isSignedIn: boolean) => void
    loadFavorites: () => Promise<void>
}

// Keep audio object outside the store to avoid re-renders on audio state changes
let audio: HTMLAudioElement | null = null

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
    currentTrack: null,
    queue: [],
    originalQueue: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isShuffle: false,
    isRepeat: false,
    favorites: new Set(),
    progress: 0,

    setCurrentTrack: (currentTrack: ITunesTrack | null) => set({ currentTrack }),
    setQueue: (queue: ITunesTrack[]) => set({ queue }),
    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setCurrentTime: (currentTime: number) => set((state: PlaybackState) => ({
        currentTime,
        progress: state.duration > 0 ? (currentTime / state.duration) * 100 : 0
    })),
    setDuration: (duration: number) => set((state: PlaybackState) => ({
        duration,
        progress: duration > 0 ? (state.currentTime / duration) * 100 : 0
    })),
    setVolume: (volume: number) => set({ volume }),
    setShuffle: (isShuffle: boolean) => set({ isShuffle }),
    setRepeat: (isRepeat: boolean) => set({ isRepeat }),
    setFavorites: (favorites: Set<number>) => set({ favorites }),

    playTrack: (track: ITunesTrack, newQueue?: ITunesTrack[], isSignedIn?: boolean) => {
        const { isShuffle } = get()

        if (newQueue) {
            const slicedQueue = newQueue.slice(0, 20)
            set({ queue: slicedQueue, originalQueue: slicedQueue })

            if (isShuffle) {
                const otherTracks = slicedQueue.filter((t: ITunesTrack) => t.trackId !== track.trackId)
                for (let i = otherTracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1))
                    const temp = otherTracks[i]!
                    otherTracks[i] = otherTracks[j]!
                    otherTracks[j] = temp
                }
                const shuffled = [track, ...otherTracks]
                set({ queue: shuffled })
            }
        }

        if (get().currentTrack?.trackId === track.trackId && audio) {
            audio.play().catch(console.error)
            set({ isPlaying: true })
            return
        }

        if (audio) {
            audio.pause()
            audio.src = ""
            audio.load()
        }

        audio = new Audio(track.previewUrl)
        audio.volume = get().volume

        audio.addEventListener('play', () => {
            set({ isPlaying: true })
            const current = get().currentTrack
            if (current) {
                trackTrackPlayed({
                    id: String(current.trackId),
                    artist: current.artistName,
                    title: current.trackName
                })
            }
        })

        audio.addEventListener('pause', () => {
            set({ isPlaying: false })
            const current = get().currentTrack
            if (current && audio) {
                trackTrackPaused(String(current.trackId), audio.currentTime)
            }
        })

        audio.addEventListener('timeupdate', () => {
            if (audio) {
                const currentTime = audio.currentTime
                set((state: PlaybackState) => ({
                    currentTime,
                    progress: state.duration > 0 ? (currentTime / state.duration) * 100 : 0
                }))
            }
        })

        audio.addEventListener('loadedmetadata', () => {
            if (audio) {
                const duration = audio.duration
                set((state: PlaybackState) => ({
                    duration,
                    progress: duration > 0 ? (state.currentTime / duration) * 100 : 0
                }))
            }
        })

        audio.addEventListener('ended', () => {
            const { isRepeat, playNext } = get()
            if (isRepeat && audio) {
                audio.currentTime = 0
                audio.play().catch(console.error)
            } else {
                playNext()
            }
        })

        audio.play().catch(err => {
            console.error("Playback failed:", err)
            get().playNext()
        })

        if (isSignedIn) {
            fetch("/api/user/plays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(track),
            }).catch(() => { })
        }

        set({ currentTrack: track, isPlaying: true })
    },

    pauseTrack: () => {
        if (audio) {
            audio.pause()
            set({ isPlaying: false })
        }
    },

    togglePlay: () => {
        const { isPlaying, currentTrack, pauseTrack, playTrack } = get()
        if (isPlaying) {
            pauseTrack()
        } else if (audio) {
            audio.play().catch(console.error)
            set({ isPlaying: true })
        } else if (currentTrack) {
            playTrack(currentTrack)
        }
    },

    playNext: () => {
        const { queue, currentTrack, playTrack } = get()
        if (queue.length === 0) return

        let nextTrack: ITunesTrack | undefined
        if (!currentTrack) {
            nextTrack = queue[0]
        } else {
            const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId)
            const nextIndex = (currentIndex + 1) % queue.length
            nextTrack = queue[nextIndex]
        }

        if (nextTrack) playTrack(nextTrack)
    },

    playPrevious: () => {
        const { queue, currentTrack, playTrack } = get()
        if (queue.length === 0) return

        let prevTrack: ITunesTrack | undefined
        if (!currentTrack) {
            prevTrack = queue[queue.length - 1]
        } else {
            const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId)
            const prevIndex = (currentIndex - 1 + queue.length) % queue.length
            prevTrack = queue[prevIndex]
        }

        if (prevTrack) playTrack(prevTrack)
    },

    seek: (timePercent: number) => {
        const { duration } = get()
        if (audio && duration > 0) {
            const newTime = (timePercent / 100) * duration
            audio.currentTime = newTime
            set({ currentTime: newTime, progress: timePercent })
        }
    },

    updateVolume: (val: number) => {
        set({ volume: val })
        if (audio) audio.volume = val
    },

    toggleShuffle: () => {
        const { isShuffle, queue, originalQueue, currentTrack } = get()
        const nextShuffle = !isShuffle

        if (nextShuffle) {
            if (queue.length > 0) {
                const otherTracks = queue.filter((t: ITunesTrack) => t.trackId !== currentTrack?.trackId)
                for (let i = otherTracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1))
                    const temp = otherTracks[i]!
                    otherTracks[i] = otherTracks[j]!
                    otherTracks[j] = temp
                }
                const newQueue = currentTrack ? [currentTrack, ...otherTracks] : otherTracks
                set({ isShuffle: nextShuffle, queue: newQueue })
            } else {
                set({ isShuffle: nextShuffle })
            }
        } else {
            set({ isShuffle: nextShuffle, queue: originalQueue })
        }
    },

    toggleRepeat: () => set((state: PlaybackState) => ({ isRepeat: !state.isRepeat })),

    toggleFavorite: async (track: ITunesTrack, isSignedIn: boolean) => {
        const { favorites } = get()
        const trackId = track.trackId
        const isFav = favorites.has(trackId)

        // Optimistic UI update
        const nextFavorites = new Set(favorites)
        if (isFav) nextFavorites.delete(trackId)
        else nextFavorites.add(trackId)
        set({ favorites: nextFavorites })

        trackTrackFavorited(String(trackId), !isFav)

        if (!isSignedIn) return

        if (isFav) {
            fetch("/api/user/favorites", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackId }),
            }).catch(() => { })
        } else {
            fetch("/api/user/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(track),
            }).catch(() => { })
        }
    },

    loadFavorites: async () => {
        try {
            const r = await fetch("/api/user/favorites")
            if (!r.ok) throw new Error(`${r.status}`)
            const { trackIds } = (await r.json()) as { trackIds: number[] }
            set({ favorites: new Set<number>(trackIds) })
        } catch (err) {
            console.error("Failed to load favorites:", err)
        }
    },
}))
