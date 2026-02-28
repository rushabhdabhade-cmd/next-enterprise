"use client"

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from "@clerk/nextjs"
import {
  BarChart3,
  Compass,
  Film,
  HardDrive,
  Heart,
  History,
  ListMusic,
  Lock,
  Menu,
  Music2,
  PlusCircle,
  Podcast,
  Search,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import logo from "@/assets/logo.png"
import { useLibrary } from "@/context/LibraryContext"

export default function LeftSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { libraries } = useLibrary()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { name: "Discover", href: "/", icon: Compass },
    { name: "Search", href: "/search", icon: Search },
    { name: "Genres", href: "/genres", icon: Music2 },
    { name: "Charts", href: "/charts", icon: BarChart3 },
    { name: "Podcasts", href: "/podcasts", icon: Podcast },
    { name: "Videos", href: "/videos", icon: Film },
    { name: "Local Files", href: "/local-files", icon: HardDrive },
  ]

  const playlists = [
    { name: "Favorites", href: "/favorites", icon: Heart, requiresAuth: true },
    { name: "History", href: "/recently-played", icon: History, requiresAuth: true },
    { name: "My Playlists", href: "/libraries", icon: ListMusic, requiresAuth: true },
    { name: "Profile", href: "/profile", icon: UserIcon, requiresAuth: true },
    { name: "Stats", href: "/stats", icon: TrendingUp, requiresAuth: true },
  ]

  const closeMobile = () => setMobileOpen(false)

  /* ── Navigation + Library — shared between mobile & desktop ── */
  const navContent = (
    <div className="px-4 flex-1 overflow-y-auto">
      <div className="mb-10">
        <h3 className="px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-4">
          Menu
        </h3>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
                  ? "bg-gray-100 dark:bg-gray-900 text-gray-950 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-950 dark:hover:text-white"
                  }`}
              >
                <item.icon size={18} className={isActive ? "text-pink-500" : "group-hover:text-pink-500 transition-colors"} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div>
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
            Library
          </h3>
          <SignedIn>
            <Link href="/libraries" onClick={closeMobile} className="text-gray-400 hover:text-pink-500 transition-colors">
              <PlusCircle size={14} />
            </Link>
          </SignedIn>
        </div>
        <ul className="space-y-1">
          {playlists.map((playlist) => {
            const isActive = pathname === playlist.href
            const linkEl = (
              <Link
                href={playlist.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
                  ? "bg-gray-100 dark:bg-gray-900 text-gray-950 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-950 dark:hover:text-white"
                }`}
              >
                <playlist.icon size={18} className={isActive ? "text-pink-500" : "group-hover:text-pink-500 transition-colors"} />
                {playlist.name}
              </Link>
            )

            if (playlist.requiresAuth) {
              return (
                <li key={playlist.name}>
                  <SignedIn>{linkEl}</SignedIn>
                  <SignedOut>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 dark:text-gray-700 cursor-not-allowed select-none">
                      <playlist.icon size={18} />
                      {playlist.name}
                      <Lock size={11} className="ml-auto opacity-60" />
                    </div>
                  </SignedOut>
                </li>
              )
            }

            return <li key={playlist.name}>{linkEl}</li>
          })}
        </ul>

        {/* Dynamic user libraries */}
        <SignedIn>
          {libraries.length > 0 && (
            <ul className="mt-2 space-y-0.5 border-t border-gray-100 dark:border-gray-900 pt-2">
              {libraries.slice(0, 5).map((lib) => {
                const isActive = pathname === `/libraries/${lib.id}`
                return (
                  <li key={lib.id}>
                    <Link
                      href={`/libraries/${lib.id}`}
                      onClick={closeMobile}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-900 text-gray-950 dark:text-white"
                          : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-950 dark:hover:text-white"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40 flex-shrink-0" />
                      <span className="truncate">{lib.name}</span>
                    </Link>
                  </li>
                )
              })}
              {libraries.length > 5 && (
                <li>
                  <Link
                    href="/libraries"
                    onClick={closeMobile}
                    className="flex items-center px-4 py-2 text-[10px] font-bold text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    View all ({libraries.length})
                  </Link>
                </li>
              )}
            </ul>
          )}
        </SignedIn>
      </div>
    </div>
  )

  /* ── Profile / Auth section — shared ── */
  const profileSection = (
    <div className="p-4 lg:p-6 border-t border-gray-100 dark:border-gray-900 flex-shrink-0">
      <SignedIn>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 rounded-xl"
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-950 dark:text-white truncate">
              {user?.fullName ?? user?.firstName ?? "Profile"}
            </p>
            <p className="text-[10px] text-gray-500 font-medium truncate">
              {user?.primaryEmailAddress?.emailAddress ?? "Manage Account"}
            </p>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="space-y-2">
          <p className="text-[10px] text-gray-400 font-medium px-1 mb-3">
            Sign in to unlock your library
          </p>
          <SignInButton mode="modal">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-xs font-bold rounded-xl hover:scale-[1.02] transition-transform">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-full py-2.5 bg-gray-100 dark:bg-gray-900 text-gray-950 dark:text-white text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 hover:scale-[1.02] transition-transform">
              Create Account
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger button — fixed top-left */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-all"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobile}
          />
        )}

        {/* ── Mobile drawer ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 flex flex-col transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
        {/* Mobile header — with close button */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group" onClick={closeMobile}>
              <div className="w-10 h-10 rounded-xl overflow-hidden transition-transform group-hover:scale-105 flex-shrink-0">
                <Image src={logo} alt="Logo" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
                iTunes
              </h1>
            </Link>
            <button
              onClick={closeMobile}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {navContent}
        {profileSection}
        </aside>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 flex-col transition-colors duration-500 flex-shrink-0">
        {/* Desktop header — no close button */}
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden transition-transform group-hover:scale-105 flex-shrink-0">
              <Image src={logo} alt="Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
              iTunes
            </h1>
          </Link>
        </div>

        {navContent}
        {profileSection}
      </aside>
    </>
  )
}
