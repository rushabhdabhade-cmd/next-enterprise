import { ITunesTrack } from "@/types/itunes"

/**
 * Lightweight client-side cache for track navigation.
 * Stores the track object when a card is clicked so loading.tsx
 * can render instantly instead of waiting for the server fetch.
 */
let cachedTrack: ITunesTrack | null = null

export function setCachedTrack(track: ITunesTrack) {
  cachedTrack = track
}

export function getCachedTrack(id: number): ITunesTrack | null {
  if (cachedTrack && cachedTrack.trackId === id) {
    return cachedTrack
  }
  return null
}

export function clearCachedTrack() {
  cachedTrack = null
}
