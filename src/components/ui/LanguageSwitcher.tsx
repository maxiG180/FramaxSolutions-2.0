"use client";

import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "pt" : "en");
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Language"
        >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{language}</span>
        </button>
    );
}
