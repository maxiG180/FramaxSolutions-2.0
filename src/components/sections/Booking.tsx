"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const TIME_SLOTS_12H = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM"
];

const TIME_SLOTS_24H = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00"
];



export function Booking() {
    const { t, language } = useLanguage();

    // Use 24-hour format for Portuguese, 12-hour format for English
    const TIME_SLOTS = language === 'pt' ? TIME_SLOTS_24H : TIME_SLOTS_12H;

    const DAYS = [t.booking.sun, t.booking.mon, t.booking.tue, t.booking.wed, t.booking.thu, t.booking.fri, t.booking.sat];
    const [step, setStep] = useState<"date" | "time" | "form" | "success">("date");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [formData, setFormData] = useState({ name: "", email: "", notes: "" });
    const [errors, setErrors] = useState({ email: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [busySlots, setBusySlots] = useState<string[]>([]);
    const [rawBusySlots, setRawBusySlots] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [titleClicks, setTitleClicks] = useState(0);

    // Convert selectedTime format when language changes
    useEffect(() => {
        if (selectedTime) {
            // Convert time format when language changes
            if (language === 'pt' && (selectedTime.includes('AM') || selectedTime.includes('PM'))) {
                // Convert from 12h to 24h
                const [timeStr, period] = selectedTime.split(' ');
                const [hoursStr, minutesStr] = timeStr.split(':');
                let hours = parseInt(hoursStr);

                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                const newTime = `${hours.toString().padStart(2, '0')}:${minutesStr}`;
                if (TIME_SLOTS.includes(newTime)) {
                    setSelectedTime(newTime);
                }
            } else if (language === 'en' && !selectedTime.includes('AM') && !selectedTime.includes('PM')) {
                // Convert from 24h to 12h
                const [hoursStr, minutesStr] = selectedTime.split(':');
                let hours = parseInt(hoursStr);
                const period = hours >= 12 ? 'PM' : 'AM';

                if (hours > 12) hours -= 12;
                if (hours === 0) hours = 12;

                const newTime = `${hours.toString().padStart(2, '0')}:${minutesStr} ${period}`;
                if (TIME_SLOTS.includes(newTime)) {
                    setSelectedTime(newTime);
                }
            }
        }
    }, [language]);

    // Fetch availability when date changes
    useEffect(() => {
        if (selectedDate) {
            const fetchAvailability = async () => {
                setIsLoadingAvailability(true);
                setRawBusySlots([]); // Reset
                setBusySlots([]); // Reset displayed slots too

                try {
                    // Call our own API endpoint (which proxies to Make.com server-side)
                    const response = await fetch('/api/check-availability', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            date: selectedDate.toISOString(),
                            action: 'checkAvailability'
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch availability');
                    }

                    const data = await response.json();
                    console.log('Raw busy slots from API:', data.busySlots);
                    setRawBusySlots(data.busySlots || []);

                } catch (error) {
                    console.error("Failed to check availability:", error);
                    setRawBusySlots([]); // Ensure we reset to empty on error
                } finally {
                    setIsLoadingAvailability(false);
                }
            };

            fetchAvailability();
        }
    }, [selectedDate]); // Only refetch when date changes, NOT when language changes

    // Update busy slots when language (TIME_SLOTS) or raw data changes
    useEffect(() => {
        // Filter busy slots based on current time format (12h/24h)
        // Note: Ideally we should normalize comparison, but for now we preserve existing behavior
        // which assumes API returns slots matching the current format or we might miss them.
        // TODO: Enhance this to handle 12h/24h conversion if API returns fixed format.
        const validBusySlots = rawBusySlots.filter((slot: string) => TIME_SLOTS.includes(slot));
        setBusySlots(validBusySlots);
    }, [rawBusySlots, TIME_SLOTS]);

    // Check if a time slot is busy
    const isSlotBusy = (time: string) => {
        return busySlots.includes(time);
    };

    // Check if a time slot is in the past
    const isSlotInPast = (time: string) => {
        if (!selectedDate) return false;

        // Check if selected date is today
        const today = new Date();
        const isToday = selectedDate.toDateString() === today.toDateString();

        if (!isToday) return false;

        // Parse the time slot
        let hour: number;
        let minutes: number;

        if (time.includes('AM') || time.includes('PM')) {
            // 12-hour format
            const [timeStr, period] = time.split(' ');
            const [hoursStr, minutesStr] = timeStr.split(':');
            hour = parseInt(hoursStr);
            minutes = parseInt(minutesStr);

            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
        } else {
            // 24-hour format
            const [hoursStr, minutesStr] = time.split(':');
            hour = parseInt(hoursStr);
            minutes = parseInt(minutesStr);
        }

        // Create a date object for the time slot
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minutes, 0, 0);

        // Compare with current time
        return slotTime < today;
    };

    // Easter Egg: Party Mode
    const handleTitleClick = () => {
        const newClicks = titleClicks + 1;
        setTitleClicks(newClicks);
        if (newClicks === 5) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
            });
            setTitleClicks(0);
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setStep("time");
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep("form");
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return t.booking.validationEmail;
        if (email.endsWith("@test.com") || email.endsWith("@example.com")) return t.booking.validationRealEmail;
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailError = validateEmail(formData.email);
        if (emailError) {
            setErrors({ ...errors, email: emailError });
            return;
        }
        setErrors({ ...errors, email: "" });

        setIsSubmitting(true);

        try {
            // Combine date and time
            let hour: number;
            let minutes: number;

            if (selectedTime!.includes('AM') || selectedTime!.includes('PM')) {
                // 12-hour format
                const [timeStr, period] = selectedTime!.split(' ');
                const [hoursStr, minutesStr] = timeStr.split(':');
                hour = parseInt(hoursStr);
                minutes = parseInt(minutesStr);

                if (period === 'PM' && hour !== 12) hour += 12;
                if (period === 'AM' && hour === 12) hour = 0;
            } else {
                // 24-hour format
                const [hoursStr, minutesStr] = selectedTime!.split(':');
                hour = parseInt(hoursStr);
                minutes = parseInt(minutesStr);
            }

            const dateTime = new Date(selectedDate!);
            dateTime.setHours(hour, minutes);

            const payload = {
                ...formData,
                date: dateTime.toISOString(),
                time: selectedTime,
                action: 'bookMeeting',
                language: language, // Send the selected language (pt or en)
            };

            await fetch('/api/book-meeting', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Success Confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'] };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            setStep("success");
        } catch (error) {
            console.error("Booking failed:", error);
            alert(t.booking.alertError);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    return (
        <section id="booking" className="py-24 md:py-32 bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* LEFT COLUMN: Value Proposition */}
                        <div className="lg:col-span-5 flex flex-col justify-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                {/* Main Headline */}
                                <div>
                                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                                        {t.booking.title}
                                        <span className="block bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-clip-text text-transparent">
                                            {t.booking.titleHighlight}
                                        </span>
                                    </h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
                                        {t.booking.subtitle}
                                    </p>
                                </div>




                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: Booking Flow */}
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden relative md:min-h-[600px] flex flex-col"
                            >
                                {/* Progress Bar */}
                                <div className="h-1 bg-muted w-full">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: "25%" }}
                                        animate={{
                                            width: step === "date" ? "25%" : step === "time" ? "50%" : step === "form" ? "75%" : "100%"
                                        }}
                                    />
                                </div>

                                <AnimatePresence mode="wait">
                                    {/* STEP 1: DATE */}
                                    {step === "date" && (
                                        <motion.div
                                            key="date"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="p-4 md:p-8 flex-1 flex flex-col"
                                        >
                                            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
                                                <h3 className="text-xl font-semibold">{t.booking.selectDate}</h3>
                                                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-border/50">
                                                    <button
                                                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                                        disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                                                        className="p-1 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-medium w-28 text-center">
                                                        {t.booking.months[currentDate.getMonth()]} {currentDate.getFullYear()}
                                                    </span>
                                                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1 hover:text-primary transition-colors">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-7 gap-2 mb-4">
                                                {DAYS.map(day => (
                                                    <div key={day} className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-7 gap-1 md:gap-2">
                                                {getDaysInMonth(currentDate).map((date, i) => (
                                                    <div key={i} className="aspect-square">
                                                        {date ? (
                                                            <button
                                                                onClick={() => handleDateSelect(date)}
                                                                disabled={date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                                className={cn(
                                                                    "w-full h-full rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 relative group",
                                                                    selectedDate?.toDateString() === date.toDateString()
                                                                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                                                        : date < new Date(new Date().setHours(0, 0, 0, 0))
                                                                            ? "text-muted-foreground/20 cursor-not-allowed"
                                                                            : "hover:bg-primary/10 hover:text-primary hover:scale-110 bg-background border border-border/50"
                                                                )}
                                                            >
                                                                {date.getDate()}
                                                                {date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() && (
                                                                    <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                                                                )}
                                                            </button>
                                                        ) : <div />}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto pt-4 md:pt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span>{t.booking.timezoneNote}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2: TIME */}
                                    {step === "time" && (
                                        <motion.div
                                            key="time"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="p-8 flex-1 flex flex-col"
                                        >
                                            <div className="flex items-center gap-4 mb-8">
                                                <button onClick={() => setStep("date")} className="p-2 hover:bg-muted rounded-full transition-colors border border-border/50">
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <div>
                                                    <h3 className="text-xl font-semibold">{t.booking.selectTime}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedDate?.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                                {isLoadingAvailability ? (
                                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                                                        <p>{t.booking.checkingAvailability}</p>
                                                    </div>
                                                ) : (
                                                    TIME_SLOTS.map((time, i) => {
                                                        const isBusy = isSlotBusy(time);
                                                        const isPast = isSlotInPast(time);
                                                        const isDisabled = isBusy || isPast;
                                                        return (
                                                            <motion.button
                                                                key={time}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.05 }}
                                                                onClick={() => handleTimeSelect(time)}
                                                                disabled={isDisabled}
                                                                className={cn(
                                                                    "py-4 px-4 rounded-xl border border-border transition-all text-sm font-medium flex items-center justify-center gap-2 group bg-background relative overflow-hidden",
                                                                    isDisabled
                                                                        ? "opacity-40 cursor-not-allowed bg-muted/20 border-transparent"
                                                                        : "hover:border-primary hover:bg-primary/5"
                                                                )}
                                                            >
                                                                <Clock className={cn("w-4 h-4 transition-colors", isDisabled ? "text-muted-foreground/50" : "text-muted-foreground group-hover:text-primary")} />
                                                                <span className={cn(isDisabled && "line-through decoration-muted-foreground/50")}>{time}</span>
                                                            </motion.button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            {!isLoadingAvailability && (
                                                <div className="mt-auto pt-6 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        {(() => {
                                                            const availableCount = TIME_SLOTS.filter(slot => !busySlots.includes(slot) && !isSlotInPast(slot)).length;
                                                            return `${availableCount} ${availableCount === 1 ? t.booking.spot : t.booking.spots} ${t.booking.spotsLeft}`;
                                                        })()}
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* STEP 3: FORM */}
                                    {step === "form" && (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="p-8 flex-1 flex flex-col"
                                        >
                                            <div className="flex items-center gap-4 mb-8">
                                                <button onClick={() => setStep("time")} className="p-2 hover:bg-muted rounded-full transition-colors border border-border/50">
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className="text-xl font-semibold">{t.booking.finalDetails}</h3>
                                            </div>

                                            <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl mb-8 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="font-semibold text-foreground">
                                                            {selectedDate?.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </p>
                                                        <p className="text-muted-foreground">{selectedTime}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setStep("date")} className="text-xs font-medium text-primary hover:underline">
                                                    {t.booking.change}
                                                </button>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-foreground ml-1">{t.booking.fullName}</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-border bg-zinc-950/50 text-zinc-100 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-foreground ml-1">{t.booking.workEmail}</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={e => {
                                                            setFormData({ ...formData, email: e.target.value });
                                                            if (errors.email) setErrors({ ...errors, email: "" });
                                                        }}
                                                        className={cn(
                                                            "w-full px-4 py-3 rounded-xl border bg-zinc-950/50 text-zinc-100 placeholder:text-muted-foreground focus:ring-2 outline-none transition-all",
                                                            errors.email
                                                                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                                                                : "border-border focus:ring-primary/20 focus:border-primary"
                                                        )}
                                                        placeholder="john@company.com"
                                                    />
                                                    {errors.email && (
                                                        <motion.p
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: [-10, 10, -5, 5, 0] }}
                                                            transition={{ duration: 0.4 }}
                                                            className="text-xs text-red-500 font-medium ml-1"
                                                        >
                                                            {errors.email}
                                                        </motion.p>
                                                    )}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-foreground ml-1">{t.booking.projectNotes}</label>
                                                    <textarea
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-border bg-zinc-950/50 text-zinc-100 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
                                                        placeholder={t.booking.projectNotesPlaceholder}
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                                                >
                                                    {isSubmitting ? (
                                                        t.booking.confirming
                                                    ) : (
                                                        <>
                                                            {t.booking.confirmBooking} <ArrowRight className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </motion.div>
                                    )}

                                    {/* STEP 4: SUCCESS */}
                                    {step === "success" && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-8 flex-1 flex flex-col items-center justify-center text-center"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 260,
                                                    damping: 20
                                                }}
                                                className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-green-500/30"
                                            >
                                                <Check className="w-12 h-12" />
                                            </motion.div>
                                            <h3 className="text-3xl font-bold mb-4">{t.booking.allSet}</h3>
                                            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                                                {t.booking.confirmationSent} <span className="text-foreground font-medium">{formData.email}</span>.
                                                <br />
                                                {t.booking.lookForward}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setStep("date");
                                                    setSelectedDate(null);
                                                    setSelectedTime(null);
                                                    setFormData({ name: "", email: "", notes: "" });
                                                }}
                                                className="text-primary hover:underline text-sm font-medium"
                                            >
                                                {t.booking.bookAnother}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
