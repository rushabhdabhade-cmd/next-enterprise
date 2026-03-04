# PostHog Analytics Integration Guide

This document outlines the current PostHog analytics integration in the `next-enterprise` project.

## Current Integrated Events

| Event Name | Description | Properties | Triggered In |
|------------|-------------|------------|--------------|
| `search_performed` | When a user searches for music | `query`, `results_count` | `components/SearchBar.tsx` |
| `search_cleared` | When a user clears the search input | None | `components/SearchBar.tsx` |
| `track_selected` | When a user clicks on a track to view details | `track_id`, `artist`, `genre` | `components/TrackList.tsx` |
| `track_played` | When a song actually starts playing | `track_id`, `artist`, `track_title` | `context/PlaybackContext.tsx` |
| `track_paused` | When a user pauses playback | `track_id`, `current_time` | `context/PlaybackContext.tsx` |
| `track_favorited` | When a user hearts/unhearts a track | `track_id`, `action` | `components/TrackList.tsx` |
| `theme_switched` | When a user toggles between Dark/Light mode | `theme` | `components/ThemeToggle.tsx` |
| `layout_exposed` | Track which AB test variant the user sees | `variant`, `experiment` | `app/page.tsx` |
| `ui_interaction` | General UI engagement (shuffle, repeat, expand) | `element_id`, `action` | `components/NowPlayingBar.tsx` |
| `page_view` | Automatic page view tracking for all routes | `$current_url` | `components/PostHogPageView.tsx` |

## Planned Analytics (To Be Implemented)

To get even more granular data, we can add:
- `track_finished`: Fired when a song reaches the end.
- `playback_error`: Fired when an audio stream fails to load.
- `track_shared`: Fired when a user uses the share functionality.
- `playlist_added`: Fired when a user adds a track to a playlist.

## How to use Analytics Abstraction

Always use the functions defined in `lib/analytics.ts` instead of calling `posthog.capture` directly in components. This ensures:
1. Typed event properties.
2. Centeralized logic for property naming.
3. Ability to switch analytics providers easily in the future.

Example:
```typescript
import { trackTrackSelected } from "@/lib/analytics";

// ...
trackTrackSelected({ id: '123', artist: 'Artist Name', genre: 'Rock' });
```
