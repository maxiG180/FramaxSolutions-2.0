"use client";

import { useLanguage } from "@/context/LanguageContext";

const technologies = [
    { name: "Next.js", url: "https://cdn.simpleicons.org/nextdotjs/000000/ffffff" },
    { name: "React", url: "https://cdn.simpleicons.org/react/61DAFB" },
    { name: "TypeScript", url: "https://cdn.simpleicons.org/typescript/3178C6" },
    { name: "Tailwind CSS", url: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
    { name: "Framer", url: "https://cdn.simpleicons.org/framer/0055FF" },
    { name: "Stripe", url: "https://cdn.simpleicons.org/stripe/635BFF" },
    { name: "Vercel", url: "https://cdn.simpleicons.org/vercel/000000/ffffff" },
    { name: "PostgreSQL", url: "https://cdn.simpleicons.org/postgresql/4169E1" },
    { name: "Node.js", url: "https://cdn.simpleicons.org/nodedotjs/339933" },
    { name: "Supabase", url: "https://cdn.simpleicons.org/supabase/3ECF8E" }
];

export function TechStack() {
    const { t } = useLanguage();

    return (
        <section className="border-y border-border bg-background/50 py-10 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
                    {t.techStack.poweredBy}
                </p>
                {/* Desktop Version */}
                <div className="relative hidden w-full overflow-hidden md:flex">
                    <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around gap-10">
                        {technologies.map((tech, i) => (
                            <div key={i} className="flex items-center gap-2 transition-all duration-300 hover:scale-110">
                                {/* Using img tag for external SVGs to avoid Next.js Image config issues for now */}
                                <img
                                    src={tech.url}
                                    alt={tech.name}
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around gap-10" aria-hidden="true">
                        {technologies.map((tech, i) => (
                            <div key={`duplicate-${i}`} className="flex items-center gap-2 transition-all duration-300 hover:scale-110">
                                <img
                                    src={tech.url}
                                    alt={tech.name}
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent" />
                </div>

                {/* Mobile Version */}
                <div className="relative flex w-full overflow-hidden md:hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="animate-marquee flex min-w-full shrink-0 items-center justify-start gap-8 pr-8">
                        {technologies.map((tech, i) => (
                            <div key={i} className="flex shrink-0 items-center gap-2 transition-all duration-300 hover:scale-110">
                                <img
                                    src={tech.url}
                                    alt={tech.name}
                                    className="h-6 w-auto object-contain"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="animate-marquee flex min-w-full shrink-0 items-center justify-start gap-8 pr-8" aria-hidden="true">
                        {technologies.map((tech, i) => (
                            <div key={`duplicate-${i}`} className="flex shrink-0 items-center gap-2 transition-all duration-300 hover:scale-110">
                                <img
                                    src={tech.url}
                                    alt={tech.name}
                                    className="h-6 w-auto object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
