"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getUrlLocale, localizePath, type Locale } from "@/lib/i18n-routes";

type Language = Locale;

import { en } from "@/locales/en";
import { pt } from "@/locales/pt";
import { Translation } from "@/locales/types";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translation;
    isLoaded: boolean; // Helper to know when language is determined
}

export const translations = {
    en,
    pt,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Pages under /pt are Portuguese from the first (server) render, so search engines
    // index them in Portuguese. Elsewhere, start with 'en' on both server and client
    // to match hydration, then apply the visitor's preference below.
    const urlLocale = getUrlLocale(usePathname());
    const [language, setLanguage] = useState<Language>(urlLocale ?? 'en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // This runs only on the client, after hydration
        const initLanguage = () => {
            // Check if we're in the dashboard
            const isDashboard = window.location.pathname.startsWith('/dashboard');

            if (urlLocale) {
                // The URL decides (e.g. /pt/about)
                setLanguage(urlLocale);
            } else if (isDashboard) {
                // Dashboard ALWAYS defaults to Portuguese
                setLanguage('pt');
                localStorage.setItem('framax_lang', 'pt');
            } else {
                // Landing page: check saved preference first, then browser language
                const savedLang = localStorage.getItem('framax_lang') as Language;
                if (savedLang && (savedLang === 'en' || savedLang === 'pt')) {
                    setLanguage(savedLang);
                } else {
                    const browserLang = navigator.language.toLowerCase();
                    if (browserLang.startsWith('pt')) {
                        setLanguage('pt');
                    }
                }
            }
            setIsLoaded(true);
        };

        initLanguage();
    }, []);

    // Follow client-side navigation into a /pt page
    useEffect(() => {
        if (urlLocale) setLanguage(urlLocale);
    }, [urlLocale]);

    // Keep <html lang> in sync (the root layout renders it as "en")
    useEffect(() => {
        document.documentElement.lang = language === 'pt' ? 'pt-PT' : 'en';
    }, [language]);

    // Persist language changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('framax_lang', language);
        }
    }, [language, isLoaded]);

    const value = {
        language,
        setLanguage,
        t: translations[language],
        isLoaded
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

/** Returns a function that turns an English path like "/about" or "/#booking" into the current language's URL */
export function useLocalePath() {
    const { language } = useLanguage();
    return useCallback((path: string) => localizePath(path, language), [language]);
}
