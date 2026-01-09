"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Service, BillingType, PriceType, RecurringInterval } from "@/types/service";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (serviceData: any) => Promise<void>;
    service?: Service | null;
}

type PricingOption = 'One-Time' | 'Starting From' | 'Monthly' | 'Yearly' | 'Custom Quote';

export function ServiceModal({ isOpen, onClose, onSave, service }: ServiceModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [pricingOption, setPricingOption] = useState<PricingOption>('One-Time');
    const [price, setPrice] = useState<number>(0);
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize form with service data if editing
    useEffect(() => {
        if (service) {
            setTitle(service.title);
            setDescription(service.description || "");
            setPrice(service.base_price || 0);
            setCategory(service.category || "");

            // Map database values to pricing option
            if (service.price_type === 'Custom Quote') {
                setPricingOption('Custom Quote');
            } else if (service.price_type === 'Starting From') {
                setPricingOption('Starting From');
            } else if (service.billing_type === 'Recurring' && service.recurring_interval === 'Monthly') {
                setPricingOption('Monthly');
            } else if (service.billing_type === 'Recurring' && service.recurring_interval === 'Yearly') {
                setPricingOption('Yearly');
            } else {
                setPricingOption('One-Time');
            }
        } else {
            // Reset form for new service
            setTitle("");
            setDescription("");
            setPricingOption('One-Time');
            setPrice(0);
            setCategory("");
        }
        setError("");
    }, [service, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Map pricing option to database fields
            let billingType: BillingType;
            let priceType: PriceType;
            let recurringInterval: RecurringInterval | null = null;
            let basePrice: number | null = null;

            switch (pricingOption) {
                case 'One-Time':
                    billingType = 'One-Time';
                    priceType = 'Fixed';
                    basePrice = Number(price);
                    break;
                case 'Starting From':
                    billingType = 'One-Time';
                    priceType = 'Starting From';
                    basePrice = Number(price);
                    break;
                case 'Monthly':
                    billingType = 'Recurring';
                    priceType = 'Fixed';
                    recurringInterval = 'Monthly';
                    basePrice = Number(price);
                    break;
                case 'Yearly':
                    billingType = 'Recurring';
                    priceType = 'Fixed';
                    recurringInterval = 'Yearly';
                    basePrice = Number(price);
                    break;
                case 'Custom Quote':
                    billingType = 'One-Time';
                    priceType = 'Custom Quote';
                    basePrice = null;
                    break;
            }

            const serviceData: any = {
                title: title.trim(),
                description: description.trim() || undefined,
                billing_type: billingType,
                price_type: priceType,
                base_price: basePrice,
                recurring_interval: recurringInterval,
                currency: 'EUR',
                category: category.trim() || undefined,
            };

            if (service) {
                serviceData.id = service.id;
            }

            await onSave(serviceData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save service');
        } finally {
            setLoading(false);
        }
    };

    // Show price input for all options except Custom Quote
    const showPriceInput = pricingOption !== 'Custom Quote';

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                            <Layers className="w-5 h-5" />
                                        </span>
                                        {service ? 'Edit Service' : 'Add New Service'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Title *</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                            placeholder="e.g., Web Design & Development"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-24"
                                            placeholder="Brief description of the service..."
                                        />
                                    </div>

                                    {/* Combined Price Input with Dropdown */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Price *</label>
                                        <div className="flex gap-0 bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-blue-500/50 transition-colors">
                                            {/* Dropdown inside input on the left */}
                                            <select
                                                value={pricingOption}
                                                onChange={(e) => setPricingOption(e.target.value as PricingOption)}
                                                className="bg-white/10 border-r border-white/10 px-3 py-2 text-white text-sm focus:outline-none"
                                            >
                                                <option value="One-Time" className="bg-[#0A0A0A]">One-Time</option>
                                                <option value="Starting From" className="bg-[#0A0A0A]">Starting From</option>
                                                <option value="Monthly" className="bg-[#0A0A0A]">Monthly</option>
                                                <option value="Yearly" className="bg-[#0A0A0A]">Yearly</option>
                                                <option value="Custom Quote" className="bg-[#0A0A0A]">Custom Quote</option>
                                            </select>

                                            {/* Price input - hidden when Custom Quote */}
                                            {showPriceInput ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={price}
                                                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                                    className="flex-1 bg-transparent px-4 py-2 text-white placeholder-white/20 focus:outline-none"
                                                    placeholder="Enter amount in EUR"
                                                    required
                                                />
                                            ) : (
                                                <div className="flex-1 px-4 py-2 text-white/40 text-sm flex items-center">
                                                    No fixed price - quote will be provided
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/40">
                                            {pricingOption === 'One-Time' && 'One-time payment (e.g., €2,500)'}
                                            {pricingOption === 'Starting From' && 'Minimum price, actual cost may be higher (e.g., €2,500+)'}
                                            {pricingOption === 'Monthly' && 'Recurring monthly subscription (e.g., €500/mo)'}
                                            {pricingOption === 'Yearly' && 'Recurring yearly subscription (e.g., €5,000/yr)'}
                                            {pricingOption === 'Custom Quote' && 'Price determined on a case-by-case basis'}
                                        </p>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Category</label>
                                        <input
                                            type="text"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                            placeholder="e.g., Development, Marketing, Design"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-white/10 p-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
