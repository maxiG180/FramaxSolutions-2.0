"use client";

import { useLanguage } from "@/context/LanguageContext";
import { PrivacyEN } from "./components/PrivacyEN";
import { PrivacyPT } from "./components/PrivacyPT";

export default function PrivacyPolicy() {
    const { language } = useLanguage();

    return language === "pt" ? <PrivacyPT /> : <PrivacyEN />;
}
