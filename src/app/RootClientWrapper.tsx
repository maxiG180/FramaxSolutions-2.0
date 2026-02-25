"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Lazy-load interaction-only components — keeps initial bundle lean
const DeveloperMode = dynamic(() => import('@/components/ui/DeveloperMode').then(m => ({ default: m.DeveloperMode })), { ssr: false });
const KonamiTrigger = dynamic(() => import('@/components/ui/KonamiTrigger').then(m => ({ default: m.KonamiTrigger })), { ssr: false });
const EasterEggs = dynamic(() => import('@/components/ui/EasterEggs').then(m => ({ default: m.EasterEggs })), { ssr: false });
const Chatbot = dynamic(() => import('@/components/chatbot/Chatbot'), { ssr: false });

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
    // Only load Google OAuth SDK on routes that actually use it — saves ~45KB on homepage
    const needsOAuth = isDashboard || isLogin || isPortal;

    const content = (
        <LanguageProvider>
            {showLayout && <Header />}
            <main className={showLayout ? "min-h-screen pt-20" : ""}>
                {children}
            </main>
            {showLayout && (
                <>
                    <DeveloperMode />
                    <KonamiTrigger />
                    <EasterEggs />
                    <Chatbot />
                    <Footer />
                    <CookieConsent />
                </>
            )}
            {!showLayout && <CookieConsent />}
        </LanguageProvider>
    );

    if (needsOAuth) {
        return (
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                {content}
            </GoogleOAuthProvider>
        );
    }

    return content;
}
