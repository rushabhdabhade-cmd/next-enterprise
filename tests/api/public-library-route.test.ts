import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// Mock db
vi.mock("@/lib/db", () => ({
    getSharedLibrary: vi.fn(),
}))

import { getSharedLibrary } from "@/lib/db"
import { GET } from "@/app/api/public/libraries/[shareId]/route"

function makeRequest() {
    return new NextRequest("http://localhost:3000/api/public/libraries/abc123def456")
}

function makeParams(shareId: string) {
    return { params: Promise.resolve({ shareId }) }
}

describe("Public library route — /api/public/libraries/[shareId]", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns 400 for empty share ID", async () => {
        const res = await GET(makeRequest(), makeParams(""))
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error).toBe("Invalid share ID")
    })

    it("returns 400 for share ID shorter than 8 characters", async () => {
        const res = await GET(makeRequest(), makeParams("abc"))
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error).toBe("Invalid share ID")
    })

    it("returns 404 when library is not found", async () => {
        vi.mocked(getSharedLibrary).mockResolvedValueOnce(null)

        const res = await GET(makeRequest(), makeParams("abc123def456"))
        const body = await res.json()

        expect(res.status).toBe(404)
        expect(body.error).toBe("Library not found or no longer shared")
    })

    it("returns sanitized library data and tracks on success", async () => {
        vi.mocked(getSharedLibrary).mockResolvedValueOnce({
            library: {
                id: "lib-1",
                user_id: "user-1",
                name: "My Playlist",
                description: "A great playlist",
                cover_url: "https://example.com/cover.jpg",
                share_id: "abc123def456",
                created_at: "2024-01-01",
                updated_at: "2024-01-01",
            },
            tracks: [
                {
                    id: "t1",
                    library_id: "lib-1",
                    track_id: 123,
                    track_name: "Song A",
                    artist_name: "Artist A",
                    collection_name: "Album A",
                    artwork_url: "https://example.com/art.jpg",
                    preview_url: "https://example.com/preview.mp3",
                    genre: "Pop",
                    duration_ms: 180000,
                    added_at: "2024-01-01",
                },
            ],
        })

        const res = await GET(makeRequest(), makeParams("abc123def456"))
        const body = await res.json()

        expect(res.status).toBe(200)

        // Library data should be sanitized — no id, user_id, share_id, timestamps
        expect(body.library).toEqual({
            name: "My Playlist",
            description: "A great playlist",
            cover_url: "https://example.com/cover.jpg",
        })
        expect(body.library.id).toBeUndefined()
        expect(body.library.user_id).toBeUndefined()
        expect(body.library.share_id).toBeUndefined()

        // Tracks should be included
        expect(body.tracks).toHaveLength(1)
        expect(body.tracks[0].track_name).toBe("Song A")
    })

    it("calls getSharedLibrary with the correct shareId", async () => {
        vi.mocked(getSharedLibrary).mockResolvedValueOnce(null)

        await GET(makeRequest(), makeParams("myshare12345"))

        expect(getSharedLibrary).toHaveBeenCalledWith("myshare12345")
    })
})
