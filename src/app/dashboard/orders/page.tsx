
"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Loader } from "@/components/ui/loader";

const ORDERS = [
    { id: "ORD-001", client: "Acme Corp", date: "Oct 24, 2024", status: "Completed", amount: "$2,500" },
    { id: "ORD-002", client: "Globex Inc", date: "Oct 26, 2024", status: "Processing", amount: "$1,200" },
    { id: "ORD-003", client: "Soylent Corp", date: "Oct 27, 2024", status: "Pending", amount: "$4,800" },
    { id: "ORD-004", client: "Acme Corp", date: "Nov 01, 2024", status: "Processing", amount: "$2,500" },
];

export default function OrdersPage() {
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
                    <h1 className="text-3xl font-bold mb-2">Orders</h1>
                    <p className="text-white/60">Track and manage client orders.</p>
                </div>
                <button className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/10">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                </div>
                <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* Orders List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/60 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium">Order ID</th>
                            <th className="p-4 font-medium">Client</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {ORDERS.map((order) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                                <td className="p-4 font-mono text-sm text-white/60">#{order.id}</td>
                                <td className="p-4 font-bold">{order.client}</td>
                                <td className="p-4 text-white/60">{order.date}</td>
                                <td className="p-4">
                                    <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${order.status === "Completed" ? "bg-green-500/20 text-green-400" :
                                        order.status === "Processing" ? "bg-blue-500/20 text-blue-400" :
                                            "bg-yellow-500/20 text-yellow-400"
                                        } `}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono">{order.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

