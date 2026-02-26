"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import logo from "@/assets/logo.png"
import {
  Compass,
  Music2,
  BarChart3,
  HardDrive,
  Heart,
  History,
  Radio,
  Clock,
  PlusCircle,
  Lock,
  User as UserIcon,
  LogOut,
  Settings,
} from "lucide-react"
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser
} from "@clerk/nextjs"

export default function LeftSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  const navItems = [
    { name: "Discover", href: "/", icon: Compass },
    { name: "Genres", href: "/genres", icon: Music2 },
    { name: "Top Charts", href: "/top-charts", icon: BarChart3 },
    { name: "Local Files", href: "/local-files", icon: HardDrive },
  ]

  const playlists = [
    { name: "Favorites", href: "/favorites", icon: Heart, requiresAuth: true },
    { name: "History", href: "/recently-played", icon: History, requiresAuth: true },
    { name: "Stations", href: "/stations", icon: Radio, requiresAuth: false },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 flex flex-col transition-colors duration-500">
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

      <div className="px-4 flex-1">
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
              <button className="text-gray-400 hover:text-pink-500 transition-colors">
                <PlusCircle size={14} />
              </button>
            </SignedIn>
          </div>
          <ul className="space-y-1">
            {playlists.map((playlist) => {
              const isActive = pathname === playlist.href
              const linkEl = (
                <Link
                  href={playlist.href}
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
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 dark:border-gray-900">
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
    </aside>
  )
}