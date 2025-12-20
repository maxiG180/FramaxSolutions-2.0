"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
        setIsScrolled(latest > 50);
    });

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="#hero" className="text-2xl font-bold tracking-tighter">
                    <span className="text-[#2563eb]">Framax</span><span className="text-white">Solutions</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                        {t.header.features}
                    </Link>
                    <Link href="#portfolio" className="text-sm font-medium hover:text-primary transition-colors">
                        {t.header.portfolio}
                    </Link>

                    <Link href="#process" className="text-sm font-medium hover:text-primary transition-colors">
                        {t.header.process}
                    </Link>
                    <Link href="#booking" className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                        {t.header.getStarted}
                    </Link>
                    <LanguageSwitcher />
                </nav>

                <button
                    className="md:hidden p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
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
                        href="#features"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t.header.features}
                    </Link>
                    <Link
                        href="#portfolio"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t.header.portfolio}
                    </Link>
                    <Link
                        href="#process"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t.header.process}
                    </Link>
                    <Link
                        href="#booking"
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
