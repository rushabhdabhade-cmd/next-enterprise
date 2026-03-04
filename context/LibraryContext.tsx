"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import type { ITunesTrack } from "@/types/itunes"

export interface LibrarySummary {
    id: string
    name: string
    description: string | null
    share_id: string | null
    track_count: number
}

interface LibraryContextType {
    libraries: LibrarySummary[]
    librariesLoaded: boolean
    refreshLibraries: () => Promise<void>
    addToLibrary: (libraryId: string, track: ITunesTrack) => Promise<boolean>
    removeFromLibrary: (libraryId: string, trackId: number) => Promise<boolean>
    createLibrary: (name: string, description?: string) => Promise<LibrarySummary | null>
    deleteLibrary: (libraryId: string) => Promise<boolean>
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
    const { isSignedIn, user } = useUser()
    const [libraries, setLibraries] = useState<LibrarySummary[]>([])
    const [librariesLoaded, setLibrariesLoaded] = useState(false)

    const refreshLibraries = useCallback(async () => {
        const res = await fetch("/api/user/libraries")
        if (!res.ok) return
        const data = (await res.json()) as { libraries: LibrarySummary[] }
        setLibraries(data.libraries ?? [])
        setLibrariesLoaded(true)
    }, [])

    useEffect(() => {
        if (!isSignedIn) {
            setLibraries([])
            setLibrariesLoaded(false)
            return
        }
        refreshLibraries()
    }, [isSignedIn, user?.id, refreshLibraries])

    const createLibraryFn = useCallback(async (name: string, description?: string) => {
        const res = await fetch("/api/user/libraries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { library: LibrarySummary }
        const lib = data.library
        setLibraries((prev) => [{ ...lib, track_count: 0 }, ...prev])
        return lib
    }, [])

    const addToLibrary = useCallback(async (libraryId: string, track: ITunesTrack) => {
        const res = await fetch(`/api/user/libraries/${libraryId}/tracks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(track),
        })
        if (res.ok) {
            setLibraries((prev) =>
                prev.map((lib) =>
                    lib.id === libraryId ? { ...lib, track_count: lib.track_count + 1 } : lib
                )
            )
        }
        return res.ok
    }, [])

    const removeFromLibrary = useCallback(async (libraryId: string, trackId: number) => {
        const res = await fetch(`/api/user/libraries/${libraryId}/tracks`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackId }),
        })
        if (res.ok) {
            setLibraries((prev) =>
                prev.map((lib) =>
                    lib.id === libraryId
                        ? { ...lib, track_count: Math.max(0, lib.track_count - 1) }
                        : lib
                )
            )
        }
        return res.ok
    }, [])

    const deleteLibraryFn = useCallback(async (libraryId: string) => {
        const res = await fetch(`/api/user/libraries/${libraryId}`, { method: "DELETE" })
        if (res.ok) {
            setLibraries((prev) => prev.filter((lib) => lib.id !== libraryId))
        }
        return res.ok
    }, [])

    return (
        <LibraryContext.Provider
            value={{
                libraries,
                librariesLoaded,
                refreshLibraries,
                addToLibrary,
                removeFromLibrary,
                createLibrary: createLibraryFn,
                deleteLibrary: deleteLibraryFn,
            }}
        >
            {children}
        </LibraryContext.Provider>
    )
}

export function useLibrary() {
    const context = useContext(LibraryContext)
    if (!context) throw new Error("useLibrary must be used within a LibraryProvider")
    return context
}
