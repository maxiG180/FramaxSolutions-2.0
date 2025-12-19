
"use client";

import { useState, useEffect } from "react";
import { InvoiceList } from "@/components/dashboard/invoices/InvoiceList";
import { QuoteModal } from "@/components/dashboard/invoices/QuoteModal";
import { Plus, FileText, AlertCircle, CheckCircle, ChevronDown, Receipt, FileSignature } from "lucide-react";
import { Loader } from "@/components/ui/loader";

type DocumentType = "all" | "invoice" | "quote";

interface Document {
    id: string;
    client: string;
    amount: string;
    date: string;
    status: "paid" | "pending" | "overdue" | "draft" | "sent" | "accepted" | "declined" | "converted";
    type: "invoice" | "quote";
}

const DOCUMENTS: Document[] = [

    { id: "#INV-2024-001", client: "Fashion Nova", amount: "$2,500.00", date: "Nov 25, 2025", status: "paid" as const, type: "invoice" as const },
    { id: "#INV-2024-002", client: "TechCorp Inc.", amount: "$1,200.00", date: "Nov 28, 2025", status: "pending" as const, type: "invoice" as const },
    { id: "#INV-2024-003", client: "FitLife", amount: "$850.00", date: "Nov 15, 2025", status: "overdue" as const, type: "invoice" as const },
    { id: "#INV-2024-004", client: "Green Earth", amount: "$3,000.00", date: "Nov 10, 2025", status: "paid" as const, type: "invoice" as const },
    { id: "#INV-2024-005", client: "Speedy Motors", amount: "$1,500.00", date: "Dec 01, 2025", status: "pending" as const, type: "invoice" as const },
    { id: "#QTE-2024-001", client: "Urban Fitness", amount: "$4,200.00", date: "Dec 05, 2025", status: "sent" as const, type: "quote" as const },
    { id: "#QTE-2024-002", client: "Cafe Luxe", amount: "$1,800.00", date: "Dec 08, 2025", status: "draft" as const, type: "quote" as const },
    { id: "#QTE-2024-003", client: "Digital Dreams", amount: "$5,500.00", date: "Dec 10, 2025", status: "accepted" as const, type: "quote" as const },
    { id: "#QTE-2024-004", client: "Metro Bank", amount: "$2,100.00", date: "Nov 20, 2025", status: "declined" as const, type: "quote" as const },
];

export default function InvoicesPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DocumentType>("all");
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [documents, setDocuments] = useState(DOCUMENTS);

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const filteredDocuments = documents.filter(doc => {
        if (activeTab === "all") return true;
        return doc.type === activeTab;
    });

    const handleConvertToInvoice = (id: string) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === id && doc.type === "quote") {
                return { ...doc, status: "converted" as const };
            }
            return doc;
        }));
        alert(`Quote ${id} has been converted to an invoice!`);
    };

    // Calculate stats based on active tab
    const calculateStats = () => {
        const relevantDocs = activeTab === "all" ? documents : documents.filter(d => d.type === activeTab);

        const total = relevantDocs.reduce((sum, doc) => {
            const amount = parseFloat(doc.amount.replace(/[$,]/g, ''));
            return sum + amount;
        }, 0);

        const overdue = relevantDocs
            .filter(d => d.status === "overdue")
            .reduce((sum, doc) => sum + parseFloat(doc.amount.replace(/[$,]/g, '')), 0);

        const paidOrAccepted = relevantDocs
            .filter(d => d.status === "paid" || d.status === "accepted")
            .reduce((sum, doc) => sum + parseFloat(doc.amount.replace(/[$,]/g, '')), 0);

        return {
            total: `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            overdue: `$${overdue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            completed: `$${paidOrAccepted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        };
    };

    const stats = calculateStats();

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Documents</h1>
                    <p className="text-white/60">Manage your invoices, quotes, and billing.</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create New
                        <ChevronDown className={`w-4 h-4 transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCreateDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
                            <button
                                onClick={() => { alert("Create Invoice clicked!"); setShowCreateDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Receipt className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Create Invoice</p>
                                    <p className="text-xs text-white/60">Bill your client</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { setIsQuoteModalOpen(true); setShowCreateDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <FileSignature className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Create Quote</p>
                                    <p className="text-xs text-white/60">Send a proposal</p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />


            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 mb-8 flex-shrink-0">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-3 font-medium transition-all relative ${activeTab === "all"
                        ? "text-blue-400"
                        : "text-white/60 hover:text-white/80"
                        }`}
                >
                    All Documents
                    {activeTab === "all" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("invoice")}
                    className={`px-4 py-3 font-medium transition-all relative ${activeTab === "invoice"
                        ? "text-blue-400"
                        : "text-white/60 hover:text-white/80"
                        }`}
                >
                    Invoices
                    {activeTab === "invoice" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("quote")}
                    className={`px-4 py-3 font-medium transition-all relative ${activeTab === "quote"
                        ? "text-blue-400"
                        : "text-white/60 hover:text-white/80"
                        }`}
                >
                    Quotes
                    {activeTab === "quote" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">
                                {activeTab === "quote" ? "Total Quoted" : activeTab === "invoice" ? "Total Invoiced" : "Total Value"}
                            </p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">
                                {activeTab === "quote" ? "Declined" : "Overdue Amount"}
                            </p>
                            <p className="text-2xl font-bold">{stats.overdue}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">
                                {activeTab === "quote" ? "Accepted" : "Paid This Month"}
                            </p>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
                <InvoiceList invoices={filteredDocuments} onConvertToInvoice={handleConvertToInvoice} />
            </div>
        </div>
    );
}
