"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useLibraryStore } from "@/store/useLibraryStore"
import { usePlaybackStore } from "@/store/usePlaybackStore"

export default function StoreInitializer() {
    const { user, isSignedIn } = useUser()
    const refreshLibraries = useLibraryStore((s) => s.refreshLibraries)
    const resetLibraries = useLibraryStore((s) => s.reset)
    const loadFavorites = usePlaybackStore((s) => s.loadFavorites)
    const setFavorites = usePlaybackStore((s) => s.setFavorites)

    // Use refs to avoid unnecessary re-triggers of effects if functions change
    const refreshRef = useRef(refreshLibraries)
    const loadFavsRef = useRef(loadFavorites)

    useEffect(() => {
        refreshRef.current = refreshLibraries
        loadFavsRef.current = loadFavorites
    }, [refreshLibraries, loadFavorites])

    useEffect(() => {
        if (!isSignedIn) {
            resetLibraries()
            setFavorites(new Set())
            return
        }

        refreshRef.current()
        loadFavsRef.current()
    }, [isSignedIn, user?.id, resetLibraries, setFavorites])

    return null
}
