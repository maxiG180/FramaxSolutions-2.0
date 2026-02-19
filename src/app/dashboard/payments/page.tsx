"use client";

import { useState, useEffect } from "react";
import { Plus, DollarSign, TrendingUp, AlertCircle, CreditCard } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useLanguage } from "@/context/LanguageContext";
import { PaymentModal } from "@/components/dashboard/payments/PaymentModal";
import { PaymentList } from "@/components/dashboard/payments/PaymentList";

interface Payment {
    id: number;
    client_id: number | null;
    client_name: string;
    service_name: string;
    service_type: "Monthly" | "One Time";
    amount: number;
    currency: string;
    status: "active" | "pending" | "overdue" | "cancelled" | "completed";
    billing_frequency: "monthly" | "quarterly" | "yearly" | "one-time";
    start_date: string;
    next_payment_date: string | null;
    last_payment_date: string | null;
    payment_method: string | null;
    notes: string | null;
    created_at: string;
}

export default function PaymentsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);

    // Fetch payments from API
    const fetchPayments = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/payments');
            if (!response.ok) {
                if (response.status === 404) {
                    setPayments([]);
                    return;
                }
                throw new Error('Failed to fetch payments');
            }

            const data = await response.json();
            setPayments(data || []);
        } catch (err: any) {
            setPayments([]);
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleDeletePayment = async (id: number) => {
        if (!confirm(t.payments.deleteConfirm)) return;

        try {
            const response = await fetch(`/api/payments/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete payment');
            }

            setPayments(prev => prev.filter(payment => payment.id !== id));
            alert(t.payments.paymentDeleted);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleEditPayment = (id: number) => {
        setEditingPaymentId(id);
        setIsPaymentModalOpen(true);
    };

    // Calculate statistics
    const calculateStats = () => {
        // Filter active recurring payments
        const activeRecurring = payments.filter(
            p => p.status === 'active' && p.service_type === 'Monthly'
        );

        // Monthly Recurring Revenue (MRR)
        const mrr = activeRecurring.reduce((sum, p) => {
            if (p.billing_frequency === 'monthly') {
                return sum + p.amount;
            } else if (p.billing_frequency === 'quarterly') {
                return sum + (p.amount / 3);
            } else if (p.billing_frequency === 'yearly') {
                return sum + (p.amount / 12);
            }
            return sum;
        }, 0);

        // Active subscriptions count
        const activeCount = activeRecurring.length;

        // Overdue payments
        const today = new Date();
        const overdue = payments.filter(p => {
            if (p.status !== 'active' || !p.next_payment_date) return false;
            const nextDate = new Date(p.next_payment_date);
            return nextDate < today;
        });
        const overdueAmount = overdue.reduce((sum, p) => sum + p.amount, 0);

        // Revenue this month (from last_payment_date in current month)
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const revenueThisMonth = payments
            .filter(p => {
                if (!p.last_payment_date) return false;
                const paymentDate = new Date(p.last_payment_date);
                return paymentDate.getMonth() === currentMonth &&
                       paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            mrr: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(mrr),
            activeCount,
            overdueCount: overdue.length,
            overdueAmount: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(overdueAmount),
            revenueThisMonth: new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(revenueThisMonth)
        };
    };

    const stats = calculateStats();

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t.payments.title}</h1>
                    <p className="text-white/60">{t.payments.subtitle}</p>
                </div>
                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    {t.payments.createPayment}
                </button>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setEditingPaymentId(null);
                }}
                onPaymentSaved={fetchPayments}
                editingPaymentId={editingPaymentId}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 flex-shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">{t.payments.monthlyRecurringRevenue}</p>
                            <p className="text-2xl font-bold">{stats.mrr}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">{t.payments.activeSubscriptions}</p>
                            <p className="text-2xl font-bold">{stats.activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">{t.payments.overduePayments}</p>
                            <p className="text-2xl font-bold">{stats.overdueCount}</p>
                            <p className="text-sm text-red-400">{stats.overdueAmount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">{t.payments.revenueThisMonth}</p>
                            <p className="text-2xl font-bold">{stats.revenueThisMonth}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="flex-1 overflow-hidden min-h-0">
                {payments.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                            <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/40 mb-2">{t.payments.noPayments}</p>
                            <p className="text-white/20 text-sm">{t.payments.createFirst}</p>
                        </div>
                    </div>
                ) : (
                    <PaymentList
                        payments={payments}
                        onEdit={handleEditPayment}
                        onDelete={handleDeletePayment}
                    />
                )}
            </div>
        </div>
    );
}
