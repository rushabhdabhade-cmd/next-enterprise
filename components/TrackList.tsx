"use client"

import { ITunesTrack } from "@/types/itunes"
import { formatDuration } from "@/services/itunesService"

interface TrackListProps {
  tracks: ITunesTrack[]
  loading?: boolean
}

export default function TrackList({ tracks, loading }: TrackListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No tracks found. Try searching for a song or artist.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.trackId}
          className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
        >
          {/* Album Art */}
          <img
            src={track.artworkUrl60}
            alt={track.trackName}
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {track.trackName}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {track.artistName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {track.collectionName}
            </p>
          </div>

          {/* Duration */}
          <div className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
            {formatDuration(track.trackTimeMillis)}
          </div>

          {/* Preview Button */}
          {track.previewUrl && (
            <audio
              controls
              className="w-32 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <source src={track.previewUrl} type="audio/mp4" />
            </audio>
          )}
        </div>
      ))}
    </div>
  )
}
