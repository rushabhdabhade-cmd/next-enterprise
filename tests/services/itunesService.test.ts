import { describe, it, expect, vi, beforeEach } from "vitest"
import { getTopTracks, searchTracks, formatDuration } from "@/services/itunesService"

// Mock fetch
global.fetch = vi.fn()

describe("itunesService", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe("formatDuration", () => {
        it("formats milliseconds to m:ss", () => {
            expect(formatDuration(180000)).toBe("3:00")
            expect(formatDuration(185000)).toBe("3:05")
            expect(formatDuration(0)).toBe("0:00")
        })
    })

    describe("getTopTracks", () => {
        it("fetches and maps top tracks from multiple feeds successfully", async () => {
            const mockEntry = {
                id: { attributes: { "im:id": "123" } },
                "im:name": { label: "Track Name" },
                "im:artist": { label: "Artist Name" },
                "im:collection": { "im:name": { label: "Album Name" } },
                "im:image": [{ label: "img30" }, { label: "img60" }, { label: "img100" }],
                "im:releaseDate": { label: "2023-01-01" },
                category: { attributes: { label: "Pop" } },
                link: [
                    { attributes: { title: "Preview", href: "preview.mp3" }, "im:duration": { label: "30000" } }
                ]
            }

                // Mock multiple successful responses for the feeds
                ; (fetch as any).mockResolvedValue({
                    ok: true,
                    json: async () => ({
                        feed: { entry: [mockEntry] }
                    })
                })

            const tracks = await getTopTracks()

            // Deduplication will merge the same track from multiple feeds into 1
            expect(tracks).toHaveLength(1)
            expect(tracks[0].trackName).toBe("Track Name")
        })

        it("returns empty array on all fetch failures", async () => {
            ; (fetch as any).mockRejectedValue(new Error("Network fail"))

            const tracks = await getTopTracks()
            expect(tracks).toEqual([])
        })
    })

    describe("searchTracks", () => {
        it("searches tracks successfully", async () => {
            const mockResult = {
                results: [{ trackId: 456, trackName: "Search Result" }]
            }

                ; (fetch as any).mockResolvedValue({
                    ok: true,
                    json: async () => mockResult
                })

            const response = await searchTracks({ term: "test" })
            expect(response.results).toHaveLength(1)
            expect(response.results[0].trackName).toBe("Search Result")
        })
    })
})
