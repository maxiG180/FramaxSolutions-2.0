"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Project {
    id: number;
    title: string;
    category: string;
    image: string;
    link: string;
    video?: string;
}

const PROJECTS: Project[] = [
    {
        id: 1,
        title: "Project Alpha",
        category: "Software",
        image: "https://images.unsplash.com/photo-1551288049-bbda3865cbb7?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 2,
        title: "Project Beta",
        category: "E-commerce",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 3,
        title: "Project Gamma",
        category: "Mobile",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 4,
        title: "Project Delta",
        category: "AI",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 5,
        title: "Project Epsilon",
        category: "SaaS",
        image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 6,
        title: "Project Zeta",
        category: "Web",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 7,
        title: "Project Eta",
        category: "Platform",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 8,
        title: "Project Theta",
        category: "Agency",
        image: "https://images.unsplash.com/photo-1501854140801-50d01674aa3e?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 9,
        title: "Project Iota",
        category: "Digital",
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 10,
        title: "Project Kappa",
        category: "Cloud",
        image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 11,
        title: "Project Lambda",
        category: "Interface",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    },
    {
        id: 12,
        title: "Project Mu",
        category: "Experience",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=60&w=800&blur=100",
        link: "#"
    }
];

// Duplicate projects for infinite loop (2x is sufficient for seamless looping)
const MARQUEE_PROJECTS = [...PROJECTS, ...PROJECTS];

const PortfolioItem = ({ project, onClick }: { project: Project; onClick: (link: string) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div
            className="relative group w-[300px] md:w-[450px] aspect-video rounded-2xl overflow-hidden bg-card border border-border/50 shrink-0"
        >
            <div className="block w-full h-full cursor-grab active:cursor-grabbing">
                {/* Image / Video */}
                {project.video ? (
                    <video
                        ref={videoRef}
                        src={project.video}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={project.image}
                        alt=""
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />



                {/* Content Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-medium text-white/70 mb-1">{project.category}</p>
                            <h3 className="text-xl font-bold text-white">{project.title}</h3>
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick(project.link);
                            }}
                            className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
                        >
                            <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function NewPortfolio() {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);

    // Motion values
    const x = useMotionValue(0);

    // Speed configuration
    const baseVelocity = -1.5; // Negative for right-to-left

    useEffect(() => {
        if (containerRef.current) {
            const totalWidth = containerRef.current.scrollWidth;
            const singleSetWidth = totalWidth / 2;
            setContentWidth(singleSetWidth);
            x.set(-singleSetWidth);
        }
    }, []);

    useAnimationFrame((t, delta) => {
        if (isDragging || !contentWidth || isHovered) return;

        const moveBy = baseVelocity * (delta / 16); // Normalize for 60fps

        let newX = x.get() + moveBy;

        if (newX <= -contentWidth * 2) {
            newX += contentWidth;
        } else if (newX > 0) {
            newX -= contentWidth;
        }

        x.set(newX);
    });

    const handleDragStart = () => {
        setIsDragging(true);
        isDraggingRef.current = true;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        // Keep isDraggingRef true for a moment to prevent click
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 150);
    };

    const handleCardClick = (link: string) => {
        if (!isDraggingRef.current) {
            window.open(link, '_blank');
        }
    };

    return (
        <section id="portfolio" className="py-32 bg-background overflow-hidden">
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
                    {t.portfolio.title} <span className="text-primary" suppressHydrationWarning>{t.portfolio.titleHighlight}</span>
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

            <div className="w-full relative pointer-events-none cursor-default py-10">
                <motion.div
                    ref={containerRef}
                    className="flex gap-8 w-max px-4 opacity-40 grayscale-[0.3] blur-[8px]"
                    style={{ x, willChange: 'transform' }}
                >
                    {MARQUEE_PROJECTS.map((project, index) => (
                        <PortfolioItem
                            key={`${project.id}-${index}`}
                            project={project}
                            onClick={() => { }}
                        />
                    ))}
                </motion.div>

                {/* Simple Coming Soon Text */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-white/10 uppercase select-none" suppressHydrationWarning>
                            {t.portfolio.comingSoon}
                        </h3>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 flex justify-center">
                <a href="#booking" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background" suppressHydrationWarning>
                    {t.portfolio.startProject}
                </a>
            </div>
        </section>
    );
}
