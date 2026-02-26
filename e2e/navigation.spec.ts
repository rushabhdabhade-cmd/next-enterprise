import { expect, test } from "@playwright/test"

test.describe("Navigation", () => {
    test("sidebar Genres link navigates correctly", async ({ page }) => {
        await page.goto("/")
        await page.locator("aside").first().getByText("Genres").click()
        await expect(page).toHaveURL("/genres")
    })

    test("sidebar Discover link navigates to home", async ({ page }) => {
        await page.goto("/genres")
        await page.locator("aside").first().getByText("Discover").click()
        await expect(page).toHaveURL("/")
    })

    test("logo link navigates to home", async ({ page }) => {
        await page.goto("/genres")
        await page.locator("aside").first().getByRole("link", { name: /iTunes/i }).click()
        await expect(page).toHaveURL("/")
    })

    test("auth-gated items show for signed-out users", async ({ page }) => {
        await page.goto("/")
        const sidebar = page.locator("aside").first()

        // Favorites and History should be visible in the sidebar but locked
        await expect(sidebar.getByText("Favorites")).toBeVisible()
        await expect(sidebar.getByText("History")).toBeVisible()
    })
})
