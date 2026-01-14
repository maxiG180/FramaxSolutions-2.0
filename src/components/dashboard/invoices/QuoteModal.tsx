"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, Download, Send, FileText, Calendar, User, MapPin, Hash, Package } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useClients, Client } from "@/hooks/useClients";
import { Service } from "@/types/service";
import { useLanguage } from "@/context/LanguageContext";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadOutfitFont, getAdjustedFontSize } from '@/utils/pdfFonts';

interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
    serviceId?: string | null;
}

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuoteSaved?: () => void;
    editingQuoteId?: string | null;
}

export function QuoteModal({ isOpen, onClose, onQuoteSaved, editingQuoteId }: QuoteModalProps) {
    const { t } = useLanguage();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clientName, setClientName] = useState("");
    const [clientContact, setClientContact] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientNif, setClientNif] = useState("");
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);

    // Calculate expiry date (30 days from today)
    const getExpiryDate = (fromDate: string) => {
        const date = new Date(fromDate);
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    };

    const [expiryDate, setExpiryDate] = useState(getExpiryDate(new Date().toISOString().split('T')[0]));
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [saveError, setSaveError] = useState("");

    const formatPhoneNumber = (value: string) => {
        if (!value) return '';

        // Preserve '+' at start if exists
        const hasPlus = value.startsWith('+');
        const digits = value.replace(/\D/g, '');

        let formatted = '';

        if (digits.length > 0) {
            // For numbers with country code (e.g., +351 911 178 179)
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

    const { clients, loading: loadingClients } = useClients();
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [clientSearch, setClientSearch] = useState("");

    // Services state
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Load quote data when editing
    useEffect(() => {
        const loadQuoteData = async () => {
            if (!editingQuoteId || !isOpen) return;

            setLoading(true);
            setIsEditMode(true);

            try {
                const response = await fetch(`/api/quotes/${editingQuoteId}`);
                if (!response.ok) {
                    throw new Error('Failed to load quote');
                }

                const quote = await response.json();

                // Populate form fields
                setClientName(quote.client_name || "");
                setClientContact(quote.client_contact || "");
                setClientEmail(quote.client_email || "");
                setClientPhone(formatPhoneNumber(quote.client_phone || ""));
                setClientAddress(quote.client_address || "");
                setClientNif(quote.client_nif || "");
                setQuoteDate(quote.quote_date || new Date().toISOString().split('T')[0]);
                setExpiryDate(quote.expiry_date || getExpiryDate(quote.quote_date));
                setNotes(quote.notes || "");

                // Load items
                const loadedItems = (quote.items || []).map((item: any, index: number) => ({
                    id: item.id || `item-${index}`,
                    description: item.description || "",
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    serviceId: item.serviceId || null,
                }));
                setItems(loadedItems.length > 0 ? loadedItems : [{ id: "1", description: "", quantity: 1, price: 0, serviceId: null }]);

            } catch (error) {
                console.error('Error loading quote:', error);
                alert('Erro ao carregar orçamento');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (editingQuoteId && isOpen) {
            loadQuoteData();
        } else if (!editingQuoteId && isOpen) {
            // Reset to create mode
            setIsEditMode(false);
        }
    }, [editingQuoteId, isOpen]);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(clientName.toLowerCase())
    );

    const selectClient = (client: Client) => {
        setClientName(client.name);
        setClientEmail(client.email || "");
        setClientPhone(formatPhoneNumber(client.phone || "")); // Format phone number
        setClientContact(client.contact_person || "");

        // Combine address and country if both exist
        let fullAddress = "";
        if (client.address && client.country) {
            fullAddress = `${client.address}\n${client.country}`;
        } else if (client.address) {
            fullAddress = client.address;
        } else if (client.country) {
            fullAddress = client.country;
        }
        setClientAddress(fullAddress);

        setShowClientDropdown(false);
    };

    // Fetch services
    const fetchServices = async () => {
        try {
            setLoadingServices(true);
            const response = await fetch('/api/services');
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();
            setServices(data);
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoadingServices(false);
        }
    };

    const modalRef = useRef<HTMLDivElement>(null);

    // Fetch services when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    // Close on click outside (kept as backup, though AnimatePresence usually handles this via overlay click)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof QuoteItem, value: string | number | null) => {
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
    const taxRate = 0.23; // Example tax rate (23%) - could be configurable
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

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
        const newQuoteDate = new Date().toISOString().split('T')[0];
        setQuoteDate(newQuoteDate);
        setExpiryDate(getExpiryDate(newQuoteDate));
        setNotes("");
        setItems([]);
        setSaveError("");
        setIsEditMode(false);
    };

    const handleExportPDF = async () => {
        try {
            // Validate required fields before exporting
            if (!clientName.trim()) {
                setSaveError(t.quoteModal.clientNameRequired);
                return;
            }

            if (items.length === 0 || items.every(item => !item.description.trim())) {
                setSaveError(t.quoteModal.itemRequired);
                return;
            }

            setExporting(true);
            setSaveError("");

            // Create PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Try to load custom font (Outfit)
            const customFontLoaded = await loadOutfitFont(doc);

            // Helper function to get adjusted font size
            const fs = (size: number) => getAdjustedFontSize(size, customFontLoaded);

            // Determine which font to use
            const fontFamily = customFontLoaded ? 'Outfit' : 'helvetica';

            // Colors (as tuples for jsPDF type compatibility)
            const primaryBlue: [number, number, number] = [37, 99, 235]; // #2563eb
            const lightGray: [number, number, number] = [107, 114, 128]; // #6b7280
            const darkGray: [number, number, number] = [31, 41, 55]; // #1f2937

            // Load and add logo
            let logoLoaded = false;
            try {
                const logoImg = document.createElement('img') as HTMLImageElement;
                logoImg.src = '/logos/framax-logo-black.png';

                await new Promise<void>((resolve, reject) => {
                    logoImg.onload = () => resolve();
                    logoImg.onerror = () => reject(new Error('Failed to load logo'));
                });

                // Add logo with correct proportions - logo is wider than tall
                // Actual logo dimensions: 422x61px = 6.92:1 aspect ratio
                const logoHeight = 8; // mm - Reduced from 12
                const logoWidth = logoHeight * 6.92; // mm (maintaining actual 6.92:1 aspect ratio)
                doc.addImage(logoImg, 'PNG', 20, 20, logoWidth, logoHeight);
                logoLoaded = true;
            } catch (err) {
                console.error('Error loading logo:', err);
            }

            // Company info below logo
            const startY = logoLoaded ? 40 : 20;

            // "Framax Solutions" text - only if logo failed to load
            if (!logoLoaded) {
                doc.setFontSize(fs(10)); // Reduced from 12
                doc.setFont(fontFamily, 'bold');
                doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
                doc.text('Framax Solutions', 20, startY);
            } else {
                // If logo loaded, just show company name in smaller text
                doc.setFontSize(fs(10)); // Reduced from 11
                doc.setFont(fontFamily, 'bold');
                doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
                doc.text('Framax Solutions', 20, startY);
            }

            // Contacts
            doc.setFontSize(fs(10));
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.text('contact@framaxsolutions.com', 20, startY + 5);
            doc.text('framaxsolutions.com', 20, startY + 10);

            // Quote Title (Right side) - MUCH larger to match preview
            doc.setFontSize(fs(24)); // Reduced from 36
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            doc.text(t.quoteModal.quote, pageWidth - 20, 30, { align: 'right' });

            // "Quote Number" label - uppercase, smaller
            doc.setFontSize(fs(9));
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.text(t.quoteModal.quoteNumber.toUpperCase(), pageWidth - 20, 40, { align: 'right' });

            // Quote number value - larger and bold
            doc.setFontSize(fs(16));
            doc.setFont(fontFamily, 'bold');
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            const quoteNumber = `ORC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
            doc.text(quoteNumber, pageWidth - 20, 48, { align: 'right' });

            // Bill To Section (Left)
            let yPos = 70;
            // "BILL TO" label
            doc.setFontSize(fs(9));
            doc.setFont(fontFamily, 'bold');
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.text(t.quoteModal.billTo.toUpperCase(), 20, yPos);

            yPos += 8;
            // Client name - bigger and bolder
            doc.setFontSize(fs(14));
            doc.setFont(fontFamily, 'bold');
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            doc.text(clientName || t.quoteModal.clientNamePlaceholder, 20, yPos);

            yPos += 7;
            // Client details
            doc.setFontSize(fs(11));
            doc.setFont(fontFamily, 'normal');

            if (clientContact) {
                // Contact person - matches font-medium
                doc.setFont(fontFamily, 'normal');
                doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
                doc.text(clientContact, 20, yPos);
                yPos += 5;
            }

            if (clientAddress) {
                const addressLines = clientAddress.split('\n');
                addressLines.forEach((line) => {
                    doc.text(line, 20, yPos);
                    yPos += 5;
                });
            }

            if (clientEmail) {
                doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
                doc.text(clientEmail, 20, yPos);
                yPos += 5;
                doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            }

            if (clientPhone) {
                doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
                doc.text(clientPhone, 20, yPos);
                doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
                yPos += 5;
            }

            if (clientNif) {
                doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
                doc.setFont(fontFamily, 'normal');
                const nifText = `${t.quoteModal.nif}: ${clientNif}`;
                doc.text(nifText, 20, yPos);
                doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
                yPos += 5;
            }

            // Date Information (Right)
            let dateYPos = 70;
            // Date labels
            doc.setFontSize(fs(9));
            doc.setFont(fontFamily, 'bold');
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.text(t.quoteModal.issueDate.toUpperCase(), pageWidth - 20, dateYPos, { align: 'right' });

            dateYPos += 7;
            // Date values
            doc.setFontSize(fs(11));
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            const quoteDateStr = quoteDate ? new Date(quoteDate).toLocaleDateString('pt-PT') : '-';
            doc.text(quoteDateStr, pageWidth - 20, dateYPos, { align: 'right' });

            dateYPos += 15;
            doc.setFontSize(fs(9));
            doc.setFont(fontFamily, 'bold');
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.text(t.quoteModal.validity.toUpperCase(), pageWidth - 20, dateYPos, { align: 'right' });

            dateYPos += 7;
            doc.setFontSize(fs(11));
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            const expiryDateStr = expiryDate ? new Date(expiryDate).toLocaleDateString('pt-PT') : '-';
            doc.text(expiryDateStr, pageWidth - 20, dateYPos, { align: 'right' });

            // Items Table
            const tableStartY = Math.max(yPos, dateYPos) + 10;

            const tableData = items.map((item) => [
                item.description || '',
                item.quantity.toString(),
                `${item.price.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`,
                `${(item.quantity * item.price).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`
            ]);

            autoTable(doc, {
                startY: tableStartY,
                head: [[t.quoteModal.description, t.quoteModal.qty, t.quoteModal.price, t.quoteModal.total]],
                body: tableData,
                theme: 'plain',
                styles: {
                    font: fontFamily,
                    fontSize: fs(11),
                    cellPadding: 5,
                    lineColor: [243, 244, 246], // Very light gray for body lines
                    lineWidth: 0.1,
                },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: lightGray,
                    fontStyle: 'bold',
                    fontSize: fs(10),
                    // Only blue border on BOTTOM of header (top of table content)
                    lineColor: primaryBlue,
                    lineWidth: { bottom: 0.5, top: 0, left: 0, right: 0 }, // Only bottom border in blue
                },
                bodyStyles: {
                    textColor: darkGray,
                    lineColor: [255, 255, 255], // White lines = no visible borders
                    lineWidth: 0,
                },
                columnStyles: {
                    0: { cellWidth: 'auto', fontStyle: 'normal', halign: 'left' },
                    1: { cellWidth: 20, halign: 'center', textColor: lightGray },
                    2: { cellWidth: 30, halign: 'right', textColor: lightGray },
                    3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
                },
                didParseCell: function (data: any) {
                    // Apply alignment to header cells to match body cells
                    if (data.section === 'head') {
                        if (data.column.index === 1) {
                            data.cell.styles.halign = 'center';
                        } else if (data.column.index === 2 || data.column.index === 3) {
                            data.cell.styles.halign = 'right';
                        }
                    }
                },
                margin: { left: 20, right: 20 },
            });

            // Totals
            const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : tableStartY + 50;
            const totalsX = pageWidth - 70;
            let totalsY = finalY;

            // Subtotal and Tax
            doc.setFontSize(fs(11));
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);

            // Subtotal
            doc.text(t.quoteModal.subtotal, totalsX, totalsY);
            doc.text(`${subtotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`, pageWidth - 20, totalsY, { align: 'right' });

            totalsY += 8;

            // IVA
            const taxPercentage = (taxRate * 100).toFixed(0);
            doc.text(`${t.quoteModal.tax} (${taxPercentage}%)`, totalsX, totalsY);
            doc.text(`${tax.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`, pageWidth - 20, totalsY, { align: 'right' });

            totalsY += 12;

            // Border line above total - thinner and lighter
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.3);
            doc.line(totalsX, totalsY - 3, pageWidth - 20, totalsY - 3);

            // Total - BIGGER and BLUE to match preview
            doc.setFontSize(fs(16));
            doc.setFont(fontFamily, 'bold');
            doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            doc.text(t.quoteModal.total, totalsX, totalsY + 2);
            doc.text(`${total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`, pageWidth - 20, totalsY + 2, { align: 'right' });

            // Notes
            if (notes) {
                totalsY += 20;

                // Border above notes
                doc.setDrawColor(243, 244, 246);
                doc.setLineWidth(0.4);
                doc.line(20, totalsY - 5, pageWidth - 20, totalsY - 5);

                // Notes header - matches text-xs font-bold uppercase (≈ 10pt)
                doc.setFontSize(fs(10));
                doc.setFont(fontFamily, 'bold');
                doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
                doc.text(t.quoteModal.notesTerms.toUpperCase(), 20, totalsY);

                totalsY += 6;
                // Notes content - matches text-sm text-gray-600 (≈ 11pt)
                doc.setFontSize(fs(11));
                doc.setFont(fontFamily, 'normal');
                doc.setTextColor(lightGray[0] + 20, lightGray[1] + 20, lightGray[2] + 20);

                const notesLines = doc.splitTextToSize(notes, pageWidth - 40);
                doc.text(notesLines, 20, totalsY);
            }

            // Footer - Legal Note
            const footerY = pageHeight - 25;

            // Legal note - matches text-xs italic (≈ 10pt)
            doc.setFontSize(fs(10));
            doc.setFont(fontFamily, 'italic');
            doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            const legalNoteLines = doc.splitTextToSize(t.quoteModal.legalNote, pageWidth - 40);
            doc.text(legalNoteLines, pageWidth / 2, footerY, { align: 'center' });

            // Save PDF
            doc.save(`Quote-${quoteNumber}.pdf`);

            // Clear any errors
            setSaveError("");
        } catch (err) {
            console.error('Error generating PDF:', err);
            setSaveError('Failed to generate PDF');
        } finally {
            setExporting(false);
        }
    };

    const handleSaveQuote = async () => {
        try {
            setSaving(true);
            setSaveError("");

            // Validate required fields
            if (!clientName.trim()) {
                setSaveError(t.quoteModal.clientNameRequired);
                return;
            }

            if (items.length === 0 || items.every(item => !item.description.trim())) {
                setSaveError(t.quoteModal.itemRequired);
                return;
            }

            const url = isEditMode && editingQuoteId
                ? `/api/quotes/${editingQuoteId}`
                : '/api/quotes';

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
                    quoteDate,
                    expiryDate: expiryDate || null,
                    items,
                    notes,
                    taxRate
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save quote');
            }

            const savedQuote = await response.json();

            // Call the callback if provided
            if (onQuoteSaved) {
                onQuoteSaved();
            }

            // Close the modal
            onClose();

            // Reset form
            resetForm();
        } catch (err: any) {
            console.error('Error saving quote:', err);
            setSaveError(err.message || t.quoteModal.failedToSave);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                        className="w-full max-w-7xl h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Left Side - Form Input */}
                        <div className="w-full md:w-1/2 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                        <p className="text-white/60">A carregar orçamento...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <FileText className="w-5 h-5" />
                                    </span>
                                    {isEditMode ? 'Editar Orçamento' : t.quoteModal.title}
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Error Display */}
                                {saveError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {saveError}
                                    </div>
                                )}

                                {/* Client Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">{t.quoteModal.clientDetails}</h3>
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
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">{t.quoteModal.nif}</label>
                                        <input
                                            type="text"
                                            value={clientNif}
                                            onChange={(e) => setClientNif(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                            placeholder={t.quoteModal.nifPlaceholder}
                                        />
                                    </div>
                                    <div className="space-y-2">
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
                                </div>

                                {/* Quote Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">{t.quoteModal.quoteDetails}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">{t.quoteModal.quoteDate}</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <input
                                                    type="date"
                                                    value={quoteDate}
                                                    onChange={(e) => {
                                                        setQuoteDate(e.target.value);
                                                        // Auto-update expiry date to 30 days after quote date
                                                        setExpiryDate(getExpiryDate(e.target.value));
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">{t.quoteModal.validUntil}</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <input
                                                    type="date"
                                                    value={expiryDate}
                                                    onChange={(e) => setExpiryDate(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">{t.quoteModal.items}</h3>
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
                                                    {/* Service Selector */}
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

                                                    {/* Item Details */}
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
                                                            title="Remove Item"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">{t.quoteModal.notesTerms}</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-24"
                                        placeholder={t.quoteModal.notesPlaceholder}
                                    />
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
                                        <h1 className="text-4xl font-light text-blue-600 mb-2">{t.quoteModal.quote}</h1>
                                        <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">
                                            {t.quoteModal.quoteNumber}
                                        </p>
                                        <p className="text-gray-700 font-bold text-lg">ORC-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</p>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="flex justify-between mb-12">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t.quoteModal.billTo}</p>
                                        <div className="text-sm text-gray-800 space-y-1">
                                            {clientName ? <p className="font-bold text-base">{clientName}</p> : <p className="text-gray-300 italic">{t.quoteModal.clientName}</p>}
                                            {clientContact && <p className="font-medium">{clientContact}</p>}
                                            {clientAddress ? (
                                                clientAddress.split('\n').map((line, i) => <p key={i}>{line}</p>)
                                            ) : (
                                                <p className="text-gray-300 italic">{t.quoteModal.addressPlaceholder}</p>
                                            )}
                                            {clientEmail && <p className="text-blue-600">{clientEmail}</p>}
                                            {clientPhone && <p className="text-gray-600">{clientPhone}</p>}
                                            {clientNif && <p className="text-gray-600"><span className="font-medium">{t.quoteModal.nif}:</span> {clientNif}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.quoteModal.issueDate}</p>
                                            <p className="text-sm font-medium">{quoteDate ? new Date(quoteDate).toLocaleDateString('pt-PT') : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.quoteModal.validity}</p>
                                            <p className="text-sm font-medium">{expiryDate ? new Date(expiryDate).toLocaleDateString('pt-PT') : '-'}</p>
                                        </div>
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
                                        {items.map((item) => (
                                            <div key={item.id} className="flex text-sm text-gray-800 border-b border-gray-100 pb-4 last:border-0">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.description || <span className="text-gray-300 italic">Item description...</span>}</p>
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
                                            <span>{t.quoteModal.tax} ({taxRate * 100}%)</span>
                                            <span>{formatCurrency(tax)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-blue-600">
                                            <span>{t.quoteModal.total}</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {notes && (
                                    <div className="pt-8 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t.quoteModal.notesTerms}</p>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-auto pt-8 border-t border-gray-200 text-center">
                                    <p className="text-xs text-gray-500 italic">{t.quoteModal.legalNote}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions Bar (Floating) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50">
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={saving || exporting}
                        >
                            {exporting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    {t.quoteModal.exportPdf}
                                </>
                            )}
                        </button>
                        <div className="w-px h-6 bg-white/10" />
                        <button
                            onClick={handleSaveQuote}
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
                                    <Send className="w-4 h-4" />
                                    {t.quoteModal.saveSend}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
