"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Github, Linkedin, Heart, Facebook, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-muted/30 border-t border-border py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="mb-4 block">
                            <Image
                                src="/logos/framax-logo-white.png"
                                alt="Framax Solutions"
                                width={160}
                                height={160}
                                className="h-auto w-40"
                            />
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            {t.footer.tagline}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">{t.footer.product}</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.features}</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.changelog}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">{t.footer.studio}</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.about}</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.blog}</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.careers}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">{t.footer.legal}</h3>
                        <ul className="space-y-2">
                            <li><Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.privacy}</Link></li>
                            {/* <li><Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.terms}</Link></li> */}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                        © {new Date().getFullYear()} Framax Solutions. {t.footer.rights}
                    </p>

                    <div className="flex items-center gap-4">
                        <Link href="https://www.facebook.com/profile.php?id=61575606540556" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                            <Facebook size={20} />
                        </Link>
                        <Link href="mailto:contact@framaxsolutions.com" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                            <Mail size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
