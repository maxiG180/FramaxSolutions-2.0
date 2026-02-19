"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Check, Trash2, Loader2, User, Users, X, ChevronDown, LayoutGrid, List, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, createTask, toggleTask, deleteTask, getProfiles, updateTaskStatus, updateTaskTitle, updateTaskAssignee, updateTaskAlertInterval } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { useLanguage } from "@/context/LanguageContext";

type Task = {
    id: number;
    title: string;
    status: string;
    priority: string;
    due_date: string;
    created_at: string;
    assignee: string | null;
    tags: string[] | null;
    alert_interval: string | null;
    last_alert_sent_at: string | null;
};

type Profile = {
    id: string;
    full_name: string;
    avatar_url: string | null;
};

type FilterType = 'all' | 'me' | 'unassigned';
type ViewMode = 'list' | 'kanban';

export default function TodoPage() {
    const { t } = useLanguage();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [newTask, setNewTask] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState<string | null>("everyone");
    const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
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

    const activeTasks = filteredTasks.filter(t => t.status === 'Todo');
    const doingTasks = filteredTasks.filter(t => t.status === 'Doing');
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

        const alertInterval = reminderEnabled ? "12h" : "None";
        const { data, error} = await createTask(newTask, assigneeId, [], alertInterval);
        if (data) {
            setTasks([data, ...tasks]);
            setNewTask("");
            setReminderEnabled(false); // Reset reminder after creating task
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

    const handleUpdateTaskStatus = async (id: number, newStatus: 'Todo' | 'Doing' | 'Done') => {
        const currentTask = tasks.find(t => t.id === id);
        if (!currentTask) return;

        setTasks(tasks.map(t =>
            t.id === id ? { ...t, status: newStatus } : t
        ));

        const { success } = await updateTaskStatus(id, newStatus);
        if (!success) {
            setTasks(tasks.map(t =>
                t.id === id ? { ...t, status: currentTask.status } : t
            ));
        }
    };

    const handleUpdateTaskAlertInterval = async (id: number, newAlertInterval: string) => {
        const currentTask = tasks.find(t => t.id === id);
        if (!currentTask) return;

        setTasks(tasks.map(t =>
            t.id === id ? { ...t, alert_interval: newAlertInterval } : t
        ));

        const { success } = await updateTaskAlertInterval(id, newAlertInterval);
        if (!success) {
            setTasks(tasks.map(t =>
                t.id === id ? { ...t, alert_interval: currentTask.alert_interval } : t
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
        if (!assigneeId) return t.tasks.everyone;
        if (assigneeId === currentUser) return t.tasks.me;
        const profile = profiles.find(p => p.id === assigneeId);
        return profile ? profile.full_name : "Unknown";
    };

    const isReminderActive = (alertInterval: string | null) => {
        return alertInterval && alertInterval !== 'None';
    };

    const handleToggleReminder = async (taskId: number, currentInterval: string | null) => {
        const newInterval = isReminderActive(currentInterval) ? 'None' : '12h';
        await handleUpdateTaskAlertInterval(taskId, newInterval);
    };

    const handleStartEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingTitle(task.title);
    };

    const handleCancelEditing = () => {
        setEditingTaskId(null);
        setEditingTitle("");
    };

    const handleSaveTitle = async (taskId: number) => {
        if (!editingTitle.trim()) {
            handleCancelEditing();
            return;
        }

        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, title: editingTitle } : t
        );
        setTasks(updatedTasks);
        setEditingTaskId(null);

        // Server update
        const { success } = await updateTaskTitle(taskId, editingTitle);
        if (!success) {
            // Revert on failure
            setTasks(tasks);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto px-2 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                        {activeFilter === 'all' && t.tasks.allTasks}
                        {activeFilter === 'me' && t.tasks.myTasks}
                        {activeFilter === 'unassigned' && t.tasks.unassigned}
                    </h1>
                    <p className="text-white/60 text-xs sm:text-sm">
                        {activeTasks.length} {t.tasks.active} • {doingTasks.length} {t.tasks.inProgress}
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* View Mode Toggle */}
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded transition-colors",
                                viewMode === 'list' ? "bg-blue-500 text-white" : "text-white/60 hover:text-white"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={cn(
                                "p-2 rounded transition-colors",
                                viewMode === 'kanban' ? "bg-blue-500 text-white" : "text-white/60 hover:text-white"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative flex-1 sm:flex-none">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors w-full justify-center"
                        >
                            <span className="text-sm font-medium">{t.tasks.filter}</span>
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
                                            {t.tasks.myTasks}
                                        </button>
                                        <button
                                            onClick={() => { setActiveFilter('all'); setShowFilters(false); }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                                activeFilter === 'all' ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/5'
                                            )}
                                        >
                                            <Users className="w-4 h-4" />
                                            {t.tasks.allTasks}
                                        </button>
                                        <button
                                            onClick={() => { setActiveFilter('unassigned'); setShowFilters(false); }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                                activeFilter === 'unassigned' ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/5'
                                            )}
                                        >
                                            <Users className="w-4 h-4" />
                                            {t.tasks.unassigned}
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Add Task Input */}
            <form onSubmit={addTask} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        ref={taskInputRef}
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder={t.tasks.addTask}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/40"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <select
                            value={selectedAssignee || 'everyone'}
                            onChange={(e) => setSelectedAssignee(e.target.value)}
                            className="flex-1 sm:flex-none bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="me" className="bg-gray-900">{t.tasks.me}</option>
                            <option value="everyone" className="bg-gray-900">{t.tasks.everyone}</option>
                            {profiles.filter(p => p.id !== currentUser).map(profile => (
                                <option key={profile.id} value={profile.id} className="bg-gray-900">
                                    {profile.full_name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setReminderEnabled(!reminderEnabled)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                                reminderEnabled
                                    ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                            )}
                            title={reminderEnabled ? t.tasks.reminderOn : t.tasks.reminderOff}
                        >
                            <Bell className={cn("w-4 h-4", reminderEnabled && "animate-pulse")} />
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 md:px-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </form>

            {/* Kanban Board View */}
            {viewMode === 'kanban' && (
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard
                        tasks={filteredTasks}
                        currentUser={currentUser}
                        profiles={profiles}
                        onTasksChange={setTasks}
                    />
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="flex-1 space-y-6 pb-8 overflow-y-auto scrollbar-thin">
                    {/* Doing Tasks - Highlighted */}
                    {doingTasks.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                {t.tasks.doing} ({doingTasks.length})
                            </h3>
                            <AnimatePresence mode="popLayout">
                                {doingTasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        layout
                                        className="group flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-all"
                                    >
                                        <button
                                            onClick={() => handleToggleTask(task.id, task.status)}
                                            className="mt-0.5 w-6 h-6 md:w-7 md:h-7 rounded-lg border-2 border-blue-400/50 flex items-center justify-center hover:border-blue-500 hover:bg-blue-500/20 transition-all flex-shrink-0"
                                        >
                                            <div className="w-0 h-0 bg-blue-500 rounded-sm transition-all" />
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            {editingTaskId === task.id ? (
                                                <input
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onBlur={() => handleSaveTitle(task.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveTitle(task.id);
                                                        if (e.key === 'Escape') handleCancelEditing();
                                                    }}
                                                    autoFocus
                                                    className="w-full bg-white/10 border border-blue-500/50 rounded px-2 py-1 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div
                                                    onDoubleClick={() => handleStartEditing(task)}
                                                    className="font-medium text-white leading-tight break-words cursor-text hover:bg-white/5 px-2 py-1 rounded transition-colors"
                                                    title="Double-click to edit"
                                                >
                                                    {task.title}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="text-xs text-white/60 flex items-center gap-1">
                                                    {task.assignee ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                                    {getAssigneeName(task.assignee)}
                                                </span>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as 'Todo' | 'Doing' | 'Done')}
                                                    className="text-xs bg-blue-500/20 border border-blue-500/30 rounded px-2 py-1 text-blue-300 hover:text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <option value="Todo" className="bg-gray-900">{t.tasks.todo}</option>
                                                    <option value="Doing" className="bg-gray-900">{t.tasks.doing}</option>
                                                    <option value="Done" className="bg-gray-900">{t.tasks.done}</option>
                                                </select>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleReminder(task.id, task.alert_interval);
                                                    }}
                                                    className={cn(
                                                        "text-xs rounded-lg px-2.5 py-1 transition-all flex items-center gap-1.5 font-medium",
                                                        isReminderActive(task.alert_interval)
                                                            ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 shadow-lg shadow-yellow-500/10"
                                                            : "bg-white/5 border border-white/20 text-white/50 hover:bg-white/10 hover:text-white/70 hover:border-white/30"
                                                    )}
                                                    title={isReminderActive(task.alert_interval) ? t.tasks.reminderOn : t.tasks.reminderOff}
                                                >
                                                    <Bell className={cn("w-3.5 h-3.5", isReminderActive(task.alert_interval) && "animate-pulse")} />
                                                    <span>{isReminderActive(task.alert_interval) ? "Reminder" : "Set Reminder"}</span>
                                                </button>
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
                        </div>
                    )}

                    {/* Todo Tasks */}
                    <div className="space-y-2">
                        {activeTasks.length > 0 && (
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{t.tasks.todo} ({activeTasks.length})</h3>
                        )}
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
                                        {editingTaskId === task.id ? (
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onBlur={() => handleSaveTitle(task.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveTitle(task.id);
                                                    if (e.key === 'Escape') handleCancelEditing();
                                                }}
                                                autoFocus
                                                className="w-full bg-white/10 border border-blue-500/50 rounded px-2 py-1 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div
                                                onDoubleClick={() => handleStartEditing(task)}
                                                className="font-medium text-white leading-tight break-words cursor-text hover:bg-white/5 px-2 py-1 rounded transition-colors"
                                                title="Double-click to edit"
                                            >
                                                {task.title}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span className="text-xs text-white/40 flex items-center gap-1">
                                                {task.assignee ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                                {getAssigneeName(task.assignee)}
                                            </span>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as 'Todo' | 'Doing' | 'Done')}
                                                className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white/60 hover:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="Todo" className="bg-gray-900">{t.tasks.todo}</option>
                                                <option value="Doing" className="bg-gray-900">{t.tasks.doing}</option>
                                                <option value="Done" className="bg-gray-900">{t.tasks.done}</option>
                                            </select>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleReminder(task.id, task.alert_interval);
                                                }}
                                                className={cn(
                                                    "text-xs rounded-lg px-2.5 py-1 transition-all flex items-center gap-1.5 font-medium",
                                                    isReminderActive(task.alert_interval)
                                                        ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 shadow-lg shadow-yellow-500/10"
                                                        : "bg-white/5 border border-white/20 text-white/50 hover:bg-white/10 hover:text-white/70 hover:border-white/30"
                                                )}
                                                title={isReminderActive(task.alert_interval) ? t.tasks.reminderOn : t.tasks.reminderOff}
                                            >
                                                <Bell className={cn("w-3.5 h-3.5", isReminderActive(task.alert_interval) && "animate-pulse")} />
                                                <span>{isReminderActive(task.alert_interval) ? "Reminder" : "Set Reminder"}</span>
                                            </button>
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
                        {activeTasks.length === 0 && doingTasks.length === 0 && (
                            <div className="text-center py-12 text-white/40 italic">
                                {t.tasks.noActiveTasks}
                            </div>
                        )}
                    </div>

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <div className="space-y-2 pt-6 border-t border-white/10">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{t.tasks.completed}</h3>
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
                                        {editingTaskId === task.id ? (
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onBlur={() => handleSaveTitle(task.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveTitle(task.id);
                                                    if (e.key === 'Escape') handleCancelEditing();
                                                }}
                                                autoFocus
                                                className="flex-1 bg-white/10 border border-blue-500/50 rounded px-2 py-1 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <span
                                                onDoubleClick={() => handleStartEditing(task)}
                                                className="flex-1 font-medium text-white/60 line-through break-words cursor-text hover:bg-white/5 px-2 py-1 rounded transition-colors"
                                                title="Double-click to edit"
                                            >
                                                {task.title}
                                            </span>
                                        )}

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
            )}
        </div>
    );
}
