"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowRight, Check, Sparkles, ChevronLeft, ChevronRight, Star, ShieldCheck, Users, X } from "lucide-react";
import confetti from "canvas-confetti";
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
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [formData, setFormData] = useState({ name: "", email: "", notes: "" });
    const [errors, setErrors] = useState({ email: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [busySlots, setBusySlots] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [titleClicks, setTitleClicks] = useState(0);
    const [promoCode, setPromoCode] = useState("");
    const [promoStatus, setPromoStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [promoMessage, setPromoMessage] = useState("");

    // Auto-fill promo code from localStorage
    useEffect(() => {
        const savedCode = localStorage.getItem("framax_promo_code");
        if (savedCode) {
            setPromoCode(savedCode);
        }
    }, []);

    // Fetch availability when date changes
    useEffect(() => {
        if (selectedDate) {
            const fetchAvailability = async () => {
                setIsLoadingAvailability(true);
                setBusySlots([]); // Reset

                try {
                    // Call our own API endpoint (which proxies to Make.com server-side)
                    const response = await fetch('/api/check-availability', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: selectedDate.toISOString() })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch availability');
                    }

                    const data = await response.json();
                    // Only set busy slots that are actually in our TIME_SLOTS array
                    const validBusySlots = (data.busySlots || []).filter((slot: string) => TIME_SLOTS.includes(slot));
                    setBusySlots(validBusySlots);

                } catch (error) {
                    console.error("Failed to check availability:", error);
                    setBusySlots([]); // Ensure we reset to empty on error
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
        if (!emailRegex.test(email)) return "Please enter a valid email address.";
        if (email.endsWith("@test.com") || email.endsWith("@example.com")) return "Please use a real email address.";
        return "";
    };

    const validatePromoCode = async (code: string) => {
        if (!code) {
            setPromoStatus('idle');
            setPromoMessage("");
            return;
        }

        setPromoStatus('validating');
        try {
            const res = await fetch('/api/validate-discount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();

            if (data.valid) {
                setPromoStatus('valid');
                setPromoMessage(data.message);
            } else {
                setPromoStatus('invalid');
                setPromoMessage(data.message);
            }
        } catch (error) {
            setPromoStatus('invalid');
            setPromoMessage("Error checking code");
        }
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
                time: selectedTime,
                promoCode: promoCode // Send promo code to webhook
            };

            await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // If there's a valid promo code, redeem it
            if (promoCode && promoStatus === 'valid') {
                try {
                    await fetch('/api/redeem-discount', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: promoCode })
                    });
                } catch (err) {
                    console.error("Failed to redeem code:", err);
                    // Non-blocking error, user booked successfully
                }
            }

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
            alert("Something went wrong. Please try again.");
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
                                        Book your
                                        <span className="block bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-clip-text text-transparent">
                                            free call
                                        </span>
                                    </h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
                                        30 minutes to discuss your project. Zero commitment, maximum value.
                                    </p>
                                </div>

                                {/* Quick Stats - Hidden on mobile, shown on desktop */}
                                <div className="hidden lg:grid grid-cols-2 gap-6 pt-8">
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-foreground">50+</span>
                                            <span className="text-sm text-muted-foreground">projects</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">delivered successfully</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-foreground">24h</span>
                                            <span className="text-sm text-muted-foreground">response</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">average reply time</p>
                                    </div>
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
                                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col"
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
                                            className="p-8 flex-1 flex flex-col"
                                        >
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-xl font-semibold">Select a Date</h3>
                                                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-border/50">
                                                    <button
                                                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                                        disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                                                        className="p-1 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-medium w-28 text-center">
                                                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
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

                                            <div className="grid grid-cols-7 gap-2">
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

                                            <div className="mt-auto pt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span>Times are in your local timezone</span>
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
                                                    <h3 className="text-xl font-semibold">Select a Time</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedDate?.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                                {isLoadingAvailability ? (
                                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                                                        <p>Checking availability...</p>
                                                    </div>
                                                ) : (
                                                    TIME_SLOTS.map((time, i) => {
                                                        const isBusy = isSlotBusy(time);
                                                        return (
                                                            <motion.button
                                                                key={time}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.05 }}
                                                                onClick={() => handleTimeSelect(time)}
                                                                disabled={isBusy}
                                                                className={cn(
                                                                    "py-4 px-4 rounded-xl border border-border transition-all text-sm font-medium flex items-center justify-center gap-2 group bg-background relative overflow-hidden",
                                                                    isBusy
                                                                        ? "opacity-40 cursor-not-allowed bg-muted/20 border-transparent"
                                                                        : "hover:border-primary hover:bg-primary/5"
                                                                )}
                                                            >
                                                                <Clock className={cn("w-4 h-4 transition-colors", isBusy ? "text-muted-foreground/50" : "text-muted-foreground group-hover:text-primary")} />
                                                                <span className={cn(isBusy && "line-through decoration-muted-foreground/50")}>{time}</span>
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
                                                            const availableCount = TIME_SLOTS.filter(slot => !busySlots.includes(slot)).length;
                                                            return `${availableCount} ${availableCount === 1 ? 'spot' : 'spots'} left for this day`;
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
                                                <h3 className="text-xl font-semibold">Final Details</h3>
                                            </div>

                                            <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl mb-8 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="font-semibold text-foreground">
                                                            {selectedDate?.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </p>
                                                        <p className="text-muted-foreground">{selectedTime}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setStep("date")} className="text-xs font-medium text-primary hover:underline">
                                                    Change
                                                </button>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
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
                                                    <label className="text-sm font-medium text-foreground ml-1">Work Email</label>
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
                                                    <label className="text-sm font-medium text-foreground ml-1">Project Notes (Optional)</label>
                                                    <textarea
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-border bg-zinc-950/50 text-zinc-100 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
                                                        placeholder="Tell us a bit about your goals..."
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-foreground ml-1">Promo Code (Optional)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={promoCode}
                                                            onChange={e => {
                                                                setPromoCode(e.target.value.toUpperCase());
                                                                setPromoStatus('idle');
                                                                setPromoMessage('');
                                                            }}
                                                            onBlur={() => validatePromoCode(promoCode)}
                                                            className={cn(
                                                                "w-full px-4 py-3 rounded-xl border border-border bg-zinc-950/50 text-zinc-100 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono",
                                                                promoStatus === 'valid' && "border-green-500/50 bg-green-500/5",
                                                                promoStatus === 'invalid' && "border-red-500/50 bg-red-500/5"
                                                            )}
                                                            placeholder="FRAMAX-XXXX"
                                                        />
                                                        {promoStatus === 'validating' && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                            </div>
                                                        )}
                                                        {promoStatus === 'valid' && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
                                                                <Check className="w-3 h-3" /> {promoMessage}
                                                            </div>
                                                        )}
                                                        {promoStatus === 'invalid' && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 flex items-center gap-1 text-xs font-medium bg-red-500/10 px-2 py-1 rounded-full">
                                                                <X className="w-3 h-3" /> {promoMessage}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                                                >
                                                    {isSubmitting ? (
                                                        "Confirming..."
                                                    ) : (
                                                        <>
                                                            Confirm Booking <ArrowRight className="w-4 h-4" />
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
                                            <h3 className="text-3xl font-bold mb-4">You're all set!</h3>
                                            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                                                We've sent a calendar invitation to <span className="text-foreground font-medium">{formData.email}</span>.
                                                <br />
                                                Looking forward to our chat!
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
                                                Book another call
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
