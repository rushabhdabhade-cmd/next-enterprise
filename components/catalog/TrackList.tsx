"use client"

import { Heart, Pause, Play, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import { usePlayback } from "@/context/PlaybackContext"
import { trackTrackSelected } from "@/lib/analytics"
import { formatDuration } from "@/services/itunesService"
import { ITunesTrack } from "@/types/itunes"

interface TrackListProps {
  tracks: ITunesTrack[]
  loading?: boolean
}

export default function TrackList({ tracks, loading }: TrackListProps) {
  const router = useRouter()
  const { currentTrack, isPlaying, playTrack, togglePlay, favorites, toggleFavorite } = usePlayback()
  const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)

  const handlePlayClick = (e: React.MouseEvent, track: ITunesTrack) => {
    e.stopPropagation()

    trackTrackSelected({
      id: String(track.trackId),
      artist: track.artistName,
      genre: track.primaryGenreName
    })

    if (currentTrack?.trackId === track.trackId) {
      togglePlay()
    } else {
      playTrack(track, tracks)
    }
  }

  const handleDetailsClick = (track: ITunesTrack) => {
    trackTrackSelected({
      id: String(track.trackId),
      artist: track.artistName,
      genre: track.primaryGenreName
    })
    router.push(`/track/${track.trackId}`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="h-[100px] bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tracks.map((track, index) => {
        const isCurrent = currentTrack?.trackId === track.trackId
        const isPlayingThis = isCurrent && isPlaying

        return (
          <div
            key={track.trackId}
            onClick={() => handleDetailsClick(track)}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`group relative p-4 rounded-3xl border transition-all duration-500 flex items-center gap-5 cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${isCurrent
              ? "bg-gray-50 dark:bg-gray-900 border-pink-500/30 shadow-2xl shadow-pink-500/5 scale-[1.02]"
              : "bg-white dark:bg-transparent border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-800 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5"
              }`}
          >


            {/* Artwork */}
            <div className="relative w-16 h-16 flex-shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-xl shadow-black/10">
              <img
                src={track.artworkUrl100}
                alt={track.trackName}
                className="w-full h-full rounded-2xl object-cover"
              />
              <div
                onClick={(e) => handlePlayClick(e, track)}
                className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity rounded-2xl backdrop-blur-[2px] ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white text-gray-950 rounded-full shadow-2xl transition-transform active:scale-90">
                  {isPlayingThis ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold truncate text-sm tracking-tight mb-1 ${isCurrent ? "text-pink-500" : "text-gray-950 dark:text-white"}`}>
                {track.trackName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                {track.artistName}
              </p>

              {/* Meta Tags */}
              <div className="flex items-center gap-2 mt-3">
                <div className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                  {formatDuration(track.trackTimeMillis)}
                </div>
                {index % 4 === 0 && (
                  <div className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[9px] font-bold uppercase tracking-tighter animate-pulse">
                    Hot
                  </div>
                )}
              </div>
            </div>

            {/* Hover Actions */}
            <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(track) }}
                className={`transition-all hover:scale-110 ${favorites.has(track.trackId) ? 'text-pink-500' : 'text-gray-300 dark:text-gray-600 hover:text-pink-500'}`}
              >
                <Heart size={18} fill={favorites.has(track.trackId) ? "currentColor" : "none"} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLibraryTrack(track) }}
                className="text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )
      })}

      {libraryTrack && (
        <AddToLibraryModal
          track={libraryTrack}
          open={!!libraryTrack}
          onOpenChange={(open) => { if (!open) setLibraryTrack(null) }}
        />
      )}
    </div>
  )
}
