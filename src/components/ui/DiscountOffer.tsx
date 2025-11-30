"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Copy, Check, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export function DiscountOffer() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"offer" | "form" | "success">("offer");
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        teamSize: "",
        challenge: ""
    });
    const [copied, setCopied] = useState(false);

    // Auto-open after 10 seconds if not already interacted
    useEffect(() => {
        const timer = setTimeout(() => {
            const hasSeenOffer = localStorage.getItem("framax_discount_seen");
            if (!hasSeenOffer && !isOpen) {
                // setIsOpen(true); // Disabled for testing
            }
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate data collection
        console.log("Lead Data Collected:", formData);

        setStep("success");
        localStorage.setItem("framax_discount_seen", "true");

        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const copyCode = () => {
        navigator.clipboard.writeText("FRAMAX100");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Floating Trigger */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-primary/25 transition-shadow"
                    >
                        <Gift className="w-5 h-5" />
                        <span className="font-medium">Get 100€ Off</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="p-8">
                                {step === "offer" && (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                                            <Gift className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Unlock 100€ Discount</h3>
                                        <p className="text-muted-foreground mb-8">
                                            Answer a few quick questions about your business to unlock an exclusive discount on your first project.
                                        </p>
                                        <button
                                            onClick={() => setStep("form")}
                                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                        >
                                            Unlock Now <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {step === "form" && (
                                    <div>
                                        <h3 className="text-xl font-bold mb-6">Tell us about you</h3>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.company}
                                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    placeholder="Acme Inc."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Role</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.role}
                                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                        placeholder="Founder"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Team Size</label>
                                                    <select
                                                        required
                                                        value={formData.teamSize}
                                                        onChange={e => setFormData({ ...formData, teamSize: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    >
                                                        <option value="">Select...</option>
                                                        <option value="1-5">1-5</option>
                                                        <option value="6-20">6-20</option>
                                                        <option value="21-50">21-50</option>
                                                        <option value="50+">50+</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Biggest Challenge</label>
                                                <input
                                                    type="text"
                                                    value={formData.challenge}
                                                    onChange={e => setFormData({ ...formData, challenge: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    placeholder="e.g. Low conversion rate"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all mt-2"
                                            >
                                                Get My Code
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {step === "success" && (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                                            <Check className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Here's your code!</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Use this code during your discovery call to get 100€ off.
                                        </p>

                                        <div className="bg-muted p-4 rounded-xl flex items-center justify-between mb-6 border border-border border-dashed">
                                            <code className="text-xl font-mono font-bold tracking-wider text-primary">FRAMAX100</code>
                                            <button
                                                onClick={copyCode}
                                                className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                            >
                                                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="text-sm text-muted-foreground hover:text-foreground underline"
                                        >
                                            Close and continue browsing
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
