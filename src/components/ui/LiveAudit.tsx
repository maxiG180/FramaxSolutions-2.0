"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, X, Zap, Search, MousePointer2, ShieldCheck } from "lucide-react";

export function LiveAudit() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0); // 0: Idle, 1: Scanning, 2: Results

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "l" && !isOpen) {
                setIsOpen(true);
                setStep(1);
            } else if (e.key === "Escape") {
                setIsOpen(false);
                setStep(0);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Simulation Logic
    useEffect(() => {
        if (isOpen && step === 1) {
            const timer = setTimeout(() => {
                setStep(2);
            }, 3000); // 3s scan time
            return () => clearTimeout(timer);
        }
    }, [isOpen, step]);

    const metrics = [
        { label: "Performance", icon: Zap, color: "text-green-500", score: 100, delay: 0.2 },
        { label: "SEO", icon: Search, color: "text-blue-500", score: 100, delay: 0.4 },
        { label: "Acessibilidade", icon: MousePointer2, color: "text-orange-500", score: 100, delay: 0.6 },
        { label: "Boas Práticas", icon: ShieldCheck, color: "text-blue-600", score: 100, delay: 0.8 },
    ];

    return (
        <>
            {/* Floating Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="fixed bottom-8 right-8 z-40 hidden md:flex items-center gap-3 bg-background/80 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-lg"
            >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-muted text-xs font-bold font-mono text-muted-foreground border border-border">
                    L
                </div>
                <span className="text-sm font-medium text-muted-foreground">para auditar esta página</span>
            </motion.div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary animate-pulse" />
                                    <h3 className="font-bold text-lg">Auditoria ao Vivo</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                {step === 1 ? (
                                    <div className="flex flex-col items-center py-8 space-y-6">
                                        <div className="relative w-24 h-24">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary">...</span>
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h4 className="text-xl font-semibold">A analisar Core Web Vitals...</h4>
                                            <p className="text-muted-foreground">A verificar métricas LCP, FID e CLS</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            {metrics.map((metric, index) => (
                                                <motion.div
                                                    key={metric.label}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: metric.delay }}
                                                    className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border"
                                                >
                                                    <div className={`mb-2 p-3 rounded-full bg-background shadow-sm ${metric.color}`}>
                                                        <metric.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-3xl font-bold mb-1">{metric.score}</div>
                                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 }}
                                            className="text-center space-y-4"
                                        >
                                            <p className="text-lg font-medium">
                                                Este é o padrão que entregamos a <span className="text-primary font-bold">cada cliente</span>.
                                            </p>
                                            <button className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                                                Obter a Sua Pontuação Perfeita
                                            </button>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
