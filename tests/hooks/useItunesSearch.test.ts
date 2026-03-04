import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useItunesSearch } from "@/hooks/useItunesSearch"
import * as itunesService from "@/services/itunesService"

// Mock the service
vi.mock("@/services/itunesService", () => ({
    searchTracks: vi.fn(),
    getTopTracks: vi.fn(),
}))

describe("useItunesSearch", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("starts in idle state", () => {
        const { result } = renderHook(() => useItunesSearch())
        expect(result.current.tracks).toEqual([])
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
    })

    it("handles successful search", async () => {
        const mockTracks = [{ trackId: 1, trackName: "Song 1" }]
        vi.mocked(itunesService.searchTracks).mockResolvedValue({
            results: mockTracks as any,
            resultCount: 1
        })

        const { result } = renderHook(() => useItunesSearch())

        // Use act for state-changing calls
        result.current.search({ term: "test" })

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
            expect(result.current.tracks).toEqual(mockTracks)
        })

        expect(result.current.error).toBe(null)
    })

    it("handles search error", async () => {
        vi.mocked(itunesService.searchTracks).mockRejectedValue(new Error("Network error"))

        const { result } = renderHook(() => useItunesSearch())

        // We expect search to throw because it propagates the error
        await expect(result.current.search({ term: "fail" })).rejects.toThrow("Network error")

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe("Network error")
        })

        expect(result.current.tracks).toEqual([])
    })

    it("handles fetchTopTracks", async () => {
        const mockTracks = [{ trackId: 1, trackName: "Top Song" }]
        vi.mocked(itunesService.getTopTracks).mockResolvedValue(mockTracks as any)

        const { result } = renderHook(() => useItunesSearch())

        // No await needed here if we use waitFor
        result.current.fetchTopTracks()

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
            expect(result.current.tracks).toHaveLength(1)
        }, { timeout: 3000 })

        expect(result.current.tracks[0].trackName).toBe("Top Song")
    })
})
