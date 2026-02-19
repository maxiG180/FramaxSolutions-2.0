"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Users, CheckCircle2 } from "lucide-react";

const companies = [
    { name: "TechStart", icon: "⚡" },
    { name: "Bloom", icon: "🌸" },
    { name: "Urban", icon: "👕" },
    { name: "Health+", icon: "🏥" },
    { name: "Construct", icon: "🏗️" },
    { name: "Fresh", icon: "🥗" },
    { name: "EduLearn", icon: "📚" },
    { name: "Solar", icon: "☀️" },
];

const stats = [
    { label: "Clientes Satisfeitos", value: "50+", icon: Users },
    { label: "Receita Gerada", value: "$10M+", icon: TrendingUp },
    { label: "Sucesso nos Projetos", value: "100%", icon: CheckCircle2 },
];

export function SocialProof() {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <section id="social-proof" className="py-24 bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center max-w-3xl mx-auto"
                >
                    <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        Confiado por <span className="text-primary">Líderes da Indústria</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Já ajudámos dezenas de empresas a escalar a sua presença digital.
                    </p>
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                            <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <span className="text-4xl font-bold text-foreground mb-2">{stat.value}</span>
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Logo Marquee */}
                <div className="relative w-full overflow-hidden py-10 border-y border-border/50 bg-muted/20 backdrop-blur-sm">
                    <div className="flex w-full">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="flex min-w-full shrink-0 items-center justify-around gap-16 px-8"
                        >
                            {[...companies, ...companies].map((company, i) => (
                                <div key={i} className="flex items-center gap-2 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0 cursor-pointer group">
                                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{company.icon}</span>
                                    <span className="text-xl font-bold text-foreground/80">{company.name}</span>
                                </div>
                            ))}
                        </motion.div>
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="flex min-w-full shrink-0 items-center justify-around gap-16 px-8"
                        >
                            {[...companies, ...companies].map((company, i) => (
                                <div key={`dup-${i}`} className="flex items-center gap-2 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0 cursor-pointer group">
                                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{company.icon}</span>
                                    <span className="text-xl font-bold text-foreground/80">{company.name}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
                </div>
            </div>
        </section>
    );
}
