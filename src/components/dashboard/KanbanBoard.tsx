"use client";

import { useState } from "react";
import { Trash2, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateTaskStatus, deleteTask } from "@/app/dashboard/todo/actions";
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

    const getAssigneeName = (assigneeId: string | null) => {
        if (!assigneeId) return t.tasks.everyone;
        if (assigneeId === currentUser) return t.tasks.me;
        const profile = profiles.find(p => p.id === assigneeId);
        return profile ? profile.full_name : "Unknown";
    };

    const getAssigneeAvatar = (assigneeId: string | null) => {
        if (!assigneeId) return null;
        const profile = profiles.find(p => p.id === assigneeId);
        return profile?.avatar_url || null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-x-auto pb-8">
            {columns.map((column) => (
                <div
                    key={column.id}
                    className="flex flex-col min-h-[400px]"
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
                                    draggable
                                    onDragStart={() => handleDragStart(task)}
                                    className={cn(
                                        "group bg-white/5 border border-white/10 rounded-lg p-4 cursor-move hover:bg-white/10 hover:border-white/20 transition-all",
                                        draggedTask?.id === task.id && "opacity-50"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                "font-medium text-white leading-tight break-words mb-2",
                                                task.status === 'Done' && "line-through text-white/60"
                                            )}>
                                                {task.title}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 text-xs text-white/60">
                                                    {task.assignee ? (
                                                        <>
                                                            {getAssigneeAvatar(task.assignee) ? (
                                                                <img
                                                                    src={getAssigneeAvatar(task.assignee)!}
                                                                    alt={getAssigneeName(task.assignee)}
                                                                    className="w-5 h-5 rounded-full"
                                                                />
                                                            ) : (
                                                                <User className="w-3.5 h-3.5" />
                                                            )}
                                                            <span>{getAssigneeName(task.assignee)}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span>Everyone</span>
                                                        </>
                                                    )}
                                                </div>
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
    );
}
