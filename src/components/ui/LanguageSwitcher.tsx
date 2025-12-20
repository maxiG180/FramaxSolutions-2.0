"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "pt" : "en");
    };

    return (
        <button
            onClick={toggleLanguage}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-muted font-medium text-xs uppercase",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            aria-label="Switch language"
        >
            <Globe className="h-4 w-4" />
            <span>{language}</span>
        </button>
    );
}
