"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "@/components/dashboard/projects/ProjectCard";
import { Loader } from "@/components/ui/loader";
import { Plus, Search, Filter, X, Calendar, Users, Briefcase } from "lucide-react";

type ProjectStatus = "in-progress" | "review" | "completed" | "on-hold";

interface ProjectType {
    id: number;
    title: string;
    client: string;
    deadline: string;
    status: ProjectStatus;
    progress: number;
    team: string[];
}

const INITIAL_PROJECTS: ProjectType[] = [
    {
        id: 1,
        title: "E-commerce Redesign",
        client: "Fashion Nova",
        deadline: "Dec 15, 2025",
        status: "in-progress",
        progress: 65,
        team: ["Alex", "Sarah", "Mike"],
    },
    {
        id: 2,
        title: "SEO Audit & Strategy",
        client: "TechCorp Inc.",
        deadline: "Nov 30, 2025",
        status: "review",
        progress: 90,
        team: ["John", "Emma"],
    },
    {
        id: 3,
        title: "Mobile App Development",
        client: "FitLife",
        deadline: "Jan 20, 2026",
        status: "on-hold",
        progress: 30,
        team: ["Alex", "David", "Lisa", "Tom"],
    },
    {
        id: 4,
        title: "Brand Identity",
        client: "Green Earth",
        deadline: "Dec 05, 2025",
        status: "completed",
        progress: 100,
        team: ["Sarah", "Jessica"],
    },
    {
        id: 5,
        title: "Marketing Campaign",
        client: "Speedy Motors",
        deadline: "Dec 10, 2025",
        status: "in-progress",
        progress: 45,
        team: ["Mike", "Emma"],
    },
    {
        id: 6,
        title: "Website Maintenance",
        client: "Local Bakery",
        deadline: "Ongoing",
        status: "in-progress",
        progress: 75,
        team: ["John"],
    },
];

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectType[]>(INITIAL_PROJECTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // New Project Form State
    const [newProject, setNewProject] = useState<Partial<ProjectType>>({
        title: "",
        client: "",
        deadline: "",
        status: "in-progress",
        progress: 0,
        team: [],
    });
    const [teamInput, setTeamInput] = useState("");

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => {
            // Simulate loading
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loader />;

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.client.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        const project: ProjectType = {
            id: Date.now(),
            title: newProject.title || "Untitled Project",
            client: newProject.client || "Unknown Client",
            deadline: newProject.deadline || "TBD",
            status: (newProject.status as ProjectStatus) || "in-progress",
            progress: Number(newProject.progress) || 0,
            team: teamInput.split(",").map(s => s.trim()).filter(Boolean),
        };

        setProjects([project, ...projects]);
        setIsModalOpen(false);
        setNewProject({ title: "", client: "", deadline: "", status: "in-progress", progress: 0, team: [] });
        setTeamInput("");
    };

    const handleDeleteProject = (id: number) => {
        if (confirm("Are you sure you want to delete this project?")) {
            setProjects(projects.filter(p => p.id !== id));
        }
    };

    const handleEditProject = (id: number) => {
        alert("Edit functionality coming soon!");
    };

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Projects</h1>
                    <p className="text-white/60">Track and manage your ongoing client projects.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Pesquisar projetos ou clientes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <ProjectCard
                                {...project}
                                onDelete={handleDeleteProject}
                                onEdit={handleEditProject}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredProjects.length === 0 && (
                    <div className="col-span-full text-center py-20 text-white/40">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>No projects found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* New Project Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                    <h2 className="text-xl font-bold">New Project</h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Project Title</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Website Redesign"
                                            value={newProject.title}
                                            onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Client Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Acme Corp"
                                            value={newProject.client}
                                            onChange={e => setNewProject({ ...newProject, client: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Deadline</label>
                                            <input
                                                required
                                                type="date"
                                                value={newProject.deadline}
                                                onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Status</label>
                                            <select
                                                value={newProject.status}
                                                onChange={e => setNewProject({ ...newProject, status: e.target.value as ProjectStatus })}
                                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            >
                                                <option value="in-progress">In Progress</option>
                                                <option value="review">In Review</option>
                                                <option value="on-hold">On Hold</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Progress (%)</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={newProject.progress}
                                            onChange={e => setNewProject({ ...newProject, progress: Number(e.target.value) })}
                                            className="w-full accent-blue-500"
                                        />
                                        <div className="text-right text-xs text-white/40">{newProject.progress}%</div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Team Members (comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="Alex, Sarah, Mike"
                                            value={teamInput}
                                            onChange={e => setTeamInput(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            Create Project
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
