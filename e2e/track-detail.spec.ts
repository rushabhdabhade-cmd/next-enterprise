import { expect, test } from "@playwright/test"

// Well-known stable iTunes track ID (Blinding Lights — The Weeknd)
const TRACK_ID = "1499378108"

test.describe("Track Detail Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/track/${TRACK_ID}`, { waitUntil: "networkidle" })
    })

    test("renders track name and artist", async ({ page }) => {
        // Track name is in the main content h1 (not sidebar h1 "iTunes")
        const trackTitle = page.locator("main h1")
        await expect(trackTitle).toBeVisible()

        // Artist name appears after "by"
        await expect(page.locator("main").getByText(/by /)).toBeVisible()
    })

    test("has dynamic OG metadata for music.song", async ({ page }) => {
        const ogType = page.locator('meta[property="og:type"]')
        await expect(ogType).toHaveAttribute("content", "music.song")

        // Title should contain track info
        const title = await page.title()
        expect(title).toContain("| iTunes")
    })

    test("has Listen Now button", async ({ page }) => {
        await expect(page.getByRole("button", { name: /Listen Now/i })).toBeVisible()
    })

    test("has share button", async ({ page }) => {
        await expect(page.locator('button[title="Copy share link"]')).toBeVisible()
    })

    test("renders metadata grid", async ({ page }) => {
        await expect(page.getByText("Release Date")).toBeVisible()
        await expect(page.getByText("Album")).toBeVisible()
    })
})
