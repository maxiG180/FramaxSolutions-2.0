"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Cpu, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useKonamiCode } from "@/hooks/useKonamiCode";

export function DeveloperMode() {
    const isActivated = useKonamiCode();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isActivated) {
            // Prevent synchronous state update warning
            const timeout = setTimeout(() => setIsOpen(true), 0);
            return () => clearTimeout(timeout);
        }
    }, [isActivated]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
                <div className="w-full max-w-2xl bg-black border border-green-500/50 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.2)] overflow-hidden font-mono text-green-500">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-green-500/30 bg-green-500/10">
                        <div className="flex items-center gap-2">
                            <Terminal size={16} />
                            <span className="text-sm font-bold">DEVELOPER_MODE_ACTIVATED</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-green-400">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-green-500/30 rounded bg-green-500/5">
                                <div className="flex items-center gap-2 mb-2 text-xs uppercase opacity-70">
                                    <Cpu size={14} /> System Status
                                </div>
                                <div className="text-2xl font-bold">ONLINE</div>
                                <div className="text-xs mt-1">All systems nominal</div>
                            </div>

                            <div className="p-4 border border-green-500/30 rounded bg-green-500/5">
                                <div className="flex items-center gap-2 mb-2 text-xs uppercase opacity-70">
                                    <Activity size={14} /> Performance
                                </div>
                                <div className="text-2xl font-bold">98/100</div>
                                <div className="text-xs mt-1">Lighthouse Score</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs uppercase opacity-70">Console Output</p>
                            <div className="h-32 overflow-y-auto text-sm space-y-1 p-2 bg-black/50 rounded border border-green-500/20">
                                <p>{">"} Initializing secret protocols...</p>
                                <p>{">"} Access granted: Level 5</p>
                                <p>{">"} Unlocking hidden features...</p>
                                <p>{">"} Coffee levels: CRITICAL (Refill needed)</p>
                                <p className="animate-pulse">{">"} Waiting for input_</p>
                            </div>
                        </div>

                        <div className="text-center text-xs opacity-50">
                            Press ESC to close
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
