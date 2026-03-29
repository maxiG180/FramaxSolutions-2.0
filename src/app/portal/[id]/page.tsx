"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Download, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ClientPortalPage() {
    const [activeTab, setActiveTab] = useState<"overview" | "files">("overview");

    // Mock Data
    const project = {
        title: "E-commerce Redesign",
        phase: "Development",
        progress: 65,
        nextMilestone: "Beta Release - Dec 10",
        approvals: [
            { id: 1, title: "Homepage Design v2", status: "approved", date: "Nov 20" },
            { id: 2, title: "User Flow Diagrams", status: "pending", date: "Nov 25" },
        ],
        recentFiles: [
            { name: "Contract_Signed.pdf", size: "2.4 MB", date: "Nov 01" },
            { name: "Brand_Assets.zip", size: "156 MB", date: "Nov 15" },
        ]
    };

    return (
        <div className="space-y-12">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-2"
                    >
                        Welcome back, Fashion Nova
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-lg"
                    >
                        Here's what's happening with your project today.
                    </motion.p>
                </div>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                >
                    <MessageSquare className="w-4 h-4" /> Contact Manager
                </motion.button>
            </div>

            {/* Project Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <div className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wider">Current Project</div>
                            <h2 className="text-3xl font-bold">{project.title}</h2>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Overall Progress</span>
                                <span className="font-bold">{project.progress}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${project.progress}%` }} />
                            </div>
                        </div>

                        <div className="flex gap-8 pt-4">
                            <div>
                                <div className="text-sm text-white/40 mb-1">Current Phase</div>
                                <div className="font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    {project.phase}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-white/40 mb-1">Next Milestone</div>
                                <div className="font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    {project.nextMilestone}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                            Pending Approvals
                        </h3>
                        <div className="space-y-3">
                            {project.approvals.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-sm font-medium">{item.title}</div>
                                    {item.status === "approved" ? (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Approved</span>
                                    ) : (
                                        <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition-colors">
                                            Review
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Files */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Recent Files</h3>
                        <button className="text-sm text-white/40 hover:text-white transition-colors">View All</button>
                    </div>
                    <div className="space-y-4">
                        {project.recentFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium group-hover:text-blue-400 transition-colors">{file.name}</div>
                                        <div className="text-xs text-white/40">{file.size} • {file.date}</div>
                                    </div>
                                </div>
                                <button className="p-2 text-white/40 hover:text-white transition-colors">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Updates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-bold mb-6">Project Updates</h3>
                    <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-green-500" />
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-white">Homepage Design Approved</span>
                                <p className="text-sm text-white/60">Great work! The team loves the new direction. Proceeding to development.</p>
                                <span className="text-xs text-white/40 mt-1">Yesterday at 2:30 PM</span>
                            </div>
                        </div>
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-blue-500" />
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-white">New Assets Uploaded</span>
                                <p className="text-sm text-white/60">Added the new icon set and font files to the shared drive.</p>
                                <span className="text-xs text-white/40 mt-1">Nov 28 at 10:15 AM</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
