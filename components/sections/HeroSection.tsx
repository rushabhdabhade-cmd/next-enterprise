"use client"

import { Play, Pause, Heart } from "lucide-react"
import { usePlayback } from "@/context/PlaybackContext"
import { ITunesTrack } from "@/types/itunes"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  track?: ITunesTrack
  queue?: ITunesTrack[]
}

export default function HeroSection({
  title = "Discover New Melodies",
  subtitle = "Search and stream your favorite tracks instantly.",
  track,
  queue,
}: HeroSectionProps) {
  const { playTrack, togglePlay, currentTrack, isPlaying, favorites, toggleFavorite } = usePlayback()

  const isCurrent     = !!track && currentTrack?.trackId === track.trackId
  const isPlayingThis = isCurrent && isPlaying
  const isFavorited   = !!track && favorites.has(track.trackId)
  const artworkUrl    = track?.artworkUrl100?.replace("100x100", "600x600")

  const handlePlay = () => {
    if (!track) return
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue ?? [track])
    }
  }

  return (
    <div className="relative h-56 md:h-80 bg-gray-950 overflow-hidden group">
      <div className="relative h-full flex">

        {/* Left — Text content */}
        <div className="relative z-10 flex flex-col justify-center px-5 md:px-10 w-full md:w-[55%]">
          <p className="text-pink-400 text-[10px] md:text-xs font-semibold tracking-wide mb-2 md:mb-4">
            Trending New Hits
          </p>

          <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight line-clamp-2">
            {track?.trackName || title}
          </h1>

          <p className="text-gray-400 text-sm md:text-lg mt-1 mb-4 md:mb-6 truncate">
            <span className="text-white font-medium">{track?.artistName}</span>
            {track?.artistName && (
              <span className="ml-2 text-gray-500">
                {track?.primaryGenreName ?? "Music"}
              </span>
            )}
            {!track?.artistName && subtitle}
          </p>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={handlePlay}
              disabled={!track}
              className="px-4 py-2 md:px-6 md:py-2.5 bg-pink-500 hover:bg-pink-400 text-white text-xs md:text-sm font-semibold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-pink-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPlayingThis
                ? <Pause fill="currentColor" size={16} />
                : <Play  fill="currentColor" size={16} />
              }
              {isPlayingThis ? "Pause" : "Listen Now"}
            </button>

            <button
              onClick={() => track && toggleFavorite(track)}
              disabled={!track}
              className="w-9 h-9 md:w-10 md:h-10 bg-pink-500 hover:bg-pink-400 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Heart
                size={16}
                fill={isFavorited ? "currentColor" : "none"}
                className={isFavorited ? "text-white" : "text-white"}
              />
            </button>
          </div>
        </div>

        {/* Right — Artwork */}
        <div className="hidden md:block absolute right-0 top-0 w-[50%] h-full">
          {artworkUrl && (
            <img
              src={artworkUrl}
              alt={track?.trackName ?? "Featured track"}
              className="w-full h-full object-cover"
            />
          )}
          {/* Gradient overlay fading artwork into the dark left side */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent" />
        </div>
      </div>
    </div>
  )
}
