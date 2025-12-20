"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom-10 md:m-4 md:rounded-lg md:border md:max-w-xl md:bg-background/95 md:backdrop-blur">
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">We value your privacy</h3>
                        <p className="text-sm text-muted-foreground">
                            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                            <br />
                            <Link href="/legal/privacy" className="text-primary hover:underline mt-1 inline-block">
                                Read our Privacy Policy
                            </Link>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-muted-foreground hover:text-foreground md:hidden"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary/70 rounded-md transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
