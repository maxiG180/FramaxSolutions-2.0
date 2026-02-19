"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, Download, FileText, Calendar, User, MapPin, Hash, Package, ChevronDown, CreditCard, DollarSign } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useClients, Client } from "@/hooks/useClients";
import { Service } from "@/types/service";
import { useLanguage } from "@/context/LanguageContext";
import { generateQuotePDFFromHTML } from '@/utils/generateQuotePDFFromHTML';
import { QuotePDFData } from '@/utils/generateQuotePDF';
import { pt } from '@/locales/pt';
import { en } from '@/locales/en';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
    serviceId?: string | null;
}

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvoiceSaved?: () => void;
    editingInvoiceId?: string | null;
}

export function InvoiceModal({ isOpen, onClose, onInvoiceSaved, editingInvoiceId }: InvoiceModalProps) {
    const { t, language } = useLanguage();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);

    // Helper function to get translations for specific language
    const getTranslations = (lang: 'pt' | 'en') => {
        return lang === 'pt' ? pt : en;
    };

    const [clientName, setClientName] = useState("");
    const [clientContact, setClientContact] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientNif, setClientNif] = useState("");
    const [clientLanguage, setClientLanguage] = useState<'pt' | 'en'>(language as 'pt' | 'en');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

    // Calculate due date (30 days from today)
    const getDueDate = (fromDate: string) => {
        const date = new Date(fromDate);
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    };

    const [dueDate, setDueDate] = useState(getDueDate(new Date().toISOString().split('T')[0]));
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, price: 0, serviceId: null }]);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [saveError, setSaveError] = useState("");

    // Payment fields
    const [status, setStatus] = useState<'pending' | 'paid' | 'overdue'>('pending');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [paymentDate, setPaymentDate] = useState<string>('');
    const [paymentReference, setPaymentReference] = useState<string>('');
    const [paymentNotes, setPaymentNotes] = useState<string>('');

    // Banking information
    const [bankName, setBankName] = useState('Millennium BCP');
    const [iban, setIban] = useState('PT50 0033 0000 0000 0000 0000 0');
    const [swiftBic, setSwiftBic] = useState('BCOMPTPL');

    const [isNotesExpanded, setIsNotesExpanded] = useState(false);
    const [isClientDetailsExpanded, setIsClientDetailsExpanded] = useState(true);
    const [isItemsExpanded, setIsItemsExpanded] = useState(false);
    const [isPaymentDetailsExpanded, setIsPaymentDetailsExpanded] = useState(false);
    const [isBankingDetailsExpanded, setIsBankingDetailsExpanded] = useState(false);
    const [manuallyExpandedClient, setManuallyExpandedClient] = useState(false);

    const formatPhoneNumber = (value: string) => {
        if (!value) return '';
        const hasPlus = value.startsWith('+');
        const digits = value.replace(/\D/g, '');
        let formatted = '';

        if (digits.length > 0) {
            if (hasPlus && digits.length >= 12) {
                const countryCode = digits.slice(0, 3);
                const rest = digits.slice(3);
                const part1 = rest.slice(0, 3);
                const part2 = rest.slice(3, 6);
                const part3 = rest.slice(6, 9);
                const remaining = rest.slice(9);
                formatted = `${countryCode} ${part1}${part2 ? ' ' + part2 : ''}${part3 ? ' ' + part3 : ''}${remaining ? ' ' + remaining : ''}`.trim();
            } else if (hasPlus && digits.length > 3) {
                const countryCode = digits.slice(0, 3);
                const rest = digits.slice(3);
                formatted = countryCode + ' ' + rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
            } else if (digits.length === 9) {
                formatted = digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
            } else if (digits.length === 10) {
                formatted = digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
            } else if (digits.length > 3) {
                formatted = digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
            } else {
                formatted = digits;
            }
        }

        return hasPlus ? '+' + formatted : formatted;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setClientPhone(formatPhoneNumber(input));
    };

    const isClientDetailsFilled = () => {
        return clientName.trim() !== '' && clientEmail.trim() !== '';
    };

    useEffect(() => {
        if (isClientDetailsFilled() && isClientDetailsExpanded && !manuallyExpandedClient) {
            const timer = setTimeout(() => {
                setIsClientDetailsExpanded(false);
                setIsItemsExpanded(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [clientName, clientEmail, isClientDetailsExpanded, manuallyExpandedClient]);

    const { clients, loading: loadingClients } = useClients();
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [clientSearch, setClientSearch] = useState("");

    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Load invoice data when editing
    useEffect(() => {
        const loadInvoiceData = async () => {
            if (!editingInvoiceId || !isOpen) return;

            setLoading(true);
            setIsEditMode(true);

            try {
                const response = await fetch(`/api/invoices/${editingInvoiceId}`);
                if (!response.ok) {
                    throw new Error('Failed to load invoice');
                }

                const invoice = await response.json();

                setClientName(invoice.client_name || "");
                setClientContact(invoice.client_contact || "");
                setClientEmail(invoice.client_email || "");
                setClientPhone(formatPhoneNumber(invoice.client_phone || ""));
                setClientAddress(invoice.client_address || "");
                setClientNif(invoice.client_nif || "");
                setClientLanguage(invoice.client_language || language as 'pt' | 'en');
                setInvoiceDate(invoice.invoice_date || new Date().toISOString().split('T')[0]);
                setDueDate(invoice.due_date || getDueDate(invoice.invoice_date));
                setNotes(invoice.notes || "");

                // Load payment fields
                setStatus(invoice.status || 'pending');
                setPaymentMethod(invoice.payment_method || '');
                setPaymentDate(invoice.payment_date || '');
                setPaymentReference(invoice.payment_reference || '');
                setPaymentNotes(invoice.payment_notes || '');

                // Load banking fields
                setBankName(invoice.bank_name || 'Millennium BCP');
                setIban(invoice.iban || 'PT50 0033 0000 0000 0000 0000 0');
                setSwiftBic(invoice.swift_bic || 'BCOMPTPL');

                const loadedItems = (invoice.items || []).map((item: any, index: number) => ({
                    id: item.id || `item-${index}`,
                    description: item.description || "",
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    serviceId: item.serviceId || null,
                }));
                setItems(loadedItems.length > 0 ? loadedItems : [{ id: "1", description: "", quantity: 1, price: 0, serviceId: null }]);

            } catch (error) {
                console.error('Error loading invoice:', error);
                alert(t.invoices.errorLoadingInvoice || 'Failed to load invoice');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (editingInvoiceId && isOpen) {
            loadInvoiceData();
        } else if (!editingInvoiceId && isOpen) {
            setIsEditMode(false);
        }
    }, [editingInvoiceId, isOpen]);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(clientName.toLowerCase())
    );

    const selectClient = (client: Client) => {
        setClientName(client.name);
        setClientEmail(client.email || "");
        setClientPhone(formatPhoneNumber(client.phone || ""));
        setClientContact(client.contact_person || "");

        let fullAddress = "";
        if (client.address && client.country) {
            fullAddress = `${client.address}\n${client.country}`;
        } else if (client.address) {
            fullAddress = client.address;
        } else if (client.country) {
            fullAddress = client.country;
        }
        setClientAddress(fullAddress);

        if (client.preferred_language) {
            setClientLanguage(client.preferred_language);
        }

        setShowClientDropdown(false);
    };

    const fetchServices = async () => {
        try {
            setLoadingServices(true);
            const response = await fetch('/api/services');
            if (!response.ok) {
                console.warn('Failed to fetch services, continuing without services list');
                setServices([]);
                return;
            }
            const data = await response.json();
            setServices(data || []);
        } catch (err) {
            console.warn('Error fetching services, continuing without services list:', err);
            setServices([]);
        } finally {
            setLoadingServices(false);
        }
    };

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number | null) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const selectServiceForItem = (itemId: string, serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setItems(items.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        serviceId: service.id,
                        description: service.title,
                        price: service.base_price || 0
                    };
                }
                return item;
            }));
        }
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const subtotal = calculateSubtotal();
    const taxRate = 0.23;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const previewT = getTranslations(clientLanguage);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const resetForm = () => {
        setClientName("");
        setClientEmail("");
        setClientPhone("");
        setClientContact("");
        setClientAddress("");
        setClientNif("");
        setClientLanguage(language as 'pt' | 'en');
        const newInvoiceDate = new Date().toISOString().split('T')[0];
        setInvoiceDate(newInvoiceDate);
        setDueDate(getDueDate(newInvoiceDate));
        setNotes("");
        setItems([{ id: "1", description: "", quantity: 1, price: 0, serviceId: null }]);
        setStatus('pending');
        setPaymentMethod('');
        setPaymentDate('');
        setPaymentReference('');
        setPaymentNotes('');
        setBankName('Millennium BCP');
        setIban('PT50 0033 0000 0000 0000 0000 0');
        setSwiftBic('BCOMPTPL');
        setSaveError("");
        setIsEditMode(false);
        setIsClientDetailsExpanded(true);
        setIsNotesExpanded(false);
        setIsItemsExpanded(false);
        setIsPaymentDetailsExpanded(false);
        setIsBankingDetailsExpanded(false);
        setManuallyExpandedClient(false);
    };

    const handleExportPDF = async () => {
        setSaveError("");

        if (!clientName.trim()) {
            setSaveError(t.quoteModal.clientNameRequired);
            if (modalRef.current) {
                const scrollContainer = modalRef.current.querySelector('.overflow-y-auto');
                if (scrollContainer) {
                    scrollContainer.scrollTop = 0;
                }
            }
            return;
        }

        if (items.length === 0 || items.every(item => !item.description.trim())) {
            setSaveError(t.quoteModal.itemRequired);
            if (modalRef.current) {
                const scrollContainer = modalRef.current.querySelector('.overflow-y-auto');
                if (scrollContainer) {
                    scrollContainer.scrollTop = 0;
                }
            }
            return;
        }

        try {
            setExporting(true);

            const tempInvoiceNumber = `FAT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

            const pdfData: QuotePDFData = {
                invoice_number: tempInvoiceNumber,
                client_name: clientName,
                client_contact: clientContact || undefined,
                client_email: clientEmail || undefined,
                client_phone: clientPhone || undefined,
                client_address: clientAddress || undefined,
                client_nif: clientNif || undefined,
                invoice_date: invoiceDate,
                due_date: dueDate || undefined,
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                })),
                subtotal: subtotal,
                tax_rate: taxRate,
                tax_amount: tax,
                total: total,
                notes: notes || undefined,
                currency: 'EUR'
            };

            const clientTranslations = getTranslations(clientLanguage);

            const pdfBlob = await generateQuotePDFFromHTML(pdfData, {
                type: 'invoice',
                translations: {
                    quote: clientTranslations.quoteModal.quote,
                    invoice: clientTranslations.invoices.typeInvoice.toUpperCase(),
                    quoteNumber: clientTranslations.quoteModal.quoteNumber,
                    invoiceNumber: clientTranslations.quoteModal.invoiceNumber,
                    billTo: clientTranslations.quoteModal.billTo,
                    issueDate: clientTranslations.quoteModal.issueDate,
                    validity: clientTranslations.quoteModal.validity,
                    dueDate: clientTranslations.quoteModal.dueDate,
                    description: clientTranslations.quoteModal.description,
                    qty: clientTranslations.quoteModal.qty,
                    price: clientTranslations.quoteModal.price,
                    total: clientTranslations.quoteModal.total,
                    subtotal: clientTranslations.quoteModal.subtotal,
                    tax: clientTranslations.quoteModal.tax,
                    notesTerms: clientTranslations.quoteModal.notesTerms,
                    legalNote: clientTranslations.quoteModal.legalNote,
                    invoiceLegalNote: clientTranslations.quoteModal.invoiceLegalNote,
                    nif: clientTranslations.quoteModal.nif
                }
            });

            const fileName = `Invoice-${tempInvoiceNumber}.pdf`;
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSaveError("");
        } catch (err) {
            console.error('Error generating PDF:', err);
            setSaveError('Failed to generate PDF');
        } finally {
            setExporting(false);
        }
    };

    const handleSaveInvoice = async () => {
        setSaveError("");

        if (!clientName.trim()) {
            setSaveError(t.quoteModal.clientNameRequired);
            if (modalRef.current) {
                const scrollContainer = modalRef.current.querySelector('.overflow-y-auto');
                if (scrollContainer) {
                    scrollContainer.scrollTop = 0;
                }
            }
            return;
        }

        if (items.length === 0 || items.every(item => !item.description.trim())) {
            setSaveError(t.quoteModal.itemRequired);
            if (modalRef.current) {
                const scrollContainer = modalRef.current.querySelector('.overflow-y-auto');
                if (scrollContainer) {
                    scrollContainer.scrollTop = 0;
                }
            }
            return;
        }

        try {
            setSaving(true);
            setSaveError("");

            const url = isEditMode && editingInvoiceId
                ? `/api/invoices/${editingInvoiceId}`
                : '/api/invoices';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientName,
                    clientEmail,
                    clientPhone,
                    clientContact,
                    clientAddress,
                    clientNif,
                    clientLanguage,
                    invoiceDate,
                    dueDate: dueDate || null,
                    items,
                    notes,
                    taxRate,
                    status,
                    paymentMethod: paymentMethod || null,
                    paymentDate: paymentDate || null,
                    paymentReference: paymentReference || null,
                    paymentNotes: paymentNotes || null,
                    bankName,
                    iban,
                    swiftBic
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save invoice');
            }

            if (onInvoiceSaved) {
                onInvoiceSaved();
            }

            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Error saving invoice:', err);
            setSaveError(err.message || t.invoices.failedToSaveInvoice || 'Failed to save invoice');
        } finally {
            setSaving(false);
        }
    };

    // Auto-set payment date when status changes to paid
    useEffect(() => {
        if (status === 'paid' && !paymentDate) {
            setPaymentDate(new Date().toISOString().split('T')[0]);
        }
    }, [status]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        key="invoice-modal-container"
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <motion.div
                            ref={modalRef}
                            initial={{ x: 0 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                            className="w-full max-w-7xl h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row pointer-events-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Left Side - Form Input */}
                            <div className="w-full md:w-1/2 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                            <p className="text-white/60">{t.quoteModal.loading}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                                <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                                    <FileText className="w-5 h-5" />
                                                </span>
                                                {isEditMode ? (t.invoices.editInvoice || 'Editar Fatura') : (t.invoices.createInvoice || 'Criar Fatura')}
                                            </h2>
                                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {saveError && (
                                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                                    {saveError}
                                                </div>
                                            )}

                                            {/* Invoice Details */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">{t.invoices.invoiceDetails || 'Detalhes da Fatura'}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm text-white/60">{t.quoteModal.issueDate}</label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                            <input
                                                                type="date"
                                                                value={invoiceDate}
                                                                onChange={(e) => {
                                                                    setInvoiceDate(e.target.value);
                                                                    setDueDate(getDueDate(e.target.value));
                                                                }}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm text-white/60">{t.quoteModal.dueDate}</label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                            <input
                                                                type="date"
                                                                value={dueDate}
                                                                onChange={(e) => setDueDate(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/60">{t.invoices.status || 'Status'}</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setStatus('pending')}
                                                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                                                                status === 'pending'
                                                                    ? 'bg-yellow-500 text-white'
                                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {t.invoices.statusPending || 'Pendente'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setStatus('paid')}
                                                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                                                                status === 'paid'
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {t.invoices.statusPaid || 'Pago'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setStatus('overdue')}
                                                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                                                                status === 'overdue'
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {t.invoices.statusOverdue || 'Atrasado'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Client Details - Collapsible */}
                                            <div className="space-y-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newState = !isClientDetailsExpanded;
                                                        setIsClientDetailsExpanded(newState);
                                                        if (newState && isClientDetailsFilled()) {
                                                            setManuallyExpandedClient(true);
                                                        }
                                                    }}
                                                    className="w-full flex items-center justify-between text-left"
                                                >
                                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">{t.quoteModal.clientDetails}</h3>
                                                    <motion.div
                                                        animate={{ rotate: isClientDetailsExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="w-4 h-4 text-white/40" />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence>
                                                    {isClientDetailsExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm text-white/60">{t.quoteModal.clientName}</label>
                                                                    <div className="relative">
                                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                                        <input
                                                                            type="text"
                                                                            value={clientName}
                                                                            onChange={(e) => {
                                                                                setClientName(e.target.value);
                                                                                setShowClientDropdown(true);
                                                                            }}
                                                                            onFocus={() => setShowClientDropdown(true)}
                                                                            onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                            placeholder={t.quoteModal.clientNamePlaceholder}
                                                                        />
                                                                        <AnimatePresence>
                                                                            {showClientDropdown && (filteredClients.length > 0) && (
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, y: -10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: -10 }}
                                                                                    className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto"
                                                                                >
                                                                                    {filteredClients.map((client) => (
                                                                                        <button
                                                                                            key={client.id}
                                                                                            onClick={() => selectClient(client)}
                                                                                            className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors flex items-center justify-between"
                                                                                        >
                                                                                            <span>{client.name}</span>
                                                                                            {client.contact_person && <span className="text-xs text-white/40">{client.contact_person}</span>}
                                                                                        </button>
                                                                                    ))}
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm text-white/60">{t.quoteModal.contactPerson}</label>
                                                                    <div className="relative">
                                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                                        <input
                                                                            type="text"
                                                                            value={clientContact}
                                                                            onChange={(e) => setClientContact(e.target.value)}
                                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                            placeholder={t.quoteModal.contactPersonPlaceholder}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm text-white/60">{t.quoteModal.email}</label>
                                                                    <input
                                                                        type="email"
                                                                        value={clientEmail}
                                                                        onChange={(e) => setClientEmail(e.target.value)}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                        placeholder={t.quoteModal.emailPlaceholder}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm text-white/60">{t.quoteModal.phone}</label>
                                                                    <input
                                                                        type="tel"
                                                                        value={clientPhone}
                                                                        onChange={handlePhoneChange}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                        placeholder={t.quoteModal.phonePlaceholder}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 mt-4">
                                                                <label className="text-sm text-white/60">{t.quoteModal.nif}</label>
                                                                <input
                                                                    type="text"
                                                                    value={clientNif}
                                                                    onChange={(e) => setClientNif(e.target.value)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                    placeholder={t.quoteModal.nifPlaceholder}
                                                                />
                                                            </div>
                                                            <div className="space-y-2 mt-4">
                                                                <label className="text-sm text-white/60">{t.quoteModal.address}</label>
                                                                <div className="relative">
                                                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                                                    <textarea
                                                                        value={clientAddress}
                                                                        onChange={(e) => setClientAddress(e.target.value)}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-20"
                                                                        placeholder={t.quoteModal.addressPlaceholder}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 mt-4">
                                                                <label className="text-sm text-white/60">{t.quoteModal.preferredLanguage}</label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setClientLanguage('pt')}
                                                                        className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                                                                            clientLanguage === 'pt'
                                                                                ? 'bg-blue-500 text-white'
                                                                                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                                        }`}
                                                                    >
                                                                        {t.quoteModal.languagePortuguese}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setClientLanguage('en')}
                                                                        className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                                                                            clientLanguage === 'en'
                                                                                ? 'bg-blue-500 text-white'
                                                                                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                                        }`}
                                                                    >
                                                                        {t.quoteModal.languageEnglish}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Items - Collapsible */}
                                            <div className="space-y-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                                                    className="w-full flex items-center justify-between text-left"
                                                >
                                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">{t.quoteModal.items}</h3>
                                                    <motion.div
                                                        animate={{ rotate: isItemsExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="w-4 h-4 text-white/40" />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence>
                                                    {isItemsExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden space-y-4"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-white/40">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                                                                <button
                                                                    onClick={addItem}
                                                                    className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                    {t.quoteModal.addItem}
                                                                </button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <AnimatePresence>
                                                                    {items.map((item, index) => (
                                                                        <motion.div
                                                                            key={item.id}
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: "auto" }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            className="space-y-2 overflow-hidden"
                                                                        >
                                                                            <div className="flex gap-3 items-center">
                                                                                <div className="flex-1">
                                                                                    <div className="relative">
                                                                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none z-10" />
                                                                                        <select
                                                                                            value={item.serviceId || ""}
                                                                                            onChange={(e) => {
                                                                                                if (e.target.value) {
                                                                                                    selectServiceForItem(item.id, e.target.value);
                                                                                                } else {
                                                                                                    updateItem(item.id, 'serviceId', null);
                                                                                                }
                                                                                            }}
                                                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                                                                                        >
                                                                                            <option value="" className="bg-[#1A1A1A] text-white/60">{t.quoteModal.selectService}</option>
                                                                                            {services.map((service) => (
                                                                                                <option key={service.id} value={service.id} className="bg-[#1A1A1A] text-white">
                                                                                                    {service.title} - {formatCurrency(service.base_price || 0)}
                                                                                                </option>
                                                                                            ))}
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-3 items-start">
                                                                                <div className="flex-1 space-y-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={item.description}
                                                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                                                        placeholder={t.quoteModal.description}
                                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                                    />
                                                                                </div>
                                                                                <div className="w-20 space-y-2">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        value={item.quantity}
                                                                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors text-center"
                                                                                        placeholder={t.quoteModal.qty}
                                                                                    />
                                                                                </div>
                                                                                <div className="w-32 space-y-2">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        step="0.01"
                                                                                        value={item.price}
                                                                                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors text-right"
                                                                                        placeholder={t.quoteModal.price}
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => removeItem(item.id)}
                                                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400 transition-colors mt-[1px]"
                                                                                    title={t.quoteModal.removeItem}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        </motion.div>
                                                                    ))}
                                                                </AnimatePresence>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Payment Details - Collapsible */}
                                            <div className="space-y-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPaymentDetailsExpanded(!isPaymentDetailsExpanded)}
                                                    className="w-full flex items-center justify-between text-left"
                                                >
                                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">
                                                        {t.invoices.paymentDetails || 'Detalhes de Pagamento'}
                                                    </h3>
                                                    <motion.div
                                                        animate={{ rotate: isPaymentDetailsExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="w-4 h-4 text-white/40" />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence>
                                                    {isPaymentDetailsExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden space-y-4"
                                                        >
                                                            <div className="space-y-2">
                                                                <label className="text-sm text-white/60">{t.invoices.paymentMethod || 'Método de Pagamento'}</label>
                                                                <div className="relative">
                                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none z-10" />
                                                                    <select
                                                                        value={paymentMethod}
                                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                                                                    >
                                                                        <option value="" className="bg-[#1A1A1A]">{t.invoices.selectPaymentMethod || 'Selecionar método'}</option>
                                                                        <option value="transfer" className="bg-[#1A1A1A]">{t.invoices.paymentTransfer || 'Transferência Bancária'}</option>
                                                                        <option value="multibanco" className="bg-[#1A1A1A]">Multibanco</option>
                                                                        <option value="mbway" className="bg-[#1A1A1A]">MB WAY</option>
                                                                        <option value="cash" className="bg-[#1A1A1A]">{t.invoices.paymentCash || 'Dinheiro'}</option>
                                                                        <option value="check" className="bg-[#1A1A1A]">{t.invoices.paymentCheck || 'Cheque'}</option>
                                                                        <option value="card" className="bg-[#1A1A1A]">{t.invoices.paymentCard || 'Cartão'}</option>
                                                                        <option value="other" className="bg-[#1A1A1A]">{t.invoices.paymentOther || 'Outro'}</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm text-white/60">{t.invoices.paymentDate || 'Data de Pagamento'}</label>
                                                                <div className="relative">
                                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                                    <input
                                                                        type="date"
                                                                        value={paymentDate}
                                                                        onChange={(e) => setPaymentDate(e.target.value)}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm text-white/60">{t.invoices.paymentReference || 'Referência de Pagamento'}</label>
                                                                <div className="relative">
                                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                                    <input
                                                                        type="text"
                                                                        value={paymentReference}
                                                                        onChange={(e) => setPaymentReference(e.target.value)}
                                                                        placeholder={t.invoices.paymentReferencePlaceholder || 'Ex: MB12345678901'}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm text-white/60">{t.invoices.paymentNotes || 'Notas de Pagamento'}</label>
                                                                <textarea
                                                                    value={paymentNotes}
                                                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                                                    placeholder={t.invoices.paymentNotesPlaceholder || 'Informações adicionais sobre o pagamento...'}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-20"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Banking Details - Collapsible */}
                                            <div className="space-y-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsBankingDetailsExpanded(!isBankingDetailsExpanded)}
                                                    className="w-full flex items-center justify-between text-left"
                                                >
                                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">
                                                        {t.invoices.bankingDetails || 'Informações Bancárias'}
                                                    </h3>
                                                    <motion.div
                                                        animate={{ rotate: isBankingDetailsExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="w-4 h-4 text-white/40" />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence>
                                                    {isBankingDetailsExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden space-y-4"
                                                        >
                                                            <div className="space-y-2">
                                                                <label className="text-sm text-white/60">{t.invoices.bankName || 'Nome do Banco'}</label>
                                                                <input
                                                                    type="text"
                                                                    value={bankName}
                                                                    onChange={(e) => setBankName(e.target.value)}
                                                                    placeholder="Ex: Millennium BCP"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm text-white/60">IBAN</label>
                                                                <input
                                                                    type="text"
                                                                    value={iban}
                                                                    onChange={(e) => setIban(e.target.value)}
                                                                    placeholder="PT50 0000 0000 0000 0000 0000 0"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm text-white/60">SWIFT/BIC</label>
                                                                <input
                                                                    type="text"
                                                                    value={swiftBic}
                                                                    onChange={(e) => setSwiftBic(e.target.value)}
                                                                    placeholder="Ex: BCOMPTPL"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Notes - Collapsible */}
                                            <div className="space-y-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                                                    className="w-full flex items-center justify-between text-left"
                                                >
                                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">{t.quoteModal.notesTerms}</h3>
                                                    <motion.div
                                                        animate={{ rotate: isNotesExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="w-4 h-4 text-white/40" />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence>
                                                    {isNotesExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <textarea
                                                                value={notes}
                                                                onChange={(e) => setNotes(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-32"
                                                                placeholder={t.quoteModal.notesPlaceholder}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right Side - Live Preview */}
                            <div className="w-full md:w-1/2 bg-[#111111] p-8 overflow-y-auto flex flex-col items-center">
                                <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-12 shadow-2xl relative flex flex-col">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="w-48">
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
                                            <h1 className="text-4xl font-light text-blue-600 mb-2">{previewT.invoices.typeInvoice.toUpperCase()}</h1>
                                            <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">
                                                {previewT.quoteModal.invoiceNumber}
                                            </p>
                                            <p className="text-gray-700 font-bold text-lg">FAT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</p>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="flex justify-between mb-12">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{previewT.quoteModal.billTo}</p>
                                            <div className="text-sm text-gray-800 space-y-1">
                                                {clientName ? <p className="font-bold text-base">{clientName}</p> : <p className="text-gray-300 italic">{previewT.quoteModal.clientName}</p>}
                                                {clientContact && <p className="font-medium">{clientContact}</p>}
                                                {clientAddress ? (
                                                    clientAddress.split('\n').map((line, i) => <p key={i}>{line}</p>)
                                                ) : (
                                                    <p className="text-gray-300 italic">{previewT.quoteModal.addressPlaceholder}</p>
                                                )}
                                                {clientEmail && <p className="text-blue-600">{clientEmail}</p>}
                                                {clientPhone && <p className="text-gray-600">{clientPhone}</p>}
                                                {clientNif && <p className="text-gray-600"><span className="font-medium">{previewT.quoteModal.nif}:</span> {clientNif}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{previewT.quoteModal.issueDate}</p>
                                                <p className="text-sm font-medium">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('pt-PT') : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{previewT.quoteModal.dueDate}</p>
                                                <p className="text-sm font-medium">{dueDate ? new Date(dueDate).toLocaleDateString('pt-PT') : '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="mb-8">
                                        <div className="border-b-2 border-blue-600 pb-2 mb-4 flex text-xs font-bold text-gray-400 uppercase">
                                            <div className="flex-1">{previewT.quoteModal.description}</div>
                                            <div className="w-20 text-center">{previewT.quoteModal.qty}</div>
                                            <div className="w-32 text-right">{previewT.quoteModal.price}</div>
                                            <div className="w-32 text-right">{previewT.quoteModal.total}</div>
                                        </div>
                                        <div className="space-y-4">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex text-sm text-gray-800 border-b border-gray-100 pb-4 last:border-0">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.description || <span className="text-gray-300 italic">{previewT.quoteModal.itemDescriptionPlaceholder}</span>}</p>
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
                                                <span>{previewT.quoteModal.subtotal}</span>
                                                <span>{formatCurrency(subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>{previewT.quoteModal.tax} ({taxRate * 100}%)</span>
                                                <span>{formatCurrency(tax)}</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-blue-600">
                                                <span>{previewT.quoteModal.total}</span>
                                                <span>{formatCurrency(total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {notes && (
                                        <div className="pt-8 border-t border-gray-100">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{previewT.quoteModal.notesTerms}</p>
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-auto pt-8 border-t border-gray-200 text-center">
                                        <p className="text-xs text-gray-500 italic">{previewT.quoteModal.invoiceLegalNote}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Actions Bar (Floating) */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[70] pointer-events-auto">
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving || exporting}
                            >
                                {exporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{t.quoteModal.exporting}</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        {t.quoteModal.download}
                                    </>
                                )}
                            </button>
                            <div className="w-px h-6 bg-white/10" />
                            <button
                                onClick={handleSaveInvoice}
                                disabled={saving || exporting}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t.quoteModal.saving}
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4" />
                                        {t.quoteModal.save}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
