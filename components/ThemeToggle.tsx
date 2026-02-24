"use client"

import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light"
    setCurrentTheme(savedTheme)
  }, [])

  const handleToggle = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light"
    setCurrentTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    const html = document.documentElement
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }

  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-10 h-10" />
    )
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
      title={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
    >
      {currentTheme === "light" ? (
        <span className="text-lg">🌙</span>
      ) : (
        <span className="text-lg">☀️</span>
      )}
    </button>
  )
}
