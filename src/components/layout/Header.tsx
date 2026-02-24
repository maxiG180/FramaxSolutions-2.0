"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Header() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const shouldBeScrolled = latest > 50;
        if (shouldBeScrolled !== isScrolled) {
            setIsScrolled(shouldBeScrolled);
        }
    });

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3"
                    : "bg-transparent py-5",
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Left - Logo */}
                <Link href="/#hero" className="flex items-center z-10">
                    <Image
                        src="/logos/framax-logo-white.png"
                        alt="Framax Solutions"
                        width={200}
                        height={200}
                        priority
                        style={{ width: 'auto', height: 'auto' }}
                        className="w-48"
                    />
                </Link>

                {/* Center - Navigation (Desktop) */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
                        {t.header.features}
                    </Link>
                    <Link href="/#portfolio" className="text-sm font-medium hover:text-primary transition-colors">
                        {t.header.portfolio}
                    </Link>
                    <Link href="/#booking" className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                        {t.header.getStarted}
                    </Link>
                </nav>

                {/* Right - Language Switcher & Mobile Menu Button */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <LanguageSwitcher />
                    </div>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 md:hidden flex flex-col gap-4 shadow-lg"
                >
                    <Link
                        href="/#features"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t.header.features}
                    </Link>
                    <Link
                        href="/#portfolio"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t.header.portfolio}
                    </Link>

                    <Link
                        href="/#booking"
                        className="bg-primary text-primary-foreground w-full py-3 rounded-full text-sm font-medium text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t.header.getStarted}
                    </Link>
                    <div className="p-2">
                        <LanguageSwitcher />
                    </div>
                </motion.div>
            )}
        </header>
    );
}
