"use client";

import { Search, Download, DollarSign, CreditCard, Calendar } from "lucide-react";

const PAYMENTS = [
    { id: "INV-2024-001", client: "Acme Corp", date: "Oct 24, 2024", status: "Paid", amount: "$2,500.00", method: "Stripe" },
    { id: "INV-2024-002", client: "Globex Inc", date: "Oct 26, 2024", status: "Pending", amount: "$1,200.00", method: "Bank Transfer" },
    { id: "INV-2024-003", client: "Soylent Corp", date: "Oct 27, 2024", status: "Paid", amount: "$4,800.00", method: "PayPal" },
    { id: "INV-2024-004", client: "Umbrella Corp", date: "Nov 01, 2024", status: "Overdue", amount: "$500.00", method: "Stripe" },
    { id: "INV-2024-005", client: "Acme Corp", date: "Nov 05, 2024", status: "Paid", amount: "$2,500.00", method: "Stripe" },
];

export default function PaymentsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Payments</h1>
                    <p className="text-white/60">Track revenue and manage invoices.</p>
                </div>
                <button className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
                    <DollarSign className="w-4 h-4" /> Create Invoice
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="text-white/60 text-sm font-medium mb-2">Total Revenue (YTD)</div>
                    <div className="text-3xl font-bold">$112,450.00</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="text-white/60 text-sm font-medium mb-2">Pending Invoices</div>
                    <div className="text-3xl font-bold text-yellow-400">$3,700.00</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="text-white/60 text-sm font-medium mb-2">Overdue</div>
                    <div className="text-3xl font-bold text-red-400">$500.00</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                </div>
                <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Calendar className="w-4 h-4" /> Date Range
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/60 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium">Invoice</th>
                            <th className="p-4 font-medium">Client</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Method</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Amount</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {PAYMENTS.map((payment) => (
                            <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-sm text-white/60">{payment.id}</td>
                                <td className="p-4 font-bold">{payment.client}</td>
                                <td className="p-4 text-white/60">{payment.date}</td>
                                <td className="p-4 flex items-center gap-2 text-white/80">
                                    <CreditCard className="w-4 h-4 opacity-50" />
                                    {payment.method}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === "Paid" ? "bg-green-500/20 text-green-400" :
                                        payment.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                                            "bg-red-500/20 text-red-400"
                                        }`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono font-bold">{payment.amount}</td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
