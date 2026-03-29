"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function Portfolio() {
    const { t } = useLanguage();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const PROJECTS = [
        {
            id: 1,
            title: t.portfolio.project1Title,
            category: t.portfolio.project1Category,
            description: t.portfolio.project1Description,
            color: "from-blue-500 to-cyan-400",
            link: "#"
        },
        {
            id: 2,
            title: t.portfolio.project2Title,
            category: t.portfolio.project2Category,
            description: t.portfolio.project2Description,
            color: "from-amber-500 to-orange-400",
            link: "#"
        },
        {
            id: 3,
            title: t.portfolio.project3Title,
            category: t.portfolio.project3Category,
            description: t.portfolio.project3Description,
            color: "from-emerald-500 to-green-400",
            link: "#"
        }
    ];

    return (
        <section id="portfolio" className="py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        {t.portfolio.title} <span className="text-primary">{t.portfolio.titleHighlight}</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-2xl"
                    >
                        {t.portfolio.subtitle}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PROJECTS.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer border border-border/50 bg-card"
                        >
                            {/* Background Gradient / Image Placeholder */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

                            {/* Content Container */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="px-4 py-2 rounded-full bg-background/50 backdrop-blur-md border border-white/10 text-xs font-medium uppercase tracking-wider">
                                        {project.category}
                                    </span>
                                    <div className="w-12 h-12 rounded-full bg-background/50 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <ArrowUpRight className="w-6 h-6" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-bold mb-4 group-hover:translate-x-2 transition-transform duration-300">
                                        {project.title}
                                    </h3>
                                    <p className="text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors duration-300">
                                        {project.description}
                                    </p>
                                </div>
                            </div>

                            {/* Hover Overlay Effect */}
                            <motion.div
                                className="absolute inset-0 bg-primary/5 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
