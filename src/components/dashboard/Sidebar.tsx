"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, ShoppingBag, CreditCard, Settings, LogOut, Globe, FileText, CheckSquare, Folder, Target, Calendar, Briefcase, FolderKanban, ChevronDown, ChevronRight, BarChart3, PanelLeftClose, PanelLeftOpen, ReceiptText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";


const MANAGEMENT_ITEMS = [
    { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { name: "Projects", icon: FolderKanban, href: "/dashboard/projects" },
    { name: "Clients", icon: Users, href: "/dashboard/clients" },
    { name: "Leads", icon: Target, href: "/dashboard/leads" },
    { name: "Services", icon: Briefcase, href: "/dashboard/services" }
];

const FINANCE_ITEMS = [
    { name: "Invoices", icon: ReceiptText, href: "/dashboard/invoices" },
    { name: "Payments", icon: CreditCard, href: "/dashboard/payments" },
    { name: "Orders", icon: ShoppingBag, href: "/dashboard/orders" },
];

const PRODUCTIVITY_ITEMS = [
    { name: "Calendar", icon: Calendar, href: "/dashboard/calendar", color: "text-red-500" },
    { name: "Notes", icon: FileText, href: "/dashboard/notes", color: "text-yellow-500" },
    { name: "Tasks", icon: CheckSquare, href: "/dashboard/todo", color: "text-blue-500" },
    { name: "Docs", icon: Folder, href: "/dashboard/docs", color: "text-purple-500" },
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<string[]>(["Management", "Finance", "Productivity"]);

    const toggleSection = (section: string) => {
        if (isCollapsed) return;
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const renderMenuItems = (items: Array<{ name: string; icon: any; href: string; color?: string }>) => {
        return items.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group relative",
                        isActive
                            ? "bg-white text-black"
                            : "text-white/60 hover:text-white hover:bg-white/5",
                        isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.name : undefined}
                >
                    <item.icon className={cn("w-5 h-5 flex-shrink-0", !isActive && item.color)} />
                    {!isCollapsed && <span>{item.name}</span>}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                            {item.name}
                        </div>
                    )}
                </Link>
            );
        });
    };

    const renderSection = (title: string, items: typeof MANAGEMENT_ITEMS) => {
        const isExpanded = expandedSections.includes(title);

        if (isCollapsed) {
            return (
                <div className="space-y-1 pt-2 border-t border-white/5 first:border-0 first:pt-0">
                    {renderMenuItems(items)}
                </div>
            );
        }

        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleSection(title)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-white/30 uppercase tracking-widest hover:text-white/50 transition-colors"
                >
                    <span>{title}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {isExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                        {renderMenuItems(items)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside
            className={cn(
                "bg-black border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-40",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn("p-6 border-b border-white/10 flex items-center", isCollapsed && "justify-center px-2")}>
                <Link href="/dashboard" className="text-xl font-bold text-white tracking-tighter overflow-hidden whitespace-nowrap flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isCollapsed ? (
                            <motion.img
                                key="icon"
                                src="/logos/framax_icon.png"
                                alt="Framax"
                                className="w-8 h-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            />
                        ) : (
                            <motion.div
                                key="text"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                Framax<span className="text-blue-500">Solutions</span><span className="text-white/50">Admin</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {/* Collapsible Sections */}
                {renderSection("Management", MANAGEMENT_ITEMS)}
                {renderSection("Finance", FINANCE_ITEMS)}
                {renderSection("Productivity", PRODUCTIVITY_ITEMS)}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
                <button
                    onClick={onToggle}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all w-full",
                        isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen className="w-5 h-5 flex-shrink-0" /> : <PanelLeftClose className="w-5 h-5 flex-shrink-0" />}
                    {!isCollapsed && "Collapse"}
                </button>

                <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all",
                            isCollapsed ? "justify-center w-full px-2" : "flex-1"
                        )}
                        title="Settings"
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && "Settings"}
                    </Link>
                    <button
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            window.location.href = "/login";
                        }}
                        className={cn(
                            "flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 transition-all",
                            isCollapsed ? "w-full py-3" : "w-11 h-11"
                        )}
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
