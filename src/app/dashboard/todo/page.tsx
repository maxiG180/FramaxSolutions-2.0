"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Check, Trash2, Loader2, User, Users, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, createTask, toggleTask, deleteTask, getProfiles } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type Task = {
    id: number;
    title: string;
    status: string;
    priority: string;
    due_date: string;
    created_at: string;
    assignee: string | null;
    tags: string[] | null;
};

type Profile = {
    id: string;
    full_name: string;
    avatar_url: string | null;
};

type FilterType = 'all' | 'me' | 'unassigned';

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [newTask, setNewTask] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState<string | null>("me");
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showFilters, setShowFilters] = useState(false);
    const taskInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUser(user.id);

            const [tasksData, profilesData] = await Promise.all([
                getTasks(),
                getProfiles()
            ]);
            setTasks(tasksData);
            setProfiles(profilesData);
            setLoading(false);
        };
        init();
    }, []);

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'me') return task.assignee === currentUser;
        if (activeFilter === 'unassigned') return task.assignee === null;
        return true;
    });

    const activeTasks = filteredTasks.filter(t => t.status !== 'Done');
    const completedTasks = filteredTasks.filter(t => t.status === 'Done');

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        let assigneeId: string | null = null;
        if (selectedAssignee === 'me') {
            assigneeId = currentUser;
        } else if (selectedAssignee === 'everyone') {
            assigneeId = null;
        } else {
            assigneeId = selectedAssignee;
        }

        const { data, error } = await createTask(newTask, assigneeId, [], "None");
        if (data) {
            setTasks([data, ...tasks]);
            setNewTask("");
        }
    };

    const handleToggleTask = async (id: number, currentStatus: string) => {
        const isCompleted = currentStatus === 'Done';
        const newStatus = isCompleted ? 'Todo' : 'Done';

        setTasks(tasks.map(t =>
            t.id === id ? { ...t, status: newStatus } : t
        ));

        const { success } = await toggleTask(id, !isCompleted);
        if (!success) {
            setTasks(tasks.map(t =>
                t.id === id ? { ...t, status: currentStatus } : t
            ));
        }
    };

    const handleDeleteTask = async (id: number) => {
        const taskToDelete = tasks.find(t => t.id === id);
        setTasks(tasks.filter(t => t.id !== id));

        const { success } = await deleteTask(id);
        if (!success && taskToDelete) {
            setTasks([...tasks, taskToDelete]);
        }
    };

    const getAssigneeName = (assigneeId: string | null) => {
        if (!assigneeId) return "Everyone";
        if (assigneeId === currentUser) return "Me";
        const profile = profiles.find(p => p.id === assigneeId);
        return profile ? profile.full_name : "Unknown";
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {activeFilter === 'all' && 'All Tasks'}
                        {activeFilter === 'me' && 'My Tasks'}
                        {activeFilter === 'unassigned' && 'Unassigned'}
                    </h1>
                    <p className="text-white/60 text-sm">
                        {activeTasks.length} active
                    </p>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <span className="text-sm font-medium">Filter</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {showFilters && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-black border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                                >
                                    <button
                                        onClick={() => { setActiveFilter('me'); setShowFilters(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                            activeFilter === 'me' ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/5'
                                        )}
                                    >
                                        <User className="w-4 h-4" />
                                        My Tasks
                                    </button>
                                    <button
                                        onClick={() => { setActiveFilter('all'); setShowFilters(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                            activeFilter === 'all' ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/5'
                                        )}
                                    >
                                        <Users className="w-4 h-4" />
                                        All Tasks
                                    </button>
                                    <button
                                        onClick={() => { setActiveFilter('unassigned'); setShowFilters(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                            activeFilter === 'unassigned' ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/5'
                                        )}
                                    >
                                        <Users className="w-4 h-4" />
                                        Unassigned
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add Task Input */}
            <form onSubmit={addTask} className="mb-6">
                <div className="flex gap-2">
                    <input
                        ref={taskInputRef}
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a task..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/40"
                        autoFocus
                    />
                    <select
                        value={selectedAssignee || 'everyone'}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hidden md:block"
                    >
                        <option value="me" className="bg-gray-900">Me</option>
                        <option value="everyone" className="bg-gray-900">Everyone</option>
                        {profiles.filter(p => p.id !== currentUser).map(profile => (
                            <option key={profile.id} value={profile.id} className="bg-gray-900">
                                {profile.full_name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 md:px-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-8">
                {/* Active Tasks */}
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {activeTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                layout
                                className="group flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all"
                            >
                                <button
                                    onClick={() => handleToggleTask(task.id, task.status)}
                                    className="mt-0.5 w-6 h-6 md:w-7 md:h-7 rounded-lg border-2 border-white/30 flex items-center justify-center hover:border-blue-500 hover:bg-blue-500/20 transition-all flex-shrink-0"
                                >
                                    <div className="w-0 h-0 bg-blue-500 rounded-sm transition-all" />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white leading-tight break-words">{task.title}</div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-xs text-white/40 flex items-center gap-1">
                                            {task.assignee ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                            {getAssigneeName(task.assignee)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {activeTasks.length === 0 && (
                        <div className="text-center py-12 text-white/40 italic">
                            No active tasks
                        </div>
                    )}
                </div>

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div className="space-y-2 pt-6 border-t border-white/10">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Completed</h3>
                        <AnimatePresence mode="popLayout">
                            {completedTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    layout
                                    className="group flex items-center gap-3 md:gap-4 p-3 bg-black/20 rounded-xl"
                                >
                                    <button
                                        onClick={() => handleToggleTask(task.id, task.status)}
                                        className="w-6 h-6 md:w-7 md:h-7 rounded-lg border-2 border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="flex-1 font-medium text-white/60 line-through break-words">{task.title}</span>

                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
