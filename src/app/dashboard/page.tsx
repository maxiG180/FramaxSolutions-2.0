"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { Users, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                <p className="text-white/60">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="$12,450"
                    change="+12.5%"
                    isPositive={true}
                    icon={DollarSign}
                />
                <StatCard
                    title="Active Clients"
                    value="24"
                    change="+4"
                    isPositive={true}
                    icon={Users}
                />
                <StatCard
                    title="Pending Orders"
                    value="7"
                    change="-2"
                    isPositive={true}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Conversion Rate"
                    value="3.2%"
                    change="+0.4%"
                    isPositive={true}
                    icon={TrendingUp}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Placeholder */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
                                    JD
                                </div>
                                <div>
                                    <p className="font-medium">New order from John Doe</p>
                                    <p className="text-sm text-white/40">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions Placeholder */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left">
                            <span className="block font-bold mb-1">Add Client</span>
                            <span className="text-sm text-white/40">Create a new client profile</span>
                        </button>
                        <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left">
                            <span className="block font-bold mb-1">Create Invoice</span>
                            <span className="text-sm text-white/40">Send a new invoice</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
