import { create } from "zustand"
import type { ITunesTrack } from "@/types/itunes"

export interface LibrarySummary {
    id: string
    name: string
    description: string | null
    share_id: string | null
    track_count: number
}

interface LibraryState {
    libraries: LibrarySummary[]
    librariesLoaded: boolean
    refreshLibraries: () => Promise<void>
    addToLibrary: (libraryId: string, track: ITunesTrack) => Promise<boolean>
    removeFromLibrary: (libraryId: string, trackId: number) => Promise<boolean>
    createLibrary: (name: string, description?: string) => Promise<LibrarySummary | null>
    deleteLibrary: (libraryId: string) => Promise<boolean>
    setLibraries: (libraries: LibrarySummary[]) => void
    setLibrariesLoaded: (loaded: boolean) => void
    reset: () => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
    libraries: [],
    librariesLoaded: false,

    setLibraries: (libraries: LibrarySummary[]) => set({ libraries }),
    setLibrariesLoaded: (loaded: boolean) => set({ librariesLoaded: loaded }),

    refreshLibraries: async () => {
        const res = await fetch("/api/user/libraries")
        if (!res.ok) return
        const data = (await res.json()) as { libraries: LibrarySummary[] }
        set({ libraries: data.libraries ?? [], librariesLoaded: true })
    },

    createLibrary: async (name: string, description?: string) => {
        const res = await fetch("/api/user/libraries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { library: LibrarySummary }
        const lib = data.library
        set((state: LibraryState) => ({
            libraries: [{ ...lib, track_count: 0 }, ...state.libraries],
        }))
        return lib
    },

    addToLibrary: async (libraryId: string, track: ITunesTrack) => {
        const res = await fetch(`/api/user/libraries/${libraryId}/tracks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(track),
        })
        if (res.ok) {
            set((state: LibraryState) => ({
                libraries: state.libraries.map((lib: LibrarySummary) =>
                    lib.id === libraryId ? { ...lib, track_count: lib.track_count + 1 } : lib
                ),
            }))
        }
        return res.ok
    },

    removeFromLibrary: async (libraryId: string, trackId: number) => {
        const res = await fetch(`/api/user/libraries/${libraryId}/tracks`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackId }),
        })
        if (res.ok) {
            set((state: LibraryState) => ({
                libraries: state.libraries.map((lib: LibrarySummary) =>
                    lib.id === libraryId
                        ? { ...lib, track_count: Math.max(0, lib.track_count - 1) }
                        : lib
                ),
            }))
        }
        return res.ok
    },

    deleteLibrary: async (libraryId: string) => {
        const res = await fetch(`/api/user/libraries/${libraryId}`, { method: "DELETE" })
        if (res.ok) {
            set((state: LibraryState) => ({
                libraries: state.libraries.filter((lib: LibrarySummary) => lib.id !== libraryId),
            }))
        }
        return res.ok
    },

    reset: () => set({ libraries: [], librariesLoaded: false }),
}))
