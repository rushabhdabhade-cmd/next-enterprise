"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Pause, Music2 } from "lucide-react"
import LeftSidebar from "@/components/LeftSidebar"
import Queue from "@/components/Queue"
import ThemeToggle from "@/components/ThemeToggle"
import { usePlayback } from "@/context/PlaybackContext"
import { trackTrackSelected } from "@/lib/analytics"
import { ITunesTrack } from "@/types/itunes"

const GENRES = [
  {
    name: "Pop",
    emoji: "🎵",
    bg: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/30",
    searchTerm: "pop hits",
  },
  {
    name: "Hip-Hop",
    emoji: "🎤",
    bg: "from-purple-500 to-violet-600",
    shadow: "shadow-purple-500/30",
    searchTerm: "hip hop rap",
  },
  {
    name: "Rock",
    emoji: "🎸",
    bg: "from-red-500 to-orange-500",
    shadow: "shadow-red-500/30",
    searchTerm: "rock",
  },
  {
    name: "Alternative",
    emoji: "🌀",
    bg: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/30",
    searchTerm: "alternative indie",
  },
  {
    name: "Country",
    emoji: "🤠",
    bg: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/30",
    searchTerm: "country music",
  },
  {
    name: "Electronic",
    emoji: "🎛️",
    bg: "from-cyan-400 to-teal-600",
    shadow: "shadow-cyan-500/30",
    searchTerm: "electronic dance",
  },
  {
    name: "R&B / Soul",
    emoji: "🎶",
    bg: "from-indigo-500 to-purple-600",
    shadow: "shadow-indigo-500/30",
    searchTerm: "r&b soul",
  },
  {
    name: "Jazz",
    emoji: "🎺",
    bg: "from-emerald-400 to-green-600",
    shadow: "shadow-emerald-500/30",
    searchTerm: "jazz",
  },
  {
    name: "Classical",
    emoji: "🎻",
    bg: "from-stone-400 to-stone-600",
    shadow: "shadow-stone-500/25",
    searchTerm: "classical orchestra",
  },
  {
    name: "Latin",
    emoji: "💃",
    bg: "from-orange-400 to-red-600",
    shadow: "shadow-orange-500/30",
    searchTerm: "latin reggaeton",
  },
  {
    name: "K-Pop",
    emoji: "⭐",
    bg: "from-fuchsia-400 to-pink-600",
    shadow: "shadow-fuchsia-500/30",
    searchTerm: "kpop korean",
  },
  {
    name: "Reggae",
    emoji: "🌴",
    bg: "from-green-400 to-teal-600",
    shadow: "shadow-green-500/30",
    searchTerm: "reggae",
  },
]

type Genre = (typeof GENRES)[0]

function GenreCard({ genre, onClick }: { genre: Genre; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative group bg-gradient-to-br ${genre.bg} rounded-[28px] p-6 text-left overflow-hidden shadow-lg ${genre.shadow} hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300`}
    >
      {/* Ghost emoji in background */}
      <div className="absolute -bottom-3 -right-3 text-[80px] leading-none opacity-[0.18] select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:opacity-25">
        {genre.emoji}
      </div>
      <span className="text-3xl mb-4 block">{genre.emoji}</span>
      <h3 className="text-white font-bold text-lg tracking-tight leading-tight">{genre.name}</h3>
      <p className="text-white/60 text-xs font-medium mt-1">Top tracks →</p>
    </button>
  )
}

function TrackCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800" />
      <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
    </div>
  )
}

export default function GenresPage() {
  const router = useRouter()
  const { playTrack, togglePlay, currentTrack, isPlaying } = usePlayback()
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [tracks, setTracks] = useState<ITunesTrack[]>([])
  const [loading, setLoading] = useState(false)

  const handleGenreSelect = useCallback(async (genre: Genre) => {
    setSelectedGenre(genre)
    setLoading(true)
    setTracks([])
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(genre.searchTerm)}&entity=song&limit=50`
      )
      const data = await res.json()
      setTracks(data.results ?? [])
    } catch {
      setTracks([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBack = () => {
    setSelectedGenre(null)
    setTracks([])
  }

  const handlePlay = (e: React.MouseEvent, track: ITunesTrack) => {
    e.stopPropagation()
    trackTrackSelected({
      id: String(track.trackId),
      artist: track.artistName,
      genre: track.primaryGenreName,
    })
    if (currentTrack?.trackId === track.trackId) {
      togglePlay()
    } else {
      playTrack(track, tracks)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
      <LeftSidebar />

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto px-8 py-12 pb-32">

          {/* Header */}
          <header className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                Browse <span className="font-bold">Genres</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                Explore music by mood and style
              </p>
            </div>
            <ThemeToggle />
          </header>

          {/* ── Genre Grid ── */}
          {!selectedGenre && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
              {GENRES.map((genre) => (
                <GenreCard
                  key={genre.name}
                  genre={genre}
                  onClick={() => handleGenreSelect(genre)}
                />
              ))}
            </div>
          )}

          {/* ── Selected Genre: Track Browser ── */}
          {selectedGenre && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Genre Header Row */}
              <div className="flex items-center gap-4 mb-10">
                <button
                  onClick={handleBack}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all"
                >
                  <ArrowLeft size={18} />
                </button>
                <div
                  className={`flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r ${selectedGenre.bg} rounded-[20px] shadow-lg ${selectedGenre.shadow}`}
                >
                  <span className="text-2xl leading-none">{selectedGenre.emoji}</span>
                  <h2 className="text-white font-bold text-xl tracking-tight">{selectedGenre.name}</h2>
                </div>
                {!loading && tracks.length > 0 && (
                  <span className="text-sm font-medium text-gray-400">
                    {tracks.length} tracks
                  </span>
                )}
              </div>

              {/* Loading Skeleton */}
              {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {[...Array(10)].map((_, i) => <TrackCardSkeleton key={i} />)}
                </div>
              )}

              {/* Empty State */}
              {!loading && tracks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
                    <Music2 size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No tracks found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Try a different genre
                  </p>
                </div>
              )}

              {/* Track Grid */}
              {!loading && tracks.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {tracks.map((track, idx) => {
                    const isCurrent = currentTrack?.trackId === track.trackId
                    const isPlayingThis = isCurrent && isPlaying

                    return (
                      <div
                        key={track.trackId}
                        onClick={() => router.push(`/track/${track.trackId}`)}
                        style={{ animationDelay: `${idx * 25}ms` }}
                        className={`group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-xl hover:-translate-y-0.5 ${
                          isCurrent
                            ? "border-pink-500/40 shadow-lg shadow-pink-500/10"
                            : "border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        {/* Artwork */}
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={track.artworkUrl100.replace("100x100", "400x400")}
                            alt={track.trackName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />

                          {/* Play overlay */}
                          <div
                            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                              isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <button
                              onClick={(e) => handlePlay(e, track)}
                              className="w-12 h-12 flex items-center justify-center bg-white text-gray-950 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300 hover:scale-110 active:scale-90"
                            >
                              {isPlayingThis
                                ? <Pause size={18} fill="currentColor" />
                                : <Play size={18} fill="currentColor" className="ml-0.5" />
                              }
                            </button>
                          </div>

                          {/* Active playing badge */}
                          {isPlayingThis && (
                            <div className="absolute top-2 left-2 flex items-end gap-[2px] h-4 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                              {[0, 0.15, 0.08].map((delay, i) => (
                                <span
                                  key={i}
                                  className="w-0.5 bg-pink-400 rounded-full animate-bounce"
                                  style={{ height: "8px", animationDelay: `${delay}s`, animationDuration: "0.6s" }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          <h4
                            className={`font-bold text-xs tracking-tight truncate ${
                              isCurrent ? "text-pink-500" : "text-gray-950 dark:text-white"
                            }`}
                          >
                            {track.trackName}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                            {track.artistName}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Queue />
    </div>
  )
}
