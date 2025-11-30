"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const FEATURES = [
    { name: "Delivery Time", framax: "2 Weeks", others: "3+ Months", freelancers: "Unpredictable" },
    { name: "Design Quality", framax: "World-Class", others: "Generic Templates", freelancers: "Inconsistent" },
    { name: "Pricing Model", framax: "Fixed Price", others: "Hourly Billing", freelancers: "Hidden Costs" },
    { name: "Communication", framax: "Direct Access", others: "Account Managers", freelancers: "Ghosting Risk" },
    { name: "Revisions", framax: "Unlimited", others: "Capped at 2", freelancers: "Charged Extra" },
    { name: "Tech Stack", framax: "Modern (Next.js)", others: "Outdated (WP)", freelancers: "Varies" },
];

export function Comparison() {
    return (
        <section id="comparison" className="py-32 bg-background/50 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        Why <span className="text-primary">Framax</span>?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Stop gambling with your project. See exactly how we stack up against the competition.
                    </motion.p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Headers */}
                        <div className="hidden md:block p-6"></div>
                        <div className="p-6 text-center font-bold text-xl text-muted-foreground">Freelancers</div>
                        <div className="p-6 text-center font-bold text-xl text-muted-foreground">Big Agencies</div>
                        <div className="p-6 text-center font-bold text-2xl text-primary bg-primary/10 rounded-t-2xl border-t border-x border-primary/20">Framax</div>

                        {/* Rows */}
                        {FEATURES.map((feature, index) => (
                            <motion.div
                                key={feature.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="contents"
                            >
                                {/* Feature Name (Mobile: Show above, Desktop: Show left) */}
                                <div className="md:col-span-1 p-4 md:p-6 flex items-center font-medium text-lg border-b border-border/50">
                                    {feature.name}
                                </div>

                                {/* Freelancers */}
                                <div className="p-4 md:p-6 flex items-center justify-center text-center border-b border-border/50 text-muted-foreground bg-muted/20 md:bg-transparent">
                                    <span className="md:hidden font-bold mr-2">Freelancers: </span>
                                    {feature.freelancers === "Unpredictable" || feature.freelancers === "Inconsistent" || feature.freelancers === "Ghosting Risk" ? (
                                        <div className="flex items-center text-red-400 gap-2">
                                            <X className="w-5 h-5" /> {feature.freelancers}
                                        </div>
                                    ) : (
                                        feature.freelancers
                                    )}
                                </div>

                                {/* Big Agencies */}
                                <div className="p-4 md:p-6 flex items-center justify-center text-center border-b border-border/50 text-muted-foreground bg-muted/20 md:bg-transparent">
                                    <span className="md:hidden font-bold mr-2">Agencies: </span>
                                    {feature.others === "3+ Months" || feature.others === "Generic Templates" || feature.others === "Hourly Billing" ? (
                                        <div className="flex items-center text-orange-400 gap-2">
                                            <Minus className="w-5 h-5" /> {feature.others}
                                        </div>
                                    ) : (
                                        feature.others
                                    )}
                                </div>

                                {/* Framax */}
                                <div className={`p-4 md:p-6 flex items-center justify-center text-center border-b border-x border-primary/20 bg-primary/5 ${index === FEATURES.length - 1 ? 'rounded-b-2xl border-b-primary/20' : ''}`}>
                                    <span className="md:hidden font-bold mr-2 text-primary">Framax: </span>
                                    <div className="flex items-center text-primary font-bold gap-2">
                                        <Check className="w-6 h-6" /> {feature.framax}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
