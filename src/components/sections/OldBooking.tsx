"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function Booking() {
    const [step, setStep] = useState<"date" | "time" | "form" | "success">("date");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "", notes: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [busySlots, setBusySlots] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    // Fetch availability when date changes
    useEffect(() => {
        if (selectedDate) {
            const fetchAvailability = async () => {
                setIsLoadingAvailability(true);
                setBusySlots([]); // Reset

                // REPLACE THIS WITH YOUR NEW MAKE.COM WEBHOOK FOR AVAILABILITY
                const AVAILABILITY_WEBHOOK = "https://hook.eu1.make.com/zum9fcvc124vwh6iwa0q2jjr6nx5cg0i";

                try {
                    // In a real implementation, you would fetch from the webhook
                    const response = await fetch(AVAILABILITY_WEBHOOK, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: selectedDate.toISOString() })
                    });
                    const data = await response.json();
                    setBusySlots(data.busySlots || []);

                } catch (error) {
                    console.error("Failed to check availability:", error);
                } finally {
                    setIsLoadingAvailability(false);
                }
            };

            fetchAvailability();
        }
    }, [selectedDate]);

    // Check if a time slot is busy
    const isSlotBusy = (time: string) => {
        return busySlots.includes(time);
    };

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setStep("time");
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep("form");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // REPLACE THIS URL WITH YOUR ZAPIER/MAKE WEBHOOK URL
        const WEBHOOK_URL = "https://hook.eu1.make.com/acq3mral3fprrpfnqolsrgtr89t2cyah";

        try {
            // Combine date and time
            const [timeStr, period] = selectedTime!.split(' ');
            const [hours, minutes] = timeStr.split(':');
            let hour = parseInt(hours);

            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;

            const dateTime = new Date(selectedDate!);
            dateTime.setHours(hour, parseInt(minutes));

            const payload = {
                ...formData,
                date: dateTime.toISOString(),
                time: selectedTime
            };

            console.log("Sending booking payload:", payload);

            // In a real scenario, you would fetch() to the webhook
            await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Simulating network delay for now
            await new Promise(resolve => setTimeout(resolve, 1500));

            setStep("success");
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        Book a <span className="text-primary">Discovery Call</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Ready to transform your digital presence? Pick a time that works for you, and let's discuss your project.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    {/* Sidebar / Summary */}
                    <div className="bg-muted/30 p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-border flex flex-col">
                        <div className="mb-8">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Discovery Session</h3>
                            <p className="text-muted-foreground text-sm">30 min • Google Meet</p>
                        </div>

                        <div className="space-y-4 mt-auto">
                            {selectedDate && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">
                                        {selectedDate.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            )}
                            {selectedTime && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{selectedTime}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8 md:w-2/3 relative">
                        <AnimatePresence mode="wait">
                            {step === "date" && (
                                <motion.div
                                    key="date"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold">Select a Date</h3>
                                        <div className="flex gap-2">
                                            <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="font-medium w-32 text-center">
                                                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                                            </span>
                                            <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {DAYS.map(day => (
                                            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {getDaysInMonth(currentDate).map((date, i) => (
                                            <div key={i} className="aspect-square">
                                                {date ? (
                                                    <button
                                                        onClick={() => handleDateSelect(date)}
                                                        disabled={date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                        className={cn(
                                                            "w-full h-full rounded-lg flex items-center justify-center text-sm transition-all",
                                                            selectedDate?.toDateString() === date.toDateString()
                                                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                                                : date < new Date(new Date().setHours(0, 0, 0, 0))
                                                                    ? "text-muted-foreground/30 cursor-not-allowed"
                                                                    : "hover:bg-primary/10 hover:text-primary"
                                                        )}
                                                    >
                                                        {date.getDate()}
                                                    </button>
                                                ) : (
                                                    <div />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === "time" && (
                                <motion.div
                                    key="time"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <button onClick={() => setStep("date")} className="p-2 hover:bg-muted rounded-full transition-colors">
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <h3 className="text-lg font-semibold">Select a Time</h3>
                                    </div>


                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[300px] pr-2">
                                        {isLoadingAvailability ? (
                                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                <p>Checking availability...</p>
                                            </div>
                                        ) : (
                                            TIME_SLOTS.map(time => {
                                                const isBusy = isSlotBusy(time);
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => handleTimeSelect(time)}
                                                        disabled={isBusy}
                                                        className={cn(
                                                            "py-3 px-4 rounded-xl border border-border transition-all text-sm font-medium relative overflow-hidden",
                                                            isBusy
                                                                ? "opacity-50 cursor-not-allowed bg-muted/50"
                                                                : "hover:border-primary hover:bg-primary/5"
                                                        )}
                                                    >
                                                        {time}
                                                        {isBusy && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                                                                <span className="text-xs font-bold text-red-500 transform -rotate-12 border border-red-500 px-2 py-0.5 rounded">BUSY</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === "form" && (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <button onClick={() => setStep("time")} className="p-2 hover:bg-muted rounded-full transition-colors">
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <h3 className="text-lg font-semibold">Your Details</h3>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Project Details</label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-24 resize-none"
                                                placeholder="Tell us a bit about your project..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Booking...
                                                </>
                                            ) : (
                                                <>
                                                    Confirm Booking <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {step === "success" && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center p-8"
                                >
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                                    <p className="text-muted-foreground mb-8">
                                        We've sent an email with the Google Meet link to {formData.email}. We look forward to speaking with you.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setStep("date");
                                            setSelectedDate(null);
                                            setSelectedTime(null);
                                            setFormData({ name: "", email: "", notes: "" });
                                        }}
                                        className="text-primary hover:underline text-sm"
                                    >
                                        Book another call
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}