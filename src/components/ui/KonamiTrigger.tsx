"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useKonamiCode } from "@/hooks/useKonamiCode";

export function KonamiTrigger() {
    const triggered = useKonamiCode();

    useEffect(() => {
        if (triggered) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        }
    }, [triggered]);

    return null;
}
