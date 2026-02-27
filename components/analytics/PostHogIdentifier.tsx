"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import posthog from "posthog-js"

/**
 * Syncs Clerk user session with PostHog identity.
 * This links anonymous events to the logged-in user.
 */
export default function PostHogIdentifier() {
    const { user, isLoaded } = useUser()

    useEffect(() => {
        if (isLoaded && user) {
            // Identify user in PostHog
            posthog.identify(user.id, {
                email: user.primaryEmailAddress?.emailAddress,
                username: user.username,
                full_name: user.fullName,
            })
        } else if (isLoaded && !user) {
            // Optional: reset identity on sign out
            posthog.reset()
        }
    }, [user, isLoaded])

    return null
}
