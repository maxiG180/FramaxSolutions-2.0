"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "pt";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
}

export const translations = {
    en: {
        header: {
            features: "Features",
            portfolio: "Portfolio",
            whyFramax: "Why Framax",
            process: "Process",
            faq: "FAQ",
            getStarted: "Get Started",
            results: "Results",
        },
    },
    pt: {
        header: {
            features: "Funcionalidades",
            portfolio: "Portfólio",
            whyFramax: "Porquê Framax",
            process: "Processo",
            faq: "Perguntas Frequentes",
            getStarted: "Começar",
            results: "Resultados",
        },
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

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
