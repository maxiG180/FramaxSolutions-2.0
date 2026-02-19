"use client";

import { useState, useEffect } from "react";
import { InvoiceList } from "@/components/dashboard/invoices/InvoiceList";
import { QuoteModal } from "@/components/dashboard/invoices/QuoteModal";
import { QuoteViewModal } from "@/components/dashboard/invoices/QuoteViewModal";
import { EmailPreviewModal } from "@/components/dashboard/invoices/EmailPreviewModal";
import { Plus, FileText, AlertCircle, CheckCircle, FileSignature } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useLanguage } from "@/context/LanguageContext";

interface Document {
    id: string;
    displayId?: string;
    client: string;
    amount: string;
    date: string;
    status: "draft" | "sent" | "accepted" | "declined" | "converted";
    type: "quote";
    rawData?: any;
}

export default function QuotesPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
    const [viewingQuoteId, setViewingQuoteId] = useState<string | null>(null);
    const [quotes, setQuotes] = useState<Document[]>([]);
    const [error, setError] = useState<string>("");
    const [emailPreviewData, setEmailPreviewData] = useState<{
        isOpen: boolean;
        documentId: string | null;
        clientName: string;
        documentNumber: string;
        clientEmail: string;
        validUntil?: string;
        clientLanguage?: 'pt' | 'en';
    }>({
        isOpen: false,
        documentId: null,
        clientName: "",
        documentNumber: "",
        clientEmail: "",
    });
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Fetch quotes from API
    const fetchQuotes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch('/api/quotes');
            if (!response.ok) {
                if (response.status === 404) {
                    setQuotes([]);
                    return;
                }
                throw new Error('Failed to fetch quotes');
            }

            const data = await response.json();

            // Transform to document format
            const quoteDocs = (data || []).map((quote: any) => ({
                id: quote.id,
                displayId: quote.quote_number,
                client: quote.client_name,
                amount: new Intl.NumberFormat('pt-PT', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(quote.total || 0),
                date: new Date(quote.quote_date).toLocaleDateString('pt-PT', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                status: quote.status,
                type: 'quote' as const,
                rawData: quote
            }));

            setQuotes(quoteDocs);
        } catch (err: any) {
            setQuotes([]);
            console.error('Error fetching quotes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchQuotes();
    }, []);

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
            setQuotes(prev => prev.map(doc => {
                if (doc.id === id) {
                    return { ...doc, status: "accepted" as const };
                }
                return doc;
            }));

            await fetchQuotes();

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

            setQuotes(prev => prev.map(doc => {
                if (doc.id === id) {
                    return { ...doc, status: "declined" as const };
                }
                return doc;
            }));

            alert(t.invoices.quoteDeclined);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    // Calculate stats
    const calculateStats = () => {
        const total = quotes.reduce((sum, doc) => {
            const amount = doc.rawData?.total || 0;
            return sum + amount;
        }, 0);

        const declined = quotes
            .filter(d => d.status === "declined")
            .reduce((sum, doc) => {
                const amount = doc.rawData?.total || 0;
                return sum + amount;
            }, 0);

        const accepted = quotes
            .filter(d => d.status === "accepted")
            .reduce((sum, doc) => {
                const amount = doc.rawData?.total || 0;
                return sum + amount;
            }, 0);

        return {
            total: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(total),
            declined: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(declined),
            accepted: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(accepted)
        };
    };

    const stats = calculateStats();

    const handleDeleteDocument = async (id: string, type: "quote") => {
        if (!confirm(t.invoices.deleteQuoteConfirm)) return;

        try {
            const response = await fetch('/api/delete-quote', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete quote');
            }

            setQuotes(prev => prev.filter(doc => doc.id !== id));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDownloadPdf = async (id: string) => {
        try {
            const doc = quotes.find(d => d.id === id);
            if (!doc || !doc.rawData) {
                alert(t.invoices.documentNotFound);
                return;
            }

            const { generateQuotePDFFromHTML } = await import('@/utils/generateQuotePDFFromHTML');

            const pdfData = {
                quote_number: doc.rawData.quote_number,
                client_name: doc.rawData.client_name,
                client_contact: doc.rawData.client_contact,
                client_email: doc.rawData.client_email,
                client_phone: doc.rawData.client_phone,
                client_address: doc.rawData.client_address,
                client_nif: doc.rawData.client_nif,
                quote_date: doc.rawData.quote_date,
                expiry_date: doc.rawData.expiry_date,
                items: doc.rawData.items || [],
                subtotal: doc.rawData.subtotal || 0,
                tax_rate: doc.rawData.tax_rate || 0.23,
                tax_amount: doc.rawData.tax_amount || 0,
                total: doc.rawData.total || 0,
                notes: doc.rawData.notes,
                currency: doc.rawData.currency || 'EUR'
            };

            const pdfBlob = await generateQuotePDFFromHTML(pdfData, {
                type: 'quote',
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
            const doc = quotes.find(d => d.id === id);
            if (!doc) {
                alert(t.invoices.documentNotFound);
                return;
            }

            if (!doc.rawData?.client_email) {
                alert(t.invoices.noClientEmail);
                return;
            }

            setEmailPreviewData({
                isOpen: true,
                documentId: id,
                clientName: doc.rawData.client_name,
                documentNumber: doc.displayId || id,
                clientEmail: doc.rawData.client_email,
                validUntil: doc.rawData.expiry_date,
                clientLanguage: doc.rawData.client_language || 'pt',
            });
        } catch (err: any) {
            alert(t.invoices.sendError.replace('{error}', err.message));
        }
    };

    const handleConfirmSendEmail = async (emailData: { email: string; language: 'pt' | 'en' }) => {
        if (!emailPreviewData.documentId) return;

        try {
            setIsSendingEmail(true);
            const doc = quotes.find(d => d.id === emailPreviewData.documentId);
            if (!doc) {
                alert(t.invoices.documentNotFound);
                return;
            }

            const response = await fetch('/api/send-quote-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: emailPreviewData.documentId,
                    type: 'quote',
                    email: emailData.email,
                    language: emailData.language,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send email');
            }

            if (doc.status === 'draft') {
                setQuotes(prev => prev.map(d => {
                    if (d.id === emailPreviewData.documentId) {
                        return { ...d, status: "sent" as const };
                    }
                    return d;
                }));
            }

            alert(t.invoices.sentSuccess.replace('{type}', t.invoices.typeQuote).replace('{email}', emailData.email));

            setEmailPreviewData({
                isOpen: false,
                documentId: null,
                clientName: "",
                documentNumber: "",
                clientEmail: "",
            });
        } catch (err: any) {
            alert(t.invoices.sendError.replace('{error}', err.message));
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleEditQuote = (id: string) => {
        setEditingQuoteId(id);
        setIsQuoteModalOpen(true);
    };

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t.invoices.quotes}</h1>
                    <p className="text-white/60">{t.invoices.quotesSubtitle || 'Gerir orçamentos e propostas comerciais'}</p>
                </div>
                <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    {t.invoices.createQuote}
                </button>
            </div>

            <QuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => {
                    setIsQuoteModalOpen(false);
                    setEditingQuoteId(null);
                }}
                onQuoteSaved={fetchQuotes}
                editingQuoteId={editingQuoteId}
            />

            <QuoteViewModal
                isOpen={viewingQuoteId !== null}
                onClose={() => setViewingQuoteId(null)}
                quoteId={viewingQuoteId}
                documentType="quote"
                onEdit={handleEditQuote}
                onDownload={handleDownloadPdf}
                onSend={handleSendDocument}
            />

            <EmailPreviewModal
                isOpen={emailPreviewData.isOpen}
                onClose={() => setEmailPreviewData({
                    isOpen: false,
                    documentId: null,
                    clientName: "",
                    documentNumber: "",
                    clientEmail: "",
                })}
                onConfirm={handleConfirmSendEmail}
                defaultEmail={emailPreviewData.clientEmail}
                clientName={emailPreviewData.clientName}
                quoteNumber={emailPreviewData.documentNumber}
                validUntil={emailPreviewData.validUntil}
                loading={isSendingEmail}
                defaultLanguage={emailPreviewData.clientLanguage}
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
                            <p className="text-white/60 text-sm">{t.invoices.totalQuoted}</p>
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
                            <p className="text-white/60 text-sm">{t.invoices.declined}</p>
                            <p className="text-2xl font-bold">{stats.declined}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">{t.invoices.accepted}</p>
                            <p className="text-2xl font-bold">{stats.accepted}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
                {quotes.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                            <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <FileSignature className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/40 mb-2">{t.invoices.noQuotes}</p>
                            <p className="text-white/20 text-sm">{t.invoices.createFirstQuote}</p>
                        </div>
                    </div>
                ) : (
                    <InvoiceList
                        invoices={quotes}
                        onAcceptQuote={handleAcceptQuote}
                        onDeclineQuote={handleDeclineQuote}
                        onDelete={handleDeleteDocument}
                        onDownload={handleDownloadPdf}
                        onSend={handleSendDocument}
                        onEdit={(id) => handleEditQuote(id)}
                        onView={(id) => setViewingQuoteId(id)}
                    />
                )}
            </div>
        </div>
    );
}
