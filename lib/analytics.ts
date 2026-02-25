import { posthog } from './posthog'

/**
 * Analytics abstraction layer to keep tracking logic out of UI components.
 */

export const trackSearch = (query: string, resultsCount: number) => {
    posthog.capture('search_performed', {
        query,
        results_count: resultsCount,
    })
}

export const trackTrackSelected = (track: { id: string; artist: string; genre: string }) => {
    posthog.capture('track_selected', {
        track_id: track.id,
        artist: track.artist,
        genre: track.genre,
    })
}

export const trackThemeSwitch = (theme: "light" | "dark") => {
    posthog.capture('theme_switched', {
        theme,
    })
}

export const trackLayoutExposure = (variant: "old" | "new") => {
    posthog.capture('layout_exposed', {
        variant,
        experiment: 'new-catalog-layout'
    })
}

export const trackTrackPlayed = (track: { id: string; artist: string; title: string }) => {
    posthog.capture('track_played', {
        track_id: track.id,
        artist: track.artist,
        track_title: track.title,
    })
}

export const trackTrackPaused = (trackId: string, currentTime: number) => {
    posthog.capture('track_paused', {
        track_id: trackId,
        current_time: currentTime,
    })
}

export const trackTrackFavorited = (trackId: string, isFavorited: boolean) => {
    posthog.capture('track_favorited', {
        track_id: trackId,
        action: isFavorited ? 'added' : 'removed'
    })
}

export const trackSearchCleared = () => {
    posthog.capture('search_cleared')
}

export const trackInteraction = (elementId: string, action: string) => {
    posthog.capture('ui_interaction', {
        element_id: elementId,
        action: action
    })
}
