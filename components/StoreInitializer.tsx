"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useRef } from "react"
import { useLibraryStore } from "@/store/useLibraryStore"
import { usePlaybackStore } from "@/store/usePlaybackStore"

export default function StoreInitializer() {
    const { user, isSignedIn, isLoaded } = useUser()
    const refreshLibraries = useLibraryStore((s) => s.refreshLibraries)
    const resetLibraries = useLibraryStore((s) => s.reset)
    const loadFavorites = usePlaybackStore((s) => s.loadFavorites)
    const setFavorites = usePlaybackStore((s) => s.setFavorites)
    const setSignedIn = usePlaybackStore((s) => s.setSignedIn)

    // Use refs to avoid unnecessary re-triggers of effects if functions change
    const refreshRef = useRef(refreshLibraries)
    const loadFavsRef = useRef(loadFavorites)

    useEffect(() => {
        refreshRef.current = refreshLibraries
        loadFavsRef.current = loadFavorites
    }, [refreshLibraries, loadFavorites])

    useEffect(() => {
        if (!isLoaded) return

        setSignedIn(!!isSignedIn)
        if (!isSignedIn) {
            resetLibraries()
            setFavorites(new Set())
            return
        }

        refreshRef.current()
        loadFavsRef.current()
    }, [isSignedIn, isLoaded, user?.id, resetLibraries, setFavorites, setSignedIn])

    return null
}
