"use client";

import { Zap, Search, Globe, Star, Bot, FileText, Settings, CheckCircle, MousePointerClick, LayoutDashboard, Users, Mail, Calendar } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import createGlobe from "cobe";
import { motion, useMotionValue, useTransform, useSpring, useInView, useAnimation, animate, AnimatePresence } from "framer-motion";

import { useLanguage } from "@/context/LanguageContext";

export function Features() {
    const { t } = useLanguage();

    const NOTIFICATIONS = [
        { icon: Users, text: "Novo Lead", subtext: "Agora mesmo", color: "bg-blue-500" },
        { icon: FileText, text: "Fatura Enviada", subtext: "Há 2m", color: "bg-green-500" },
        { icon: Calendar, text: "Reunião Agendada", subtext: "Há 15m", color: "bg-purple-500" },
        { icon: Mail, text: "Email Aberto", subtext: "Há 2h", color: "bg-pink-500" },
    ];

    const [visibleNotifications, setVisibleNotifications] = useState([0, 1]);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleNotifications(prev => {
                const nextIndex = (prev[0] - 1 + NOTIFICATIONS.length) % NOTIFICATIONS.length;
                return [nextIndex, ...prev.slice(0, 1)];
            });
        }, 4000); // Slower animation (4s)
        return () => clearInterval(interval);
    }, []);

    // Refs for in-view animations
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });


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

    // Globe Logic
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);
    const [r, setR] = useState(0);

    useEffect(() => {
        let phi = 0;
        let width = 0;
        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener('resize', onResize);
        onResize();
        const globe = createGlobe(canvasRef.current!, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 3,
            baseColor: [0.3, 0.3, 0.3], // Monochrome base
            markerColor: [0.8, 0.8, 0.8], // White/Gray markers
            glowColor: [0.5, 0.5, 0.5], // Monochrome glow
            markers: [],
            onRender: (state) => {
                if (!pointerInteracting.current) {
                    phi += 0.005;
                }
                state.phi = phi + r;
                state.width = width * 2;
                state.height = width * 2;
            }
        });
        setTimeout(() => canvasRef.current!.style.opacity = '1');
        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        }
    }, [r]);

    return (
        <section id="features" className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements - Matching Hero */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.07] dark:opacity-[0.08]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px'
                    }}
                />

                {/* Subtle Radial Accent */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.12] dark:opacity-[0.06]">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px]" />
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        {t.features.title} <br />
                        <span className="text-primary">{t.features.titleHighlight}</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        {t.features.subtitle}
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 gap-6 md:grid-cols-6"
                >
                    {/* Card New 1: Websites (Small) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-2xl hover:shadow-primary/10 md:col-span-3"
                    >
                        <div className="relative z-10 w-full">
                            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                                <MousePointerClick className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-foreground relative z-10">{t.features.websitesTitle}</h3>
                            <p className="text-sm text-muted-foreground mb-4 relative z-10">
                                {t.features.websitesDesc}
                            </p>
                        </div>

                        {/* Visual: High Conversion Landing Page Mockup */}
                        <div className="absolute -right-12 -bottom-12 w-[400px] h-[300px] bg-slate-900 rounded-xl border border-slate-800 shadow-2xl skew-x-[-5deg] rotate-[5deg] group-hover:skew-x-0 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 origin-bottom-right">
                            {/* Browser Header */}
                            <div className="h-8 bg-slate-800 rounded-t-xl border-b border-slate-700 flex gap-2 px-4 items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                <div className="ml-4 flex-1 h-4 bg-slate-950/50 rounded-full text-[10px] text-slate-600 flex items-center px-3">
                                    framaxsolutions.com
                                </div>
                            </div>

                            {/* Browser Body (Landing Page) */}
                            <div className="p-6 flex flex-col items-center h-[calc(100%-32px)] bg-slate-950 relative overflow-hidden">
                                {/* Nav */}
                                <div className="w-full flex justify-between items-center mb-8 opacity-50">
                                    <div className="w-20 h-2 bg-slate-700 rounded-full" />
                                    <div className="flex gap-2">
                                        <div className="w-10 h-2 bg-slate-800 rounded-full" />
                                        <div className="w-10 h-2 bg-slate-800 rounded-full" />
                                        <div className="w-10 h-2 bg-slate-800 rounded-full" />
                                    </div>
                                </div>

                                {/* Hero Content */}
                                <div className="w-full flex flex-col items-center text-center gap-3 z-10">
                                    <div className="w-3/4 h-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg" />
                                    <div className="w-1/2 h-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg mb-2" />
                                    <div className="w-2/3 h-2 bg-slate-800 rounded-full" />

                                    {/* Animated CTA Button */}
                                    <motion.div
                                        className="mt-4 px-6 py-2 bg-indigo-600 rounded-md shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <div className="w-24 h-2 bg-white/90 rounded-full" />
                                    </motion.div>
                                </div>

                                {/* Feature Grid (Below Fold) */}
                                <div className="w-full grid grid-cols-3 gap-4 mt-auto opacity-40">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-slate-900 rounded-lg border border-slate-800 p-2">
                                            <div className="w-6 h-6 bg-slate-800 rounded-md mb-2" />
                                            <div className="w-full h-1.5 bg-slate-800 rounded-full" />
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Cursor Clicking CTA */}
                                <motion.div
                                    className="absolute top-[130px] left-[55%] z-20"
                                    animate={{
                                        x: [0, -10, -10, 0],
                                        y: [0, -10, -10, 0],
                                        scale: [1, 0.9, 0.9, 1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.6, 1] }}
                                >
                                    <MousePointerClick className="w-8 h-8 text-white fill-black drop-shadow-xl" />
                                </motion.div>
                            </div>
                        </div>

                    </motion.div>

                    {/* Card New 2: Systems (Wide) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-card p-8 pb-52 md:pb-8 md:col-span-3 transition-all hover:shadow-xl"
                    >
                        <div className="relative z-10 w-full md:w-3/5">
                            <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
                                <LayoutDashboard className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-foreground">{t.features.systemsTitle}</h3>
                            <p className="text-base text-muted-foreground mb-4 max-w-sm">
                                {t.features.systemsDesc}
                            </p>
                        </div>

                        {/* Visual: Realistic Tablet Dashboard */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-12 md:top-12 md:bottom-auto w-[320px] md:w-[380px] h-[240px] md:h-[280px] perspective-[1000px] group-hover:scale-[1.02] transition-transform duration-500">
                            {/* Tablet Frame */}
                            <div className="relative w-full h-full bg-[#0f172a] rounded-[20px] border-[4px] border-[#1e293b] shadow-2xl skew-y-[-5deg] rotate-[-5deg] group-hover:rotate-0 group-hover:skew-y-0 transition-all duration-500 origin-center">
                                {/* Screen Bezel */}
                                <div className="absolute inset-0 bg-[#020617] rounded-[16px] border border-white/5 overflow-hidden">
                                    {/* Glass Reflection */}
                                    <div className="absolute top-0 right-0 w-[200px] h-full bg-gradient-to-l from-white/5 to-transparent skew-x-[-20deg] pointer-events-none z-20" />

                                    {/* Dashboard UI */}
                                    <div className="w-full h-full flex bg-slate-950">
                                        {/* Sidebar */}
                                        <div className="w-16 h-full border-r border-white/5 flex flex-col items-center py-4 gap-4 bg-[#0f172a]/50">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <LayoutDashboard className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="w-full h-px bg-white/5 my-1" />
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" />
                                            ))}
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 p-4 flex flex-col gap-4">
                                            {/* Header */}
                                            <div className="flex justify-between items-center">
                                                <div className="h-2 w-24 bg-white/10 rounded-full" />
                                                <div className="flex gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-white/5" />
                                                    <div className="h-6 w-6 rounded-full bg-white/5" />
                                                </div>
                                            </div>

                                            {/* KPIs */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-[#1e293b]/50 rounded-xl p-3 border border-white/5">
                                                    <div className="text-[10px] text-slate-400 mb-1">Receita Mensal</div>
                                                    <div className="text-lg font-bold text-white mb-1">€12.450</div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full w-[70%] bg-emerald-500 rounded-full" />
                                                    </div>
                                                </div>
                                                <div className="bg-[#1e293b]/50 rounded-xl p-3 border border-white/5">
                                                    <div className="text-[10px] text-slate-400 mb-1">Novos Clientes</div>
                                                    <div className="text-lg font-bold text-white mb-1">+124</div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full w-[45%] bg-blue-500 rounded-full" />

                                                    </div>
                                                </div>
                                            </div>

                                            {/* Data Listing */}
                                            <div className="flex-1 bg-[#1e293b]/30 rounded-xl border border-white/5 p-3 flex flex-col gap-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${i === 1 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700/50 text-slate-400'}`}>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="h-1.5 w-16 bg-white/10 rounded-full mb-1" />
                                                            <div className="h-1 w-10 bg-white/5 rounded-full" />
                                                        </div>
                                                        <div className="h-1.5 w-8 bg-white/10 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 1: SEO (Wide) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-card p-8 pb-[230px] md:p-8 md:col-span-2 transition-all hover:shadow-2xl hover:shadow-primary/10"
                        onMouseEnter={handleSeoHover}
                    >
                        <div className="relative z-10 w-full md:w-3/5">
                            <div className="mb-4 inline-flex rounded-lg bg-white/10 p-3 text-white">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-foreground relative z-10">{t.features.seoTitle}</h3>
                            <p className="text-base text-muted-foreground mb-4 max-w-sm relative z-10">
                                {t.features.seoDesc}
                            </p>
                        </div>

                        {/* Visual: Mini iPhone Mockup (Scaled for Narrow Card) */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:absolute md:mt-0 md:top-10 md:right-[-50px] md:bottom-auto md:left-auto md:translate-x-0 origin-bottom md:origin-center scale-[0.8] md:scale-90 w-64 h-[220px] md:h-[380px] bg-gray-950 rounded-t-[2.5rem] rounded-b-none md:rounded-[2.5rem] border-[6px] border-b-0 md:border-[6px] border-gray-900 shadow-2xl md:rotate-[-12deg] transition-transform duration-500 group-hover:scale-[0.85] md:group-hover:scale-95 md:group-hover:rotate-0 md:group-hover:translate-x-[-10px] md:group-hover:translate-y-[-10px]">
                            {/* Dynamic Island */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-b-lg z-20" />

                            {/* Screen Content */}
                            <div className="w-full h-full bg-slate-50 rounded-t-[2.2rem] rounded-b-none md:rounded-[2.2rem] overflow-hidden relative pt-7 flex flex-col">
                                {/* Search Bar */}
                                <div className="mx-3 mb-3 h-7 bg-white rounded-full shadow-sm flex items-center px-2 gap-1.5 border border-gray-100">
                                    <Search className="w-3 h-3 text-gray-400" />
                                    <span className="text-[10px] text-gray-400 font-medium ml-1">Your Business</span>
                                </div>

                                {/* Results */}
                                <div className="flex-1 px-3 space-y-2">
                                    {/* Winner: Your Business */}
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-2.5 bg-white rounded-xl shadow-lg border border-primary/20 relative"
                                    >
                                        {/* "This could be you" Tooltip */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8, type: "spring" }}
                                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-xl z-30 flex items-center gap-1"
                                        >
                                            This could be you!
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-primary" />
                                        </motion.div>

                                        <div className="flex items-start gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 shrink-0" />
                                            <div>
                                                <div className="h-2 w-16 bg-gray-900 rounded-full mb-1" />
                                                <div className="flex gap-0.5 mb-1">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-2 w-2 text-yellow-500 fill-yellow-500" />)}

                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Competitor (Faded) */}
                                    <div className="p-2 bg-gray-100 rounded-xl opacity-50 blur-[0.5px]">
                                        <div className="flex gap-2">
                                            <div className="h-6 w-6 bg-gray-300 rounded-md" />
                                            <div className="space-y-1">
                                                <div className="h-1.5 w-12 bg-gray-300 rounded-full" />
                                                <div className="h-1.5 w-8 bg-gray-200 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    {/* Card 3: Automation (Small) */}
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
                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-xl perspective-1000 col-span-1 md:col-span-2"
                    >
                        <div className="relative z-10 w-2/3">
                            <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 text-purple-500" style={{ transform: "translateZ(20px)" }}>
                                <Bot className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-foreground" style={{ transform: "translateZ(20px)" }}>{t.features.automationTitle}</h3>
                            <p className="text-sm text-muted-foreground" style={{ transform: "translateZ(20px)" }}>
                                {t.features.automationDesc}
                            </p>
                        </div>

                        {/* Visual: Automated Task Stream */}
                        <div className="absolute top-8 right-0 w-[240px] h-full flex flex-col gap-3 p-4 perspective-[1000px]" style={{ transformStyle: "preserve-3d" }}>
                            <AnimatePresence mode="popLayout" initial={false}>
                                {visibleNotifications.map((idx) => {
                                    const item = NOTIFICATIONS[idx];
                                    return (
                                        <motion.div
                                            key={`${idx}-${item.text}`}
                                            layout
                                            className="relative flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-md"
                                            style={{
                                                transform: "rotateY(-10deg) rotateX(5deg)",
                                                transformOrigin: "right center"
                                            }}
                                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <div className={`w-8 h-8 rounded-lg ${item.color}/20 flex items-center justify-center`}>
                                                <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-white/90 truncate">{item.text}</p>
                                                <p className="text-[10px] text-white/50">{item.subtext}</p>
                                            </div>
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Ambient Glow */}
                            <div className="absolute top-1/2 right-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none" />
                        </div>                    </motion.div>

                    {/* Card 4: Global (Wide) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-card p-8 md:col-span-2"
                    >
                        <div className="relative z-10 w-full md:w-2/3">
                            <div className="mb-4 inline-flex rounded-lg bg-slate-500/10 p-3 text-slate-500">
                                <Globe className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-foreground">{t.features.globalTitle}</h3>
                            <p className="text-muted-foreground">
                                {t.features.globalDesc}
                            </p>
                        </div>

                        {/* Visual: Cobe Globe */}
                        <div className="absolute right-[-100px] bottom-[-100px] w-[600px] h-[600px] opacity-100 md:opacity-100 pointer-events-none">
                            <canvas
                                ref={canvasRef}
                                style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
                                className="w-full h-full opacity-0 transition-opacity duration-1000"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div >
        </section >
    );
}
