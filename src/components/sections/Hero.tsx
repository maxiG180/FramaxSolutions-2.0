"use client";

import Link from "next/link";
import { ArrowRight, Code, Smartphone, Globe, Zap, Bot, BarChart3 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export function Hero() {
    const { t } = useLanguage();

    return (
        <section id="hero" className="relative min-h-[90vh] overflow-hidden bg-background px-4 pt-24 md:pt-32">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-[#2563eb]/20 blur-[80px] sm:blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-[#2563eb]/20 blur-[80px] sm:blur-[120px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-[20%] left-[50%] h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] -translate-x-1/2 rounded-full bg-[#2563eb]/10 blur-[60px] sm:blur-[100px]" />
            </div>

            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                    {/* Left: Content */}
                    <div className="relative z-10 space-y-8 text-center lg:text-left">
                        {/* Badge */}
                        <div className="animate-fade-in-up mx-auto lg:mx-0 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-white/90">{t.hero.badge}</span>
                        </div>

                        <div className="animate-fade-in-up space-y-4 sm:space-y-6 opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1]">
                                {t.hero.titlePre} <br />
                                <span className="bg-gradient-to-r from-[#2563eb] via-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">
                                    {t.hero.titleHighlight}
                                </span>
                            </h1>
                            <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                                {t.hero.description}
                            </p>
                        </div>

                        <div className="animate-fade-in-up flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
                            <Link
                                href="/#booking"
                                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-foreground px-8 font-medium text-background transition-all hover:scale-105 hover:bg-foreground/90 hover:shadow-lg hover:shadow-primary/20"
                            >
                                {t.hero.startProject}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2563eb] via-[#2563eb] to-[#3b82f6] opacity-0 transition-opacity group-hover:opacity-10" />
                            </Link>
                            <Link
                                href="#portfolio"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 font-medium text-foreground transition-colors hover:bg-[#2563eb] hover:text-white"
                            >
                                {t.hero.viewWork}
                            </Link>
                        </div>

                        {/* Stats/Trust Indicators */}
                        <div className="animate-fade-in-up pt-8 opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                <div>
                                    <div className="text-3xl font-bold text-foreground">50+</div>
                                    <div className="text-sm text-muted-foreground">{t.hero.trustedBy}</div>
                                </div>
                                <div className="h-12 w-px bg-border" />
                                <div>
                                    <div className="text-3xl font-bold text-foreground">100%</div>
                                    <div className="text-sm text-muted-foreground">Success Rate</div>
                                </div>
                                <div className="h-12 w-px bg-border" />
                                <div>
                                    <div className="text-3xl font-bold text-foreground">24/7</div>
                                    <div className="text-sm text-muted-foreground">Support</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Showcase */}
                    <div className="relative z-10 h-[500px] lg:h-[600px] hidden lg:block">
                        {/* Main Desktop Mockup - Website */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, rotateX: 15 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="absolute top-0 left-0 w-[480px] h-[320px] bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl overflow-hidden"
                            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                        >
                            {/* Browser Header */}
                            <div className="h-8 bg-slate-800 border-b border-slate-700 flex gap-2 px-4 items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                <div className="ml-4 flex-1 h-5 bg-slate-950/50 rounded-md text-[10px] text-slate-500 flex items-center px-3">
                                    your-business.com
                                </div>
                            </div>

                            {/* Website Content */}
                            <div className="h-[calc(100%-32px)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
                                {/* Navigation */}
                                <div className="flex justify-between items-center mb-6 opacity-60">
                                    <div className="w-24 h-3 bg-slate-700 rounded-full" />
                                    <div className="flex gap-3">
                                        <div className="w-12 h-2 bg-slate-800 rounded-full" />
                                        <div className="w-12 h-2 bg-slate-800 rounded-full" />
                                        <div className="w-12 h-2 bg-slate-800 rounded-full" />
                                    </div>
                                </div>

                                {/* Hero Section */}
                                <div className="space-y-3">
                                    <div className="w-3/4 h-5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg" />
                                    <div className="w-1/2 h-5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg" />
                                    <div className="w-2/3 h-2 bg-slate-800 rounded-full mt-2" />

                                    {/* CTA Button */}
                                    <motion.div
                                        className="mt-6 w-32 h-10 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <div className="w-20 h-2 bg-white/90 rounded-full" />
                                    </motion.div>
                                </div>

                                {/* Feature Cards */}
                                <div className="grid grid-cols-3 gap-3 mt-8 opacity-40">
                                    {[Code, Zap, Globe].map((Icon, i) => (
                                        <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                                            <Icon className="w-5 h-5 text-slate-600 mb-2" />
                                            <div className="w-full h-1.5 bg-slate-800 rounded-full" />
                                        </div>
                                    ))}
                                </div>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </motion.div>

                        {/* Tablet Mockup - Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, x: -20, rotateY: -15 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="absolute top-[180px] right-[60px] w-[320px] h-[240px] bg-slate-900 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden"
                        >
                            <div className="h-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4">
                                {/* Dashboard Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="h-2 w-20 bg-slate-700 rounded-full" />
                                    <div className="flex gap-2">
                                        <div className="h-5 w-5 rounded-full bg-slate-800" />
                                        <div className="h-5 w-5 rounded-full bg-slate-800" />
                                    </div>
                                </div>

                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-800">
                                        <BarChart3 className="w-4 h-4 text-emerald-500 mb-1" />
                                        <div className="text-xs font-bold text-white">€12,450</div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-emerald-500 rounded-full"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "70%" }}
                                                transition={{ duration: 1.5, delay: 1 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-800">
                                        <Zap className="w-4 h-4 text-blue-500 mb-1" />
                                        <div className="text-xs font-bold text-white">+124</div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-blue-500 rounded-full"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "45%" }}
                                                transition={{ duration: 1.5, delay: 1.2 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Data List */}
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + i * 0.1 }}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50"
                                        >
                                            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-1.5 w-16 bg-slate-700 rounded-full mb-1" />
                                                <div className="h-1 w-10 bg-slate-800 rounded-full" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Mobile Mockup - App/SEO */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, rotateZ: 15 }}
                            animate={{ opacity: 1, y: 0, rotateZ: 8 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="absolute bottom-[40px] left-[80px] w-[160px] h-[320px] bg-slate-950 rounded-[32px] border-4 border-slate-900 shadow-2xl overflow-hidden"
                        >
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-b-2xl z-20" />

                            {/* Screen */}
                            <div className="h-full bg-slate-900 pt-8 px-3 pb-3 overflow-hidden">
                                {/* Status Bar */}
                                <div className="flex justify-between items-center mb-4 opacity-60">
                                    <div className="text-[8px] text-slate-500">9:41</div>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 border border-slate-600 rounded-sm" />
                                        <div className="w-2 h-2 border border-slate-600 rounded-sm" />
                                    </div>
                                </div>

                                {/* App Content */}
                                <div className="space-y-3">
                                    {/* Search/Action Bar */}
                                    <div className="h-8 bg-slate-800 rounded-full flex items-center px-3 gap-2">
                                        <Globe className="w-3 h-3 text-slate-500" />
                                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full" />
                                    </div>

                                    {/* Feature Cards */}
                                    {[Bot, Smartphone, Code].map((Icon, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1 + i * 0.15 }}
                                            className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50"
                                        >
                                            <Icon className="w-5 h-5 text-slate-500 mb-2" />
                                            <div className="space-y-1.5">
                                                <div className="h-1.5 w-16 bg-slate-700 rounded-full" />
                                                <div className="h-1 w-12 bg-slate-800 rounded-full" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Elements */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                            className="absolute top-[120px] right-[20px] w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center"
                        >
                            <Zap className="w-6 h-6 text-white" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1.4 }}
                            className="absolute bottom-[280px] left-[20px] w-12 h-12 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center"
                        >
                            <Bot className="w-6 h-6 text-white" />
                        </motion.div>

                        {/* Ambient Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
}
