"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useState } from "react";

const PROJECTS = [
    {
        id: 1,
        title: "Lumina Finance",
        category: "Fintech Platform",
        description: "A next-gen dashboard for crypto asset management. Real-time data visualization with 0ms latency.",
        color: "from-blue-500 to-cyan-400",
        link: "#"
    },
    {
        id: 2,
        title: "Velvet & Oak",
        category: "E-commerce",
        description: "Luxury furniture store with 3D product previews and AI-driven recommendations.",
        color: "from-amber-500 to-orange-400",
        link: "#"
    },
    {
        id: 3,
        title: "Nexus Health",
        category: "SaaS Application",
        description: "Patient management system streamlining workflow for over 500+ clinics worldwide.",
        color: "from-emerald-500 to-green-400",
        link: "#"
    }
];

export function Portfolio() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
                        Selected <span className="text-primary">Work</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-2xl"
                    >
                        We don't just write code. We build digital empires that scale, convert, and impress.
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
