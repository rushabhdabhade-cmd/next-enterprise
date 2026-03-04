"use client"

import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
    useUser
} from "@clerk/nextjs"
import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import ThemeToggle from "@/components/ui/ThemeToggle"

export default function TopHeader() {
    const { user } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

    useEffect(() => {
        setQuery(searchParams.get("q") || "")
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
            setIsMobileSearchOpen(false)
        }
    }

    return (
        <header className="h-20 border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 transition-colors duration-500 pl-20 lg:pl-8">
            {/* Desktop & Tablet Search Bar */}
            <div className="flex-1 max-w-3xl hidden sm:block mr-6 md:mr-10">
                <form onSubmit={handleSearch} className="relative group flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for music, artists..."
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                        />
                    </div>
                    {query && (
                        <button
                            type="submit"
                            className="ml-2 px-4 py-2 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
                        >
                            Explore
                        </button>
                    )}
                </form>
            </div>

            {/* Mobile Search Bar Toggle - Visible only on very small screens */}
            <div className="sm:hidden flex-1">
                <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full text-gray-400 hover:text-gray-950 dark:hover:text-white transition-all w-full max-w-[140px]"
                >
                    <Search size={14} />
                    <span className="text-xs font-bold">Search</span>
                </button>
            </div>


            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="fixed inset-0 bg-white dark:bg-gray-950 z-[60] flex items-center px-4 animate-in fade-in slide-in-from-top-4 duration-200">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>
                    <button
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="ml-4 text-sm font-bold text-pink-500"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="flex items-center gap-4 md:gap-6 ml-4">
                <ThemeToggle />

                <div className="h-8 w-px bg-gray-100 dark:bg-gray-900 hidden sm:block" />

                <SignedIn>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-950 dark:text-white leading-tight">
                                {user?.firstName ?? "User"}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium max-w-[150px] truncate">
                                {user?.primaryEmailAddress?.emailAddress ?? "No Email"}
                            </p>
                        </div>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-10 h-10 rounded-xl ring-2 ring-gray-100 dark:ring-gray-800"
                                }
                            }}
                        />
                    </div>
                </SignedIn>

                <SignedOut>
                    <div className="flex items-center gap-3">
                        <SignInButton mode="modal">
                            <button className="px-5 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors">
                                Log In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="px-5 py-2 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-gray-950/10 dark:shadow-none">
                                Sign Up
                            </button>
                        </SignUpButton>
                    </div>
                </SignedOut>
            </div>
        </header>
    )
}
