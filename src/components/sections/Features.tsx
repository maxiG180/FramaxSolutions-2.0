"use client";

import { Zap, Search, Palette, Code, Smartphone, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView, useAnimation } from "framer-motion";

export function Features() {
    const [score, setScore] = useState(0);
    const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

    // Refs for in-view animations
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Speed Card Logic
    useEffect(() => {
        if (isInView) {
            const interval = setInterval(() => {
                setScore(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [isInView]);

    const handleScoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
        setScore(prev => prev + 1);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newClick = { id: Date.now(), x, y };
        setClicks(prev => [...prev, newClick]);

        setTimeout(() => {
            setClicks(prev => prev.filter(c => c.id !== newClick.id));
        }, 1000);
    };

    // SEO Card Animation Logic
    const seoControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            seoControls.start("visible");
        }
    }, [isInView, seoControls]);

    const handleSeoHover = () => {
        seoControls.set("hidden");
        seoControls.start("visible");
    };

    // Design Card 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set((clientX - left) / width - 0.5);
        y.set((clientY - top) / height - 0.5);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    // Tech Card Typing Logic
    const [codeText, setCodeText] = useState("");
    const fullCode = `<motion.div>
  <h3>{title}</h3>
  <Price value={price} />
</motion.div>`;

    useEffect(() => {
        if (isInView) {
            let i = 0;
            const interval = setInterval(() => {
                setCodeText(fullCode.slice(0, i));
                i++;
                if (i > fullCode.length) {
                    clearInterval(interval);
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isInView]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <section id="features" className="py-24 bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        Everything You Need to <br />
                        <span className="text-primary">Dominate Your Market</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        We don't just build websites. We build digital assets that work as hard as you do.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-rows-2"
                >
                    {/* Card 1: Speed (Large) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-card p-8 md:col-span-2 lg:row-span-2 transition-all hover:shadow-2xl hover:shadow-primary/10"
                    >
                        <div className="relative z-10">
                            <div className="mb-4 inline-flex rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-foreground">Blazing Fast Performance</h3>
                            <p className="max-w-md text-muted-foreground">
                                We optimize every line of code to ensure your site loads instantly. Google loves fast sites, and so do your customers.
                            </p>
                        </div>

                        {/* Visual: Lighthouse Score */}
                        <div
                            className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-50 transition-transform duration-500 group-hover:scale-105 md:opacity-100 cursor-pointer"
                            onClick={handleScoreClick}
                        >
                            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-[12px] border-green-500 bg-background shadow-2xl transition-all hover:border-green-400 active:scale-95">
                                <span className="text-6xl font-bold text-green-500 select-none">{score}</span>
                                <AnimatePresence>
                                    {clicks.map(click => (
                                        <motion.span
                                            key={click.id}
                                            initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 0, y: -100, scale: 1.5 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute text-4xl font-bold text-green-400 pointer-events-none"
                                            style={{ top: "20%", left: "50%", x: "-50%" }}
                                        >
                                            +1
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                                {/* Confetti particles could go here */}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: SEO (Small) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1"
                        onMouseEnter={handleSeoHover}
                    >
                        <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3 text-blue-500">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-foreground">SEO Optimized</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Built-in best practices to help you rank higher on search engines.
                        </p>
                        {/* Visual: Ranking Animation */}
                        <div className="absolute bottom-0 right-0 w-full h-32 p-4 flex flex-col justify-end gap-2 opacity-80 mask-image-linear-gradient(to top, black, transparent)">
                            {/* Result 3 */}
                            <motion.div
                                variants={{
                                    hidden: { y: 0, opacity: 1 },
                                    visible: { y: 100, opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }
                                }}
                                initial="hidden"
                                animate={seoControls}
                                className="h-8 w-full rounded bg-muted/30 flex items-center px-2 gap-2"
                            >
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                <div className="h-2 w-24 rounded bg-muted-foreground/20" />
                            </motion.div>
                            {/* Result 2 */}
                            <motion.div
                                variants={{
                                    hidden: { y: 0 },
                                    visible: { y: 40, transition: { duration: 1.5, ease: "easeInOut" } }
                                }}
                                initial="hidden"
                                animate={seoControls}
                                className="h-8 w-full rounded bg-muted/30 flex items-center px-2 gap-2"
                            >
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                <div className="h-2 w-32 rounded bg-muted-foreground/20" />
                            </motion.div>
                            {/* Result 1 (Winner) */}
                            <motion.div
                                variants={{
                                    hidden: { y: 40, scale: 0.95, boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)" },
                                    visible: { y: 0, scale: 1, boxShadow: "0 4px 20px -2px rgba(59, 130, 246, 0.5)", transition: { duration: 1.5, ease: "easeInOut" } }
                                }}
                                initial="hidden"
                                animate={seoControls}
                                className="h-10 w-full rounded bg-card border border-blue-500/30 flex items-center px-3 gap-3 relative z-10"
                            >
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <div className="h-2.5 w-40 rounded bg-blue-500/20" />
                                <div className="ml-auto h-4 w-12 rounded bg-blue-500/10 text-[8px] text-blue-500 flex items-center justify-center font-bold">#1 RANK</div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Card 3: Design (Small) */}
                    <motion.div
                        variants={itemVariants}
                        onMouseMove={onMouseMove}
                        onMouseLeave={() => {
                            x.set(0);
                            y.set(0);
                        }}
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-xl perspective-1000"
                    >
                        <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3 text-pink-500" style={{ transform: "translateZ(20px)" }}>
                            <Palette className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-foreground" style={{ transform: "translateZ(20px)" }}>Premium Design</h3>
                        <p className="text-sm text-muted-foreground" style={{ transform: "translateZ(20px)" }}>
                            Stunning visuals that capture your brand's unique identity.
                        </p>
                        {/* Visual: Floating Elements */}
                        <div className="absolute right-[-20px] top-[-20px] h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40" />
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [12, 0, 12]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute bottom-4 right-4 h-12 w-12 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
                            style={{ transform: "translateZ(40px)" }}
                        />
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                rotate: [-12, 0, -12]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute bottom-8 right-12 h-8 w-8 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-500/30 shadow-lg"
                            style={{ transform: "translateZ(30px)" }}
                        />
                    </motion.div>

                    {/* Card 4: Tech (Wide) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-card p-8 md:col-span-3 lg:col-span-2"
                    >
                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 text-purple-500">
                                    <Code className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-foreground">Clean, Modern Code</h3>
                                <p className="text-muted-foreground">
                                    Built with the latest technologies like Next.js and Tailwind CSS for scalability and maintainability. No bloated page builders.
                                </p>
                            </div>
                            {/* Visual: Code Snippet */}
                            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gray-950/50 backdrop-blur-md shadow-2xl min-h-[160px] flex items-center">
                                {/* Window Header */}
                                <div className="absolute top-0 left-0 right-0 flex items-center gap-4 border-b border-white/5 bg-white/5 px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                                        <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                                        <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                                    </div>
                                    <div className="flex items-center gap-2 rounded bg-black/20 px-3 py-1 text-xs font-medium text-gray-400">
                                        <Code className="h-3 w-3" />
                                        <span>ProductCard.tsx</span>
                                    </div>
                                </div>
                                {/* Code Content */}
                                <div className="p-6 pt-12 text-[14px] font-mono leading-relaxed text-gray-300 whitespace-pre w-full">
                                    <div dangerouslySetInnerHTML={{
                                        __html: codeText
                                            .replace(/motion.div/g, '<span class="text-red-400">motion.div</span>')
                                            .replace(/h3/g, '<span class="text-red-400">h3</span>')
                                            .replace(/Price/g, '<span class="text-yellow-300">Price</span>')
                                            .replace(/value/g, '<span class="text-green-400">value</span>')
                                    }} />
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className="inline-block w-2 h-4 bg-purple-500 ml-1 align-middle"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 5: Mobile (Small) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-shadow hover:shadow-lg md:col-span-1"
                    >
                        <div className="mb-4 inline-flex rounded-lg bg-orange-500/10 p-3 text-orange-500">
                            <Smartphone className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-foreground">Mobile First</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Perfectly responsive on all devices.
                        </p>
                        {/* Visual: Phone Mockup */}
                        <div className="absolute bottom-[-20px] right-4 w-24 h-40 bg-gray-900 rounded-[2rem] border-4 border-gray-800 shadow-xl transition-transform duration-500 group-hover:translate-y-[-10px]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-gray-800 rounded-b-xl z-20" />
                            <div className="h-full w-full rounded-[1.7rem] overflow-hidden bg-background relative">
                                {/* Mini UI Scrolling */}
                                <motion.div
                                    animate={{ y: [-20, -80] }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        repeatType: "mirror",
                                        ease: "linear"
                                    }}
                                    className="space-y-2 pt-4 px-2"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-1">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <div className="h-1 w-8 bg-muted rounded-full" />
                                    </div>
                                    {/* Hero */}
                                    <div className="h-12 w-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg mt-2" />
                                    {/* Content Lines */}
                                    <div className="space-y-1">
                                        <div className="h-1.5 w-3/4 bg-muted/60 rounded-full" />
                                        <div className="h-1.5 w-full bg-muted/40 rounded-full" />
                                        <div className="h-1.5 w-5/6 bg-muted/40 rounded-full" />
                                    </div>
                                    {/* Button */}
                                    <div className="mt-2 h-5 w-full bg-primary rounded-md flex items-center justify-center">
                                        <div className="h-1 w-8 bg-primary-foreground/50 rounded-full" />
                                    </div>
                                    {/* More Content */}
                                    <div className="grid grid-cols-2 gap-1 mt-2">
                                        <div className="h-8 bg-muted/20 rounded" />
                                        <div className="h-8 bg-muted/20 rounded" />
                                    </div>
                                    <div className="h-12 w-full bg-muted/10 rounded-lg mt-2" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
