import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, targetUrl } = body;

        if (!name || !targetUrl) {
            return NextResponse.json({ error: "Name and Target URL are required" }, { status: 400 });
        }

        // Generate a random slug
        const slug = Math.random().toString(36).substring(2, 8);

        const { data, error } = await supabase
            .from("qr_codes")
            .insert({
                user_id: user.id,
                name,
                target_url: targetUrl,
                slug,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
