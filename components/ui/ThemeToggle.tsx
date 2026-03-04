"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)

    // Safety check: ensure class is applied on mount
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.style.colorScheme = "dark"
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.style.colorScheme = "light"
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    console.log("Toggling theme to:", newTheme)
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
      root.style.setProperty("color-scheme", "dark")
    } else {
      root.classList.remove("dark")
      root.style.setProperty("color-scheme", "light")
    }
  }

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-pink-500 hover:border-pink-200 dark:hover:border-pink-900/50 transition-all group active:scale-95 shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon size={18} className="group-hover:fill-pink-500/10" />
      ) : (
        <Sun size={18} className="group-hover:fill-pink-500/10" />
      )}
    </button>
  )
}
