import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import HeroSection from "@/components/HeroSection"

describe("HeroSection", () => {
    it("renders title and subtitle correctly", () => {
        const title = "Test Hero Title"
        const subtitle = "Test Hero Subtitle"

        render(<HeroSection title={title} subtitle={subtitle} />)

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(subtitle)).toBeInTheDocument()
    })

    it("renders default button text", () => {
        render(<HeroSection title="Title" subtitle="Subtitle" />)
        expect(screen.getByText("Experience Now")).toBeInTheDocument()
    })
})
