"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Download, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { QuoteTemplate } from "@/components/shared/QuoteTemplate";
import { QuotePDFData } from "@/utils/generateQuotePDF";

interface QuoteViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    quoteId: string | null;
    onEdit?: (id: string) => void;
    onDownload?: (id: string) => void;
    onSend?: (id: string) => void;
}

export function QuoteViewModal({ isOpen, onClose, quoteId, onEdit, onDownload, onSend }: QuoteViewModalProps) {
    const { t } = useLanguage();
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
        const loadQuote = async () => {
            if (!quoteId || !isOpen) return;

            setLoading(true);
            try {
                const response = await fetch(`/api/quotes/${quoteId}`);
                if (!response.ok) {
                    throw new Error('Failed to load quote');
                }

                const data = await response.json();
                setQuote(data);
            } catch (error) {
                console.error('Error loading quote:', error);
                alert(t.quoteModal.errorLoading);
                onClose();
            } finally {
                setLoading(false);
            }
        };

        loadQuote();
    }, [quoteId, isOpen]);

    if (!isOpen) return null;

    // Prepare quote data for template
    const quoteData: QuotePDFData | null = quote ? {
        quote_number: quote.quote_number,
        client_name: quote.client_name,
        client_contact: quote.client_contact,
        client_email: quote.client_email,
        client_phone: quote.client_phone,
        client_address: quote.client_address,
        client_nif: quote.client_nif,
        quote_date: quote.quote_date,
        expiry_date: quote.expiry_date,
        items: quote.items || [],
        subtotal: quote.subtotal || 0,
        tax_rate: quote.tax_rate || 0.23,
        tax_amount: quote.tax_amount || 0,
        total: quote.total || 0,
        notes: quote.notes,
        currency: quote.currency || 'EUR'
    } : null;

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 50));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/90"
                    onClick={onClose}
                >
                    {/* Top Toolbar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
                        <h2 className="text-lg font-medium text-white">
                            {quote?.quote_number || t.quoteModal.quote}
                        </h2>

                        <div className="flex items-center gap-3">
                            {/* Action Buttons */}
                            {quoteId && quote?.status === "draft" && onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(quoteId);
                                        onClose();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                                    title={t.invoices?.editQuote || "Editar"}
                                >
                                    <Edit className="w-4 h-4" />
                                    {t.invoices?.editQuote || "Editar"}
                                </button>
                            )}

                            {quoteId && onDownload && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(quoteId);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                                    title={t.invoices?.downloadPdf || "Download PDF"}
                                >
                                    <Download className="w-4 h-4" />
                                    {t.invoices?.downloadPdf || "Download"}
                                </button>
                            )}

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleZoomOut();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                    title={t.quoteModal.zoomOut}
                                >
                                    <ZoomOut className="w-4 h-4 text-white" />
                                </button>
                                <span className="text-sm text-white/80 min-w-[3rem] text-center">
                                    {zoom}%
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleZoomIn();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                    title={t.quoteModal.zoomIn}
                                >
                                    <ZoomIn className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Document Content */}
                    <div
                        className="absolute inset-0 top-16 overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                    <p className="text-white/60">{t.quoteModal.loading}</p>
                                </div>
                            </div>
                        ) : quoteData ? (
                            <div className="min-h-full py-8 flex justify-center items-start">
                                <div
                                    className="shadow-2xl transition-transform duration-200"
                                    style={{
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: 'top center'
                                    }}
                                >
                                    <QuoteTemplate
                                        data={quoteData}
                                        type="quote"
                                        translations={{
                                            quote: t.quoteModal.quote,
                                            invoice: t.invoices?.typeInvoice || 'Fatura',
                                            quoteNumber: t.quoteModal.quoteNumber,
                                            invoiceNumber: t.quoteModal.invoiceNumber || 'Número de Fatura',
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
                                        }}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
