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
}

export const translations = {
    en,
    pt,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('pt')) {
            setLanguage('pt');
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
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
