"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Users,
    DollarSign,
    Calendar as CalendarIcon,
    CheckSquare,
    TrendingUp,
    Briefcase,
    Plus,
    Settings,
    FileText,
    FolderKanban,
    Receipt,
    Target,
    Award,
    PieChart,
    Phone,
    Mail,
    Sun,
    CloudSun,
    Cloud,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Wind,
    MapPin,

    MoreHorizontal,
    Edit3,
    Check,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { X, Clock } from "lucide-react";
import { FlipClock } from "@/components/dashboard/FlipClock";
import { createNote, updateNote } from "./notes/actions";

type WidgetType = 'revenue' | 'schedule' | 'clients' | 'tasks' | 'quick_actions' | 'recent_invoices' | 'leads_overview' | 'team_members' | 'clock' | 'quick_notes' | 'weather' | 'team_availability';

interface Widget {
    id: string;
    type: WidgetType;
    className: string;
}

const AVAILABLE_WIDGETS: Record<WidgetType, string> = {
    revenue: "Total Revenue",
    schedule: "Upcoming Schedule",
    clients: "Active Clients",
    tasks: "Pending Tasks",
    quick_actions: "Quick Actions",
    recent_invoices: "Recent Invoices",
    leads_overview: "Leads Overview",
    team_members: "Team Members",
    clock: "World Clock",
    quick_notes: "Quick Notes",
    weather: "Weather",
    team_availability: "Team Availability"
};

const DEFAULT_LAYOUT: Widget[] = [
    { id: '1', type: 'revenue', className: 'md:col-span-2' },
    { id: '2', type: 'schedule', className: 'md:col-span-1 md:row-span-3' },
    { id: '3', type: 'clients', className: 'md:col-span-1' },
    { id: '4', type: 'tasks', className: 'md:col-span-1' },
    { id: '5', type: 'quick_actions', className: 'md:col-span-1' },
];

// Mock data for things we don't have real APIs for yet
const REVENUE_DATA = [
    { month: "Jan", amount: 4500 },
    { month: "Feb", amount: 5200 },
    { month: "Mar", amount: 4800 },
    { month: "Apr", amount: 6100 },
    { month: "May", amount: 5900 },
    { month: "Jun", amount: 7200 },
];

const INVOICES = [
    { id: "#INV-2024-001", client: "Fashion Nova", amount: "$2,500.00", status: "paid" as const },
    { id: "#INV-2024-002", client: "TechCorp Inc.", amount: "$1,200.00", status: "pending" as const },
    { id: "#INV-2024-003", client: "FitLife", amount: "$850.00", status: "overdue" as const },
];

const INITIAL_LEADS = [
    { id: 1, name: "TechStart Inc", status: "New" },
    { id: 2, name: "Coffee House", status: "Contacted" },
    { id: 3, name: "Legal Eagles", status: "Proposal" },
    { id: 4, name: "Fitness Pro", status: "Proposal" },
    { id: 5, name: "Bakery 101", status: "New" },
    { id: 6, name: "Green Energy", status: "Won" },
    { id: 7, name: "Local Gym", status: "Won" },
];

const TEAM_MEMBERS = [
    { id: 1, name: "Sarah Miller", role: "Project Manager", initials: "SM", color: "bg-purple-500", status: "online", location: "New York, USA" },
    { id: 2, name: "Mike Ross", role: "Lead Developer", initials: "MR", color: "bg-blue-500", status: "busy", location: "London, UK" },
    { id: 3, name: "Jessica Pearson", role: "Designer", initials: "JP", color: "bg-pink-500", status: "away", location: "Paris, FR" },
    { id: 4, name: "Harvey Specter", role: "Strategy", initials: "HS", color: "bg-amber-500", status: "online", location: "Toronto, CA" },
];

const DEFAULT_WEATHER = {
    temp: 22,
    condition: "Sunny",
    location: "Lisbon, PT",
    humidity: 45,
    wind: 12
};

const weatherCodeToCondition = (code: number) => {
    if (code === 0) return "Sunny";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 57) return "Drizzle";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Showers";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
};

const getWeatherIcon = (condition: string) => {
    switch (condition) {
        case "Sunny": return <Sun className="w-8 h-8 text-yellow-400" />;
        case "Partly Cloudy": return <CloudSun className="w-8 h-8 text-yellow-400" />;
        case "Foggy":
        case "Cloudy": return <Cloud className="w-8 h-8 text-white/70" />;
        case "Drizzle":
        case "Rainy":
        case "Showers": return <CloudRain className="w-8 h-8 text-blue-400" />;
        case "Snowy": return <CloudSnow className="w-8 h-8 text-white" />;
        case "Thunderstorm": return <CloudLightning className="w-8 h-8 text-purple-400" />;
        default: return <Sun className="w-8 h-8 text-yellow-400" />;
    }
};



const MOCK_EVENTS = [
    {
        title: "Client Meeting: TechCorp",
        start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
        color: "bg-blue-500"
    },
    {
        title: "Project Review - Framax v2",
        start: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
        color: "bg-purple-500"
    },
    {
        title: "Team Sync",
        start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        color: "bg-green-500"
    },
    {
        title: "Deployment Window",
        start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), // Day after tomorrow
        end: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        color: "bg-orange-500"
    }
];

export default function DashboardPage() {
    // Initialize with MOCK_EVENTS to ensure data is visible immediately
    // Quick Note State
    const [quickNoteText, setQuickNoteText] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [noteSaveStatus, setNoteSaveStatus] = useState<'idle' | 'success'>('idle');

    const handleQuickNoteSave = async () => {
        if (!quickNoteText.trim()) return;

        setIsSavingNote(true);
        try {
            // 1. Create a blank note
            const { data: newNote, error: createError } = await createNote();
            if (createError || !newNote) throw new Error(createError || "Failed to create");

            // 2. Update it with content
            const { error: updateError } = await updateNote(newNote.id, {
                title: 'Quick Note',
                content: quickNoteText
            });
            if (updateError) throw new Error(updateError);

            // 3. Success feedback
            setNoteSaveStatus('success');
            setQuickNoteText(""); // Clear input
            setTimeout(() => setNoteSaveStatus('idle'), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingNote(false);
        }
    };

    const [upcomingEvents, setUpcomingEvents] = useState<any[]>(MOCK_EVENTS);
    const [tasks, setTasks] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pendingTasks: 0,
        upcomingEvents: MOCK_EVENTS.length,
        activeClients: 0,
        totalRevenue: 9050, // Mocked from Invoices page
    });
    const [loading, setLoading] = useState(true);
    const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_LAYOUT);
    const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showAddWidget, setShowAddWidget] = useState(false);

    // Persist layout
    useEffect(() => {
        const savedLayout = localStorage.getItem('dashboard_layout');
        if (savedLayout) {
            setWidgets(JSON.parse(savedLayout));
        }
    }, []);

    const saveLayout = (newWidgets: Widget[]) => {
        setWidgets(newWidgets);
        localStorage.setItem('dashboard_layout', JSON.stringify(newWidgets));
    };

    const handleDragStart = (id: string) => {
        if (!isEditMode) return;
        setDraggedWidget(id);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedWidget || draggedWidget === targetId) return;

        const oldIndex = widgets.findIndex(w => w.id === draggedWidget);
        const newIndex = widgets.findIndex(w => w.id === targetId);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newWidgets = [...widgets];
            const [movedItem] = newWidgets.splice(oldIndex, 1);
            newWidgets.splice(newIndex, 0, movedItem);
            saveLayout(newWidgets);
        }
    };

    const removeWidget = (id: string) => {
        const newWidgets = widgets.filter(w => w.id !== id);
        saveLayout(newWidgets);
    };

    const addWidget = (type: WidgetType) => {
        const id = Date.now().toString();
        // Determine default size based on type
        let className = 'md:col-span-1';
        if (type === 'revenue') className = 'md:col-span-2';
        if (type === 'quick_actions') className = 'md:col-span-1';
        if (type === 'schedule') className = 'md:col-span-1 md:row-span-3';
        if (type === 'recent_invoices' || type === 'leads_overview' || type === 'team_members' || type === 'weather' || type === 'quick_notes') className = 'md:col-span-1';
        if (type === 'clock' || type === 'team_availability') className = 'md:col-span-2'; // Clock needs width

        const newWidget: Widget = { id, type, className };
        saveLayout([...widgets, newWidget]);
        setShowAddWidget(false);
    };

    const resetLayout = () => {
        saveLayout(DEFAULT_LAYOUT);
    };

    const [weatherData, setWeatherData] = useState(DEFAULT_WEATHER);

    const supabase = createClient();



    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch Clients
                const { count: clientCount } = await supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'Active');

                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('google_calendar_token, location')
                    .eq('id', user.id)
                    .single();

                console.log("Dashboard Debug: User ID:", user.id);
                console.log("Dashboard Debug: Profile fetched:", profile);

                if (profile?.location) {
                    try {
                        // 1. Geocoding
                        // Open-Meteo prefers just the city name. "Amsterdam, NL" might fail, so we extract "Amsterdam".
                        const cityName = profile.location.split(',')[0].trim();
                        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
                        console.log("Weather Debug: Fetching Geo for:", cityName, geoUrl);
                        const geoRes = await fetch(geoUrl);
                        const geoData = await geoRes.json();
                        console.log("Weather Debug: Geo Data:", geoData);

                        if (geoData.results && geoData.results.length > 0) {
                            const { latitude, longitude, name, country_code } = geoData.results[0];

                            // 2. Weather
                            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
                            console.log("Weather Debug: Fetching Weather:", weatherUrl);
                            const weatherRes = await fetch(weatherUrl);
                            const weatherData = await weatherRes.json();
                            console.log("Weather Debug: Weather Data:", weatherData);
                            const current = weatherData.current;

                            setWeatherData({
                                temp: Math.round(current.temperature_2m),
                                condition: weatherCodeToCondition(current.weather_code),
                                location: `${name}, ${country_code}`,
                                humidity: current.relative_humidity_2m,
                                wind: Math.round(current.wind_speed_10m)
                            });
                        }
                    } catch (error) {
                        console.error("Failed to fetch weather:", error);
                        // Keep default fallback
                        setWeatherData(prev => ({ ...prev, location: profile.location }));
                    }
                }

                // Fetch upcoming calendar events - COMMENTED OUT SETSTATE TO FORCE MOCK DATA
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
                            // ONLY USE REAL DATA IF IT EXISTS AND IS NOT EMPTY, OTHERWISE KEEP MOCK
                            if (data.events && data.events.length > 0) {
                                // setUpcomingEvents(data.events.slice(0, 5)); // DISABLED FOR DEMO
                                // setStats(prev => ({ ...prev, upcomingEvents: data.events.length }));
                            }
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
                    .limit(10); // Fetch more to separate active vs recent completed

                if (todoData) {
                    const activeTasks = todoData.filter(t => !t.completed).slice(0, 5);

                    setTasks(activeTasks);
                    setStats(prev => ({
                        ...prev,
                        pendingTasks: activeTasks.length,
                        activeClients: clientCount || 0
                    }));
                }
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <Loader />;
    }

    const renderWidgetContent = (type: WidgetType) => {
        switch (type) {
            case 'revenue':
                return {
                    title: "Total Revenue",
                    description: (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</span>
                            <span className="text-xs text-green-400 font-medium">+12.5%</span>
                        </div>
                    ),
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg flex items-end p-2 gap-1 min-h-[60px]">
                        {REVENUE_DATA.map((d, i) => (
                            <div
                                key={i}
                                className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-t w-full"
                                style={{ height: `${(d.amount / 8000) * 100}%` }}
                            ></div>
                        ))}
                    </div>,
                    icon: <DollarSign className="h-4 w-4 text-neutral-500" />
                };
            case 'schedule':
                return {
                    title: "Upcoming Schedule",
                    description: undefined,
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg p-4 overflow-hidden min-h-[120px] flex flex-col">
                        <div className="flex-1">
                            {(() => {
                                // Group events by date
                                const groupedEvents = upcomingEvents.reduce((acc, event) => {
                                    const date = new Date(event.start);
                                    const today = new Date();
                                    const tomorrow = new Date(today);
                                    tomorrow.setDate(tomorrow.getDate() + 1);

                                    let dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                                    if (date.toDateString() === today.toDateString()) {
                                        dateLabel = "Today";
                                    } else if (date.toDateString() === tomorrow.toDateString()) {
                                        dateLabel = "Tomorrow";
                                    }

                                    if (!acc[dateLabel]) {
                                        acc[dateLabel] = [];
                                    }
                                    acc[dateLabel].push(event);
                                    return acc;
                                }, {} as Record<string, any[]>);

                                const sortedKeys = Object.keys(groupedEvents).sort((a, b) => {
                                    if (a === "Today") return -1;
                                    if (b === "Today") return 1;
                                    if (a === "Tomorrow") return -1;
                                    if (b === "Tomorrow") return 1;
                                    return 0; // Keep roughly in order they were added found
                                });

                                if (upcomingEvents.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                                            <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs">No upcoming events</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-4 relative ml-2">
                                        {/* Vertical Timeline Line */}
                                        <div className="absolute left-0 top-2 bottom-2 w-px bg-neutral-800"></div>

                                        {sortedKeys.map((dateLabel) => (
                                            <div key={dateLabel} className="relative pl-6">
                                                <h4 className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-2 bg-neutral-900 inline-block pr-2 relative z-10 -ml-6">
                                                    {dateLabel}
                                                </h4>
                                                <div className="space-y-3">
                                                    {groupedEvents[dateLabel].map((event: any, i: number) => (
                                                        <div key={i} className="group/event relative">
                                                            {/* Timeline Dot */}
                                                            <div className={`absolute -left-[1.6rem] top-1.5 w-2 h-2 rounded-full border-2 border-neutral-900 ${event.color || 'bg-neutral-500'} ring-1 ring-neutral-800 group-hover/event:ring-neutral-600 transition-all z-10`}></div>

                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm font-medium text-neutral-300 group-hover/event:text-white transition-colors truncate">
                                                                    {event.title}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-neutral-600">
                                                                    {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                                    {" - "}
                                                                    {new Date(event.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>,
                    icon: <CalendarIcon className="h-4 w-4 text-neutral-500" />,
                    onClick: () => window.location.href = '/dashboard/calendar'
                };
            case 'clients':
                return {
                    title: "Active Clients",
                    description: (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{stats.activeClients}</span>
                            <span className="text-xs text-neutral-500">Active portfolios</span>
                        </div>
                    ),
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg flex items-center justify-center relative overflow-hidden group min-h-[60px]">
                        <Users className="w-16 h-16 text-neutral-800 group-hover:text-neutral-700 transition-colors" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
                    </div>,
                    icon: <Users className="h-4 w-4 text-neutral-500" />
                };
            case 'tasks':
                return {
                    title: "Pending Tasks",
                    description: (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{stats.pendingTasks}</span>
                            <span className="text-xs text-neutral-500">To do today</span>
                        </div>
                    ),
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg p-4 overflow-hidden relative min-h-[60px]">
                        <div className="space-y-2">
                            {tasks.slice(0, 3).map((task, i) => (
                                <div key={task.id} className="flex items-center gap-2 text-xs text-neutral-400">
                                    <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                                    <span className="truncate">{task.title}</span>
                                </div>
                            ))}
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-900 to-transparent"></div>
                        </div>
                    </div>,
                    icon: <CheckSquare className="h-4 w-4 text-neutral-500" />,
                    onClick: () => window.location.href = '/dashboard/todo'
                };
            case 'quick_actions':
                return {
                    title: undefined,
                    description: undefined,
                    header: <div className="h-full w-full grid grid-cols-3 gap-2 min-h-[60px]">
                        <Link href="/dashboard/clients" className="h-full w-full flex flex-col items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors p-2 text-center group whitespace-nowrap">
                            <Users className="w-4 h-4 text-white-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-neutral-400">New Client</span>
                        </Link>
                        <Link href="/dashboard/projects" className="h-full w-full flex flex-col items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors p-2 text-center group whitespace-nowrap">
                            <FolderKanban className="w-4 h-4 text-yellow-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-neutral-400">New Project</span>
                        </Link>
                        <Link href="/dashboard/services" className="h-full w-full flex flex-col items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors p-2 text-center group whitespace-nowrap">
                            <Briefcase className="w-4 h-4 text-orange-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-neutral-400">New Service</span>
                        </Link>
                        <Link href="/dashboard/invoices" className="h-full w-full flex flex-col items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors p-2 text-center group whitespace-nowrap">
                            <Receipt className="w-4 h-4 text-green-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-neutral-400">New Invoice</span>
                        </Link>
                        <Link href="/dashboard/todo" className="h-full w-full flex flex-col items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors p-2 text-center group whitespace-nowrap">
                            <CheckSquare className="w-4 h-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-neutral-400">New Task</span>
                        </Link>
                        <Link href="/dashboard/calendar" className="h-full w-full flex flex-col items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors p-2 text-center group whitespace-nowrap">
                            <CalendarIcon className="w-4 h-4 text-red-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-neutral-400">New Event</span>
                        </Link>
                    </div>,
                };
            case 'recent_invoices':
                return {
                    title: "Recent Invoices",
                    description: (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">${INVOICES.reduce((acc, inv) => acc + parseInt(inv.amount.replace(/[^0-9.-]+/g, "")), 0).toLocaleString()}</span>
                            <span className="text-xs text-neutral-500">Last 3 items</span>
                        </div>
                    ),
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg p-4 overflow-hidden relative min-h-[60px]">
                        <div className="space-y-3">
                            {INVOICES.map((inv, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${inv.status === 'paid' ? 'bg-green-500' : inv.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        <span className="text-neutral-300 font-medium">{inv.client}</span>
                                    </div>
                                    <span className="text-neutral-500">{inv.amount}</span>
                                </div>
                            ))}
                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent"></div>
                        </div>
                    </div>,
                    icon: <Receipt className="h-4 w-4 text-neutral-500" />,
                    onClick: () => window.location.href = '/dashboard/invoices'
                };
            case 'leads_overview':
                const leadsByStatus = {
                    new: INITIAL_LEADS.filter(l => l.status === 'New').length,
                    proposal: INITIAL_LEADS.filter(l => l.status === 'Proposal').length,
                    won: INITIAL_LEADS.filter(l => l.status === 'Won').length
                };
                return {
                    title: "Leads Overview",
                    description: (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{INITIAL_LEADS.length}</span>
                            <span className="text-xs text-neutral-500">Total Pipeline</span>
                        </div>
                    ),
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg p-4 flex flex-col justify-center gap-4 min-h-[60px]">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-neutral-500">New</span>
                                <div className="h-2 w-12 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(leadsByStatus.new / INITIAL_LEADS.length) * 100}%` }} />
                                </div>
                                <span className="font-bold text-white">{leadsByStatus.new}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-neutral-500">Proposal</span>
                                <div className="h-2 w-12 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{ width: `${(leadsByStatus.proposal / INITIAL_LEADS.length) * 100}%` }} />
                                </div>
                                <span className="font-bold text-white">{leadsByStatus.proposal}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-neutral-500">Won</span>
                                <div className="h-2 w-12 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${(leadsByStatus.won / INITIAL_LEADS.length) * 100}%` }} />
                                </div>
                                <span className="font-bold text-white">{leadsByStatus.won}</span>
                            </div>
                        </div>
                    </div>,
                    icon: <Target className="h-4 w-4 text-neutral-500" />,
                    onClick: () => window.location.href = '/dashboard/leads'
                };
            case 'team_members':
                return {
                    title: "Team Members",
                    description: (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{TEAM_MEMBERS.length}</span>
                            <span className="text-xs text-neutral-500">Active</span>
                        </div>
                    ),
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg p-4 flex items-center justify-start gap-[-8px] min-h-[60px]">
                        <div className="flex -space-x-3 overflow-hidden p-2">
                            {TEAM_MEMBERS.map((member) => (
                                <div
                                    key={member.id}
                                    className={`inline-block h-10 w-10 rounded-full ring-2 ring-neutral-900 ${member.color} flex items-center justify-center text-xs font-bold text-white`}
                                    title={member.name}
                                >
                                    {member.initials}
                                </div>
                            ))}
                            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 ring-2 ring-neutral-900 hover:bg-neutral-700 transition-colors">
                                <Plus className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>,
                    icon: <Users className="h-4 w-4 text-neutral-500" />,
                    onClick: () => { }
                };
            case 'team_availability':
                return {
                    title: "Team Availability",
                    description: (
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-neutral-500">{TEAM_MEMBERS.length} members</span>
                        </div>
                    ),
                    header: <div className="h-full w-full bg-neutral-900 rounded-lg p-4 overflow-y-auto">
                        <div className="space-y-3">
                            {TEAM_MEMBERS.map((member) => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`relative w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-xs font-bold text-white`}>
                                            {member.initials}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-neutral-900 ${member.status === 'online' ? 'bg-green-500' : member.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-white">{member.name}</p>
                                            <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5" /> {member.location}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${member.status === 'online' ? 'bg-green-500/10 text-green-400' : member.status === 'busy' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                        {member.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>,
                    icon: <Users className="h-4 w-4 text-neutral-500" />
                };
            case 'weather':
                return {
                    title: undefined,
                    description: undefined,
                    header: <div className="h-full w-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
                        <div className="z-10 flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-white text-lg">{weatherData.location}</h3>
                                <p className="text-xs text-white/60">{weatherData.condition}</p>
                            </div>
                            {getWeatherIcon(weatherData.condition)}
                        </div>
                        <div className="z-10">
                            <p className="text-4xl font-bold text-white">{weatherData.temp}°</p>
                            <div className="flex gap-4 mt-2 text-[10px] text-white/60">
                                <span>H: {weatherData.humidity}%</span>
                                <span>W: {weatherData.wind}km/h</span>
                            </div>
                        </div>
                        {/* Decorative background */}
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl" />
                    </div>,
                    icon: undefined,
                    className: "p-0"
                };
            case 'quick_notes':
                return {
                    title: undefined,
                    description: undefined,
                    header: <div className="h-full w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col group relative overflow-hidden transition-colors hover:bg-white/10">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-white">
                                <Edit3 className="w-5 h-5 text-yellow-400" />
                                <span className="font-bold text-lg">Quick Note</span>
                            </div>
                            <button
                                onClick={handleQuickNoteSave}
                                disabled={isSavingNote || !quickNoteText.trim() || noteSaveStatus === 'success'}
                                className={`p-1.5 rounded-lg transition-all ${noteSaveStatus === 'success'
                                    ? "bg-green-500/20 text-green-400 opacity-100"
                                    : "bg-white/10 text-yellow-400 hover:bg-white/20 opacity-0 group-hover:opacity-100"
                                    }`}
                                title="Save Note"
                            >
                                {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    noteSaveStatus === 'success' ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                                }
                            </button>
                        </div>
                        <textarea
                            className="w-full flex-1 bg-transparent text-sm text-white/80 resize-none focus:outline-none placeholder:text-white/40 font-sans leading-relaxed"
                            placeholder="Type a note..."
                            value={quickNoteText}
                            onChange={(e) => setQuickNoteText(e.target.value)}
                        />
                    </div>,
                    icon: undefined,
                    className: "p-0"
                };
            case 'clock':
                return {
                    title: undefined,
                    description: undefined,
                    header: <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                        <FlipClock />
                    </div>,
                    icon: undefined,
                    className: "p-0"
                };
            default:
                return { title: 'Unknown', description: 'Widget not found', header: null, icon: null };
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-white/60">Overview of your agency's performance</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditMode ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                    >
                        {isEditMode ? 'Done Editing' : 'Customize'}
                    </button>
                    {isEditMode && (
                        <button
                            onClick={() => setShowAddWidget(true)}
                            className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Widget
                        </button>
                    )}
                    {isEditMode && (
                        <button
                            onClick={resetLayout}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[12rem]">
                <AnimatePresence mode="popLayout">
                    {widgets.map((widget) => {
                        const content = renderWidgetContent(widget.type);
                        return (
                            <motion.div
                                key={widget.id}
                                layout
                                variants={itemVariant}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, scale: 0.8 }}
                                draggable={isEditMode}
                                onDragStart={() => handleDragStart(widget.id)}
                                onDragOver={(e) => handleDragOver(e, widget.id)}
                                onClick={!isEditMode && content.onClick ? content.onClick : undefined}
                                className={`${widget.className} relative group ${isEditMode ? 'cursor-move ring-2 ring-transparent hover:ring-blue-500/50 rounded-xl transition-all' : ''}`}
                            >
                                {isEditMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeWidget(widget.id);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                <BentoGridItem
                                    title={content.title}
                                    description={content.description}
                                    header={content.header}
                                    icon={content.icon}
                                    className={`h-full ${isEditMode ? 'pointer-events-none' : ''} ${content.className || ''}`} // Disable pointer events on content during edit to prevent accidental clicks
                                />
                                {/* Overlay to capture drag events better */}
                                {isEditMode && <div className="absolute inset-0 z-10" />}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </BentoGrid>

            {/* Add Widget Modal */}
            <AnimatePresence>
                {showAddWidget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowAddWidget(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-5xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Add Widget</h2>
                                <button onClick={() => setShowAddWidget(false)} className="text-white/40 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.keys(AVAILABLE_WIDGETS).map((type) => {
                                    const content = renderWidgetContent(type as WidgetType);

                                    // Determine span for preview based on type, matching dashboard layout where possible
                                    let spanClass = "col-span-1";
                                    if (type === 'revenue' || type === 'quick_actions') spanClass = "md:col-span-2";
                                    if (type === 'schedule') spanClass = "row-span-2"; // Limit height in preview slightly
                                    if (type === 'clock' || type === 'team_availability') spanClass = "md:col-span-2";


                                    return (
                                        <div
                                            role="button"
                                            key={type}
                                            onClick={() => addWidget(type as WidgetType)}
                                            className={`relative group text-left transition-all hover:ring-2 hover:ring-blue-500 rounded-xl overflow-hidden bg-neutral-950 ${spanClass} cursor-pointer`}
                                        >
                                            <div className="absolute inset-0 z-10 bg-transparent" /> {/* Click capture overlay */}
                                            <BentoGridItem
                                                title={content.title}
                                                description={content.description}
                                                header={content.header}
                                                icon={content.icon}
                                                className={`h-full bg-neutral-900 border-neutral-800 pointer-events-none ${content.className || ''}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
