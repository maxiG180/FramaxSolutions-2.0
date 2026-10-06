"use client";

import { useLanguage, useLocalePath } from "@/context/LanguageContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
    const { t } = useLanguage();
    const localePath = useLocalePath();

    return (
        <div className="bg-background text-foreground">
            {/* Intro */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-28 md:pb-28">
                <p className="flex items-center gap-3 mb-8 text-sm font-medium tracking-wide text-neutral-400">
                    <span className="h-px w-8 bg-primary" />
                    {t.about.eyebrow}
                </p>
                <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-foreground">
                    {t.about.title}
                </h1>
                <p className="mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-neutral-400">
                    {t.about.introduction}
                </p>
            </section>

            {/* How we work */}
            <section className="border-t border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 grid lg:grid-cols-[1fr_2fr] gap-12">
                    <h2 className="text-2xl md:text-3xl font-bold">{t.about.howWeWorkTitle}</h2>
                    <div className="grid sm:grid-cols-2 gap-x-10 gap-y-12">
                        {t.about.principles.map((principle, i) => (
                            <div key={principle.title}>
                                <span className="font-mono text-sm text-primary">0{i + 1}</span>
                                <h3 className="mt-3 text-lg font-semibold">{principle.title}</h3>
                                <p className="mt-2 leading-relaxed text-neutral-400">{principle.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What we build */}
            <section className="border-t border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 grid lg:grid-cols-[1fr_2fr] gap-12">
                    <h2 className="text-2xl md:text-3xl font-bold">{t.about.whatWeBuildTitle}</h2>
                    <div className="grid sm:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
                        {t.about.services.map((service) => (
                            <div key={service.title} className="bg-background p-6 md:p-8">
                                <h3 className="text-lg font-semibold">{service.title}</h3>
                                <p className="mt-2 leading-relaxed text-neutral-400">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to action */}
            <section className="border-t border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <h2 className="max-w-3xl text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                        {t.about.ctaTitle}
                    </h2>
                    <p className="mt-6 text-lg text-neutral-400">{t.about.ctaText}</p>
                    <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link
                            href={localePath("/#booking")}
                            className="group inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors"
                        >
                            {t.about.ctaButton}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href={localePath("/")}
                            className="text-base font-medium text-neutral-300 hover:text-white underline-offset-8 hover:underline transition-colors"
                        >
                            {t.about.backHome}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
