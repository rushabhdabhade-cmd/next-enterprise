import { expect, test } from "@playwright/test"

test.describe("Home Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/")
    })

    test("has correct page title", async ({ page }) => {
        await expect(page).toHaveTitle(/iTunes/)
    })

    test("has SEO meta tags", async ({ page }) => {
        const ogTitle = page.locator('meta[property="og:title"]')
        await expect(ogTitle).toHaveAttribute("content", /iTunes/)

        const description = page.locator('meta[name="description"]')
        await expect(description).toHaveAttribute("content", /.+/)

        const twitterCard = page.locator('meta[name="twitter:card"]')
        await expect(twitterCard).toHaveAttribute("content", "summary_large_image")
    })

    test("renders left sidebar with navigation", async ({ page }) => {
        const sidebar = page.locator("aside").first()
        await expect(sidebar).toBeVisible()

        await expect(sidebar.getByText("Discover")).toBeVisible()
        await expect(sidebar.getByText("Genres")).toBeVisible()
        await expect(sidebar.getByText("Top Charts")).toBeVisible()
        await expect(sidebar.getByText("Local Files")).toBeVisible()
    })

    test("renders Discovery Hub header", async ({ page }) => {
        await expect(page.locator("h2").filter({ hasText: "Discovery" })).toBeVisible()
    })

    test("renders search bar with placeholder", async ({ page }) => {
        const searchInput = page.getByPlaceholder("Artist, song or mood...")
        await expect(searchInput).toBeVisible()
    })

    test("renders navigation tabs", async ({ page }) => {
        // "Explore" appears both as a tab and a search submit button — use first()
        await expect(page.getByRole("button", { name: "Explore" }).first()).toBeVisible()
        await expect(page.getByRole("button", { name: "Trending" })).toBeVisible()
        await expect(page.getByRole("button", { name: "Recently Played" })).toBeVisible()
        await expect(page.getByRole("button", { name: "For You" })).toBeVisible()
    })

    test("theme toggle is present and works", async ({ page }) => {
        const toggle = page.getByRole("button", { name: "Toggle theme" })
        await expect(toggle).toBeVisible()

        const hadDarkBefore = await page.evaluate(() =>
            document.documentElement.classList.contains("dark")
        )

        await toggle.click()

        const hasDarkAfter = await page.evaluate(() =>
            document.documentElement.classList.contains("dark")
        )

        expect(hadDarkBefore).not.toEqual(hasDarkAfter)
    })

    test("tab switching changes content", async ({ page }) => {
        // Click Trending tab — search bar should disappear (only in Explore tab)
        await page.getByRole("button", { name: "Trending" }).click()
        await expect(page.getByPlaceholder("Artist, song or mood...")).not.toBeVisible()

        // Click back to Explore — search bar reappears
        await page.getByRole("button", { name: "Explore" }).click()
        await expect(page.getByPlaceholder("Artist, song or mood...")).toBeVisible()
    })
})
