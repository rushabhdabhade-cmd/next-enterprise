import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
    const user = await currentUser()

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const primaryEmail = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress

    const { data, error } = await supabaseAdmin
        .from("users")
        .upsert(
            {
                id: user.id,
                email: primaryEmail ?? null,
                first_name: user.firstName ?? null,
                last_name: user.lastName ?? null,
                username: user.username ?? null,
                avatar_url: user.imageUrl ?? null,
                created_at: new Date(user.createdAt).toISOString(),
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        )
        .select()

    if (error) {
        console.error("[sync-user] Supabase error:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ synced: true, user: data?.[0] })
}
