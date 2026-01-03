"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Search, MapPin, Phone, Globe, Star, Navigation, CheckCircle2 } from "lucide-react";

export function MobileSEOPlacement() {
    const [isAfter, setIsAfter] = useState(false);

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Text Content */}
                    <div className="order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold tracking-wide text-primary uppercase bg-primary/10 rounded-full"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Dominant Visibility
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
                        >
                            Imagine <span className="text-primary">Your Business</span> Here.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-light"
                        >
                            Most customers don't scroll. We engineer your digital presence to secure the top spot in local searches, turning "near me" queries into loyal customers.
                        </motion.p>

                        {/* Apple-style Segmented Control */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-6 mb-10"
                        >
                            <div className="relative inline-flex p-1 bg-muted/50 rounded-full border border-border/50 backdrop-blur-sm">
                                <button
                                    onClick={() => setIsAfter(false)}
                                    className={`relative z-10 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${!isAfter ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Without SEO
                                </button>
                                <button
                                    onClick={() => setIsAfter(true)}
                                    className={`relative z-10 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${isAfter ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    With Framax
                                </button>
                                {/* Sliding Pill */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-lg transition-all duration-500 ease-out ${isAfter ? "left-[50%]" : "left-1"}`}
                                />
                            </div>

                            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>Proven Results</span>
                            </div>
                        </motion.div>

                        {/* Glass Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 md:gap-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-sm backdrop-blur-sm"
                            >
                                <h4 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-2">#1</h4>
                                <p className="text-sm font-medium text-muted-foreground">Detailed Ranking</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-sm backdrop-blur-sm"
                            >
                                <h4 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-2">3.5x</h4>
                                <p className="text-sm font-medium text-muted-foreground">More Traffic</p>
                            </motion.div>
                        </div>

                    </div>

                    {/* Premium Mobile Visualization */}
                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                type: "spring",
                                stiffness: 50,
                                damping: 20
                            }}
                            className="relative w-[300px] h-[620px] bg-[#09090b] rounded-[3.5rem] p-3 shadow-[0_0_60px_-15px_rgba(var(--primary-rgb),0.3)] ring-1 ring-white/10"
                        >
                            {/* Glossy Bezel Highlights */}
                            <div className="absolute inset-0 rounded-[3.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />

                            {/* Inner Screen */}
                            <div className="w-full h-full bg-white rounded-[2.75rem] overflow-hidden relative border border-gray-200 flex flex-col">

                                {/* Dynamic Island */}
                                <div className="absolute top-0 left-0 right-0 h-14 flex justify-center bg-white z-40">
                                    <div className="w-28 h-7 bg-black rounded-b-2xl mt-0" />
                                </div>

                                {/* Mock Map App Interface */}
                                <div className="flex-1 relative bg-[#f5f5f7]">

                                    {/* Map View */}
                                    <div className="h-[45%] w-full bg-gray-200 relative overflow-hidden">
                                        {/* Map Grid Pattern */}
                                        <div className="absolute inset-0 opacity-[0.4] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]" />
                                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, transparent 70%)' }} />

                                        {/* Pins Animation */}
                                        <AnimatePresence>
                                            {!isAfter ? (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                                                    <div className="absolute top-1/4 left-1/3 p-2 bg-red-400/90 rounded-full shadow-lg backdrop-blur-md animate-bounce" style={{ animationDuration: '2s' }}><MapPin className="w-3 h-3 text-white" /></div>
                                                    <div className="absolute bottom-1/3 right-1/4 p-2 bg-gray-400/90 rounded-full shadow-lg backdrop-blur-md"><MapPin className="w-3 h-3 text-white" /></div>
                                                </motion.div>
                                            ) : (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                                                    <motion.div
                                                        initial={{ scale: 0, y: 20 }}
                                                        animate={{ scale: 1, y: 0 }}
                                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                                                    >
                                                        <div className="bg-primary px-3 py-1.5 rounded-xl shadow-lg mb-2 flex items-center gap-1.5 whitespace-nowrap">
                                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                            <span className="text-[10px] font-bold text-primary-foreground tracking-wide">YOUR BRAND</span>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-ping absolute top-8 left-1/2 -translate-x-1/2 -z-10" />
                                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-xl mx-auto ring-4 ring-white">
                                                            <MapPin className="w-4 h-4 text-white fill-current" />
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Bottom Sheet Results */}
                                    <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 space-y-4">
                                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />

                                        <AnimatePresence mode="wait">
                                            {isAfter ? (
                                                <motion.div
                                                    key="after-list"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-4"
                                                >
                                                    {/* Winner Card */}
                                                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-primary/5 ring-2 ring-primary/5">
                                                        <div className="flex gap-4">
                                                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-inner shrink-0" />
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 text-lg">Your Business</h3>
                                                                <div className="flex items-center gap-1 text-orange-400">
                                                                    <div className="flex"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
                                                                    <span className="text-xs text-gray-500 font-medium ml-1">(5.0)</span>
                                                                </div>
                                                                <p className="text-xs text-green-600 font-medium mt-1">Open 24 hours</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                                            <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                                <Phone className="w-4 h-4" />
                                                                <span className="text-[10px] font-bold">Call</span>
                                                            </button>
                                                            <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                                                <Navigation className="w-4 h-4" />
                                                                <span className="text-[10px] font-bold">Route</span>
                                                            </button>
                                                            <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                                <Globe className="w-4 h-4" />
                                                                <span className="text-[10px] font-bold">Web</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Faded Results */}
                                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 opacity-50 blur-[1px]">
                                                        <div className="flex gap-3 items-center">
                                                            <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                                                            <div className="space-y-2 flex-1">
                                                                <div className="h-2.5 bg-gray-300 rounded w-2/3" />
                                                                <div className="h-2 bg-gray-200 rounded w-1/3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="before-list"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-3"
                                                >
                                                    {/* Generic Results */}
                                                    {[1, 2].map((i) => (
                                                        <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                                                            <div>
                                                                <div className="h-3 w-32 bg-gray-800 rounded mb-2" />
                                                                <div className="h-2 w-20 bg-gray-300 rounded" />
                                                            </div>
                                                            <div className="h-8 w-8 bg-gray-100 rounded-full" />
                                                        </div>
                                                    ))}
                                                    {/* You are here */}
                                                    <div className="p-4 rounded-xl border-l-4 border-red-400 bg-red-50/50 flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Your Business</h4>
                                                            <p className="text-xs text-gray-500">Ranking on page 2...</p>
                                                        </div>
                                                        <span className="text-2xl opacity-20">📉</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
