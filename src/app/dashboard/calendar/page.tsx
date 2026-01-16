"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    allDay?: boolean;
    day?: number;
    time?: string;
    duration?: string;
    type?: string;
    meetLink?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getEventColor = (type: string) => {
    switch (type) {
        case "meeting": return "bg-red-500/20 text-red-400 border-red-500/30";
        case "deadline": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
        case "allday": return "bg-green-500/20 text-green-400 border-green-500/30";
        default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
};

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('google_calendar_token')
                    .eq('id', user.id)
                    .single();

                if (profile?.google_calendar_token) {
                    setAccessToken(profile.google_calendar_token);
                } else {
                    setAccessToken(null);
                }
            }
            setIsCheckingAuth(false);
        };

        fetchToken();
    }, []);

    const fetchEvents = useCallback(async () => {
        if (!accessToken) return;

        setIsLoading(true);
        setError(null);

        try {
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            const response = await fetch(
                `/api/calendar?timeMin=${startOfMonth.toISOString()}&timeMax=${endOfMonth.toISOString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();

            const transformedEvents = data.events.map((event: CalendarEvent) => {
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);

                return {
                    ...event,
                    day: startDate.getDate(),
                    time: event.allDay ? 'All Day' : startDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    duration: event.allDay ? '' : `${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))}m`,
                    type: event.allDay ? 'allday' : 'meeting',
                };
            });

            setEvents(transformedEvents);
        } catch (err: any) {
            setError(err.message);
            if (err.message.includes('401')) {
                setAccessToken(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, currentMonth]);

    useEffect(() => {
        if (!isCheckingAuth && accessToken) {
            fetchEvents();
        }
    }, [accessToken, isCheckingAuth, fetchEvents]);

    const selectedEvents = useMemo(() =>
        events.filter(e => e.day === selectedDate),
        [events, selectedDate]
    );

    const monthName = useMemo(() =>
        currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        [currentMonth]
    );

    const daysInMonth = useMemo(() =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(),
        [currentMonth]
    );

    const firstDayOfMonth = useMemo(() =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(),
        [currentMonth]
    );

    const todayInfo = useMemo(() => {
        const today = new Date();
        return {
            date: today.getDate(),
            month: today.getMonth(),
            year: today.getFullYear()
        };
    }, []);

    const goToPreviousMonth = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    }, []);

    const goToNextMonth = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
    }, []);

    const goToToday = useCallback(() => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today.getDate());
    }, []);

    if (isCheckingAuth) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-400" />
            </div>
        );
    }

    if (!accessToken) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Connect Google Calendar</h2>
                    <p className="text-white/60">
                        Please connect your Google Calendar from <strong>Settings → Integrations</strong> to view your events here.
                    </p>
                    <button
                        onClick={() => window.location.href = '/dashboard/settings?tab=integrations'}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2 mx-auto"
                    >
                        Go to Settings
                    </button>
                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Main Calendar Grid */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col min-h-[600px]">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold">{monthName}</h1>
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={goToPreviousMonth}
                                className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1 hover:bg-white/10 rounded text-sm font-medium transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={goToNextMonth}
                                className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-red-400" />}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-white/10">
                        {DAYS.map(day => (
                            <div key={day} className="py-2 md:py-3 text-center text-xs md:text-sm font-medium text-white/40 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Cells */}
                    <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                        {Array.from({ length: 35 }).map((_, i) => {
                            const dayNum = i - firstDayOfMonth + 1;
                            const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                            const isSelected = dayNum === selectedDate && isCurrentMonth;
                            const isToday = dayNum === todayInfo.date &&
                                currentMonth.getMonth() === todayInfo.month &&
                                currentMonth.getFullYear() === todayInfo.year;
                            const dayEvents = events.filter(e => e.day === dayNum);

                            return (
                                <div
                                    key={i}
                                    onClick={() => isCurrentMonth && setSelectedDate(dayNum)}
                                    className={`border-b border-r border-white/5 p-1 md:p-2 relative transition-colors ${!isCurrentMonth ? "bg-white/[0.02]" : "hover:bg-white/5 cursor-pointer"
                                        } ${isSelected ? "bg-white/10" : ""}`}
                                >
                                    <div className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm font-medium mb-1 ${isSelected
                                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                        : isToday
                                            ? "bg-red-500/30 text-red-300"
                                            : isCurrentMonth ? "text-white" : "text-white/20"
                                        }`}>
                                        {isCurrentMonth ? dayNum : ""}
                                    </div>

                                    {/* Event Dots */}
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map(event => (
                                            <div key={event.id} className={`text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded truncate border ${getEventColor(event.type || 'meeting')}`}>
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-[9px] text-white/40 px-1">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar / Day View */}
            <div className="w-full lg:w-80 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col max-h-[600px] lg:max-h-none">
                <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold">
                            {monthName.split(' ')[0]} {selectedDate}
                        </h2>
                        <p className="text-white/40 text-sm">
                            {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-400" />
                            <p className="text-white/40 mt-4">Loading events...</p>
                        </div>
                    ) : selectedEvents.length > 0 ? (
                        selectedEvents.map(event => (
                            <div
                                key={event.id}
                                className={`p-4 rounded-xl border ${getEventColor(event.type || 'meeting')}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold">{event.title}</h3>
                                </div>
                                <div className="flex items-center gap-4 text-xs opacity-80">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {event.time}
                                    </div>
                                    {event.duration && (
                                        <span>{event.duration}</span>
                                    )}
                                </div>
                                {event.description && (
                                    <p className="text-xs mt-2 opacity-70">{event.description}</p>
                                )}
                                {event.location && (
                                    <p className="text-xs mt-1 opacity-60">📍 {event.location}</p>
                                )}
                                {event.meetLink && (
                                    <a
                                        href={event.meetLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors border border-blue-500/30"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M15,8.5a2.5,2.5 0 0,1 5,0a2.5,2.5 0 0,1 -5,0M17.5,11a3.5,3.5 0 0,0 -3.5,3.5a3.5,3.5 0 0,0 3.5,3.5a3.5,3.5 0 0,0 3.5,-3.5a3.5,3.5 0 0,0 -3.5,-3.5M9.5,11a3.5,3.5 0 0,0 -3.5,3.5a3.5,3.5 0 0,0 3.5,3.5a3.5,3.5 0 0,0 3.5,-3.5a3.5,3.5 0 0,0 -3.5,-3.5M6,8.5a2.5,2.5 0 0,1 5,0a2.5,2.5 0 0,1 -5,0Z" />
                                        </svg>
                                        Join Google Meet
                                    </a>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-white/20">
                            No events for this day
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
