import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import { WebhookEvent } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    const svix_id = req.headers.get("svix-id")
    const svix_timestamp = req.headers.get("svix-timestamp")
    const svix_signature = req.headers.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
    }

    const body = await req.text()
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    const { type, data } = evt

    if (type === "user.created" || type === "user.updated") {
        const { id, email_addresses, first_name, last_name, username, image_url } = data as any
        const primaryEmail = email_addresses?.find((e: any) => e.id === (data as any).primary_email_address_id)?.email_address

        const payload: Record<string, any> = {
            id,
            email: primaryEmail ?? null,
            first_name: first_name ?? null,
            last_name: last_name ?? null,
            username: username ?? null,
            avatar_url: image_url ?? null,
            updated_at: new Date().toISOString(),
        }

        if (type === "user.created") {
            payload.created_at = new Date((data as any).created_at).toISOString()
        }

        const { error } = await supabaseAdmin.from("users").upsert(payload, { onConflict: "id" })

        if (error) {
            console.error(`[webhook] ${type} DB error:`, error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
    }

    if (type === "user.deleted") {
        const { id } = data as any
        if (id) {
            const { error } = await supabaseAdmin.from("users").delete().eq("id", id)
            if (error) {
                console.error("[webhook] user.deleted DB error:", error.message)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
        }
    }

    return NextResponse.json({ message: "ok" })
}
