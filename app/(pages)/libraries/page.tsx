"use client"

import { useUser } from "@clerk/nextjs"
import { ListMusic, Music, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useLibraryStore } from "@/store/useLibraryStore"

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
            </div>
        </div>
    )
}

export default function LibrariesPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { libraries, librariesLoaded, createLibrary, deleteLibrary } = useLibraryStore()
    const [newName, setNewName] = useState("")
    const [creating, setCreating] = useState(false)
    const [showCreate, setShowCreate] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!newName.trim()) return
        setCreating(true)
        await createLibrary(newName.trim())
        setNewName("")
        setCreating(false)
        setShowCreate(false)
    }

    const handleDelete = async (e: React.MouseEvent, libraryId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setDeleting(libraryId)
        await deleteLibrary(libraryId)
        setDeleting(null)
    }

    const loading = !isLoaded || (isSignedIn && !librariesLoaded)

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">
            {/* Header */}
            <header className="flex items-center justify-between mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <ListMusic size={16} className="text-purple-500" />
                        </div>
                        <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                            My <span className="font-bold">Libraries</span>
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-11">
                        {loading
                            ? "Loading..."
                            : `${libraries.length} ${libraries.length === 1 ? "library" : "libraries"}`}
                    </p>
                </div>
                {isSignedIn && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-sm font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={16} />
                        New Library
                    </button>
                )}
            </header>

            {/* Create library inline */}
            {showCreate && (
                <div className="mb-8 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h3 className="text-sm font-bold text-gray-950 dark:text-white mb-4">Create a new library</h3>
                    <div className="flex gap-3">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            placeholder="Library name..."
                            autoFocus
                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm text-gray-950 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!newName.trim() || creating}
                            className="px-6 py-3 rounded-xl bg-purple-500 text-white text-sm font-bold hover:bg-purple-600 disabled:opacity-50 transition-all"
                        >
                            {creating ? "Creating..." : "Create"}
                        </button>
                        <button
                            onClick={() => { setShowCreate(false); setNewName("") }}
                            className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                    {[...Array(5)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {/* Not signed in */}
            {!loading && !isSignedIn && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6">
                        <ListMusic size={32} className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign in to create libraries
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                        Create custom collections to organize your favorite songs.
                    </p>
                </div>
            )}

            {/* Empty state */}
            {!loading && isSignedIn && libraries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
                        <Music size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No libraries yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mb-6">
                        Create your first library to start organizing your music.
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-sm font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={16} />
                        Create Library
                    </button>
                </div>
            )}

            {/* Libraries grid */}
            {!loading && libraries.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                    {libraries.map((lib, index) => (
                        <Link
                            key={lib.id}
                            href={`/libraries/${lib.id}`}
                            style={{ animationDelay: `${index * 40}ms` }}
                            className={`group relative bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 hover:-translate-y-1 ${deleting === lib.id ? "opacity-50 pointer-events-none" : ""
                                }`}
                        >
                            {/* Cover */}
                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 flex items-center justify-center">
                                <ListMusic size={48} className="text-purple-500/40" />

                                {/* Delete on hover */}
                                <button
                                    onClick={(e) => handleDelete(e, lib.id)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 active:scale-90"
                                    title="Delete library"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h4 className="font-bold text-sm tracking-tight truncate mb-1 text-gray-950 dark:text-white group-hover:text-purple-500 transition-colors">
                                    {lib.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {lib.track_count} {lib.track_count === 1 ? "track" : "tracks"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
