import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    isPositive?: boolean;
    icon: LucideIcon;
}

export function StatCard({ title, value, change, isPositive, icon: Icon }: StatCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-sm font-medium">{title}</span>
                <div className="p-2 bg-white/10 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-white">{value}</h3>
                {change && (
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {change}
                    </span>
                )}
            </div>
        </div>
    );
}
