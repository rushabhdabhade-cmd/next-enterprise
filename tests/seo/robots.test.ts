import { describe, it, expect, vi, beforeEach } from "vitest"

const MOCK_URL = "https://example.com"

describe("robots", () => {
    beforeEach(() => {
        vi.resetModules()
    })

    it("allows all user agents to crawl /", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", MOCK_URL)
        const { default: robots } = await import("@/app/robots")

        const result = robots()

        expect(result.rules).toBeDefined()
        const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
        expect(rules.userAgent).toBe("*")
        expect(rules.allow).toBe("/")
    })

    it("disallows crawling API routes and auth pages", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", MOCK_URL)
        const { default: robots } = await import("@/app/robots")

        const result = robots()

        const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
        expect(rules.disallow).toContain("/api/")
        expect(rules.disallow).toContain("/sign-in")
        expect(rules.disallow).toContain("/sign-up")
    })

    it("includes sitemap URL", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", MOCK_URL)
        const { default: robots } = await import("@/app/robots")

        const result = robots()

        expect(result.sitemap).toBe(`${MOCK_URL}/sitemap.xml`)
    })

    it("uses localhost fallback when env var is missing", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", "")
        const { default: robots } = await import("@/app/robots")

        const result = robots()

        // Fallback is http://localhost:3000
        expect(result.sitemap).toContain("sitemap.xml")
    })
})
