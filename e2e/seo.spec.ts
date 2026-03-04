import { expect, test } from "@playwright/test"

test.describe("SEO & Technical Routes", () => {
    test("robots.txt is accessible and valid", async ({ request }) => {
        const response = await request.get("/robots.txt")
        expect(response.status()).toBe(200)

        const body = await response.text()
        expect(body).toContain("User-Agent")
        expect(body).toContain("Allow: /")
        expect(body).toContain("Disallow: /api/")
        expect(body).toContain("Sitemap")
    })

    test("sitemap.xml is accessible and valid", async ({ request }) => {
        const response = await request.get("/sitemap.xml")
        expect(response.status()).toBe(200)

        const body = await response.text()
        expect(body).toContain("<urlset")
        expect(body).toContain("<url>")
        expect(body).toContain("/genres")
    })

    test("html has lang attribute", async ({ page }) => {
        await page.goto("/")
        const lang = await page.getAttribute("html", "lang")
        expect(lang).toBe("en")
    })

    test("page has main landmark", async ({ page }) => {
        await page.goto("/")
        await expect(page.locator("main")).toBeVisible()
    })
})
