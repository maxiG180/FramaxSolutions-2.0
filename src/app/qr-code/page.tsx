"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader } from "@/components/ui/loader";

export default function QRCodeRedirect() {
    useEffect(() => {
        const trackAndRedirect = async () => {
            const supabase = createClient();

            // Track the scan
            await supabase.from("qr_scans").insert({
                user_agent: navigator.userAgent,
                referrer: document.referrer || null,
            });

            // Redirect to homepage using current origin
            window.location.href = window.location.origin;
        };

        trackAndRedirect();
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader />
        </div>
    );
}
