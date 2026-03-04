"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  Music2,
  BarChart3,
  HardDrive,
  Heart,
  History,
  Radio,
  PlusCircle,
  Layout
} from "lucide-react"

export default function LeftSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Discover", href: "/", icon: Compass },
    { name: "Genres", href: "/genres", icon: Music2 },
    { name: "Top Charts", href: "/top-charts", icon: BarChart3 },
    { name: "Local Files", href: "/local-files", icon: HardDrive },
  ]

  const playlists = [
    { name: "Favorites", icon: Heart },
    { name: "History", icon: History },
    { name: "Stations", icon: Radio },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 flex flex-col transition-colors duration-500">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gray-950 dark:bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
            <Layout className="text-white dark:text-gray-950" size={24} fill="currentColor" />
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
            <button className="text-gray-400 hover:text-pink-500 transition-colors">
              <PlusCircle size={14} />
            </button>
          </div>
          <ul className="space-y-1">
            {playlists.map((playlist) => (
              <li
                key={playlist.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-950 dark:hover:text-white transition-all cursor-pointer group"
              >
                <playlist.icon size={18} className="group-hover:text-pink-500 transition-colors" />
                {playlist.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400 mb-2">PRO PLAN</p>
          <p className="text-sm text-gray-900 dark:text-white font-medium mb-3">Unlock immersive spatial audio</p>
          <button className="w-full py-2 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-xs font-bold rounded-lg hover:scale-[1.02] transition-transform">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  )
}