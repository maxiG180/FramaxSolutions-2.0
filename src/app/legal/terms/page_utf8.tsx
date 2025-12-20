"use client";

import { useLanguage } from "@/context/LanguageContext";
import { TermsEN } from "./components/TermsEN";
import { TermsPT } from "./components/TermsPT";

export default function TermsOfService() {
    const { language } = useLanguage();

    return language === "pt" ? <TermsPT /> : <TermsEN />;
}
