import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
    auth: vi.fn(),
}))

// Mock db functions
vi.mock("@/lib/db", () => ({
    enableLibraryShare: vi.fn(),
    disableLibraryShare: vi.fn(),
}))

// Mock cache
vi.mock("@/lib/cache", () => ({
    revalidateLibraries: vi.fn(),
}))

import { auth } from "@clerk/nextjs/server"
import { enableLibraryShare, disableLibraryShare } from "@/lib/db"
import { revalidateLibraries } from "@/lib/cache"
import { POST, DELETE } from "@/app/api/user/libraries/[id]/share/route"

function makeRequest(method: string) {
    return new NextRequest("http://localhost:3000/api/user/libraries/lib-1/share", { method })
}

function makeParams(id: string) {
    return { params: Promise.resolve({ id }) }
}

describe("Share route — /api/user/libraries/[id]/share", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ─── POST (enable sharing) ──────────────────────────────────────────────

    describe("POST", () => {
        it("returns 401 when not authenticated", async () => {
            vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any)

            const res = await POST(makeRequest("POST"), makeParams("lib-1"))
            const body = await res.json()

            expect(res.status).toBe(401)
            expect(body.error).toBe("Unauthorized")
        })

        it("returns shareId and shareUrl on success", async () => {
            vi.mocked(auth).mockResolvedValueOnce({ userId: "user-1" } as any)
            vi.mocked(enableLibraryShare).mockResolvedValueOnce("abc123def456")

            const res = await POST(makeRequest("POST"), makeParams("lib-1"))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.shareId).toBe("abc123def456")
            expect(body.shareUrl).toContain("/shared/abc123def456")
            expect(enableLibraryShare).toHaveBeenCalledWith("lib-1", "user-1")
            expect(revalidateLibraries).toHaveBeenCalledWith("user-1")
        })

        it("returns 500 when enableLibraryShare fails", async () => {
            vi.mocked(auth).mockResolvedValueOnce({ userId: "user-1" } as any)
            vi.mocked(enableLibraryShare).mockResolvedValueOnce(null)

            const res = await POST(makeRequest("POST"), makeParams("lib-1"))
            const body = await res.json()

            expect(res.status).toBe(500)
            expect(body.error).toBe("Failed to enable sharing")
        })
    })

    // ─── DELETE (disable sharing) ───────────────────────────────────────────

    describe("DELETE", () => {
        it("returns 401 when not authenticated", async () => {
            vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any)

            const res = await DELETE(makeRequest("DELETE"), makeParams("lib-1"))
            const body = await res.json()

            expect(res.status).toBe(401)
            expect(body.error).toBe("Unauthorized")
        })

        it("returns ok on success", async () => {
            vi.mocked(auth).mockResolvedValueOnce({ userId: "user-1" } as any)
            vi.mocked(disableLibraryShare).mockResolvedValueOnce(true)

            const res = await DELETE(makeRequest("DELETE"), makeParams("lib-1"))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.ok).toBe(true)
            expect(disableLibraryShare).toHaveBeenCalledWith("lib-1", "user-1")
            expect(revalidateLibraries).toHaveBeenCalledWith("user-1")
        })

        it("returns 500 when disableLibraryShare fails", async () => {
            vi.mocked(auth).mockResolvedValueOnce({ userId: "user-1" } as any)
            vi.mocked(disableLibraryShare).mockResolvedValueOnce(false)

            const res = await DELETE(makeRequest("DELETE"), makeParams("lib-1"))
            const body = await res.json()

            expect(res.status).toBe(500)
            expect(body.error).toBe("Failed to disable sharing")
        })
    })
})
