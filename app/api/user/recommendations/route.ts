import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getCachedRecommendations } from "@/lib/cache"

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const result = await getCachedRecommendations(userId)
        return NextResponse.json(result)
    } catch (error) {
        console.error("[recommendations] Error:", error)
        return NextResponse.json(
            { error: "Failed to generate recommendations" },
            { status: 500 }
        )
    }
}
