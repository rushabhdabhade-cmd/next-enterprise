"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useRef } from "react"

export default function UserSync() {
    const { user, isLoaded } = useUser()
    const hasSynced = useRef(false)

    useEffect(() => {
        if (!isLoaded || !user || hasSynced.current) return

        hasSynced.current = true

        fetch("/api/auth/sync-user", { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    console.error("[UserSync] Failed:", data.error)
                } else {
                    console.log("[UserSync] Synced:", data.user?.id)
                }
            })
            .catch((err) => console.error("[UserSync] Error:", err))
    }, [isLoaded, user])

    return null
}
