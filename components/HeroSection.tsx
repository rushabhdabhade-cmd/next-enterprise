"use client"

import { Play, Pause, Heart, Star } from "lucide-react"
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
    <div className="relative h-80 bg-gray-950 overflow-hidden group">

      {/* Blurred artwork background */}
      {artworkUrl && (
        <img
          src={artworkUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-30 transition-opacity duration-1000"
        />
      )}

      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#db2777_0%,transparent_50%)] opacity-30" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#4f46e5_0%,transparent_50%)] opacity-30" />
      </div>

      {/* Decorative star */}
      <div className="absolute top-8 right-12 opacity-20 animate-pulse">
        <Star size={40} className="text-white" />
      </div>

      {/* Artwork thumbnail — top right when track is loaded */}
      {artworkUrl && (
        <div className="absolute top-6 right-6 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/10">
          <img src={artworkUrl} alt={track?.trackName} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent">
        <div className="max-w-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] uppercase tracking-widest font-bold text-pink-400 mb-6 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Spotlight
          </div>

          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4 leading-tight">
            {title}
          </h1>

          <p className="text-gray-400 text-lg font-light mb-8 max-w-lg leading-relaxed">
            {subtitle}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePlay}
              disabled={!track}
              className="px-10 py-4 bg-white text-gray-950 font-bold rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPlayingThis
                ? <Pause fill="currentColor" size={18} />
                : <Play  fill="currentColor" size={18} />
              }
              {isPlayingThis ? "Pause" : "Experience Now"}
            </button>

            <button
              onClick={() => track && toggleFavorite(track)}
              disabled={!track}
              className="w-14 h-14 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Heart
                size={20}
                fill={isFavorited ? "currentColor" : "none"}
                className={isFavorited ? "text-pink-500" : "text-white"}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
