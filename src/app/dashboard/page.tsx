"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, DollarSign, Calendar as CalendarIcon, CheckSquare, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pendingTasks: 0,
        upcomingEvents: 0,
    });
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch profile for Google Calendar token
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('google_calendar_token')
                    .eq('id', user.id)
                    .single();

                // Fetch upcoming calendar events
                if (profile?.google_calendar_token) {
                    try {
                        const now = new Date();
                        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                        const response = await fetch(
                            `/api/calendar?timeMin=${now.toISOString()}&timeMax=${nextWeek.toISOString()}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${profile.google_calendar_token}`,
                                },
                            }
                        );

                        if (response.ok) {
                            const data = await response.json();
                            setUpcomingEvents(data.events.slice(0, 3));
                            setStats(prev => ({ ...prev, upcomingEvents: data.events.length }));
                        }
                    } catch (error) {
                        console.error('Error fetching calendar events:', error);
                    }
                }

                // Fetch tasks
                const { data: todoData } = await supabase
                    .from('todos')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (todoData) {
                    setTasks(todoData);
                    const pending = todoData.filter(t => !t.completed).length;
                    setStats(prev => ({
                        ...prev,
                        pendingTasks: pending
                    }));
                }
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-white/40">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                <p className="text-white/60">Welcome back, here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Pending Tasks"
                    value={stats.pendingTasks.toString()}
                    change={`${tasks.length} total`}
                    isPositive={stats.pendingTasks === 0}
                    icon={CheckSquare}
                />
                <StatCard
                    title="Upcoming Events"
                    value={stats.upcomingEvents.toString()}
                    change="Next 7 days"
                    isPositive={true}
                    icon={CalendarIcon}
                />
                <StatCard
                    title="Active Projects"
                    value="3"
                    change="+1 this week"
                    isPositive={true}
                    icon={TrendingUp}
                />
            </div>

            {/* Main Content Grid */}
            <div className="space-y-6">
                {/* Upcoming Events */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-red-400" />
                            Upcoming Events
                        </h3>
                        <Link href="/dashboard/calendar" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <p className="font-medium text-sm">{event.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                        <Clock className="w-3 h-3" />
                                        {new Date(event.start).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/40">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No upcoming events</p>
                                <Link href="/dashboard/settings?tab=integrations" className="text-xs text-red-400 hover:text-red-300 mt-1 inline-block">
                                    Connect Google Calendar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                            Tasks
                        </h3>
                        <Link href="/dashboard/todo" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tasks.length > 0 ? (
                            tasks.slice(0, 4).map((task, i) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-3 rounded-xl border transition-colors ${task.completed
                                            ? 'bg-blue-500/10 border-blue-500/20'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 ${task.completed
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-white/30'
                                            }`}>
                                            {task.completed && (
                                                <svg className="w-full h-full text-white" viewBox="0 0 16 16" fill="none">
                                                    <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-white/40' : ''}`}>
                                                {task.title}
                                            </p>
                                            {task.priority && (
                                                <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-8 text-white/40">
                                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No tasks yet</p>
                                <Link href="/dashboard/todo" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                                    Create your first task
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
