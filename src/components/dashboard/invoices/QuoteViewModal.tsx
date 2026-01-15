"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const subtotal = quote?.subtotal || 0;
    const tax = quote?.tax_amount || 0;
    const total = quote?.total || 0;

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
                        ) : quote ? (
                            <div className="min-h-full py-8 flex justify-center items-start">
                                <div
                                    className="bg-white text-black shadow-2xl transition-transform duration-200 flex flex-col"
                                    style={{
                                        width: '210mm',
                                        minHeight: '297mm',
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: 'top center'
                                    }}
                                >
                                    <div className="p-12 flex flex-col relative" style={{ minHeight: '297mm' }}>
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-12">
                                            <div className="w-48">
                                                {/* Logo */}
                                                <div className="relative w-full h-16 mb-4">
                                                    <Image
                                                        src="/logos/framax-logo-black.png"
                                                        alt="Framax Solutions"
                                                        fill
                                                        className="object-contain object-left"
                                                        priority
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <p className="font-bold text-gray-900">Framax Solutions</p>
                                                    <p>contact@framaxsolutions.com</p>
                                                    <p>framaxsolutions.com</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <h1 className="text-4xl font-light text-blue-600 mb-2">{t.quoteModal.quote.toUpperCase()}</h1>
                                                <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">{t.quoteModal.quoteNumber}</p>
                                                <p className="text-gray-700 font-bold text-lg">{quote.quote_number}</p>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="flex justify-between mb-12">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t.quoteModal.billTo}</p>
                                                <div className="text-sm text-gray-800 space-y-1">
                                                    <p className="font-bold text-base">{quote.client_name}</p>
                                                    {quote.client_contact && <p className="font-medium">{quote.client_contact}</p>}
                                                    {quote.client_address && quote.client_address.split('\n').map((line: string, i: number) => <p key={i}>{line}</p>)}
                                                    {quote.client_email && <p className="text-blue-600">{quote.client_email}</p>}
                                                    {quote.client_phone && <p className="text-gray-600">{quote.client_phone}</p>}
                                                    {quote.client_nif && <p className="text-gray-600"><span className="font-medium">{t.quoteModal.nif}:</span> {quote.client_nif}</p>}
                                                </div>
                                            </div>
                                            <div className="text-right space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.quoteModal.issueDate}</p>
                                                    <p className="text-sm font-medium">{new Date(quote.quote_date).toLocaleDateString('pt-PT')}</p>
                                                </div>
                                                {quote.expiry_date && (
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.quoteModal.validity}</p>
                                                        <p className="text-sm font-medium">{new Date(quote.expiry_date).toLocaleDateString('pt-PT')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <div className="mb-8">
                                            <div className="border-b-2 border-blue-600 pb-2 mb-4 flex text-xs font-bold text-gray-400 uppercase">
                                                <div className="flex-1">{t.quoteModal.description}</div>
                                                <div className="w-20 text-center">{t.quoteModal.qty}</div>
                                                <div className="w-32 text-right">{t.quoteModal.price}</div>
                                                <div className="w-32 text-right">{t.quoteModal.total}</div>
                                            </div>
                                            <div className="space-y-4">
                                                {(quote.items || []).map((item: any, index: number) => (
                                                    <div key={index} className="flex text-sm text-gray-800 border-b border-gray-100 pb-4 last:border-0">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{item.description}</p>
                                                        </div>
                                                        <div className="w-20 text-center text-gray-500">{item.quantity}</div>
                                                        <div className="w-32 text-right text-gray-500">{formatCurrency(item.price)}</div>
                                                        <div className="w-32 text-right font-medium">{formatCurrency(item.quantity * item.price)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div className="flex justify-end mb-12">
                                            <div className="w-64 space-y-2">
                                                <div className="flex justify-between text-sm text-gray-500">
                                                    <span>{t.quoteModal.subtotal}</span>
                                                    <span>{formatCurrency(subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-500">
                                                    <span>{t.quoteModal.tax} (23%)</span>
                                                    <span>{formatCurrency(tax)}</span>
                                                </div>
                                                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-blue-600">
                                                    <span>{t.quoteModal.total}</span>
                                                    <span>{formatCurrency(total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {quote.notes && (
                                            <div className="pt-8 border-t border-gray-100">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t.quoteModal.notesTerms}</p>
                                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="mt-auto pt-8 border-t border-gray-200 text-center">
                                            <p className="text-xs text-gray-500 italic">
                                                {t.quoteModal.legalNote}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
