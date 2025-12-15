"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Single digit flip card
const FlipCard = ({ digit }: { digit: string }) => {
    return (
        <div className="relative w-12 h-16 md:w-16 md:h-20 bg-neutral-800 rounded-lg overflow-hidden border border-white/10 shadow-xl">
            {/* Top Half (Static Background/Previous) - Simplified for now to just show current */}
            {/* We'll focus on the slide transition of the number itself for smoothness */}

            <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={digit}
                        initial={{ y: "100%", filter: "blur(5px)", opacity: 0 }}
                        animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
                        exit={{ y: "-100%", filter: "blur(5px)", opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        className="text-4xl md:text-5xl font-bold font-mono text-white"
                    >

                        {digit}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/40 shadow-[0_1px_0_rgba(255,255,255,0.1)] z-10" />
        </div>
    );
};

// Group of two cards for a time unit (e.g. "12")
const TimeGroup = ({ value, label }: { value: number | string; label: string }) => {
    const stringValue = value.toString().padStart(2, "0");
    const digit1 = stringValue[0];
    const digit2 = stringValue[1];

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
                <FlipCard digit={digit1} />
                <FlipCard digit={digit2} />
            </div>
            <span className="text-xs font-medium text-white/40 uppercase tracking-widest">{label}</span>
        </div>
    );
};

export function FlipClock({ className }: { className?: string }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();

    return (
        <div className={cn("flex items-center justify-center gap-2 md:gap-4 p-4 h-full", className)}>
            <TimeGroup value={hours} label="Hours" />

            <div className="flex flex-col gap-2 md:gap-4 pb-6">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/20" />
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/20" />
            </div>

            <TimeGroup value={minutes} label="Minutes" />
        </div>
    );
}
