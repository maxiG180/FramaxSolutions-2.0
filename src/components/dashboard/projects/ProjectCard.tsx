"use client";

import { Calendar, Globe, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
    id: number;
    title: string;
    client: string;
    contactPerson?: string;
    clientLogo?: string;
    status: "in-progress" | "completed";
    websiteOnline?: boolean;
    websiteUrl?: string;
    startDate: string;
    addOns?: string[];
}

export function ProjectCard({ id, title, client, contactPerson, clientLogo, status, websiteOnline, websiteUrl, startDate, addOns }: ProjectCardProps) {
    const router = useRouter();

    const handleCardClick = (e: React.MouseEvent) => {
        router.push(`/dashboard/projects/${id}`);
    };

    const getStatusColor = (status: string) => {
        return status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    };


    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return 'Hoje';
        } else if (diffInDays === 1) {
            return 'Há 1 dia';
        } else if (diffInDays < 30) {
            return `Há ${diffInDays} dias`;
        } else if (diffInDays < 60) {
            return 'Há 1 mês';
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
        } else if (diffInDays < 730) {
            return 'Há 1 ano';
        } else {
            const years = Math.floor(diffInDays / 365);
            return `Há ${years} anos`;
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3 flex-1">
                    {clientLogo && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            <img
                                src={clientLogo}
                                alt={client}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                        {contactPerson ? (
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                                <p className="text-white/60 text-sm truncate">{contactPerson}</p>
                            </div>
                        ) : (
                            <p className="text-white/60 text-sm truncate">{client}</p>
                        )}
                    </div>
                </div>
                {websiteUrl && websiteOnline ? (
                    <a
                        href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/80 hover:text-white transition-colors"
                    >
                        <Globe className="w-3 h-3" />
                        <span className="max-w-[120px] truncate">{websiteUrl}</span>
                        <div className="relative flex h-2 w-2 ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                    </a>
                ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status === 'completed' ? 'Completo' : 'Em Progresso'}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{getRelativeTime(startDate)}</span>
                </div>

                {/* Add-ons */}
                {addOns && addOns.length > 0 && (
                    <div className="pt-2">
                        <div className="flex flex-wrap gap-2">
                            {addOns.map((addOn, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 text-white/70 border border-white/10"
                                >
                                    {addOn}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
