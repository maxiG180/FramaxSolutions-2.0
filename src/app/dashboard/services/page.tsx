"use client";

import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { ServiceCard } from "@/components/dashboard/services/ServiceCard";
import { Plus } from "lucide-react";

const SERVICES = [
    {
        title: "Web Design & Development",
        description: "Custom website design and development using modern frameworks like Next.js and React.",
        price: "$2,500+",
        status: "active" as const,
    },
    {
        title: "SEO Optimization",
        description: "Comprehensive SEO audit, keyword research, and on-page optimization to improve rankings.",
        price: "$1,200/mo",
        status: "active" as const,
    },
    {
        title: "Website Maintenance",
        description: "Monthly updates, security patches, backups, and performance monitoring.",
        price: "$500/mo",
        status: "active" as const,
    },
    {
        title: "Content Marketing",
        description: "Blog post creation, social media content, and email marketing campaigns.",
        price: "$1,500/mo",
        status: "inactive" as const,
    },
    {
        title: "Brand Identity",
        description: "Logo design, color palette selection, and brand guidelines creation.",
        price: "$3,000+",
        status: "active" as const,
    },
];

export default function ServicesPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Services</h1>
                    <p className="text-white/60">Manage your agency's service offerings and pricing.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
                    <Plus className="w-5 h-5" />
                    Add New Service
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SERVICES.map((service, index) => (
                    <ServiceCard key={index} {...service} />
                ))}
            </div>
        </div>
    );
}
