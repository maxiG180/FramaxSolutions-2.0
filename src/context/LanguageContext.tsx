"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "pt";

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
    // Always initialize with 'en' to match server-side rendering
    const [language, setLanguage] = useState<Language>("en");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // This runs only on the client, after hydration
        const initLanguage = () => {
            // Check if we're in the dashboard
            const isDashboard = window.location.pathname.startsWith('/dashboard');

            if (isDashboard) {
                // Dashboard ALWAYS defaults to Portuguese (ignore saved preference for now)
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
