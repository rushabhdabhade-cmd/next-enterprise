"use client"

import { useUser } from "@clerk/nextjs"
import {
  AlertCircle,
  FolderOpen,
  HardDrive,
  Music,
  Play,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { formatDuration } from "@/services/itunesService"
import { usePlaybackStore } from "@/store/usePlaybackStore"
import { ITunesTrack } from "@/types/itunes"

// ─── Constants ───────────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-indigo-500 to-blue-600",
  "from-red-400 to-pink-600",
  "from-green-400 to-emerald-600",
]

const MIME_TO_LABEL: Record<string, string> = {
  "audio/mpeg": "MP3",
  "audio/flac": "FLAC",
  "audio/wav": "WAV",
  "audio/x-wav": "WAV",
  "audio/aac": "AAC",
  "audio/ogg": "OGG",
  "audio/webm": "WEBM",
  "audio/mp4": "M4A",
  "audio/x-m4a": "M4A",
}

const ACCEPTED = ".mp3,.flac,.wav,.aac,.ogg,.m4a,.webm,audio/*"

// ─── Helpers ─────────────────────────────────────────────────────────────────

let idCounter = Date.now()

function nameGradient(name: string): string {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]!
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function loadDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const a = new Audio(url)
    a.addEventListener("loadedmetadata", () => { resolve(a.duration); a.src = "" }, { once: true })
    a.addEventListener("error", () => { resolve(0); a.src = "" }, { once: true })
  })
}

function buildTrack(file: File, blobUrl: string, id: number): ITunesTrack {
  return {
    trackId: id,
    trackName: file.name.replace(/\.[^.]+$/, ""),
    artistName: "Local File",
    collectionName: "Local Library",
    trackCensoredName: file.name,
    artworkUrl30: "",
    artworkUrl60: "",
    artworkUrl100: "",
    previewUrl: blobUrl,
    trackTimeMillis: 0,
    primaryGenreName: "Local",
    wrapperType: "track",
    kind: "song",
    artistId: 0,
    collectionId: 0,
    trackPrice: 0,
    collectionPrice: 0,
    releaseDate: new Date(file.lastModified).toISOString(),
    country: "",
    currency: "",
    isStreamable: true,
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalFile {
  id: number
  displayName: string
  filename: string
  blobUrl: string
  sizeBytes: number
  mimeType: string
  duration: number   // seconds, 0 until loaded
  track: ITunesTrack
}

// ─── Empty drop zone ──────────────────────────────────────────────────────────

function DropZone({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div
      onClick={onBrowse}
      className="group mt-4 flex flex-col items-center justify-center gap-4 md:gap-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl md:rounded-[40px] py-16 md:py-28 px-4 cursor-pointer hover:border-pink-300 dark:hover:border-pink-800 hover:bg-pink-50/40 dark:hover:bg-pink-950/10 transition-all duration-300"
    >
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center group-hover:bg-pink-100 dark:group-hover:bg-pink-900/20 transition-colors duration-300">
        <HardDrive size={40} className="text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Drop your music here
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-5">
          or click to browse your device
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {["MP3", "FLAC", "WAV", "AAC", "OGG", "M4A"].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-900 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      <button className="px-8 py-3 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
        <FolderOpen size={16} />
        Browse Files
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocalFilesPage() {
  const { isSignedIn } = useUser()
  const { playTrack, togglePlay, currentTrack, isPlaying } = usePlaybackStore()
  const [files, setFiles] = useState<LocalFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [rejected, setRejected] = useState(false)   // non-audio files were dropped
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File ingestion ───────────────────────────────────────────────────────

  const addFiles = useCallback(async (rawFiles: File[]) => {
    const audio = rawFiles.filter((f) => f.type.startsWith("audio/"))
    const nonAudio = rawFiles.filter((f) => !f.type.startsWith("audio/"))

    if (nonAudio.length > 0) {
      setRejected(true)
      setTimeout(() => setRejected(false), 3000)
    }
    if (audio.length === 0) return

    const incoming: LocalFile[] = audio.map((file) => {
      const id = idCounter++
      const blobUrl = URL.createObjectURL(file)
      return {
        id,
        displayName: file.name.replace(/\.[^.]+$/, ""),
        filename: file.name,
        blobUrl,
        sizeBytes: file.size,
        mimeType: file.type,
        duration: 0,
        track: buildTrack(file, blobUrl, id),
      }
    })

    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.filename))
      return [...prev, ...incoming.filter((f) => !existing.has(f.filename))]
    })

    // Load durations in background
    incoming.forEach(async (lf) => {
      const dur = await loadDuration(lf.blobUrl)
      setFiles((prev) => prev.map((f) => f.id === lf.id ? { ...f, duration: dur } : f))
    })
  }, [])

  // ── Playback ─────────────────────────────────────────────────────────────

  const handlePlay = (lf: LocalFile) => {
    if (currentTrack?.trackId === lf.id) {
      togglePlay()
    } else {
      playTrack(lf.track, files.map((f) => f.track), !!isSignedIn)
    }
  }

  // ── File management ──────────────────────────────────────────────────────

  const removeFile = (id: number) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.blobUrl)
      return prev.filter((f) => f.id !== id)
    })
  }

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.blobUrl))
    setFiles([])
  }

  // ── Global drag-and-drop ──────────────────────────────────────────────────

  useEffect(() => {
    const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const onDragLeave = (e: DragEvent) => { if (!e.relatedTarget) setIsDragging(false) }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(Array.from(e.dataTransfer?.files ?? []))
    }
    window.addEventListener("dragover", onDragOver)
    window.addEventListener("dragleave", onDragLeave)
    window.addEventListener("drop", onDrop)
    return () => {
      window.removeEventListener("dragover", onDragOver)
      window.removeEventListener("dragleave", onDragLeave)
      window.removeEventListener("drop", onDrop)
    }
  }, [addFiles])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Full-page drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="w-28 h-28 bg-pink-500/20 border-2 border-dashed border-pink-500/60 rounded-[32px] flex items-center justify-center mb-5">
            <Upload size={44} className="text-pink-400" />
          </div>
          <p className="text-white text-2xl font-bold">Drop to add music</p>
          <p className="text-gray-400 text-sm mt-2">MP3, FLAC, WAV, AAC, OGG, M4A</p>
        </div>
      )}

      {/* Rejected files toast */}
      {rejected && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-red-500 text-white text-sm font-bold rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AlertCircle size={16} />
          Only audio files are supported
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
              Local <span className="font-bold">Files</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              Play music directly from your device
            </p>
          </div>
          <div className="flex items-center gap-3">
            {files.length > 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600 transition-all"
              >
                <Plus size={15} />
                Add More
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files))
            e.target.value = ""
          }}
        />

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {files.length === 0 && (
          <DropZone onBrowse={() => fileInputRef.current?.click()} />
        )}

        {/* ── Track list ────────────────────────────────────────────────── */}
        {files.length > 0 && (
          <div className="animate-in fade-in duration-500">

            {/* List toolbar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-sm font-bold text-gray-500">
                {files.length} {files.length === 1 ? "track" : "tracks"}
              </p>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>

            {/* Column headings (desktop only) */}
            <div className="hidden md:grid grid-cols-[32px_44px_1fr_76px_56px_68px_36px] gap-4 items-center px-4 pb-2 border-b border-gray-100 dark:border-gray-900 mb-1">
              <span />
              <span />
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Title</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Duration</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Format</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Size</span>
              <span />
            </div>

            {/* Rows */}
            <div className="space-y-0.5 mt-1">
              {files.map((lf, idx) => {
                const isCurrent = currentTrack?.trackId === lf.id
                const isPlayingThis = isCurrent && isPlaying
                const gradient = nameGradient(lf.displayName)
                const format = MIME_TO_LABEL[lf.mimeType] ?? "AUDIO"

                return (
                  <div
                    key={lf.id}
                    onClick={() => handlePlay(lf)}
                    style={{ animationDelay: `${idx * 18}ms` }}
                    className={`group flex items-center gap-3 md:grid md:grid-cols-[32px_44px_1fr_76px_56px_68px_36px] md:gap-4 px-3 md:px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-left-2 fill-mode-both ${isCurrent
                      ? "bg-pink-50 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-800/40"
                      : "border border-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      }`}
                  >
                    {/* # / play indicator */}
                    <div className="flex items-center justify-center w-6 md:w-auto flex-shrink-0">
                      {isPlayingThis ? (
                        <div className="flex items-end gap-[2px] h-4">
                          {[0, 0.15, 0.08].map((delay, i) => (
                            <span
                              key={i}
                              className="w-[3px] bg-pink-500 rounded-full animate-bounce"
                              style={{ height: "10px", animationDelay: `${delay}s`, animationDuration: "0.55s" }}
                            />
                          ))}
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-gray-300 dark:text-gray-700 group-hover:hidden">
                            {idx + 1}
                          </span>
                          <Play
                            size={14}
                            fill="currentColor"
                            className="hidden group-hover:block text-gray-500"
                          />
                        </>
                      )}
                    </div>

                    {/* Gradient thumbnail */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      <Music size={15} className="text-white/80" />
                    </div>

                    {/* Title + mobile meta */}
                    <div className="flex-1 min-w-0 md:contents">
                      <span
                        className={`text-sm font-semibold truncate block ${isCurrent ? "text-pink-500" : "text-gray-900 dark:text-white"
                          }`}
                      >
                        {lf.displayName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 md:hidden">
                        <span className="text-[10px] font-bold text-gray-400">{lf.duration > 0 ? formatDuration(lf.duration * 1000) : "—"}</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-500 uppercase">{format}</span>
                        <span className="text-[10px] text-gray-400">{formatBytes(lf.sizeBytes)}</span>
                      </div>
                    </div>

                    {/* Duration (desktop) */}
                    <span className="hidden md:block text-xs font-medium text-gray-400 tabular-nums">
                      {lf.duration > 0 ? formatDuration(lf.duration * 1000) : "—"}
                    </span>

                    {/* Format badge (desktop) */}
                    <span className="hidden md:block">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {format}
                      </span>
                    </span>

                    {/* File size (desktop) */}
                    <span className="hidden md:block text-xs font-medium text-gray-400 tabular-nums">
                      {formatBytes(lf.sizeBytes)}
                    </span>

                    {/* Remove */}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(lf.id) }}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add more — bottom CTA when list is populated */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group mt-4 flex items-center justify-center gap-3 py-5 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-pink-300 dark:hover:border-pink-800 hover:bg-pink-50/30 dark:hover:bg-pink-950/10 transition-all duration-300"
            >
              <Plus size={18} className="text-gray-400 group-hover:text-pink-500 transition-colors" />
              <span className="text-sm font-bold text-gray-400 group-hover:text-pink-500 transition-colors">
                Add more files
              </span>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
