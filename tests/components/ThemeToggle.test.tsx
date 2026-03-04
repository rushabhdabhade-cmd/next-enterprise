import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import ThemeToggle from "@/components/ui/ThemeToggle"

describe("ThemeToggle", () => {
    beforeEach(() => {
        // Clear localStorage and DOM classes
        localStorage.clear()
        document.documentElement.classList.remove("dark")
        vi.clearAllMocks()

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        })
    })

    it("renders and toggles theme", () => {
        render(<ThemeToggle />)

        const button = screen.getByLabelText("Toggle theme")
        expect(button).toBeInTheDocument()

        // Initial state (light)
        expect(document.documentElement.classList.contains("dark")).toBe(false)

        // Toggle to dark
        fireEvent.click(button)
        expect(document.documentElement.classList.contains("dark")).toBe(true)
        expect(localStorage.getItem("theme")).toBe("dark")

        // Toggle back to light
        fireEvent.click(button)
        expect(document.documentElement.classList.contains("dark")).toBe(false)
        expect(localStorage.getItem("theme")).toBe("light")
    })

    it("loads theme from localStorage", () => {
        localStorage.setItem("theme", "dark")
        render(<ThemeToggle />)

        // Should be dark initially
        expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("respects system preference if no localStorage", () => {
        vi.mocked(window.matchMedia).mockReturnValue({
            matches: true,
            media: "",
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        } as any)

        render(<ThemeToggle />)
        expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
})
