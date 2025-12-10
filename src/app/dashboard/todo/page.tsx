"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Check, Trash2, Calendar, Tag, Loader2, User, Users, X, Layout, ListFilter, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, createTask, toggleTask, deleteTask, getProfiles } from "./actions";
import { formatDistanceToNow } from "date-fns";
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

type FilterType = 'all' | 'me' | 'unassigned' | string; // string for tags (prefixed with 'tag:')

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [newTask, setNewTask] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState<string | null>("me");
    const [newTag, setNewTag] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTagInput, setShowTagInput] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
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

    useEffect(() => {
        // Auto-focus the task input after loading
        if (!loading && taskInputRef.current) {
            taskInputRef.current.focus();
        }
    }, [loading]);

    // Derived state for tags
    const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || []))).sort();

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'me') return task.assignee === currentUser;
        if (activeFilter === 'unassigned') return task.assignee === null;
        if (activeFilter.startsWith('tag:')) {
            const tag = activeFilter.replace('tag:', '');
            return task.tags?.includes(tag);
        }
        return true;
    });

    const activeTasks = filteredTasks.filter(t => t.status !== 'Done');
    const completedTasks = filteredTasks.filter(t => t.status === 'Done');

    const [alertInterval, setAlertInterval] = useState("None");

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

        const { data, error } = await createTask(newTask, assigneeId, selectedTags, alertInterval);
        if (data) {
            setTasks([data, ...tasks]);
            setNewTask("");
            setSelectedTags([]);
            setShowTagInput(false);
            setAlertInterval("None");
        }
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            if (!selectedTags.includes(newTag.trim())) {
                setSelectedTags([...selectedTags, newTag.trim()]);
            }
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
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
        <div className="h-[calc(100vh-4rem)] flex gap-6">
            {/* Left Sidebar - Navigation */}
            <div className="w-64 flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 overflow-y-auto">
                    <div className="space-y-1 mb-8">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Views</h3>
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeFilter === 'all' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Layout className="w-4 h-4" />
                            <span className="text-sm font-medium">All Tasks</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter('me')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeFilter === 'me' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">My Tasks</span>
                        </button>
                        <button
                            onClick={() => setActiveFilter('unassigned')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeFilter === 'unassigned' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">Unassigned</span>
                        </button>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Tags</h3>
                        {allTags.length === 0 && (
                            <div className="px-3 py-2 text-sm text-white/20 italic">No tags yet</div>
                        )}
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveFilter(`tag:${tag}`)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeFilter === `tag:${tag}` ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Hash className="w-4 h-4 opacity-50" />
                                <span className="text-sm font-medium">{tag}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            {activeFilter === 'all' && 'All Tasks'}
                            {activeFilter === 'me' && 'My Tasks'}
                            {activeFilter === 'unassigned' && 'Unassigned Tasks'}
                            {activeFilter.startsWith('tag:') && `#${activeFilter.replace('tag:', '')}`}
                        </h1>
                        <p className="text-white/60 text-sm">
                            {activeTasks.length} active, {completedTasks.length} completed
                        </p>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-b border-white/10">
                    <form onSubmit={addTask} className="space-y-3">
                        <div className="relative">
                            <input
                                ref={taskInputRef}
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-32 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <select
                                    value={alertInterval}
                                    onChange={(e) => setAlertInterval(e.target.value)}
                                    className="bg-white/10 text-xs text-white/80 focus:outline-none px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/20 transition-colors border-none"
                                    title="Alert Interval"
                                >
                                    <option value="None" className="bg-gray-900">No Alerts</option>
                                    <option value="1h" className="bg-gray-900">Every 1h</option>
                                    <option value="24h" className="bg-gray-900">Every 24h</option>
                                    <option value="1w" className="bg-gray-900">Every 1w</option>
                                </select>
                                <select
                                    value={selectedAssignee || 'everyone'}
                                    onChange={(e) => setSelectedAssignee(e.target.value)}
                                    className="bg-white/10 text-xs text-white/80 focus:outline-none px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/20 transition-colors border-none"
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
                                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tags & Extras */}
                        <div className="flex items-center gap-2 pl-1">
                            {selectedTags.map(tag => (
                                <span key={tag} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md flex items-center gap-1 border border-blue-500/30">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}

                            {showTagInput ? (
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Tag..."
                                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-24"
                                    autoFocus
                                    onBlur={() => !newTag && setShowTagInput(false)}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowTagInput(true)}
                                    className="text-xs flex items-center gap-1 text-white/40 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                >
                                    <Tag className="w-3 h-3" /> Add Tag
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Active */}
                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {activeTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    layout
                                    className="group flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-all"
                                >
                                    <button
                                        onClick={() => handleToggleTask(task.id, task.status)}
                                        className="mt-1 w-5 h-5 rounded-md border-2 border-white/20 flex items-center justify-center hover:border-blue-500 hover:bg-blue-500/20 transition-all flex-shrink-0"
                                    >
                                        <div className="w-0 h-0 bg-blue-500 rounded-sm transition-all" />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white leading-tight">{task.title}</div>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className="text-xs text-white/40 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                                                {task.assignee ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                                {getAssigneeName(task.assignee)}
                                            </span>
                                            <span className="text-xs text-white/40 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                                            </span>
                                            {task.tags && task.tags.map(tag => (
                                                <span key={tag} className="text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {activeTasks.length === 0 && (
                            <div className="text-center py-12 text-white/20 italic">
                                No active tasks in this view.
                            </div>
                        )}
                    </div>

                    {/* Completed */}
                    {completedTasks.length > 0 && (
                        <div className="space-y-2 pt-8 border-t border-white/10">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Completed</h3>
                            <AnimatePresence mode="popLayout">
                                {completedTasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.5 }}
                                        exit={{ opacity: 0 }}
                                        layout
                                        className="group flex items-center gap-4 p-3 bg-black/20 border border-transparent rounded-xl"
                                    >
                                        <button
                                            onClick={() => handleToggleTask(task.id, task.status)}
                                            className="w-5 h-5 rounded-md border-2 border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0"
                                        >
                                            <Check className="w-3 h-3 text-white" />
                                        </button>
                                        <span className="flex-1 font-medium text-white line-through decoration-white/30">{task.title}</span>

                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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

            {/* Right Sidebar - Stats (Simplified) */}
            <div className="w-72 space-y-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20">
                    <h3 className="font-bold text-lg mb-1">Productivity</h3>
                    <div className="flex items-end gap-2 mb-4">
                        <div className="text-4xl font-bold">
                            {tasks.length > 0
                                ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100)
                                : 0}%
                        </div>
                        <div className="text-sm text-white/60 mb-1">completion rate</div>
                    </div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/90 transition-all duration-1000"
                            style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'Done').length / tasks.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Team</h3>
                    <div className="space-y-3">
                        {profiles.map(profile => (
                            <div key={profile.id} className="flex items-center gap-3">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                        {profile.full_name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">{profile.full_name}</div>
                                    <div className="text-xs text-white/40">
                                        {tasks.filter(t => t.assignee === profile.id && t.status !== 'Done').length} active tasks
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
