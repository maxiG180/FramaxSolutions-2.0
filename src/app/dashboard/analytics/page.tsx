"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity, MousePointer2, TrendingUp, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Charts
const REVENUE_DATA = [40, 25, 60, 35, 80, 55, 90, 45, 70, 85, 60, 95];
const VISITORS_DATA = [30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 100];

const METRICS = [
    {
        label: "Total Revenue",
        value: "$124,500",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
    },
    {
        label: "Active Clients",
        value: "45",
        change: "+4",
        trend: "up",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
    },
    {
        label: "Bounce Rate",
        value: "24.8%",
        change: "-2.1%",
        trend: "down", // Good for bounce rate
        icon: Activity,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
    },
    {
        label: "Avg. Session",
        value: "4m 32s",
        change: "+12s",
        trend: "up",
        icon: MousePointer2,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
    },
];

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 text-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-white/60 mt-1">Overview of your agency's performance.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {METRICS.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2 rounded-lg", metric.bg)}>
                                <metric.icon className={cn("w-5 h-5", metric.color)} />
                            </div>
                            <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                                metric.trend === "up" ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
                            )}>
                                {metric.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {metric.change}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                        <p className="text-sm text-white/40">{metric.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart (Large) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-semibold">Revenue Overview</h2>
                            <p className="text-sm text-white/40">Monthly revenue performance</p>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Custom Bar Chart Visualization */}
                    <div className="h-64 flex items-end justify-between gap-2">
                        {REVENUE_DATA.map((value, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                <div className="relative w-full h-full flex items-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${value}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.05), type: "spring" }}
                                        className="w-full bg-blue-500/20 rounded-t-sm group-hover:bg-blue-500/40 transition-colors relative"
                                    >
                                        <div className="absolute bottom-0 left-0 w-full bg-blue-500 h-1 opacity-50" />
                                    </motion.div>
                                </div>
                                <span className="text-xs text-white/20 group-hover:text-white/60 transition-colors">
                                    {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Traffic Source (Small) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <h2 className="text-lg font-semibold mb-1">Traffic Sources</h2>
                    <p className="text-sm text-white/40 mb-6">Where your clients come from</p>

                    <div className="space-y-6">
                        {[
                            { label: "Direct", value: 45, color: "bg-blue-500" },
                            { label: "Social Media", value: 32, color: "bg-purple-500" },
                            { label: "Organic Search", value: 15, color: "bg-emerald-500" },
                            { label: "Referral", value: 8, color: "bg-orange-500" },
                        ].map((item, i) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white/60">{item.label}</span>
                                    <span className="font-medium">{item.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.value}%` }}
                                        transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                                        className={cn("h-full rounded-full", item.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-100">Insight</h4>
                                <p className="text-xs text-blue-200/60 mt-1">
                                    Social media traffic has increased by 15% this month. Consider boosting your LinkedIn ad spend.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
