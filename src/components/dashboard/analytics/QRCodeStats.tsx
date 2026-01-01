"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { QrCode, TrendingUp } from "lucide-react";

interface QRScan {
    id: string;
    scanned_at: string;
    user_agent: string;
}

export function QRCodeStats() {
    const [stats, setStats] = useState({ total: 0, last7Days: 0 });
    const [recentScans, setRecentScans] = useState<QRScan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQRStats();
    }, []);

    const fetchQRStats = async () => {
        const supabase = createClient();

        // Get total scans
        const { count: totalCount } = await supabase
            .from("qr_scans")
            .select("*", { count: "exact", head: true });

        // Get last 7 days scans
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: weekCount } = await supabase
            .from("qr_scans")
            .select("*", { count: "exact", head: true })
            .gte("scanned_at", sevenDaysAgo.toISOString());

        // Get recent scans for list
        const { data: scans } = await supabase
            .from("qr_scans")
            .select("*")
            .order("scanned_at", { ascending: false })
            .limit(10);

        setStats({
            total: totalCount || 0,
            last7Days: weekCount || 0,
        });
        setRecentScans(scans || []);
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getBrowserFromAgent = (userAgent: string) => {
        if (userAgent.includes("Chrome")) return "Chrome";
        if (userAgent.includes("Safari")) return "Safari";
        if (userAgent.includes("Firefox")) return "Firefox";
        if (userAgent.includes("Edge")) return "Edge";
        return "Unknown";
    };

    if (loading) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-40 bg-white/5 rounded" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold">QR Code Scans</h2>
                    <p className="text-sm text-white/40">Track your business card QR code performance</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                    <QrCode className="w-5 h-5 text-blue-400" />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white/40 mb-1">Total Scans</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white/40 mb-1">Last 7 Days</p>
                    <p className="text-2xl font-bold">{stats.last7Days}</p>
                </div>
            </div>

            {/* Recent Scans */}
            <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Recent Scans</h3>
                <div className="space-y-2">
                    {recentScans.length === 0 ? (
                        <p className="text-sm text-white/30 italic py-4 text-center">No scans yet</p>
                    ) : (
                        recentScans.map((scan, index) => (
                            <motion.div
                                key={scan.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + (index * 0.05) }}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium">{getBrowserFromAgent(scan.user_agent)}</p>
                                    <p className="text-xs text-white/40">{formatDate(scan.scanned_at)}</p>
                                </div>
                                <div className="flex items-center gap-1 text-green-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-xs font-medium">Scan</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
