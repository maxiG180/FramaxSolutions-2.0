



"use client";

import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DeveloperMode } from "@/components/ui/DeveloperMode";
import { KonamiTrigger } from "@/components/ui/KonamiTrigger";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isLogin = pathname?.startsWith("/login");
  const showLayout = !isDashboard && !isLogin;

  return (
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${inter.variable} antialiased font-sans bg-background text-foreground overflow-x-hidden`}
      >
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
                <Footer />
              </>
            )}
          </LanguageProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
