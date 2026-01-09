"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Layers, Edit, Trash2 } from "lucide-react";
import { Service } from "@/types/service";

interface ServiceCardProps {
    service: Service;
    onEdit: (service: Service) => void;
    onDelete: (serviceId: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <Layers className="w-6 h-6" />
                </div>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-white/20 hover:text-white transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-8 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-10 min-w-[150px] overflow-hidden">
                            <button
                                onClick={() => {
                                    onEdit(service);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(service.id);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-sm text-white/80 hover:text-red-400 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-bold mb-2">{service.title}</h3>
            <p className="text-white/60 text-sm mb-4 line-clamp-2">
                {service.description || "No description provided"}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex flex-col">
                    {/* Price Display Logic */}
                    {service.price_type === 'Custom Quote' ? (
                        <span className="text-lg font-bold text-white/80">Custom Quote</span>
                    ) : service.base_price !== null ? (
                        <span className="text-xl font-bold">
                            {/* Starting From displays with + */}
                            {service.price_type === 'Starting From' && (
                                <>From €{service.base_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}+</>
                            )}

                            {/* One-Time Fixed displays as exact price */}
                            {service.billing_type === 'One-Time' && service.price_type === 'Fixed' && (
                                <>€{service.base_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                            )}

                            {/* Monthly displays with /mo */}
                            {service.billing_type === 'Recurring' && service.recurring_interval === 'Monthly' && (
                                <>€{service.base_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-sm text-white/60">/mo</span></>
                            )}

                            {/* Yearly displays with /yr */}
                            {service.billing_type === 'Recurring' && service.recurring_interval === 'Yearly' && (
                                <>€{service.base_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-sm text-white/60">/yr</span></>
                            )}
                        </span>
                    ) : (
                        <span className="text-lg font-bold text-white/80">Price TBD</span>
                    )}
                </div>

                {/* Category Badge */}
                {service.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {service.category}
                    </span>
                )}
            </div>
        </div>
    );
}
