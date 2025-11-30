import { MoreVertical, Calendar, Users, Trash2, Edit } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
    id: number;
    title: string;
    client: string;
    deadline: string;
    status: "in-progress" | "review" | "completed" | "on-hold";
    progress: number;
    team: string[];
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
}

export function ProjectCard({ id, title, client, deadline, status, progress, team, onDelete, onEdit }: ProjectCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "in-progress": return "bg-blue-500/20 text-blue-400";
            case "review": return "bg-yellow-500/20 text-yellow-400";
            case "completed": return "bg-green-500/20 text-green-400";
            case "on-hold": return "bg-red-500/20 text-red-400";
            default: return "bg-white/10 text-white/40";
        }
    };

    return (
        <div
            onClick={() => router.push(`/dashboard/projects/${id}`)}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold mb-1">{title}</h3>
                    <p className="text-white/60 text-sm">{client}</p>
                </div>
                <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-white/20 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-8 w-32 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                            <button
                                onClick={() => {
                                    onEdit?.(id);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2"
                            >
                                <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button
                                onClick={() => {
                                    onDelete?.(id);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <div className="flex items-center gap-2 text-white/40">
                        <Calendar className="w-4 h-4" />
                        <span>{deadline}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/60">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                    {team.map((member, i) => (
                        <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs font-bold"
                            title={member}
                        >
                            {member.charAt(0)}
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-black flex items-center justify-center text-xs text-white/40">
                        <Users className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
