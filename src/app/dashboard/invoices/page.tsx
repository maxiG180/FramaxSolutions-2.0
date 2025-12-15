
"use client";

import { useState, useEffect } from "react";
import { InvoiceList } from "@/components/dashboard/invoices/InvoiceList";
import { Plus, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";

const INVOICES = [
    { id: "#INV-2024-001", client: "Fashion Nova", amount: "$2,500.00", date: "Nov 25, 2025", status: "paid" as const },
    { id: "#INV-2024-002", client: "TechCorp Inc.", amount: "$1,200.00", date: "Nov 28, 2025", status: "pending" as const },
    { id: "#INV-2024-003", client: "FitLife", amount: "$850.00", date: "Nov 15, 2025", status: "overdue" as const },
    { id: "#INV-2024-004", client: "Green Earth", amount: "$3,000.00", date: "Nov 10, 2025", status: "paid" as const },
    { id: "#INV-2024-005", client: "Speedy Motors", amount: "$1,500.00", date: "Dec 01, 2025", status: "pending" as const },
];

export default function InvoicesPage() {
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
                    <h1 className="text-3xl font-bold mb-2">Invoices</h1>
                    <p className="text-white/60">Manage your billing and track payments.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
                    <Plus className="w-5 h-5" />
                    Create Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Total Invoiced</p>
                            <p className="text-2xl font-bold">$9,050.00</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Overdue Amount</p>
                            <p className="text-2xl font-bold">$850.00</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Paid This Month</p>
                            <p className="text-2xl font-bold">$5,500.00</p>
                        </div>
                    </div>
                </div>
            </div>

            <InvoiceList invoices={INVOICES} />
        </div>
    );
}
