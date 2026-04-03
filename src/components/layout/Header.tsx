"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    // Native passive scroll listener — much cheaper than framer-motion useScroll
    // which subscribes to every animation frame. This only fires when threshold changes.
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50;
            setIsScrolled(prev => prev !== scrolled ? scrolled : prev);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

    return (
        <header
            className={cn(
                "sticky left-0 right-0 z-[9999] transition-all duration-300",
                isScrolled
                    ? "bg-background/95 backdrop-blur-md border-b border-border/50 py-3"
                    : "bg-transparent py-5",
            )}
            style={{ top: 'env(safe-area-inset-top)' }}
        >
            <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                {/* Left - Logo */}
                <Link href="/#hero" className="flex items-center shrink-0 z-10 transition-all duration-300">
                    <Image
                        src="/logos/framax-logo-white.png"
                        alt="Framax Solutions"
                        width={200}
                        height={200}
                        priority
                        style={{ width: 'auto', height: 'auto' }}
                        className="w-32 sm:w-40 md:w-48 transition-all"
                    />
                </Link>

                {/* Center - Navigation (Desktop) */}
                <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 lg:gap-10">
                    <Link href="/#features" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105 active:scale-95">
                        {t.header.features}
                    </Link>
                    <Link href="/about" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105 active:scale-95">
                        {t.header.about}
                    </Link>
                    <Link href="/#portfolio" className="text-sm font-semibold hover:text-primary transition-all hover:scale-105 active:scale-95">
                        {t.header.portfolio}
                    </Link>
                </nav>

                {/* Right - Language Switcher & Actions */}
                <div className="flex items-center gap-3 lg:gap-6 shrink-0">
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link href="/#booking" className="hidden lg:block bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                            {t.header.getStarted}
                        </Link>
                    </div>

                    <button
                        className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setIsMobileMenuOpen(prev => !prev)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 md:hidden flex flex-col gap-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                        href="/#features"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={closeMobileMenu}
                    >
                        {t.header.features}
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={closeMobileMenu}
                    >
                        {t.header.about}
                    </Link>
                    <Link
                        href="/#portfolio"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={closeMobileMenu}
                    >
                        {t.header.portfolio}
                    </Link>

                    <Link
                        href="/#booking"
                        className="bg-primary text-primary-foreground w-full py-3 rounded-full text-sm font-medium text-center"
                        onClick={closeMobileMenu}
                    >
                        {t.header.getStarted}
                    </Link>
                    <div className="p-2">
                        <LanguageSwitcher />
                    </div>
                </div>
            )}
        </header>
    );
}
