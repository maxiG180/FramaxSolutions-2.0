"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

// Static placeholder images — no JS animation, no requestAnimationFrame
const PREVIEW_IMAGES = [
    "https://images.unsplash.com/photo-1551288049-bbda3865cbb7?auto=format&fit=crop&q=60&w=800",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=60&w=800",
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=60&w=800",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=60&w=800",
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=60&w=800",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=60&w=800",
];

export function NewPortfolio() {
    const { t } = useLanguage();

    return (
        <section id="portfolio" className="py-32 bg-background overflow-hidden">
            {/* Section Header */}
            <div className="container mx-auto px-4 mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full border border-primary/20"
                >
                    {t.portfolio.badge}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                >
                    {t.portfolio.title} <span className="text-primary">{t.portfolio.titleHighlight}</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground max-w-2xl mx-auto"
                >
                    {t.portfolio.subtitle}
                </motion.p>
            </div>

            {/* Static blurred grid — replaces the JS-animated carousel */}
            <div className="relative w-full py-10">
                {/* Static grid of preview images, blurred + greyscaled */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 px-4 opacity-30 grayscale blur-[6px] pointer-events-none select-none">
                    {PREVIEW_IMAGES.map((src, i) => (
                        <div key={i} className="aspect-video rounded-xl overflow-hidden bg-card">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt=""
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Coming Soon overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-white/10 uppercase select-none">
                            {t.portfolio.comingSoon}
                        </h3>
                    </motion.div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 mt-12 flex justify-center">
                <a
                    href="#booking"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {t.portfolio.startProject}
                </a>
            </div>
        </section>
    );
}
