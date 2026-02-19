"use client";

import { useState, useEffect } from "react";
import { InvoiceList } from "@/components/dashboard/invoices/InvoiceList";
import { InvoiceModal } from "@/components/dashboard/invoices/InvoiceModal";
import { QuoteViewModal } from "@/components/dashboard/invoices/QuoteViewModal";
import { Plus, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useLanguage } from "@/context/LanguageContext";

interface Invoice {
    id: string;
    displayId?: string;
    client: string;
    amount: string;
    date: string;
    status: "paid" | "pending" | "overdue";
    type: "invoice";
    rawData?: any;
}

export default function InvoicesPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [error, setError] = useState<string>("");

    // Fetch invoices from API
    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch('/api/invoices');

            if (!response.ok) {
                if (response.status === 404) {
                    setInvoices([]);
                    return;
                }
                throw new Error('Failed to fetch invoices');
            }

            const data = await response.json();

            // Transform to display format
            const invoiceDocs = (data || []).map((invoice: any) => ({
                id: invoice.id,
                displayId: invoice.invoice_number,
                client: invoice.client_name,
                amount: new Intl.NumberFormat('pt-PT', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(invoice.total || 0),
                date: new Date(invoice.invoice_date).toLocaleDateString('pt-PT', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                status: invoice.status,
                type: 'invoice' as const,
                rawData: invoice
            }));

            setInvoices(invoiceDocs);
        } catch (err: any) {
            setInvoices([]);
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchInvoices();
    }, []);

    // Calculate stats
    const calculateStats = () => {
        const total = invoices.reduce((sum, inv) => {
            const amount = inv.rawData?.total || 0;
            return sum + amount;
        }, 0);

        const overdue = invoices
            .filter(inv => inv.status === "overdue")
            .reduce((sum, inv) => {
                const amount = inv.rawData?.total || 0;
                return sum + amount;
            }, 0);

        const paid = invoices
            .filter(inv => inv.status === "paid")
            .reduce((sum, inv) => {
                const amount = inv.rawData?.total || 0;
                return sum + amount;
            }, 0);

        return {
            total: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(total),
            overdue: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(overdue),
            paid: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(paid)
        };
    };

    const stats = calculateStats();

    const handleDeleteInvoice = async (id: string) => {
        if (!confirm(t.invoices.deleteInvoiceConfirm)) return;

        try {
            const response = await fetch('/api/delete-invoice', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete invoice');
            }

            setInvoices(prev => prev.filter(inv => inv.id !== id));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDownloadPdf = async (id: string) => {
        try {
            const invoice = invoices.find(inv => inv.id === id);
            if (!invoice || !invoice.rawData) {
                alert(t.invoices.documentNotFound);
                return;
            }

            const { generateQuotePDFFromHTML } = await import('@/utils/generateQuotePDFFromHTML');

            const pdfData = {
                invoice_number: invoice.rawData.invoice_number,
                client_name: invoice.rawData.client_name,
                client_contact: invoice.rawData.client_contact,
                client_email: invoice.rawData.client_email,
                client_phone: invoice.rawData.client_phone,
                client_address: invoice.rawData.client_address,
                client_nif: invoice.rawData.client_nif,
                invoice_date: invoice.rawData.invoice_date,
                due_date: invoice.rawData.due_date,
                items: invoice.rawData.items || [],
                subtotal: invoice.rawData.subtotal || 0,
                tax_rate: invoice.rawData.tax_rate || 0.23,
                tax_amount: invoice.rawData.tax_amount || 0,
                total: invoice.rawData.total || 0,
                notes: invoice.rawData.notes,
                currency: invoice.rawData.currency || 'EUR'
            };

            const pdfBlob = await generateQuotePDFFromHTML(pdfData, {
                type: 'invoice',
                translations: {
                    quote: t.invoices.typeQuote.toUpperCase(),
                    invoice: t.invoices.typeInvoice.toUpperCase(),
                    quoteNumber: t.quoteModal.quoteNumber,
                    invoiceNumber: t.quoteModal.invoiceNumber,
                    billTo: t.quoteModal.billTo,
                    issueDate: t.quoteModal.issueDate,
                    validity: t.quoteModal.validity,
                    dueDate: t.quoteModal.dueDate,
                    description: t.quoteModal.description,
                    qty: t.quoteModal.qty,
                    price: t.quoteModal.price,
                    total: t.quoteModal.total,
                    subtotal: t.quoteModal.subtotal,
                    tax: t.quoteModal.tax,
                    notesTerms: t.quoteModal.notesTerms,
                    legalNote: t.quoteModal.legalNote,
                    invoiceLegalNote: t.quoteModal.invoiceLegalNote,
                    nif: t.quoteModal.nif
                }
            });

            const fileName = `${invoice.displayId || id}.pdf`;
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

    const handleEditInvoice = (id: string) => {
        setEditingInvoiceId(id);
        setIsInvoiceModalOpen(true);
    };

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t.invoices.invoices}</h1>
                    <p className="text-white/60">{t.invoices.invoicesSubtitle || 'Gerir faturas emitidas'}</p>
                </div>
                <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    {t.invoices.createInvoice}
                </button>
            </div>

            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => {
                    setIsInvoiceModalOpen(false);
                    setEditingInvoiceId(null);
                }}
                onInvoiceSaved={fetchInvoices}
                editingInvoiceId={editingInvoiceId}
            />

            <QuoteViewModal
                isOpen={viewingInvoiceId !== null}
                onClose={() => setViewingInvoiceId(null)}
                quoteId={viewingInvoiceId}
                documentType="invoice"
                onEdit={handleEditInvoice}
                onDownload={handleDownloadPdf}
                onSend={() => {}} // TODO: Implement send invoice email
            />

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
                            <p className="text-white/60 text-sm">{t.invoices.totalInvoiced}</p>
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
                            <p className="text-white/60 text-sm">{t.invoices.overdueAmount}</p>
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
                            <p className="text-white/60 text-sm">{t.invoices.paidThisMonth}</p>
                            <p className="text-2xl font-bold">{stats.paid}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
                {invoices.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                            <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/40 mb-2">{t.invoices.noInvoices}</p>
                            <p className="text-white/20 text-sm">{t.invoices.createFirstInvoice}</p>
                        </div>
                    </div>
                ) : (
                    <InvoiceList
                        invoices={invoices}
                        onDelete={(id) => handleDeleteInvoice(id)}
                        onDownload={handleDownloadPdf}
                        onSend={() => {}} // TODO: Implement send
                        onEdit={(id) => handleEditInvoice(id)}
                        onView={(id) => setViewingInvoiceId(id)}
                    />
                )}
            </div>
        </div>
    );
}
