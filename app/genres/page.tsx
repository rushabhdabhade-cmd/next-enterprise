"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Play, Pause, Music2, Heart, Plus, Search,
  Music, Mic, Guitar, Waves, TreePine, Radio,
  Sparkles, Music3, Crown, Flame, Star, Sun,
  type LucideIcon,
} from "lucide-react"
import LeftSidebar from "@/components/layout/LeftSidebar"
import Queue from "@/components/playback/Queue"
import ThemeToggle from "@/components/ui/ThemeToggle"
import AddToLibraryModal from "@/components/AddToLibraryModal"
import { usePlayback } from "@/context/PlaybackContext"
import { trackTrackSelected } from "@/lib/analytics"
import { formatDuration } from "@/services/itunesService"
import { ITunesTrack } from "@/types/itunes"

const GENRES: { name: string; icon: LucideIcon; searchTerm: string }[] = [
  { name: "Pop", icon: Music, searchTerm: "pop hits" },
  { name: "Hip-Hop", icon: Mic, searchTerm: "hip hop rap" },
  { name: "Rock", icon: Guitar, searchTerm: "rock" },
  { name: "Alternative", icon: Waves, searchTerm: "alternative indie" },
  { name: "Country", icon: TreePine, searchTerm: "country music" },
  { name: "Electronic", icon: Radio, searchTerm: "electronic dance" },
  { name: "R&B / Soul", icon: Sparkles, searchTerm: "r&b soul" },
  { name: "Jazz", icon: Music3, searchTerm: "jazz" },
  { name: "Classical", icon: Crown, searchTerm: "classical orchestra" },
  { name: "Latin", icon: Flame, searchTerm: "latin reggaeton" },
  { name: "K-Pop", icon: Star, searchTerm: "kpop korean" },
  { name: "Reggae", icon: Sun, searchTerm: "reggae" },
]

type Genre = (typeof GENRES)[0]

function GenreCard({ genre, onClick }: { genre: Genre; onClick: () => void }) {
  const Icon = genre.icon
  return (
    <button
      onClick={onClick}
      className="group relative bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-left overflow-hidden transition-all duration-300 hover:border-pink-500/30 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-0.5 active:scale-[0.97]"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-pink-500/10 transition-colors">
        <Icon size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-pink-500 transition-colors" />
      </div>
      <h3 className="text-gray-950 dark:text-white font-bold text-base tracking-tight leading-tight">
        {genre.name}
      </h3>
      <p className="text-gray-400 dark:text-gray-500 text-xs font-medium mt-1 group-hover:text-pink-500 transition-colors">
        Explore →
      </p>
    </button>
  )
}

function TrackCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
      </div>
    </div>
  )
}

export default function GenresPage() {
  const router = useRouter()
  const { playTrack, togglePlay, currentTrack, isPlaying, favorites, toggleFavorite } = usePlayback()
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [tracks, setTracks] = useState<ITunesTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [libraryTrack, setLibraryTrack] = useState<ITunesTrack | null>(null)
  const [customQuery, setCustomQuery] = useState("")

  const searchTracks = useCallback(async (term: string) => {
    setLoading(true)
    setTracks([])
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50`
      )
      const data = await res.json() as { results?: ITunesTrack[] }
      setTracks(data.results ?? [])
    } catch {
      setTracks([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleGenreSelect = useCallback(async (genre: Genre) => {
    setSelectedGenre(genre)
    setCustomQuery("")
    searchTracks(genre.searchTerm)
  }, [searchTracks])

  const handleCustomSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customQuery.trim()
    if (!trimmed) return
    setSelectedGenre(null)
    searchTracks(trimmed)
  }, [customQuery, searchTracks])

  const handleBack = () => {
    setSelectedGenre(null)
    setCustomQuery("")
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
        <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

          {/* Header */}
          <header className="flex items-center justify-between mb-10 lg:mb-14">
            <div>
              <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
                Browse <span className="font-bold">Genres</span>
              </h2>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium mt-1 lg:mt-2">
                Explore music by mood and style
              </p>
            </div>
            <ThemeToggle />
          </header>

          {/* Search bar */}
          {!selectedGenre && tracks.length === 0 && !loading && (
            <form onSubmit={handleCustomSearch} className="mb-8">
              <div className="relative max-w-md">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  {/* <Search size={16} className="text-gray-400" /> */}
                </div>
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Search any genre or mood..."
                  className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/20 transition-all"
                />
              </div>
            </form>
          )}

          {/* ── Genre Grid ── */}
          {!selectedGenre && tracks.length === 0 && !loading && (
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

          {/* ── Track Browser (preset genre or custom search) ── */}
          {(selectedGenre || tracks.length > 0 || loading) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Header Row */}
              <div className="flex items-center gap-4 mb-10">
                <button
                  onClick={handleBack}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  {selectedGenre
                    ? (() => { const Icon = selectedGenre.icon; return <Icon size={20} className="text-pink-500" /> })()
                    : <Search size={20} className="text-pink-500" />
                  }
                  <h2 className="text-gray-950 dark:text-white font-bold text-xl tracking-tight">
                    {selectedGenre ? selectedGenre.name : customQuery}
                  </h2>
                </div>
                {!loading && tracks.length > 0 && (
                  <span className="text-sm font-medium text-gray-400">
                    {tracks.length} tracks
                  </span>
                )}
              </div>

              {/* Loading Skeleton */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(12)].map((_, i) => <TrackCardSkeleton key={i} />)}
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

              {/* Track Grid — Horizontal compact cards */}
              {!loading && tracks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tracks.map((track, idx) => {
                    const isCurrent = currentTrack?.trackId === track.trackId
                    const isPlayingThis = isCurrent && isPlaying

                    return (
                      <div
                        key={track.trackId}
                        onClick={() => router.push(`/track/${track.trackId}`)}
                        style={{ animationDelay: `${idx * 25}ms` }}
                        className={`group relative flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                          isCurrent
                            ? "bg-gray-50 dark:bg-gray-800/80 border-pink-500/30 shadow-lg shadow-pink-500/5"
                            : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700"
                        }`}
                      >
                        {/* Artwork with play overlay */}
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                          <img
                            src={track.artworkUrl100}
                            alt={track.trackName}
                            className="w-full h-full object-cover"
                          />
                          <div
                            onClick={(e) => handlePlay(e, track)}
                            className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl transition-opacity ${
                              isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-white text-gray-950 rounded-full shadow-lg transition-transform active:scale-90">
                              {isPlayingThis
                                ? <Pause size={14} fill="currentColor" />
                                : <Play size={14} fill="currentColor" className="ml-0.5" />
                              }
                            </div>
                          </div>
                        </div>

                        {/* Track info + badges */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm truncate ${isCurrent ? "text-pink-500" : "text-gray-950 dark:text-white"}`}>
                            {track.trackName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                            {track.artistName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                              {formatDuration(track.trackTimeMillis)}
                            </span>
                            {track.primaryGenreName && (
                              <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight truncate max-w-[80px]">
                                {track.primaryGenreName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions — heart & plus */}
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(track) }}
                            className={`transition-all hover:scale-110 ${
                              favorites.has(track.trackId)
                                ? "text-pink-500"
                                : "text-gray-300 dark:text-gray-600 hover:text-pink-500"
                            }`}
                          >
                            <Heart size={16} fill={favorites.has(track.trackId) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setLibraryTrack(track) }}
                            className="text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110"
                          >
                            <Plus size={16} />
                          </button>
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
