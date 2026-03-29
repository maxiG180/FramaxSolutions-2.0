"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useClients } from "@/hooks/useClients";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSaved: () => void;
    editingPaymentId?: number | null;
}

export function PaymentModal({ isOpen, onClose, onPaymentSaved, editingPaymentId }: PaymentModalProps) {
    const { t } = useLanguage();
    const { clients } = useClients();
    const [loading, setLoading] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        clientName: "",
        serviceName: "",
        serviceType: "Monthly" as "Monthly" | "One Time",
        amount: "",
        billingFrequency: "monthly" as "monthly" | "quarterly" | "yearly" | "one-time",
        startDate: new Date().toISOString().split('T')[0],
        nextPaymentDate: "",
        paymentMethod: "",
        status: "active" as "active" | "pending" | "overdue" | "cancelled" | "completed",
        notes: "",
    });

    useEffect(() => {
        if (editingPaymentId) {
            fetchPayment(editingPaymentId);
        } else {
            resetForm();
        }
    }, [editingPaymentId, isOpen]);

    const fetchPayment = async (id: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/payments/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch payment');
            }
            const payment = await response.json();

            setFormData({
                clientName: payment.client_name,
                serviceName: payment.service_name,
                serviceType: payment.service_type,
                amount: payment.amount.toString(),
                billingFrequency: payment.billing_frequency,
                startDate: payment.start_date,
                nextPaymentDate: payment.next_payment_date || "",
                paymentMethod: payment.payment_method || "",
                status: payment.status,
                notes: payment.notes || "",
            });
            setSelectedClientId(payment.client_id || null);
        } catch (err: any) {
            console.error('Error fetching payment:', err);
            alert('Error loading payment: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            clientName: "",
            serviceName: "",
            serviceType: "Monthly",
            amount: "",
            billingFrequency: "monthly",
            startDate: new Date().toISOString().split('T')[0],
            nextPaymentDate: "",
            paymentMethod: "",
            status: "active",
            notes: "",
        });
        setSelectedClientId(null);
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value ? parseInt(e.target.value) : null;
        setSelectedClientId(clientId);

        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                setFormData(prev => ({
                    ...prev,
                    clientName: client.name,
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, clientName: "" }));
        }
    };

    const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceType = e.target.value as "Monthly" | "One Time";
        setFormData(prev => ({
            ...prev,
            serviceType,
            billingFrequency: serviceType === "Monthly" ? "monthly" : "one-time",
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientName || !formData.serviceName || !formData.amount || !formData.startDate) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                clientId: selectedClientId || null,
                clientName: formData.clientName,
                serviceName: formData.serviceName,
                serviceType: formData.serviceType,
                amount: parseFloat(formData.amount),
                billingFrequency: formData.billingFrequency,
                startDate: formData.startDate,
                nextPaymentDate: formData.nextPaymentDate || null,
                paymentMethod: formData.paymentMethod || null,
                status: formData.status,
                notes: formData.notes || null,
            };

            const url = editingPaymentId ? `/api/payments/${editingPaymentId}` : '/api/payments';
            const method = editingPaymentId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save payment');
            }

            onPaymentSaved();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Error saving payment:', err);
            alert('Error saving payment: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 sticky top-0 bg-neutral-900 z-10 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        {editingPaymentId ? t.paymentModal.editTitle : t.paymentModal.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Client Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white/80">{t.paymentModal.clientDetails}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.selectClient}
                                </label>
                                <select
                                    value={selectedClientId?.toString() || ""}
                                    onChange={handleClientChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">{t.paymentModal.selectClient}</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.clientName} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.clientName}
                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder={t.paymentModal.clientName}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white/80">{t.paymentModal.serviceDetails}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.serviceName} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.serviceName}
                                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder={t.paymentModal.serviceName}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.serviceType} *
                                </label>
                                <select
                                    value={formData.serviceType}
                                    onChange={handleServiceTypeChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="Monthly">{t.paymentModal.serviceTypeMonthly}</option>
                                    <option value="One Time">{t.paymentModal.serviceTypeOneTime}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.amount} (€) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.billingFrequency}
                                </label>
                                <select
                                    value={formData.billingFrequency}
                                    onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value as any })}
                                    disabled={formData.serviceType === "One Time"}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                                >
                                    <option value="monthly">{t.payments.frequencyMonthly}</option>
                                    <option value="quarterly">{t.payments.frequencyQuarterly}</option>
                                    <option value="yearly">{t.payments.frequencyYearly}</option>
                                    <option value="one-time">{t.payments.frequencyOneTime}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white/80">{t.paymentModal.paymentDetails}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.startDate} *
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.nextPaymentDate}
                                </label>
                                <input
                                    type="date"
                                    value={formData.nextPaymentDate}
                                    onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.paymentMethod}
                                </label>
                                <input
                                    type="text"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="MB Way, Transfer, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    {t.paymentModal.status}
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="active">{t.payments.statusActive}</option>
                                    <option value="pending">{t.payments.statusPending}</option>
                                    <option value="overdue">{t.payments.statusOverdue}</option>
                                    <option value="cancelled">{t.payments.statusCancelled}</option>
                                    <option value="completed">{t.payments.statusCompleted}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                            {t.paymentModal.notes}
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            placeholder={t.paymentModal.notesPlaceholder}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
                        >
                            {t.paymentModal.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : editingPaymentId ? t.paymentModal.save : t.paymentModal.create}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
