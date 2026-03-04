import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock next/cache
const mockRevalidateTag = vi.fn()
const mockUnstableCache = vi.fn()

vi.mock("next/cache", () => ({
    revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
    unstable_cache: (...args: unknown[]) => mockUnstableCache(...args),
}))

// Mock db functions
vi.mock("@/lib/db", () => ({
    getFavorites: vi.fn(),
    getLibraries: vi.fn(),
    getPlayHistory: vi.fn(),
}))

import {
    cacheTags,
    TTL,
    getCachedFavorites,
    getCachedPlayHistory,
    getCachedLibraries,
    revalidateFavorites,
    revalidatePlays,
    revalidateLibraries,
} from "@/lib/cache"

describe("cache module", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // unstable_cache returns a function, which when called returns data
        mockUnstableCache.mockImplementation((fn) => fn)
    })

    // ─── cacheTags ──────────────────────────────────────────────────────────

    describe("cacheTags", () => {
        it("generates correct favorites tag", () => {
            expect(cacheTags.favorites("user-123")).toBe("favorites-user-123")
        })

        it("generates correct plays tag", () => {
            expect(cacheTags.plays("user-456")).toBe("plays-user-456")
        })

        it("generates correct libraries tag", () => {
            expect(cacheTags.libraries("user-789")).toBe("libraries-user-789")
        })
    })

    // ─── TTL constants ──────────────────────────────────────────────────────

    describe("TTL", () => {
        it("has correct USER_DATA TTL (5 minutes)", () => {
            expect(TTL.USER_DATA).toBe(300)
        })

        it("has correct HOT_TRACKS TTL (1 minute)", () => {
            expect(TTL.HOT_TRACKS).toBe(60)
        })

        it("has correct ITUNES_META TTL (24 hours)", () => {
            expect(TTL.ITUNES_META).toBe(86400)
        })

        it("has correct ITUNES_CHARTS TTL (24 hours)", () => {
            expect(TTL.ITUNES_CHARTS).toBe(86400)
        })

        it("has correct ITUNES_SEARCH TTL (1 hour)", () => {
            expect(TTL.ITUNES_SEARCH).toBe(3600)
        })
    })

    // ─── getCachedFavorites ─────────────────────────────────────────────────

    describe("getCachedFavorites", () => {
        it("calls unstable_cache with correct keys and tags", async () => {
            await getCachedFavorites("user-1")

            expect(mockUnstableCache).toHaveBeenCalledWith(
                expect.any(Function),
                ["favorites", "user-1"],
                {
                    revalidate: TTL.USER_DATA,
                    tags: ["favorites-user-1"],
                }
            )
        })
    })

    // ─── getCachedPlayHistory ───────────────────────────────────────────────

    describe("getCachedPlayHistory", () => {
        it("calls unstable_cache with correct keys and tags", async () => {
            await getCachedPlayHistory("user-1", 20)

            expect(mockUnstableCache).toHaveBeenCalledWith(
                expect.any(Function),
                ["plays", "user-1", "20"],
                {
                    revalidate: TTL.USER_DATA,
                    tags: ["plays-user-1"],
                }
            )
        })
    })

    // ─── getCachedLibraries ─────────────────────────────────────────────────

    describe("getCachedLibraries", () => {
        it("calls unstable_cache with correct keys and tags", async () => {
            await getCachedLibraries("user-1")

            expect(mockUnstableCache).toHaveBeenCalledWith(
                expect.any(Function),
                ["libraries", "user-1"],
                {
                    revalidate: TTL.USER_DATA,
                    tags: ["libraries-user-1"],
                }
            )
        })
    })

    // ─── Invalidation helpers ───────────────────────────────────────────────

    describe("revalidation helpers", () => {
        it("revalidateFavorites calls revalidateTag with correct tag", () => {
            revalidateFavorites("user-1")
            expect(mockRevalidateTag).toHaveBeenCalledWith("favorites-user-1")
        })

        it("revalidatePlays calls revalidateTag with correct tag", () => {
            revalidatePlays("user-1")
            expect(mockRevalidateTag).toHaveBeenCalledWith("plays-user-1")
        })

        it("revalidateLibraries calls revalidateTag with correct tag", () => {
            revalidateLibraries("user-1")
            expect(mockRevalidateTag).toHaveBeenCalledWith("libraries-user-1")
        })
    })
})
