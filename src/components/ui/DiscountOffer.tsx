"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Copy, Check, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export function DiscountOffer() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"offer" | "form" | "email" | "success">("offer");
    const [formData, setFormData] = useState({
        email: "",
        company: "",
        role: "",
        teamSize: "",
        challenge: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("email");
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/send-discount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success && data.code) {
                // Save code to localStorage for auto-fill but DON'T show it
                localStorage.setItem("framax_promo_code", data.code);
                localStorage.setItem("framax_discount_seen", "true");

                setStep("success");

                // Trigger confetti
                const duration = 3 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);
            }
        } catch (error) {
            console.error('Error sending discount:', error);
            alert("Failed to send discount code. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                                        <form onSubmit={handleFormSubmit} className="space-y-4">
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
                                                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all mt-2 flex items-center justify-center gap-2"
                                            >
                                                Continue <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {step === "email" && (
                                    <div>
                                        <div className="text-center mb-6">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                                                <Gift className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold">Where should we send your code?</h3>
                                        </div>
                                        <form onSubmit={handleFinalSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    placeholder="you@company.com"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? "Sending..." : "Unlock My 100€ Code"}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {step === "success" && (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                                            <Check className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Code Sent!</h3>
                                        <p className="text-muted-foreground mb-8">
                                            We've sent your unique 100€ discount code to <strong>{formData.email}</strong>.
                                            <br /><br />
                                            Please check your inbox (and spam folder) to retrieve it before booking your call.
                                        </p>

                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="w-full bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-muted/80 transition-all"
                                        >
                                            Close
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
