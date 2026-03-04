import { describe, it, expect, vi, beforeEach } from "vitest"

// Dynamically set env before import
const MOCK_URL = "https://example.com"

describe("sitemap", () => {
    beforeEach(() => {
        vi.resetModules()
    })

    it("returns correct static pages", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", MOCK_URL)
        const { default: sitemap } = await import("@/app/sitemap")

        const result = sitemap()

        expect(result).toHaveLength(3)

        const urls = result.map((entry) => entry.url)
        expect(urls).toContain(MOCK_URL)
        expect(urls).toContain(`${MOCK_URL}/genres`)
        expect(urls).toContain(`${MOCK_URL}/top-charts`)
    })

    it("sets correct priorities", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", MOCK_URL)
        const { default: sitemap } = await import("@/app/sitemap")

        const result = sitemap()

        const home = result.find((e) => e.url === MOCK_URL)
        const genres = result.find((e) => e.url?.includes("/genres"))
        const topCharts = result.find((e) => e.url?.includes("/top-charts"))

        expect(home?.priority).toBe(1)
        expect(genres?.priority).toBe(0.8)
        expect(topCharts?.priority).toBe(0.8)
    })

    it("sets correct change frequencies", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", MOCK_URL)
        const { default: sitemap } = await import("@/app/sitemap")

        const result = sitemap()

        const home = result.find((e) => e.url === MOCK_URL)
        const genres = result.find((e) => e.url?.includes("/genres"))
        const topCharts = result.find((e) => e.url?.includes("/top-charts"))

        expect(home?.changeFrequency).toBe("daily")
        expect(genres?.changeFrequency).toBe("weekly")
        expect(topCharts?.changeFrequency).toBe("daily")
    })

    it("includes lastModified dates", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", MOCK_URL)
        const { default: sitemap } = await import("@/app/sitemap")

        const result = sitemap()

        for (const entry of result) {
            expect(entry.lastModified).toBeInstanceOf(Date)
        }
    })

    it("uses fallback URL when env var is not set", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", "")
        const { default: sitemap } = await import("@/app/sitemap")

        const result = sitemap()

        // With empty string, the fallback will be used
        expect(result.length).toBe(3)
    })
})
