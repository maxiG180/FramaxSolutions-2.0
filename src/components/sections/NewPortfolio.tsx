"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Project {
    id: number;
    title: string;
    category: string;
    image: string;
    video?: string; // Optional demo video path
    link: string;
    description?: string;
}

// Empty for now: the section shows "Coming soon" until real projects are added here.
const PROJECTS: Project[] = [];

// Duplicate projects for infinite loop
const MARQUEE_PROJECTS = [...PROJECTS, ...PROJECTS, ...PROJECTS];

const PortfolioItem = ({ project, onClick }: { project: Project; onClick: (link: string) => void }) => {
    const [isDraggingCard, setIsDraggingCard] = useState(false);
    const [isHoveringItem, setIsHoveringItem] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const videoRef = useRef<HTMLVideoElement>(null);

    // Handle video playback on hover
    useEffect(() => {
        if (videoRef.current) {
            if (isHoveringItem) {
                videoRef.current.play().catch(() => {
                    // Ignore autoplay errors (some browsers require user interaction)
                });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isHoveringItem]);

    return (
        <motion.div
            className="relative group w-[300px] md:w-[450px] aspect-video rounded-2xl overflow-hidden bg-card border border-border/50 shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setIsHoveringItem(true)}
            onMouseLeave={() => setIsHoveringItem(false)}
        >
            <div
                className="block w-full h-full cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                    startPos.current = { x: e.clientX, y: e.clientY };
                    setIsDraggingCard(false);
                }}
                onMouseMove={(e) => {
                    const dx = Math.abs(e.clientX - startPos.current.x);
                    const dy = Math.abs(e.clientY - startPos.current.y);
                    if (dx > 5 || dy > 5) {
                        setIsDraggingCard(true);
                    }
                }}
                onMouseUp={() => {
                    if (!isDraggingCard && project.link !== "#") {
                        onClick(project.link);
                    }
                    setIsDraggingCard(false);
                }}
            >
                {/* Static Image - shown by default */}
                <img
                    src={project.image}
                    alt={project.title}
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                    className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${isHoveringItem && project.video ? 'opacity-0' : 'opacity-100'
                        }`}
                />

                {/* Demo Video - shown on hover */}
                {project.video && (
                    <video
                        ref={videoRef}
                        src={project.video}
                        muted
                        loop
                        playsInline
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                        className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${isHoveringItem ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Visit Website Hint - appears on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-white backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-xl border-2 border-primary/20">
                        <ExternalLink className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-gray-900">Visit Website</span>
                    </div>
                </div>

                {/* Content Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-medium text-white/70 mb-1">{project.category}</p>
                            <h3 className="text-xl font-bold text-white">{project.title}</h3>
                        </div>
                        <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                            <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ProjectCarousel = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);

    // Motion values
    const x = useMotionValue(0);

    // Speed configuration
    const baseVelocity = -0.5; // Negative for right-to-left

    useEffect(() => {
        if (containerRef.current) {
            const totalWidth = containerRef.current.scrollWidth;
            const singleSetWidth = totalWidth / 3;
            setContentWidth(singleSetWidth);
            x.set(-singleSetWidth);
        }
    }, [x]);

    useAnimationFrame((t, delta) => {
        if (isDragging || !contentWidth) return;

        let moveBy = baseVelocity * (delta / 16); // Normalize for 60fps

        if (isHovered) {
            moveBy *= 0.3; // Slow down on hover
        }

        let newX = x.get() + moveBy;

        // Seamless loop logic
        if (newX <= -contentWidth * 2) {
            newX = -contentWidth;
        } else if (newX >= 0) {
            newX = -contentWidth;
        }

        x.set(newX);
    });

    const handleProjectClick = (link: string) => {
        if (link && link !== "#") {
            window.open(link, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="relative w-full overflow-hidden py-10">
            <motion.div
                ref={containerRef}
                className="flex gap-6"
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -contentWidth * 2, right: 0 }}
                onDragStart={() => {
                    setIsDragging(true);
                    isDraggingRef.current = true;
                }}
                onDragEnd={() => {
                    setIsDragging(false);
                    isDraggingRef.current = false;
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {MARQUEE_PROJECTS.map((project, index) => (
                    <PortfolioItem
                        key={`${project.id}-${index}`}
                        project={project}
                        onClick={handleProjectClick}
                    />
                ))}
            </motion.div>
        </div>
    );
};

const ComingSoon = ({ label }: { label: string }) => (
    <div className="container mx-auto px-4 py-10">
        <div className="relative max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 blur-[6px] opacity-60 select-none" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`aspect-video rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${i > 0 ? "hidden md:block" : ""}`}
                    >
                        <div className="flex gap-1.5 mb-5">
                            <span className="w-2 h-2 rounded-full bg-white/20" />
                            <span className="w-2 h-2 rounded-full bg-white/20" />
                            <span className="w-2 h-2 rounded-full bg-white/20" />
                        </div>
                        <div className="h-3 w-2/3 rounded bg-white/15 mb-2" />
                        <div className="h-3 w-1/2 rounded bg-white/10 mb-6" />
                        <div className="h-1/3 rounded-lg bg-primary/20" />
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-5 py-2 rounded-full border border-white/15 bg-background text-sm font-medium tracking-wide text-neutral-200">
                    {label}
                </span>
            </div>
        </div>
    </div>
);

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
                    suppressHydrationWarning
                >
                    {t.portfolio.badge}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                    suppressHydrationWarning
                >
                    {t.portfolio.title} <span className="text-primary">{t.portfolio.titleHighlight}</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground max-w-2xl mx-auto"
                    suppressHydrationWarning
                >
                    {t.portfolio.subtitle}
                </motion.p>
            </div>

            {PROJECTS.length > 0 ? <ProjectCarousel /> : <ComingSoon label={t.portfolio.comingSoon} />}

            {/* CTA */}
            <div className="container mx-auto px-4 mt-12 flex justify-center">
                <a
                    href="#booking"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    suppressHydrationWarning
                >
                    {t.portfolio.startProject}
                </a>
            </div>
        </section>
    );
}
