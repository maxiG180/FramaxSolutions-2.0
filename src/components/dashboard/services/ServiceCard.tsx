import { MoreVertical, Layers } from "lucide-react";

interface ServiceCardProps {
    title: string;
    description: string;
    price: string;
    status: "active" | "inactive";
}

export function ServiceCard({ title, description, price, status }: ServiceCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <Layers className="w-6 h-6" />
                </div>
                <button className="text-white/20 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-white/60 text-sm mb-4 line-clamp-2">{description}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="text-xl font-bold">{price}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                    }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>
        </div>
    );
}
