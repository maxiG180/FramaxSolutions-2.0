import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const supabase = await createClient();
    const headersList = await headers();

    // 1. Fetch QR code details
    const { data: qrCode, error: qrError } = await supabase
        .from("qr_codes")
        .select("id, target_url")
        .eq("slug", slug)
        .single();

    if (qrError || !qrCode) {
        // Redirect to home if QR code not found
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Log the scan asynchronously (don't block the user)
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const referer = headersList.get("referer") || "unknown";

    // We use a background task to log and increment
    // In Next.js App Router, we can just not await these if we don't care about the result for the redirect
    // But better to at least trigger them.

    // Increment scan count via RPC
    supabase.rpc("increment_qr_scans", { qr_slug: slug }).then(({ error }) => {
        if (error) console.error("Error incrementing QR scans:", error);
    });

    // Log detailed scan
    supabase
        .from("qr_scans")
        .insert({
            qr_code_id: qrCode.id,
            ip_address: ip,
            user_agent: userAgent,
            referer: referer,
        })
        .then(({ error }) => {
            if (error) console.error("Error logging QR scan:", error);
        });

    // 3. Redirect to target URL
    return NextResponse.redirect(new URL(qrCode.target_url));
}
