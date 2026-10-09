"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// "Hide sensitive data" switch for showing the dashboard to other people (demos, interviews).
// While on, it blurs money, contact details and standalone numbers anywhere in the dashboard,
// including modals. It only adds an attribute that CSS blurs; nothing in the data changes.

const STORAGE_KEY = "framax-privacy-mode";
const MASK_ATTR = "data-privacy-mask";

const SENSITIVE_PATTERNS = [
    /€\s?\d|\d\s?€|\$\s?\d/, // money
    /[^\s@]+@[^\s@]+\.[a-z]{2,}/i, // e-mail
    /(?:\+\d{1,3}\s?)?\b\d{3}\s?\d{3}\s?\d{3}\b/, // phone numbers, NIF
    /\b[A-Z]{2}\d{2}(?:\s?\d{4}){4,}/, // IBAN
    /^[\s+-]*[\d.,]*\d[\d.,]*\s*[%kKmM]?\s*$/, // text that is only a number: totals, counts, percentages
];

// Blurring marks the element holding the text; skip big blocks that merely contain a number
const MAX_MASKED_TEXT_LENGTH = 80;

// Calendar day numbers and years stay readable, so calendars and dates still make sense
const CALENDAR_NUMBER = /^\s*(\d{1,2}|(19|20)\d{2})\s*$/;

const isSensitive = (text: string) =>
    !CALENDAR_NUMBER.test(text) && SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));

function maskSensitiveContent(root: HTMLElement) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        const text = node.nodeValue ?? "";
        if (!parent || !text.trim() || parent.closest("script, style, [data-privacy-ignore]")) continue;
        if ((parent.textContent?.length ?? 0) > MAX_MASKED_TEXT_LENGTH) continue;
        if (isSensitive(text)) parent.setAttribute(MASK_ATTR, "");
    }

    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((field) => {
        if (field.type !== "hidden" && isSensitive(field.value)) field.setAttribute(MASK_ATTR, "");
    });
}

function unmaskAll() {
    document.querySelectorAll(`[${MASK_ATTR}]`).forEach((el) => el.removeAttribute(MASK_ATTR));
}

export function PrivacyModeToggle() {
    const [enabled, setEnabled] = useState(false);

    // Restore the last choice, so a page refresh mid-demo stays hidden
    useEffect(() => {
        setEnabled(localStorage.getItem(STORAGE_KEY) === "on");
    }, []);

    // Ctrl + Shift + H toggles without reaching for the button
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.code === "KeyH") {
                e.preventDefault();
                setEnabled((on) => !on);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
        if (!enabled) {
            unmaskAll();
            return;
        }

        // Re-scan as pages, tables and modals render new content
        let frame = 0;
        const scan = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => maskSensitiveContent(document.body));
        };
        scan();
        const observer = new MutationObserver(scan);
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            unmaskAll();
        };
    }, [enabled]);

    return (
        <button
            type="button"
            onClick={() => setEnabled((on) => !on)}
            data-privacy-ignore
            title="Hide sensitive data (Ctrl + Shift + H)"
            className={cn(
                "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur transition-colors",
                enabled
                    ? "border-blue-500/40 bg-blue-600/90 text-white hover:bg-blue-600"
                    : "border-white/10 bg-neutral-900/90 text-white/70 hover:text-white"
            )}
        >
            {enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {enabled ? "Data hidden" : "Hide data"}
        </button>
    );
}
