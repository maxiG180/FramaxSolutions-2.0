"use client";

import { useState } from "react";
import { Trash2, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateTaskStatus, deleteTask, updateTaskTitle, updateTaskAssignee, updateTaskAlertInterval } from "@/app/dashboard/todo/actions";
import { cn } from "@/lib/utils";
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

type KanbanBoardProps = {
    tasks: Task[];
    currentUser: string | null;
    profiles: Profile[];
    onTasksChange: (tasks: Task[]) => void;
};

type Column = 'Todo' | 'Doing' | 'Done';

export default function KanbanBoard({ tasks, currentUser, profiles, onTasksChange }: KanbanBoardProps) {
    const { t } = useLanguage();
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [draggedOverColumn, setDraggedOverColumn] = useState<Column | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const columns: { id: Column; title: string; color: string }[] = [
        { id: 'Todo', title: t.tasks.todo, color: 'bg-gray-500/20 border-gray-500/30' },
        { id: 'Doing', title: t.tasks.doing, color: 'bg-blue-500/20 border-blue-500/30' },
        { id: 'Done', title: t.tasks.done, color: 'bg-green-500/20 border-green-500/30' },
    ];

    const getTasksByStatus = (status: Column) => {
        return tasks.filter(task => task.status === status);
    };

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e: React.DragEvent, column: Column) => {
        e.preventDefault();
        setDraggedOverColumn(column);
    };

    const handleDragLeave = () => {
        setDraggedOverColumn(null);
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: Column) => {
        e.preventDefault();
        setDraggedOverColumn(null);

        if (!draggedTask || draggedTask.status === targetStatus) {
            setDraggedTask(null);
            return;
        }

        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === draggedTask.id ? { ...t, status: targetStatus } : t
        );
        onTasksChange(updatedTasks);

        // Server update
        const { success } = await updateTaskStatus(draggedTask.id, targetStatus);
        if (!success) {
            // Revert on failure
            onTasksChange(tasks);
        }

        setDraggedTask(null);
    };

    const handleDeleteTask = async (id: number) => {
        const taskToDelete = tasks.find(t => t.id === id);
        const updatedTasks = tasks.filter(t => t.id !== id);
        onTasksChange(updatedTasks);

        const { success } = await deleteTask(id);
        if (!success && taskToDelete) {
            onTasksChange([...tasks, taskToDelete]);
        }
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
        onTasksChange(updatedTasks);
        setEditingTaskId(null);

        // Server update
        const { success } = await updateTaskTitle(taskId, editingTitle);
        if (!success) {
            // Revert on failure
            onTasksChange(tasks);
        }
    };

    const handleUpdateAssignee = async (taskId: number, newAssignee: string | null) => {
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, assignee: newAssignee } : t
        );
        onTasksChange(updatedTasks);

        // Server update
        const { success } = await updateTaskAssignee(taskId, newAssignee);
        if (!success) {
            // Revert on failure
            onTasksChange(tasks);
        }
    };

    const isReminderActive = (alertInterval: string | null) => {
        return alertInterval && alertInterval !== 'None';
    };

    const handleToggleReminder = async (taskId: number, currentInterval: string | null) => {
        const newInterval = isReminderActive(currentInterval) ? 'None' : '12h';

        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, alert_interval: newInterval } : t
        );
        onTasksChange(updatedTasks);

        // Server update
        const { success } = await updateTaskAlertInterval(taskId, newInterval);
        if (!success) {
            // Revert on failure
            onTasksChange(tasks);
        }
    };

    return (
        <div className="overflow-x-auto pb-8 -mx-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-full md:min-w-0">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="flex flex-col min-w-[85vw] md:min-w-0 min-h-[400px]"
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className={cn(
                            "flex items-center justify-between p-4 rounded-t-xl border-2 border-b-0",
                            column.color,
                            draggedOverColumn === column.id && "ring-2 ring-white/50"
                        )}>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white">{column.title}</h3>
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                                    {getTasksByStatus(column.id).length}
                                </span>
                            </div>
                        </div>

                        {/* Column Content */}
                        <div className={cn(
                            "flex-1 p-4 border-2 border-t-0 rounded-b-xl space-y-3 min-h-[300px] max-h-[calc(100vh-300px)] overflow-y-auto transition-all scrollbar-thin",
                            column.color,
                            draggedOverColumn === column.id && "bg-white/5 ring-2 ring-white/50"
                        )}>
                            <AnimatePresence mode="popLayout">
                                {getTasksByStatus(column.id).map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        draggable={!('ontouchstart' in window)}
                                        onDragStart={() => handleDragStart(task)}
                                        className={cn(
                                            "group bg-white/5 border border-white/10 rounded-lg p-3 md:p-4 hover:bg-white/10 hover:border-white/20 transition-all",
                                            !('ontouchstart' in window) && "cursor-move",
                                            draggedTask?.id === task.id && "opacity-50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
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
                                                        className={cn(
                                                            "font-medium text-white leading-tight break-words mb-2 cursor-text hover:bg-white/5 px-2 py-1 rounded transition-colors",
                                                            task.status === 'Done' && "line-through text-white/60"
                                                        )}
                                                        title="Double-click to edit"
                                                    >
                                                        {task.title}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={task.assignee || 'everyone'}
                                                        onChange={(e) => handleUpdateAssignee(task.id, e.target.value === 'everyone' ? null : e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded px-2 py-1 text-white/80 hover:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors cursor-pointer"
                                                    >
                                                        <option value={currentUser ?? ""} className="bg-gray-900">
                                                            {t.tasks.me}
                                                        </option>
                                                        <option value="everyone" className="bg-gray-900">
                                                            {t.tasks.everyone}
                                                        </option>
                                                        {profiles.filter(p => p.id !== currentUser).map(profile => (
                                                            <option key={profile.id} value={profile.id} className="bg-gray-900">
                                                                {profile.full_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleReminder(task.id, task.alert_interval);
                                                        }}
                                                        className={cn(
                                                            "text-xs rounded-lg px-2.5 py-1.5 transition-all flex items-center gap-1.5 font-medium whitespace-nowrap",
                                                            isReminderActive(task.alert_interval)
                                                                ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 shadow-lg shadow-yellow-500/10"
                                                                : "bg-white/5 border border-white/20 text-white/50 hover:bg-white/10 hover:text-white/70 hover:border-white/30"
                                                        )}
                                                        title={isReminderActive(task.alert_interval) ? t.tasks.reminderOn : t.tasks.reminderOff}
                                                    >
                                                        <Bell className={cn("w-3.5 h-3.5", isReminderActive(task.alert_interval) && "animate-pulse")} />
                                                        <span className="hidden sm:inline">{isReminderActive(task.alert_interval) ? "On" : "Off"}</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {getTasksByStatus(column.id).length === 0 && (
                                <div className="flex items-center justify-center h-full text-white/30 text-sm italic">
                                    {t.tasks.noTasks}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
