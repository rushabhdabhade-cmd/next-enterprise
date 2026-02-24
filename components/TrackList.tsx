import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ITunesTrack } from "@/types/itunes"
import { formatDuration } from "@/services/itunesService"
import { usePlayback } from "@/context/PlaybackContext"

interface TrackListProps {
  tracks: ITunesTrack[]
  loading?: boolean
}

export default function TrackList({ tracks, loading }: TrackListProps) {
  const router = useRouter()
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback()
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  const handlePlayClick = (e: React.MouseEvent, track: ITunesTrack) => {
    e.stopPropagation()
    if (currentTrack?.trackId === track.trackId) {
      togglePlay()
    } else {
      playTrack(track, tracks)
    }
  }

  const handleDetailsClick = (trackId: number) => {
    router.push(`/track/${trackId}`)
  }

  const toggleFavorite = (e: React.MouseEvent, trackId: number) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-purple-100/50 dark:border-gray-700/50 animate-pulse"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tracks.map((track) => {
        const isCurrent = currentTrack?.trackId === track.trackId
        const isPlayingThis = isCurrent && isPlaying

        return (
          <div
            key={track.trackId}
            onClick={() => handleDetailsClick(track.trackId)}
            className={`group relative backdrop-blur-sm p-3 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer ${isCurrent
              ? "bg-white/80 dark:bg-gray-700/80 border-pink-500/50 shadow-lg shadow-pink-500/10"
              : "bg-white/60 dark:bg-gray-800/60 border-purple-100/30 dark:border-gray-700/30 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:shadow-purple-200/20 dark:hover:shadow-none"
              }`}
          >
            {/* Album Art with Play Controller */}
            <div className="relative w-16 h-16 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src={track.artworkUrl100}
                alt={track.trackName}
                className="w-full h-full rounded-xl object-cover shadow-md"
              />
              {track.previewUrl && (
                <div
                  onClick={(e) => handlePlayClick(e, track)}
                  className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity rounded-xl ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-pink-600 text-white rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
                    {isPlayingThis ? '⏸' : '▶'}
                  </div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold truncate text-sm ${isCurrent ? "text-pink-600 dark:text-pink-400" : "text-gray-900 dark:text-white"}`}>
                {track.trackName}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                {track.artistName}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${isCurrent ? "bg-pink-50 dark:bg-pink-900/30 text-pink-600" : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"}`}>
                  {formatDuration(track.trackTimeMillis)}
                </span>
                <span className="text-[10px] text-gray-400 truncate max-w-[80px]">
                  {track.collectionName}
                </span>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => toggleFavorite(e, track.trackId)}
                className={`transition-colors ${favorites.has(track.trackId) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
              >
                ❤️
              </button>
              <button className="text-gray-400 hover:text-purple-500 transition-colors text-xs">
                ➕
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
