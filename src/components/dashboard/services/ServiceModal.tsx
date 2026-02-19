"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Service, BillingType, PriceType, RecurringInterval } from "@/types/service";
import { IconPicker } from "./IconPicker";
import { suggestIcon } from "@/utils/serviceIcons";
import { useLanguage } from "@/context/LanguageContext";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (serviceData: any) => Promise<void>;
    service?: Service | null;
}

type PricingOption = 'One-Time' | 'Starting From' | 'Monthly' | 'Yearly' | 'Custom Quote';

export function ServiceModal({ isOpen, onClose, onSave, service }: ServiceModalProps) {
    const { t } = useLanguage();
    const [title, setTitle] = useState("");
    const [pricingOption, setPricingOption] = useState<PricingOption>('One-Time');
    const [price, setPrice] = useState<number>(0);
    const [icon, setIcon] = useState("Layers");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [selectedIncludedServices, setSelectedIncludedServices] = useState<string[]>([]);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch available services for inclusion selection
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services');
                if (response.ok) {
                    const data = await response.json();
                    setAvailableServices(data);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    // Initialize form with service data if editing
    useEffect(() => {
        if (service) {
            setTitle(service.title);
            setPrice(service.base_price || 0);
            setIcon(service.icon || "Layers");

            // Set included services
            if (service.included_services) {
                setSelectedIncludedServices(service.included_services.map(s => s.id));
            } else {
                setSelectedIncludedServices([]);
            }

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
            setPricingOption('One-Time');
            setPrice(0);
            setIcon("Layers");
            setSelectedIncludedServices([]);
        }
        setError("");
    }, [service, isOpen]);

    const handleAutoSuggestIcon = () => {
        const suggestedIcon = suggestIcon(title);
        setIcon(suggestedIcon);
    };

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
                billing_type: billingType,
                price_type: priceType,
                base_price: basePrice,
                recurring_interval: recurringInterval,
                currency: 'EUR',
                icon: icon,
                included_service_ids: selectedIncludedServices,
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
                        className="w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                            <Layers className="w-5 h-5" />
                                        </span>
                                        {service ? t.services.editService : t.services.addService}
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
                                    <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {/* Row 1: Title and Price */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">{t.services.titleLabel}</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                placeholder={t.services.titlePlaceholder}
                                                required
                                            />
                                        </div>

                                        {/* Price */}
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">{t.services.priceLabel}</label>
                                            <div className="flex gap-0 bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-blue-500/50 transition-colors">
                                                <select
                                                    value={pricingOption}
                                                    onChange={(e) => setPricingOption(e.target.value as PricingOption)}
                                                    className="bg-white/10 border-r border-white/10 px-3 py-2 text-white text-sm focus:outline-none"
                                                >
                                                    <option value="One-Time" className="bg-[#0A0A0A]">{t.services.pricingOptions.oneTime}</option>
                                                    <option value="Starting From" className="bg-[#0A0A0A]">{t.services.pricingOptions.startingFrom}</option>
                                                    <option value="Monthly" className="bg-[#0A0A0A]">{t.services.pricingOptions.monthly}</option>
                                                    <option value="Yearly" className="bg-[#0A0A0A]">{t.services.pricingOptions.yearly}</option>
                                                    <option value="Custom Quote" className="bg-[#0A0A0A]">{t.services.pricingOptions.customQuote}</option>
                                                </select>

                                                {showPriceInput ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={price === 0 ? '' : price}
                                                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                                        className="flex-1 bg-transparent px-4 py-2 text-white placeholder-white/20 focus:outline-none"
                                                        placeholder={t.services.priceAmountPlaceholder}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="flex-1 px-4 py-2 text-white/40 text-sm flex items-center">
                                                        {t.services.noFixedPrice}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Icon and Included Services */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Icon Picker */}
                                        <div className="space-y-2">
                                            <IconPicker
                                                selectedIcon={icon}
                                                onIconChange={setIcon}
                                                onAutoSuggest={handleAutoSuggestIcon}
                                            />
                                        </div>

                                        {/* Included Services */}
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">{t.services.includedServicesLabel}</label>
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-[450px] overflow-y-auto scrollbar-thin">
                                            {availableServices.length === 0 ? (
                                                <p className="text-white/40 text-sm">{t.services.loadingServices}</p>
                                            ) : availableServices.filter(s => s.id !== service?.id).length === 0 ? (
                                                <p className="text-white/40 text-sm">{t.services.noOtherServices}</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {availableServices
                                                        .filter(s => s.id !== service?.id) // Exclude current service
                                                        .map(availableService => (
                                                            <label
                                                                key={availableService.id}
                                                                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIncludedServices.includes(availableService.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedIncludedServices([...selectedIncludedServices, availableService.id]);
                                                                        } else {
                                                                            setSelectedIncludedServices(selectedIncludedServices.filter(id => id !== availableService.id));
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="text-white text-sm font-medium">{availableService.title}</div>
                                                                    {availableService.description && (
                                                                        <div className="text-white/40 text-xs line-clamp-1">{availableService.description}</div>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-white/10 px-5 py-3 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                                    disabled={loading}
                                >
                                    {t.services.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? t.services.saving : service ? t.services.updateService : t.services.createService}
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
