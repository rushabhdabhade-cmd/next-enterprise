import { expect, test } from "@playwright/test"

test.describe("Genres Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/genres")
    })

    test("renders Genres header", async ({ page }) => {
        await expect(page.locator("h2").filter({ hasText: "Genres" })).toBeVisible()
    })

    test("renders all 12 genre cards", async ({ page }) => {
        const genres = [
            "Pop",
            "Hip-Hop",
            "Rock",
            "Alternative",
            "Country",
            "Electronic",
            "R&B / Soul",
            "Jazz",
            "Classical",
            "Latin",
            "K-Pop",
            "Reggae",
        ]

        for (const genre of genres) {
            await expect(page.getByText(genre, { exact: true }).first()).toBeVisible()
        }
    })

    test("clicking a genre shows track browser with back button", async ({ page }) => {
        // Click the Pop genre card
        await page.getByText("Pop", { exact: true }).first().click()

        // Wait for the genre track browser header to appear
        await expect(page.locator("h2").filter({ hasText: "Pop" })).toBeVisible({ timeout: 15000 })

        // The back arrow button should be visible — click it
        const backButton = page.locator('button:has(.lucide-arrow-left)')
        await backButton.click()

        // Genre grid should reappear
        await expect(page.getByText("Rock", { exact: true }).first()).toBeVisible()
    })

    test("has left sidebar", async ({ page }) => {
        await expect(page.locator("aside").first()).toBeVisible()
    })
})
