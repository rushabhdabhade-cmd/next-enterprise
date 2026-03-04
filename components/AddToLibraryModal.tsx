"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Check, ListMusic, Loader2, Plus, X } from "lucide-react"
import { useState } from "react"
import { useLibrary } from "@/context/LibraryContext"
import type { ITunesTrack } from "@/types/itunes"

interface AddToLibraryModalProps {
    track: ITunesTrack
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AddToLibraryModal({ track, open, onOpenChange }: AddToLibraryModalProps) {
    const { libraries, librariesLoaded, addToLibrary, createLibrary } = useLibrary()
    const [newLibraryName, setNewLibraryName] = useState("")
    const [creating, setCreating] = useState(false)
    const [addedTo, setAddedTo] = useState<Set<string>>(new Set())
    const [adding, setAdding] = useState<string | null>(null)

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setAddedTo(new Set())
            setNewLibraryName("")
        }
        onOpenChange(nextOpen)
    }

    const handleAddToLibrary = async (libraryId: string) => {
        setAdding(libraryId)
        const ok = await addToLibrary(libraryId, track)
        if (ok) setAddedTo((prev) => new Set(prev).add(libraryId))
        setAdding(null)
    }

    const handleCreateAndAdd = async () => {
        if (!newLibraryName.trim()) return
        setCreating(true)
        const lib = await createLibrary(newLibraryName.trim())
        if (lib) {
            await addToLibrary(lib.id, track)
            setAddedTo((prev) => new Set(prev).add(lib.id))
        }
        setNewLibraryName("")
        setCreating(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-lg font-bold text-gray-950 dark:text-white">
                            Add to Library
                        </Dialog.Title>
                        <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                            <X size={16} className="text-gray-400" />
                        </Dialog.Close>
                    </div>

                    {/* Track preview */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 mb-6">
                        <img
                            src={track.artworkUrl100}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-950 dark:text-white truncate">
                                {track.trackName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
                        </div>
                    </div>

                    {/* Create new library */}
                    <div className="flex gap-2 mb-4">
                        <input
                            value={newLibraryName}
                            onChange={(e) => setNewLibraryName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
                            placeholder="New library name..."
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                        />
                        <button
                            onClick={handleCreateAndAdd}
                            disabled={!newLibraryName.trim() || creating}
                            className="px-4 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {creating ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Plus size={14} />
                            )}
                            Create
                        </button>
                    </div>

                    {/* Existing libraries list */}
                    <div className="max-h-64 overflow-y-auto space-y-1">
                        {!librariesLoaded && (
                            <div className="py-8 text-center text-sm text-gray-400">
                                <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                                Loading libraries...
                            </div>
                        )}

                        {librariesLoaded && libraries.length === 0 && (
                            <div className="py-8 text-center text-sm text-gray-400">
                                No libraries yet. Create one above!
                            </div>
                        )}

                        {libraries.map((lib) => {
                            const isAdded = addedTo.has(lib.id)
                            const isAdding = adding === lib.id

                            return (
                                <button
                                    key={lib.id}
                                    onClick={() => !isAdded && handleAddToLibrary(lib.id)}
                                    disabled={isAdded || isAdding}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                        isAdded
                                            ? "bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/40"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                        <ListMusic size={16} className="text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-950 dark:text-white truncate">
                                            {lib.name}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {lib.track_count} {lib.track_count === 1 ? "track" : "tracks"}
                                        </p>
                                    </div>
                                    {isAdding && (
                                        <Loader2 size={16} className="text-pink-500 animate-spin flex-shrink-0" />
                                    )}
                                    {isAdded && (
                                        <Check size={16} className="text-pink-500 flex-shrink-0" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
