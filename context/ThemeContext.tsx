"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage and apply on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")

    setTheme(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  // Apply theme whenever it changes (after mount)
  useEffect(() => {
    if (mounted) {
      applyTheme(theme)
      localStorage.setItem("theme", theme)
    }
  }, [theme, mounted])

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "light", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

export function useThemedComponent<T extends React.ComponentType<any>>(Component: T) {
  return function ThemedComponent(props: React.ComponentProps<T>) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) return null

    return <Component {...props} />
  }
}
