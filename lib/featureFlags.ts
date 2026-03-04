/**
 * 🧪 Experiment Plan: New Catalog Layout
 * 
 * Hypothesis: 
 * Larger artwork and a more modern grid structure in the catalog increases 
 * the click-through rate (track_selected) from the search page.
 * 
 * Primary Metric: 
 * Conversion rate: track_selected / search_performed
 * 
 * Rollout: 
 * 50% of users will see the "new-catalog-layout" variant.
 */

import { useEffect, useState } from 'react'
import { posthog } from './posthog'

/**
 * Hook to safely access feature flags client-side.
 * Returns undefined while loading to prevent hydration mismatches and flickering.
 *
 * Registered flags:
 *  - "new-catalog-layout"  A/B test: enlarged grid cards vs compact grid (50/50 split)
 *  - "ai-summaries"        Show AI-generated insight panel on track detail page
 */
// How long to wait for PostHog to resolve flags before falling back to disabled.
// Prevents a permanent loading skeleton when PostHog is slow or not configured.
const FLAG_TIMEOUT_MS = 3000

export function useFeatureFlag(flagKey: string): boolean | undefined {
    const [enabled, setEnabled] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        if (typeof window === 'undefined') return

        let resolved = false

        const checkFlag = () => {
            const value = posthog.isFeatureEnabled(flagKey)
            // isFeatureEnabled returns undefined when flags haven't loaded yet
            if (value !== undefined) {
                resolved = true
                setEnabled(!!value)
            }
        }

        // Check immediately if PostHog has already resolved flags
        // areFeatureFlagsLoaded exists at runtime but is not in the published types
        if ((posthog as Record<string, unknown> & typeof posthog).areFeatureFlagsLoaded?.()) {
            checkFlag()
        }

        // Also subscribe so we update the moment flags arrive
        const unsubscribe = posthog.onFeatureFlags(checkFlag)

        // Safety net: if flags never resolve (PostHog not configured, network error, etc.)
        // fall back to disabled so the UI is never stuck in a permanent loading state.
        const timeout = setTimeout(() => {
            if (!resolved) setEnabled(false)
        }, FLAG_TIMEOUT_MS)

        return () => {
            clearTimeout(timeout)
            if (typeof unsubscribe === 'function') unsubscribe()
        }
    }, [flagKey])

    return enabled
}
