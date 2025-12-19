"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, Download, Send, FileText, Calendar, User, MapPin, Hash } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useClients, Client } from "@/hooks/useClients";

interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<QuoteItem[]>([
        { id: "1", description: "Service / Product", quantity: 1, price: 0 }
    ]);

    const { clients, loading: loadingClients } = useClients();
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [clientSearch, setClientSearch] = useState("");

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(clientName.toLowerCase())
    );

    const selectClient = (client: Client) => {
        setClientName(client.name);
        setClientEmail(client.email || "");
        setClientAddress(client.address || client.country || "");
        setShowClientDropdown(false);
    };

    const modalRef = useRef<HTMLDivElement>(null);

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

    const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const subtotal = calculateSubtotal();
    const taxRate = 0.23; // Example tax rate (23%) - could be configurable
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <FileText className="w-5 h-5" />
                                    </span>
                                    Create Quote
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Client Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Client Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Client Name</label>
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
                                                    placeholder="Enter or search client name"
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
                                            <label className="text-sm text-white/60">Email</label>
                                            <input
                                                type="email"
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                placeholder="client@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                            <textarea
                                                value={clientAddress}
                                                onChange={(e) => setClientAddress(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-20"
                                                placeholder="Client address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Quote Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Quote Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <input
                                                    type="date"
                                                    value={quoteDate}
                                                    onChange={(e) => setQuoteDate(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Valid Until</label>
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
                                        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Items</h3>
                                        <button
                                            onClick={addItem}
                                            className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add Item
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
                                                    className="flex gap-3 items-start overflow-hidden"
                                                >
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                            placeholder="Description"
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
                                                            placeholder="Qty"
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
                                                            placeholder="Price"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400 transition-colors mt-[1px]"
                                                        title="Remove Item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">Notes / Terms</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-24"
                                        placeholder="Payment terms, delivery details, etc."
                                    />
                                </div>
                            </div>
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
                                                src="/logos/framax-logo-cut.png"
                                                alt="Framax Solutions"
                                                fill
                                                className="object-contain object-left"
                                                priority
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p className="font-bold text-gray-900">Framax Solutions</p>
                                            <p>123 Tech Avenue</p>
                                            <p>Lisbon, Portugal 1000-001</p>
                                            <p>contact@framaxsolutions.com</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-4xl font-light text-blue-600 mb-2">QUOTE</h1>
                                        <p className="text-gray-500 font-medium"># QTE-{new Date().getFullYear()}-001</p>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="flex justify-between mb-12">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To</p>
                                        <div className="text-sm text-gray-800 space-y-1">
                                            {clientName ? <p className="font-bold">{clientName}</p> : <p className="text-gray-300 italic">Client Name</p>}
                                            {clientAddress ? (
                                                clientAddress.split('\n').map((line, i) => <p key={i}>{line}</p>)
                                            ) : (
                                                <p className="text-gray-300 italic">Client Address</p>
                                            )}
                                            {clientEmail && <p className="text-blue-600">{clientEmail}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Date</p>
                                            <p className="text-sm font-medium">{quoteDate ? new Date(quoteDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Valid Until</p>
                                            <p className="text-sm font-medium">{expiryDate ? new Date(expiryDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-8">
                                    <div className="border-b-2 border-blue-600 pb-2 mb-4 flex text-xs font-bold text-gray-400 uppercase">
                                        <div className="flex-1">Description</div>
                                        <div className="w-20 text-center">Qty</div>
                                        <div className="w-32 text-right">Price</div>
                                        <div className="w-32 text-right">Total</div>
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
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Tax ({taxRate * 100}%)</span>
                                            <span>{formatCurrency(tax)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-blue-600">
                                            <span>Total</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {notes && (
                                    <div className="mt-auto pt-8 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Notes & Terms</p>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-auto pt-8 text-center text-xs text-gray-400">
                                    <p>Thank you for your business!</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions Bar (Floating) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <div className="w-px h-6 bg-white/10" />
                        <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                            <Send className="w-4 h-4" />
                            Save & Send
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
