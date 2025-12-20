"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DeveloperMode } from "@/components/ui/DeveloperMode";
import { KonamiTrigger } from "@/components/ui/KonamiTrigger";
import Chatbot from "@/components/chatbot/Chatbot";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard");
    const isLogin = pathname?.startsWith("/login");
    const isPortal = pathname?.startsWith("/portal");
    const showLayout = !isDashboard && !isLogin && !isPortal;

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <LanguageProvider>
                {showLayout && <Header />}
                <main className={showLayout ? "min-h-screen pt-20" : ""}>
                    {children}
                </main>
                {showLayout && (
                    <>
                        <DeveloperMode />
                        <KonamiTrigger />
                        <Chatbot />
                        <Footer />
                        <CookieConsent />
                    </>
                )}
                {!showLayout && <CookieConsent />}
            </LanguageProvider>
        </GoogleOAuthProvider>
    );
}
