"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
        title: "Framax Solutions",
        category: "Digital Agency",
        image: "linear-gradient(to bottom right, #2563eb, #1d4ed8)",
        video: "/videos/framax-scroll.mp4",
        link: "https://www.framaxsolutions.com/"
    },
    {
        id: 2,
        title: "Velvet & Oak",
        category: "E-commerce",
        image: "linear-gradient(to bottom right, #f59e0b, #f97316)",
        link: "https://velvet-oak.example.com"
    },
    {
        id: 3,
        title: "Framax Solutions",
        category: "Digital Agency",
        image: "linear-gradient(to bottom right, #2563eb, #1d4ed8)",
        video: "/videos/framax-scroll.mp4",
        link: "https://www.framaxsolutions.com/"
    },
    {
        id: 4,
        title: "Aether Systems",
        category: "AI Infra",
        image: "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
        link: "https://aether.example.com"
    },
    {
        id: 5,
        title: "Solaris Energy",
        category: "Clean Tech",
        image: "linear-gradient(to bottom right, #eab308, #f97316)",
        link: "https://solaris.example.com"
    },
    {
        id: 6,
        title: "Quantum Leap",
        category: "Research",
        image: "linear-gradient(to bottom right, #6366f1, #a855f7)",
        link: "https://quantum.example.com"
    },
    {
        id: 7,
        title: "Cyber Shield",
        category: "Security",
        image: "linear-gradient(to bottom right, #ef4444, #b91c1c)",
        link: "https://cybershield.example.com"
    },
    {
        id: 8,
        title: "Eco Pulse",
        category: "Environment",
        image: "linear-gradient(to bottom right, #84cc16, #15803d)",
        link: "https://ecopulse.example.com"
    },
    {
        id: 9,
        title: "Urban Flow",
        category: "Smart City",
        image: "linear-gradient(to bottom right, #0ea5e9, #0369a1)",
        link: "https://urbanflow.example.com"
    },
    {
        id: 10,
        title: "Mindful AI",
        category: "Wellness",
        image: "linear-gradient(to bottom right, #f472b6, #db2777)",
        link: "https://mindful.example.com"
    },
    {
        id: 11,
        title: "Orbit Logistics",
        category: "Supply Chain",
        image: "linear-gradient(to bottom right, #f97316, #c2410c)",
        link: "https://orbit.example.com"
    },
    {
        id: 12,
        title: "Deep Blue",
        category: "Oceanography",
        image: "linear-gradient(to bottom right, #1e40af, #1e3a8a)",
        link: "https://deepblue.example.com"
    }
];

// Duplicate projects for infinite loop
const MARQUEE_PROJECTS = [...PROJECTS, ...PROJECTS, ...PROJECTS];

const PortfolioItem = ({ project, onClick }: { project: Project; onClick: (link: string) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <motion.div
            className="relative group w-[300px] md:w-[450px] aspect-video rounded-2xl overflow-hidden bg-card border border-border/50 shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => videoRef.current?.play()}
            onMouseLeave={() => {
                if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                }
            }}
        >
            <div className="block w-full h-full cursor-grab active:cursor-grabbing">
                {/* Image / Gradient Placeholder / Video */}
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
                    <div
                        className="absolute inset-0"
                        style={{ background: project.image }}
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
        </motion.div>
    );
};

export function NewPortfolio() {
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
            const singleSetWidth = totalWidth / 3;
            setContentWidth(singleSetWidth);
            x.set(-singleSetWidth);
        }
    }, []);

    useAnimationFrame((t, delta) => {
        if (isDragging || !contentWidth) return;

        let moveBy = baseVelocity * (delta / 16); // Normalize for 60fps

        if (isHovered) {
            moveBy = 0;
        }

        let newX = x.get() + moveBy;

        if (newX <= -contentWidth * 2) {
            newX += contentWidth;
        } else if (newX > -contentWidth) {
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
                >
                    Showcase
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                >
                    Made with <span className="text-primary">Passion</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground max-w-2xl mx-auto"
                >
                    Explore some of our best creations. Click to visit the live websites.
                </motion.p>
            </div>

            <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing py-10">
                <motion.div
                    ref={containerRef}
                    className="flex gap-8 w-max px-4"
                    style={{ x }}
                    drag="x"
                    dragConstraints={{ left: -contentWidth * 3, right: 0 }}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                >
                    {MARQUEE_PROJECTS.map((project, index) => (
                        <PortfolioItem
                            key={`${project.id}-${index}`}
                            project={project}
                            onClick={handleCardClick}
                        />
                    ))}
                </motion.div>
            </div>

            <div className="container mx-auto px-4 mt-12 flex justify-center">
                <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background">
                    Start your project
                </a>
            </div>
        </section>
    );
}
