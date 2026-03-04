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

import { useState, useEffect } from 'react'
import { posthog } from './posthog'

/**
 * Hook to safely access feature flags client-side.
 * Returns undefined while loading to prevent hydration mismatches and flickering.
 */
export function useFeatureFlag(flagKey: string): boolean | undefined {
    const [enabled, setEnabled] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return

        const checkFlag = () => {
            const isFeatureEnabled = posthog.isFeatureEnabled(flagKey)
            setEnabled(!!isFeatureEnabled)
        }

        // Check immediately if flags are already loaded
        if (posthog.areFeatureFlagsLoaded()) {
            checkFlag()
        }

        // Subscribe to changes
        posthog.onFeatureFlags(() => {
            checkFlag()
        })
    }, [flagKey])

    return enabled
}
