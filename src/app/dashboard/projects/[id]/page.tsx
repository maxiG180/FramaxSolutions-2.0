"use client";

import { useState } from "react";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare,
    MoreVertical,
    Paperclip,
    Plus,
    Users,
    TrendingUp,
    AlertCircle,
    Download,
    Share2,
    LayoutGrid,
    List
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetailsPage() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "files" | "team">("overview");

    // Mock Data (In a real app, fetch based on params.id)
    const project = {
        id: params.id,
        title: "E-commerce Redesign",
        client: "Fashion Nova",
        status: "in-progress",
        deadline: "Dec 15, 2025",
        daysLeft: 14,
        progress: 65,
        description: "Complete redesign of the main e-commerce platform including new checkout flow, user dashboard, and mobile responsiveness improvements. The goal is to increase conversion rate by 20%.",
        team: [
            { name: "Alex", role: "Lead Dev", online: true },
            { name: "Sarah", role: "Designer", online: false },
            { name: "Mike", role: "Frontend", online: true }
        ],
        tasks: [
            { id: 1, title: "Design System Update", status: "completed", assignee: "Sarah", priority: "high" },
            { id: 2, title: "Homepage Hero Animation", status: "in-progress", assignee: "Mike", priority: "medium" },
            { id: 3, title: "Checkout API Integration", status: "pending", assignee: "Alex", priority: "high" },
            { id: 4, title: "Mobile Responsive Testing", status: "pending", assignee: "Mike", priority: "low" },
        ],
        files: [
            { name: "Design_System_v2.fig", size: "24 MB", type: "figma", date: "2 days ago" },
            { name: "Project_Brief.pdf", size: "2.4 MB", type: "pdf", date: "1 week ago" },
            { name: "Assets_Export.zip", size: "156 MB", type: "zip", date: "3 days ago" },
        ]
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Navigation */}
            <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Projects
            </Link>

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-black border border-white/10 p-8 md:p-10">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <div className="w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                IN PROGRESS
                            </div>
                            <span className="text-white/40 text-sm flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Due {project.deadline}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                {project.title}
                            </h1>
                            <p className="text-xl text-white/60 font-light">
                                for <span className="text-white font-medium">{project.client}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all hover:scale-105 active:scale-95">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all hover:scale-105 active:scale-95">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        <Link
                            href={`/portal/${project.id}`}
                            target="_blank"
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 flex items-center gap-2"
                        >
                            Client Portal <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                        <div className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Progress</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white">{project.progress}%</span>
                            <span className="text-xs text-green-400 mb-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-0.5" /> +5%
                            </span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                        <div className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Time Remaining</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white">{project.daysLeft}</span>
                            <span className="text-xs text-white/40 mb-1">days</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }} />
                        </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                        <div className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Team</div>
                        <div className="flex items-center -space-x-2 mt-1">
                            {project.team.map((member, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/20 flex items-center justify-center text-xs font-bold text-white" title={member.name}>
                                    {member.name.charAt(0)}
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/60">
                                +2
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                        <div className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Tasks</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white">12</span>
                            <span className="text-xs text-white/40 mb-1">open</span>
                        </div>
                        <div className="flex items-center gap-1 mt-3">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] text-white/40">4 completed this week</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    {/* Custom Tabs */}
                    <div className="flex p-1 bg-white/5 rounded-xl w-fit border border-white/10">
                        {(["overview", "tasks", "files", "team"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "text-white" : "text-white/40 hover:text-white"
                                    }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 rounded-lg shadow-sm"
                                        transition={{ type: "spring", duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10 capitalize">{tab}</span>
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {activeTab === "overview" && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">About this Project</h3>
                                        <p className="text-white/60 leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                                            <div className="space-y-6 relative pl-2">
                                                <div className="absolute left-2 top-2 bottom-2 w-px bg-white/10" />
                                                {[1, 2, 3].map((_, i) => (
                                                    <div key={i} className="relative pl-6">
                                                        <div className="absolute left-0 top-1.5 w-4 h-4 -ml-[8.5px] rounded-full bg-[#0A0A0A] border-2 border-blue-500" />
                                                        <p className="text-sm text-white font-medium">Design System v2.0 published</p>
                                                        <p className="text-xs text-white/40 mt-1">Sarah • 2 hours ago</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4">Project Health</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">Budget</div>
                                                            <div className="text-xs text-white/40">On Track</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-green-400 text-sm font-bold">92%</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                                            <Clock className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">Timeline</div>
                                                            <div className="text-xs text-white/40">Slight Delay</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-yellow-400 text-sm font-bold">-2d</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "tasks" && (
                                <motion.div
                                    key="tasks"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white">Tasks</h3>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                                            <Plus className="w-4 h-4" /> Add Task
                                        </button>
                                    </div>
                                    {project.tasks.map((task) => (
                                        <div key={task.id} className="group flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === "completed" ? "bg-green-500 border-green-500" : "border-white/20 hover:border-blue-500"
                                                    }`}>
                                                    {task.status === "completed" && <CheckCircle2 className="w-3 h-3 text-black" />}
                                                </button>
                                                <div>
                                                    <p className={`font-medium ${task.status === "completed" ? "text-white/40 line-through" : "text-white"}`}>
                                                        {task.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className="text-xs text-white/40">Due tomorrow</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                                                        {task.assignee.charAt(0)}
                                                    </div>
                                                </div>
                                                <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === "files" && (
                                <motion.div
                                    key="files"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {project.files.map((file, i) => (
                                            <div key={i} className="group p-4 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-white font-medium truncate mb-1">{file.name}</p>
                                                <div className="flex items-center justify-between text-xs text-white/40">
                                                    <span>{file.size}</span>
                                                    <span>{file.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="flex flex-col items-center justify-center gap-3 p-4 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-medium">Upload File</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "team" && (
                                <motion.div
                                    key="team"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {project.team.map((member, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/10 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/10 flex items-center justify-center text-lg font-bold text-white">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    {member.online && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0A0A0A] rounded-full" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{member.name}</p>
                                                    <p className="text-sm text-white/40">{member.role}</p>
                                                </div>
                                            </div>
                                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-white transition-colors">
                                                Message
                                            </button>
                                        </div>
                                    ))}
                                    <button className="flex items-center justify-center gap-2 p-4 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all">
                                        <Plus className="w-5 h-5" />
                                        <span className="font-medium">Add Member</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-3 p-3 text-left bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm">Create Task</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-left bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                    <Paperclip className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm">Upload File</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-left bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm">Team Chat</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Client Details</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                                FN
                            </div>
                            <div>
                                <div className="text-white font-bold">Fashion Nova</div>
                                <div className="text-xs text-white/40">Premium Client</div>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/40">Contact</span>
                                <span className="text-white">Sarah Jenkins</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40">Email</span>
                                <span className="text-white">sarah@fashionnova.com</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40">Phone</span>
                                <span className="text-white">+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
