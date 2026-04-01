"use client";

import { useLanguage } from "@/context/LanguageContext";
import { LinkedInCard } from "@/components/ui/LinkedInCard";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { 
    ArrowRight, 
    Lightbulb, 
    ShieldCheck, 
    Rocket, 
    Target, 
    Eye, 
    Coffee, 
    CodeXml, 
    CheckCircle2,
    Trophy,
    LucideIcon
} from "lucide-react";
import { useRef } from "react";

// --- Components ---

const StatItem = ({ value, label, icon: Icon }: { value: string, label: string, icon: LucideIcon }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
    >
        <div className="p-3 bg-blue-600/20 rounded-xl mb-4 text-blue-400">
            <Icon size={24} />
        </div>
        <div className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-white/50 font-medium uppercase tracking-wider">{label}</div>
    </motion.div>
);

const ValueCard = ({ title, description, icon: Icon, delay }: { title: string, description: string, icon: LucideIcon, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="group p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
    >
        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform group-hover:bg-blue-600 group-hover:text-white">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/60 leading-relaxed">{description}</p>
    </motion.div>
);

// --- Page ---

export default function AboutPage() {
    const { t } = useLanguage();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div ref={containerRef} className="relative min-h-screen bg-background text-foreground selection:bg-blue-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] right-[5%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        style={{ opacity, scale }}
                        className="max-w-5xl mx-auto text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide uppercase"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            The Framax Story
                        </motion.div>
                        
                        <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter text-white leading-[0.9]">
                            {t.about.title.split(' ').map((word, i) => (
                                <motion.span 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="inline-block mr-4"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </h1>
                        
                        <p className="text-xl md:text-3xl text-blue-400 font-medium mb-12 max-w-3xl mx-auto leading-tight italic">
                            "{t.about.subtitle}"
                        </p>
                        
                        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-transparent mx-auto rounded-full mb-12" />
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg md:text-2xl text-white/70 leading-relaxed max-w-4xl mx-auto font-light"
                        >
                            {t.about.introduction}
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative z-10 py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-md">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <StatItem icon={Target} value={t.about.stats.projects} label={t.about.stats.projectsLabel} />
                        <StatItem icon={CheckCircle2} value={t.about.stats.clients} label={t.about.stats.clientsLabel} />
                        <StatItem icon={Coffee} value={t.about.stats.coffee} label={t.about.stats.coffeeLabel} />
                        <StatItem icon={CodeXml} value={t.about.stats.hours} label={t.about.stats.hoursLabel} />
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="relative z-10 py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative group p-10 bg-gradient-to-br from-blue-600/10 to-transparent rounded-[3rem] border border-blue-500/10 overflow-hidden"
                        >
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors" />
                            <Target className="text-blue-500 mb-6" size={48} />
                            <h2 className="text-4xl font-bold text-white mb-6">{t.about.missionTitle}</h2>
                            <p className="text-xl text-white/70 leading-relaxed">
                                {t.about.missionDesc}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative group p-10 bg-gradient-to-br from-purple-600/10 to-transparent rounded-[3rem] border border-purple-500/10 overflow-hidden text-right md:text-left flex flex-col items-end md:items-start"
                        >
                            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors" />
                            <Eye className="text-purple-500 mb-6" size={48} />
                            <h2 className="text-4xl font-bold text-white mb-6">{t.about.visionTitle}</h2>
                            <p className="text-xl text-white/70 leading-relaxed">
                                {t.about.visionDesc}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="relative z-10 py-24 md:py-32 bg-white/[0.01]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t.about.valuesTitle}</h2>
                        <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        <ValueCard 
                            icon={Lightbulb} 
                            title={t.about.values.innovationTitle} 
                            description={t.about.values.innovationDesc} 
                            delay={0.1}
                        />
                        <ValueCard 
                            icon={ShieldCheck} 
                            title={t.about.values.transparencyTitle} 
                            description={t.about.values.transparencyDesc} 
                            delay={0.2}
                        />
                        <ValueCard 
                            icon={Trophy} 
                            title={t.about.values.resultsTitle} 
                            description={t.about.values.resultsDesc} 
                            delay={0.3}
                        />
                        <ValueCard 
                            icon={Rocket} 
                            title={t.about.values.resilienceTitle} 
                            description={t.about.values.resilienceDesc} 
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="relative z-10 py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Meet the Founders</h2>
                        <p className="text-white/50 text-xl font-light">The strategic minds powering your digital evolution.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <LinkedInCard
                                name={t.about.maksym.name}
                                role={t.about.maksym.role}
                                description={t.about.maksym.description}
                                linkedinUrl="https://www.linkedin.com/in/maksym-grebeniuk-7a8b63174/"
                                imageUrl="/Maksym.png"
                                viewProfileLabel={t.about.viewProfile}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <LinkedInCard
                                name={t.about.francisco.name}
                                role={t.about.francisco.role}
                                description={t.about.francisco.description}
                                linkedinUrl="https://www.linkedin.com/in/franciscoofarias/"
                                imageUrl="/Francisco.png"
                                viewProfileLabel={t.about.viewProfile}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-24 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto bg-gradient-to-b from-blue-600 to-blue-800 rounded-[3rem] p-12 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl -ml-32 -mb-32" />

                        <h3 className="text-3xl md:text-5xl font-black text-white mb-8 relative z-10">
                            {t.about.cta}
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                            <Link 
                                href="/#booking" 
                                className="group flex items-center gap-3 px-10 py-5 bg-white text-blue-600 hover:bg-blue-50 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                            >
                                Get Started
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link 
                                href="/" 
                                className="text-white/80 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <footer className="relative z-10 py-12 text-center text-white/30 text-sm">
                © {new Date().getFullYear()} Framax Solutions. All rights reserved.
            </footer>
        </div>
    );
}
