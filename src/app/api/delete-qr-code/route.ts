import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
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

        const { error } = await supabase
            .from("qr_codes")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
