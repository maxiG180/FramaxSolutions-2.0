"use client";

import { useLanguage } from "@/context/LanguageContext";
import { LinkedInCard } from "@/components/ui/LinkedInCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide uppercase"
                    >
                        Framax Solutions
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">
                        {t.about.title}
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-blue-400 font-medium mb-8">
                        {t.about.subtitle}
                    </p>
                    
                    <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full mb-10" />
                    
                    <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
                        {t.about.introduction}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-10 max-w-5xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <LinkedInCard
                            name={t.about.maksym.name}
                            role={t.about.maksym.role}
                            description={t.about.maksym.description}
                            linkedinUrl="https://www.linkedin.com/in/maksym-grebeniuk-7a8b63174/"
                            imageUrl="/Maksym.png"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <LinkedInCard
                            name={t.about.francisco.name}
                            role={t.about.francisco.role}
                            description={t.about.francisco.description}
                            linkedinUrl="https://www.linkedin.com/in/franciscoofarias/"
                            imageUrl="/Francisco.png"
                        />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-8"
                >
                    <Link 
                        href="/#booking" 
                        className="group flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                    >
                        {t.about.cta}
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    
                    <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                        ← Voltar para a página inicial
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
