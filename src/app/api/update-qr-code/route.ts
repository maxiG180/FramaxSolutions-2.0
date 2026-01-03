import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, targetUrl } = body;

        if (!id || !name || !targetUrl) {
            return NextResponse.json({ error: "ID, Name and Target URL are required" }, { status: 400 });
        }

        // Verify ownership
        const { data: existing } = await supabase
            .from("qr_codes")
            .select("id")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (!existing) {
            return NextResponse.json({ error: "QR code not found or unauthorized" }, { status: 404 });
        }

        const { data, error } = await supabase
            .from("qr_codes")
            .update({
                name,
                target_url: targetUrl,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
