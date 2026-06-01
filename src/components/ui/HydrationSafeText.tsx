"use client";

import { ReactNode } from "react";

/**
 * Wrapper component that suppresses hydration warnings for dynamic text content.
 * Use this for any text that might differ between server and client (e.g., translations, dates).
 */
export function HydrationSafeText({
    children,
    as: Component = "span"
}: {
    children: ReactNode;
    as?: keyof JSX.IntrinsicElements
}) {
    return <Component suppressHydrationWarning>{children}</Component>;
}
