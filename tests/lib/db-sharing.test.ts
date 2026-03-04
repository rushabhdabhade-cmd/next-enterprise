import { describe, it, expect, vi, beforeEach } from "vitest"

// Queue of results that terminal/awaited calls will consume in order
let callIndex = 0
let terminalResults: Array<{ data: unknown; error: unknown }> = []

function consumeNext() {
    const result = terminalResults[callIndex] ?? { data: null, error: null }
    callIndex++
    return result
}

/**
 * Proxy-based Supabase query builder mock.
 * - Named terminal methods (maybeSingle, single) immediately consume a result.
 * - All other methods return a new thenable proxy.
 * - Awaiting any proxy consumes the next result (via .then protocol).
 * - This supports arbitrary chaining like .update().eq().eq() being awaited.
 */
function createQueryBuilder(): unknown {
    const handler: ProxyHandler<object> = {
        get(_target, prop) {
            if (typeof prop === "symbol") return undefined

            // Terminal methods — consume immediately
            if (prop === "maybeSingle" || prop === "single") {
                return () => Promise.resolve(consumeNext())
            }

            // Thenable protocol — when the proxy is awaited, consume next result
            if (prop === "then") {
                const result = consumeNext()
                const promise = Promise.resolve(result)
                return promise.then.bind(promise)
            }

            // All other methods (select, update, insert, delete, eq, order, limit, upsert, etc.)
            // return a new thenable proxy to support further chaining
            return (..._args: unknown[]) => new Proxy({}, handler)
        },
    }

    return new Proxy({}, handler)
}

const mockFrom = vi.fn()

vi.mock("@/lib/supabase", () => ({
    supabaseAdmin: {
        from: (...args: unknown[]) => {
            mockFrom(...args)
            return createQueryBuilder()
        },
    },
}))

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
    randomUUID: () => "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
})

import {
    enableLibraryShare,
    disableLibraryShare,
    getSharedLibrary,
} from "@/lib/db"

describe("Library Sharing — DB functions", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        callIndex = 0
        terminalResults = []
    })

    // ─── enableLibraryShare ─────────────────────────────────────────────────

    describe("enableLibraryShare", () => {
        it("returns null when library does not exist", async () => {
            terminalResults = [{ data: null, error: null }]

            const result = await enableLibraryShare("lib-1", "user-1")

            expect(result).toBeNull()
            expect(mockFrom).toHaveBeenCalledWith("libraries")
        })

        it("returns existing share_id if already shared", async () => {
            terminalResults = [{ data: { share_id: "existing123" }, error: null }]

            const result = await enableLibraryShare("lib-1", "user-1")

            expect(result).toBe("existing123")
        })

        it("generates and saves a new share_id when not shared", async () => {
            terminalResults = [
                // 1: select().eq().eq().maybeSingle() — library exists, no share_id
                { data: { share_id: null }, error: null },
                // 2: update().eq().eq() — awaited, succeeds
                { data: null, error: null },
            ]

            const result = await enableLibraryShare("lib-1", "user-1")

            // "a1b2c3d4-e5f6-7890-abcd-ef1234567890" → remove dashes → "a1b2c3d4e5f67890abcdef1234567890" → slice(0,12) → "a1b2c3d4e5f6"
            expect(result).toBe("a1b2c3d4e5f6")
        })

        it("returns null on update error", async () => {
            terminalResults = [
                { data: { share_id: null }, error: null },
                { data: null, error: { message: "DB error" } },
            ]

            const result = await enableLibraryShare("lib-1", "user-1")

            expect(result).toBeNull()
        })
    })

    // ─── disableLibraryShare ────────────────────────────────────────────────

    describe("disableLibraryShare", () => {
        it("returns true on success", async () => {
            terminalResults = [{ data: null, error: null }]

            const result = await disableLibraryShare("lib-1", "user-1")

            expect(result).toBe(true)
            expect(mockFrom).toHaveBeenCalledWith("libraries")
        })

        it("returns false on error", async () => {
            terminalResults = [{ data: null, error: { message: "DB error" } }]

            const result = await disableLibraryShare("lib-1", "user-1")

            expect(result).toBe(false)
        })
    })

    // ─── getSharedLibrary ───────────────────────────────────────────────────

    describe("getSharedLibrary", () => {
        it("returns null when library is not found", async () => {
            terminalResults = [{ data: null, error: null }]

            const result = await getSharedLibrary("abc123")

            expect(result).toBeNull()
        })

        it("returns null on query error", async () => {
            terminalResults = [{ data: null, error: { message: "DB error" } }]

            const result = await getSharedLibrary("abc123")

            expect(result).toBeNull()
        })

        it("returns library and tracks on success", async () => {
            const mockLibrary = {
                id: "lib-1",
                user_id: "user-1",
                name: "My Playlist",
                description: "Great tracks",
                cover_url: null,
                share_id: "abc123",
                created_at: "2024-01-01",
                updated_at: "2024-01-01",
            }
            const mockTracks = [
                {
                    id: "t1",
                    library_id: "lib-1",
                    track_id: 123,
                    track_name: "Song A",
                    artist_name: "Artist A",
                },
            ]

            terminalResults = [
                // 1: library maybeSingle
                { data: mockLibrary, error: null },
                // 2: tracks .order() — awaited
                { data: mockTracks, error: null },
            ]

            const result = await getSharedLibrary("abc123")

            expect(result).not.toBeNull()
            expect(result!.library.name).toBe("My Playlist")
            expect(result!.tracks).toHaveLength(1)
            expect(result!.tracks[0].track_name).toBe("Song A")
        })

        it("returns empty tracks array when tracks query fails", async () => {
            const mockLibrary = {
                id: "lib-1",
                user_id: "user-1",
                name: "My Playlist",
                description: null,
                cover_url: null,
                share_id: "abc123",
                created_at: "2024-01-01",
                updated_at: "2024-01-01",
            }

            terminalResults = [
                { data: mockLibrary, error: null },
                { data: null, error: { message: "Tracks error" } },
            ]

            const result = await getSharedLibrary("abc123")

            expect(result).not.toBeNull()
            expect(result!.library.name).toBe("My Playlist")
            expect(result!.tracks).toEqual([])
        })
    })
})
