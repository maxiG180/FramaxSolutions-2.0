
"use client";

import { useState, useEffect } from "react";
import { InvoiceList } from "@/components/dashboard/invoices/InvoiceList";
import { QuoteModal } from "@/components/dashboard/invoices/QuoteModal";
import { QuoteViewModal } from "@/components/dashboard/invoices/QuoteViewModal";
import { Plus, FileText, AlertCircle, CheckCircle, ChevronDown, Receipt, FileSignature } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useLanguage } from "@/context/LanguageContext";

type DocumentType = "all" | "invoice" | "quote";

interface Document {
    id: string;
    displayId?: string;
    client: string;
    amount: string;
    date: string;
    status: "paid" | "pending" | "overdue" | "draft" | "sent" | "accepted" | "declined" | "converted";
    type: "invoice" | "quote";
    rawData?: any;
}


export default function InvoicesPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DocumentType>("all");
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
    const [viewingQuoteId, setViewingQuoteId] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [error, setError] = useState<string>("");

    // Fetch documents from API
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError("");
            // TODO: Replace with actual API endpoint when backend is ready
            // For now, we'll use an empty array until the API is implemented
            const response = await fetch('/api/documents');

            if (!response.ok) {
                // If the endpoint doesn't exist yet, just use empty array
                if (response.status === 404) {
                    setDocuments([]);
                    return;
                }
                throw new Error('Failed to fetch documents');
            }

            const data = await response.json();
            setDocuments(data);
        } catch (err: any) {
            // Set empty array instead of showing error if API doesn't exist yet
            setDocuments([]);
            // setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter(doc => {
        if (activeTab === "all") return true;
        return doc.type === activeTab;
    });

    const handleAcceptQuote = async (id: string) => {
        if (!confirm(t.invoices.acceptQuoteConfirm)) return;

        try {
            const response = await fetch('/api/accept-quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to accept quote');
            }

            const result = await response.json();

            // Update the quote status to 'accepted' in the local state
            setDocuments(prev => prev.map(doc => {
                if (doc.id === id && doc.type === "quote") {
                    return { ...doc, status: "accepted" as const };
                }
                return doc;
            }));

            // Refresh documents to show the new invoice
            await fetchDocuments();

            alert(t.invoices.quoteAccepted);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeclineQuote = async (id: string) => {
        if (!confirm(t.invoices.declineQuoteConfirm)) return;

        try {
            const response = await fetch('/api/decline-quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to decline quote');
            }

            // Update the quote status to 'declined' in the local state
            setDocuments(prev => prev.map(doc => {
                if (doc.id === id && doc.type === "quote") {
                    return { ...doc, status: "declined" as const };
                }
                return doc;
            }));

            alert(t.invoices.quoteDeclined);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    // Calculate stats based on active tab
    const calculateStats = () => {
        const relevantDocs = activeTab === "all" ? documents : documents.filter(d => d.type === activeTab);

        const total = relevantDocs.reduce((sum, doc) => {
            // Use the raw numeric value from rawData if available
            const amount = doc.rawData?.total || 0;
            return sum + amount;
        }, 0);

        const overdue = relevantDocs
            .filter(d => d.status === "overdue")
            .reduce((sum, doc) => {
                const amount = doc.rawData?.total || 0;
                return sum + amount;
            }, 0);

        const paidOrAccepted = relevantDocs
            .filter(d => d.status === "paid" || d.status === "accepted")
            .reduce((sum, doc) => {
                const amount = doc.rawData?.total || 0;
                return sum + amount;
            }, 0);

        return {
            total: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(total),
            overdue: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(overdue),
            completed: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(paidOrAccepted)
        };
    };

    const stats = calculateStats();

    const handleDeleteDocument = async (id: string, type: "invoice" | "quote") => {
        const doc = documents.find(d => d.id === id);
        if (!doc) return;

        const confirmMessage = type === "quote" ? t.invoices.deleteQuoteConfirm : t.invoices.deleteInvoiceConfirm;
        if (!confirm(confirmMessage)) return;

        try {
            const endpoint = type === "quote" ? '/api/delete-quote' : '/api/delete-invoice';
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to delete ${type}`);
            }

            // Remove from state
            setDocuments(prev => prev.filter(doc => doc.id !== id));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDownloadPdf = async (id: string) => {
        try {
            const doc = documents.find(d => d.id === id);
            if (!doc) {
                alert(t.invoices.documentNotFound);
                return;
            }

            if (!doc.rawData) {
                alert(t.invoices.documentNotFound);
                return;
            }

            // Dynamic import to avoid SSR issues
            const { generateQuotePDFFromHTML } = await import('@/utils/generateQuotePDFFromHTML');

            // Prepare data for PDF generation
            const pdfData = {
                quote_number: doc.type === 'quote' ? doc.rawData.quote_number : undefined,
                invoice_number: doc.type === 'invoice' ? doc.rawData.invoice_number : undefined,
                client_name: doc.rawData.client_name,
                client_contact: doc.rawData.client_contact,
                client_email: doc.rawData.client_email,
                client_phone: doc.rawData.client_phone,
                client_address: doc.rawData.client_address,
                client_nif: doc.rawData.client_nif,
                quote_date: doc.type === 'quote' ? doc.rawData.quote_date : undefined,
                invoice_date: doc.type === 'invoice' ? doc.rawData.invoice_date : undefined,
                expiry_date: doc.rawData.expiry_date,
                items: doc.rawData.items || [],
                subtotal: doc.rawData.subtotal || 0,
                tax_rate: doc.rawData.tax_rate || 0.23,
                tax_amount: doc.rawData.tax_amount || 0,
                total: doc.rawData.total || 0,
                notes: doc.rawData.notes,
                currency: doc.rawData.currency || 'EUR'
            };

            // Generate PDF from HTML template (same as preview and email)
            const pdfBlob = await generateQuotePDFFromHTML(pdfData, {
                type: doc.type,
                translations: {
                    quote: t.invoices.typeQuote.toUpperCase(),
                    invoice: t.invoices.typeInvoice.toUpperCase(),
                    quoteNumber: t.quoteModal.quoteNumber,
                    invoiceNumber: t.quoteModal.invoiceNumber,
                    billTo: t.quoteModal.billTo,
                    issueDate: t.quoteModal.issueDate,
                    validity: t.quoteModal.validity,
                    description: t.quoteModal.description,
                    qty: t.quoteModal.qty,
                    price: t.quoteModal.price,
                    total: t.quoteModal.total,
                    subtotal: t.quoteModal.subtotal,
                    tax: t.quoteModal.tax,
                    notesTerms: t.quoteModal.notesTerms,
                    legalNote: t.quoteModal.legalNote,
                    nif: t.quoteModal.nif
                }
            });

            // Download the PDF
            const fileName = `${doc.displayId || id}.pdf`;
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('PDF generation error:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleSendDocument = async (id: string) => {
        try {
            const doc = documents.find(d => d.id === id);
            if (!doc) {
                alert(t.invoices.documentNotFound);
                return;
            }

            // Check if client has email
            if (!doc.rawData?.client_email) {
                alert(t.invoices.noClientEmail);
                return;
            }

            // Confirm before sending
            const docType = doc.type === 'quote' ? t.invoices.typeQuote : t.invoices.typeInvoice;
            const confirmMessage = t.invoices.sendConfirm
                .replace('{type}', docType.toLowerCase())
                .replace('{id}', doc.displayId || id)
                .replace('{email}', doc.rawData.client_email);
            if (!confirm(confirmMessage)) return;

            const response = await fetch('/api/send-quote-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    type: doc.type,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send email');
            }

            // Update status to 'sent' if it was draft
            if (doc.status === 'draft') {
                setDocuments(prev => prev.map(d => {
                    if (d.id === id) {
                        return { ...d, status: "sent" as const };
                    }
                    return d;
                }));
            }

            alert(t.invoices.sentSuccess.replace('{type}', docType).replace('{email}', doc.rawData.client_email));
        } catch (err: any) {
            alert(t.invoices.sendError.replace('{error}', err.message));
        }
    };

    const handleEditQuote = (id: string) => {
        // Set the quote ID to edit and open modal
        setEditingQuoteId(id);
        setIsQuoteModalOpen(true);
    };

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t.invoices.title}</h1>
                    <p className="text-white/60">{t.invoices.subtitle}</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        {t.invoices.createNew}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCreateDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
                            <button
                                onClick={() => { alert(t.invoices.createInvoiceComingSoon); setShowCreateDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Receipt className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{t.invoices.createInvoice}</p>
                                    <p className="text-xs text-white/60">{t.invoices.createInvoiceDesc}</p>
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
                                    <p className="font-medium text-white">{t.invoices.createQuote}</p>
                                    <p className="text-xs text-white/60">{t.invoices.createQuoteDesc}</p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <QuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => {
                    setIsQuoteModalOpen(false);
                    setEditingQuoteId(null);
                }}
                onQuoteSaved={fetchDocuments}
                editingQuoteId={editingQuoteId}
            />

            <QuoteViewModal
                isOpen={viewingQuoteId !== null}
                onClose={() => setViewingQuoteId(null)}
                quoteId={viewingQuoteId}
                onEdit={handleEditQuote}
                onDownload={handleDownloadPdf}
                onSend={handleSendDocument}
            />


            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 mb-8 flex-shrink-0">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-3 font-medium transition-all relative ${activeTab === "all"
                        ? "text-blue-400"
                        : "text-white/60 hover:text-white/80"
                        }`}
                >
                    {t.invoices.allDocuments}
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
                    {t.invoices.invoices}
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
                    {t.invoices.quotes}
                    {activeTab === "quote" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">
                                {activeTab === "quote" ? t.invoices.totalQuoted : activeTab === "invoice" ? t.invoices.totalInvoiced : t.invoices.totalValue}
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
                                {activeTab === "quote" ? t.invoices.declined : t.invoices.overdueAmount}
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
                                {activeTab === "quote" ? t.invoices.accepted : t.invoices.paidThisMonth}
                            </p>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
                {filteredDocuments.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                            <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/40 mb-2">
                                {activeTab === "all" ? t.invoices.noDocuments : activeTab === "invoice" ? t.invoices.noInvoices : t.invoices.noQuotes}
                            </p>
                            <p className="text-white/20 text-sm">
                                {activeTab === "all" ? t.invoices.createFirst : activeTab === "invoice" ? t.invoices.createFirstInvoice : t.invoices.createFirstQuote}
                            </p>
                        </div>
                    </div>
                ) : (
                    <InvoiceList
                        invoices={filteredDocuments}
                        onAcceptQuote={handleAcceptQuote}
                        onDeclineQuote={handleDeclineQuote}
                        onDelete={handleDeleteDocument}
                        onDownload={handleDownloadPdf}
                        onSend={handleSendDocument}
                        onEdit={handleEditQuote}
                        onView={(id) => setViewingQuoteId(id)}
                    />
                )}
            </div>
        </div>
    );
}
