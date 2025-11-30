"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Check, X, ArrowRight, DollarSign, Clock, Briefcase, Bot, Globe, MapPin, Calendar } from "lucide-react";

export function ProjectEstimator() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [selections, setSelections] = useState<{
        type: string;
        design: string;
        pages: string;
        extras: string[];
    }>({ type: "", design: "", pages: "", extras: [] });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input field
            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA" ||
                document.activeElement?.tagName === "SELECT"
            ) {
                return;
            }

            if (e.key.toLowerCase() === "q" && !isOpen) {
                setIsOpen(true);
                setStep(1);
            } else if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const handleSelect = (key: keyof typeof selections, value: string) => {
        setSelections(prev => ({ ...prev, [key]: value }));
        if (step < 3) {
            setTimeout(() => setStep(prev => prev + 1), 300);
        } else if (step === 3) {
            setTimeout(() => setStep(4), 300);
        }
    };

    const toggleExtra = (id: string) => {
        setSelections(prev => {
            const extras = prev.extras.includes(id)
                ? prev.extras.filter(e => e !== id)
                : [...prev.extras, id];
            return { ...prev, extras };
        });
    };

    const calculateEstimate = () => {
        let base = 0;
        // Type
        if (selections.type === "landing") base += 600;
        if (selections.type === "website") base += 1500;
        if (selections.type === "ai") base += 2500;
        if (selections.type === "app") base += 4000;

        // Design
        if (selections.design === "need") base *= 1.5; // +50% for design

        // Pages
        if (selections.pages === "1-5") base += 300;
        if (selections.pages === "5-10") base += 800;
        if (selections.pages === "10+") base += 1500;

        // Extras
        if (selections.extras.includes("multilanguage")) base += 300;
        if (selections.extras.includes("seo")) base += 200;
        if (selections.extras.includes("booking")) base += 500;

        return base;
    };

    const estimate = calculateEstimate();

    const options = {
        type: [
            { id: "landing", label: "One-Page Website", icon: Briefcase, desc: "Perfect for launching a product or service" },
            { id: "website", label: "Multi-Page Website", icon: GlobeIcon, desc: "Complete online presence with multiple sections" },
            { id: "app", label: "Custom Platform", icon: ZapIcon, desc: "Interactive tools for your users" },
            { id: "ai", label: "AI-Powered Solution", icon: Bot, desc: "Intelligent automation for your business" },
        ],
        design: [
            { id: "have", label: "I have Logos and Images", icon: Check, desc: "Logo, colors, and images prepared" },
            { id: "need", label: "I need help with design", icon: PaletteIcon, desc: "Create everything from scratch" },
        ],
        pages: [
            { id: "1-5", label: "Small", sub: "Perfect for Menus & Contact", icon: FileIcon, desc: "1-5 sections or pages" },
            { id: "5-10", label: "Medium", sub: "Great for Full Websites", icon: FilesIcon, desc: "5-10 sections or pages" },
            { id: "10+", label: "Large", sub: "Complex Projects", icon: FolderIcon, desc: "10+ sections or pages" },
        ],
        extras: [
            { id: "multilanguage", label: "Multi-language (PT/EN)", price: 300, icon: Globe },
            { id: "seo", label: "SEO & Google Maps", price: 200, icon: MapPin },
            { id: "booking", label: "Reservation System", price: 500, icon: Calendar },
        ]
    };

    return (
        <>
            {/* Floating Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="fixed bottom-8 right-8 z-40 hidden md:flex items-center gap-3 bg-background/80 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground text-xs font-bold font-mono border border-primary">
                    Q
                </div>
                <span className="text-sm font-medium text-foreground">to estimate project</span>
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
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                                <div>
                                    <h3 className="font-bold text-xl">Project Estimator</h3>
                                    <p className="text-sm text-muted-foreground">Get a quick ballpark figure for your project.</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <h4 className="text-lg font-medium">What type of project do you need?</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {options.type.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleSelect("type", opt.id)}
                                                        className="flex flex-col items-center justify-center p-6 gap-3 rounded-xl border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all group"
                                                    >
                                                        <opt.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        <span className="font-medium">{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <h4 className="text-lg font-medium">Do you already have your branding?</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {options.design.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleSelect("design", opt.id)}
                                                        className="flex flex-col items-center justify-center p-6 gap-3 rounded-xl border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all group"
                                                    >
                                                        <opt.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        <span className="font-medium">{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <h4 className="text-lg font-medium">What size project are you planning?</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {options.pages.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleSelect("pages", opt.id)}
                                                        className="flex flex-col items-center justify-center p-6 gap-2 rounded-xl border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all group text-center"
                                                    >
                                                        <opt.icon className="w-8 h-8 mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        <span className="font-medium">{opt.label}</span>
                                                        <span className="text-xs text-muted-foreground">{opt.sub}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 4 && (
                                        <motion.div
                                            key="step4"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <h4 className="text-lg font-medium">Any extras?</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {options.extras.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => toggleExtra(opt.id)}
                                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selections.extras.includes(opt.id)
                                                                ? "border-primary bg-primary/5"
                                                                : "border-muted hover:border-primary/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${selections.extras.includes(opt.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                                                <opt.icon className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-medium">{opt.label}</span>
                                                        </div>
                                                        <span className="font-bold text-primary">+€{opt.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setStep(5)}
                                                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all"
                                            >
                                                Calculate Estimate
                                            </button>
                                        </motion.div>
                                    )}

                                    {step === 5 && (
                                        <motion.div
                                            key="step5"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center text-center space-y-8 py-4"
                                        >
                                            <div className="space-y-2">
                                                <p className="text-muted-foreground uppercase tracking-wider text-sm font-medium">Estimated Investment</p>
                                                <div className="text-5xl md:text-6xl font-bold text-primary">
                                                    €{estimate.toLocaleString()}
                                                    <span className="text-2xl text-muted-foreground font-normal">+</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                                    This is a rough estimate based on your inputs. Final pricing may vary based on specific requirements.
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                                <button className="flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                                                    Book a Call <ArrowRight className="ml-2 w-4 h-4" />
                                                </button>
                                                <a
                                                    href="https://wa.me/351912345678" // Replace with actual number
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#25D366] rounded-lg hover:bg-[#25D366]/90 transition-all shadow-lg shadow-[#25D366]/25"
                                                >
                                                    WhatsApp
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setStep(1);
                                                        setSelections({ type: "", design: "", pages: "", extras: [] });
                                                    }}
                                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-all"
                                                >
                                                    Start Over
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Progress Bar */}
                            {step < 5 && (
                                <div className="h-1 bg-muted w-full">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${(step / 4) * 100}%` }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Icon components for the options
function GlobeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" x2="22" y1="12" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    )
}

function ZapIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}

function PaletteIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="13.5" cy="6.5" r=".5" />
            <circle cx="17.5" cy="10.5" r=".5" />
            <circle cx="8.5" cy="7.5" r=".5" />
            <circle cx="6.5" cy="12.5" r=".5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
    )
}

function FileIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    )
}

function FilesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V7.5L15.5 2z" />
            <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8" />
            <path d="M15 2v5.5h5.5" />
        </svg>
    )
}

function FolderIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
    )
}
