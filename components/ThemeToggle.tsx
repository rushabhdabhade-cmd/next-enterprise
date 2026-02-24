"use client"

import { useTheme } from "context/ThemeContext"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-10 h-10" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <span className="text-lg">🌙</span> : <span className="text-lg">☀️</span>}
    </button>
  )
}