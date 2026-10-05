"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LOCALIZED_PATHS, localizePath, stripLocale } from "@/lib/i18n-routes";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const toggleLanguage = () => {
        const next = language === "en" ? "pt" : "en";
        setLanguage(next);

        // Pages with a /pt version: go to the other language's URL (/about <-> /pt/about)
        const basePath = stripLocale(pathname ?? "/");
        if ((LOCALIZED_PATHS as readonly string[]).includes(basePath)) {
            router.push(localizePath(basePath, next) + window.location.hash, { scroll: false });
        }
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
