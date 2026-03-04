import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Home from "@/app/(pages)/page"
import { useItunesSearch } from "@/hooks/useItunesSearch"

// Mock the hook
vi.mock("@/hooks/useItunesSearch", () => ({
    useItunesSearch: vi.fn(),
}))

// Mock all internal components to focus on Home logic
vi.mock("@/components/LeftSidebar", () => ({ default: () => <div data-testid="sidebar" /> }))
vi.mock("@/components/HeroSection", () => ({ default: () => <div data-testid="hero" /> }))
vi.mock("@/components/RecentlyPlayedGrid", () => ({ default: () => <div data-testid="recent-grid" /> }))
vi.mock("@/components/Queue", () => ({ default: () => <div data-testid="queue" /> }))
vi.mock("@/components/ThemeToggle", () => ({ default: () => <div data-testid="theme-toggle" /> }))
vi.mock("@/components/SearchBar", () => ({ default: () => <div data-testid="search-bar" /> }))
vi.mock("@/components/TrackList", () => ({ default: ({ tracks }: any) => <div data-testid="track-list">{tracks.length} tracks</div> }))

describe("Home Page Pagination", () => {
    beforeEach(() => {
        vi.resetAllMocks()

        // Mock scrollIntoView as it's not in JSDOM
        window.HTMLElement.prototype.scrollIntoView = vi.fn()
    })

    it("calculates and displays correct total pages", async () => {
        const mockTracks = Array.from({ length: 45 }, (_, i) => ({
            trackId: i,
            trackName: `Track ${i}`,
            artistName: "Artist",
            artworkUrl100: "",
            previewUrl: "",
        }))

        vi.mocked(useItunesSearch).mockReturnValue({
            tracks: mockTracks as any,
            loading: false,
            error: null,
            search: vi.fn(),
            fetchTopTracks: vi.fn(),
        })

        render(<Home />)

        // 45 tracks / 20 items per page = 3 pages (20 + 20 + 5)
        expect(screen.getByText(/Page/)).toBeInTheDocument()
        expect(screen.getByText("3")).toBeInTheDocument() // Total pages indicator or last page button
        expect(screen.getByText(/of 3/)).toBeInTheDocument()
    })

    it("changes tracks when page button is clicked", async () => {
        const mockTracks = Array.from({ length: 45 }, (_, i) => ({
            trackId: i,
            trackName: `Track ${i}`,
            artistName: "Artist",
            artworkUrl100: "",
            previewUrl: "",
        }))

        vi.mocked(useItunesSearch).mockReturnValue({
            tracks: mockTracks as any,
            loading: false,
            error: null,
            search: vi.fn(),
            fetchTopTracks: vi.fn(),
        })

        render(<Home />)

        // Page 1 should show 20 tracks
        expect(screen.getByTestId("track-list")).toHaveTextContent("20 tracks")

        // Click page 2
        const page2Button = screen.getByText("2")
        fireEvent.click(page2Button)

        // Page 2 should still show 20 tracks (21-40)
        expect(screen.getByTestId("track-list")).toHaveTextContent("20 tracks")
        expect(screen.getByText(/Page/)).toHaveTextContent("2")

        // Click page 3
        const page3Button = screen.getByText("3")
        fireEvent.click(page3Button)

        // Page 3 should show 5 tracks (41-45)
        expect(screen.getByTestId("track-list")).toHaveTextContent("5 tracks")
    })
})
