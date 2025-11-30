"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data
const EVENTS = [
    { id: 1, title: "Client Meeting: Acme Corp", time: "10:00 AM", duration: "1h", day: 26, type: "meeting" },
    { id: 2, title: "Project Deadline", time: "5:00 PM", duration: "", day: 28, type: "deadline" },
    { id: 3, title: "Team Sync", time: "2:00 PM", duration: "30m", day: 26, type: "internal" },
    { id: 4, title: "Design Review", time: "11:30 AM", duration: "1h", day: 29, type: "meeting" },
    { id: 5, title: "Launch Day 🚀", time: "All Day", duration: "", day: 30, type: "launch" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(26);

    const getEventColor = (type: string) => {
        switch (type) {
            case "meeting": return "bg-red-500/20 text-red-400 border-red-500/30";
            case "deadline": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            case "launch": return "bg-green-500/20 text-green-400 border-green-500/30";
            default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        }
    };

    const selectedEvents = EVENTS.filter(e => e.day === selectedDate);

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Main Calendar Grid */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col min-h-[600px]">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold">November 2025</h1>
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="px-3 py-1 hover:bg-white/10 rounded text-sm font-medium">
                                Today
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs md:text-sm font-medium border border-white/10 transition-colors">
                            Day
                        </button>
                        <button className="px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs md:text-sm font-medium border border-white/10 transition-colors">
                            Week
                        </button>
                        <button className="px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg text-xs md:text-sm font-bold shadow-lg shadow-red-500/20">
                            Month
                        </button>
                        <button className="px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs md:text-sm font-medium border border-white/10 transition-colors">
                            Year
                        </button>
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
                            const dayNum = i - 1; // Offset for starting day
                            const isCurrentMonth = dayNum > 0 && dayNum <= 30;
                            const isSelected = dayNum === selectedDate;
                            const dayEvents = EVENTS.filter(e => e.day === dayNum);

                            return (
                                <div
                                    key={i}
                                    onClick={() => isCurrentMonth && setSelectedDate(dayNum)}
                                    className={`border-b border-r border-white/5 p-1 md:p-2 relative group transition-colors ${!isCurrentMonth ? "bg-white/[0.02]" : "hover:bg-white/5 cursor-pointer"
                                        } ${isSelected ? "bg-white/10" : ""}`}
                                >
                                    <div className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm font-medium mb-1 ${isSelected
                                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                        : isCurrentMonth ? "text-white" : "text-white/20"
                                        }`}>
                                        {dayNum > 0 && dayNum <= 30 ? dayNum : ""}
                                    </div>

                                    {/* Event Dots */}
                                    <div className="space-y-1">
                                        {dayEvents.map(event => (
                                            <div key={event.id} className={`text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded truncate border ${getEventColor(event.type)}`}>
                                                {event.title}
                                            </div>
                                        ))}
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
                        <h2 className="text-xl md:text-2xl font-bold">Nov {selectedDate}</h2>
                        <p className="text-white/40 text-sm">Wednesday</p>
                    </div>
                    <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedEvents.length > 0 ? (
                        selectedEvents.map(event => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border ${getEventColor(event.type)}`}
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
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-white/20">
                            No events for this day
                        </div>
                    )}

                    {/* Timeline Decoration */}
                    <div className="relative pl-4 border-l border-white/10 space-y-8 py-4 ml-2">
                        {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => (
                            <div key={hour} className="relative">
                                <div className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-white/20 border-2 border-[#111]" />
                                <span className="text-xs text-white/20 font-mono">
                                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
