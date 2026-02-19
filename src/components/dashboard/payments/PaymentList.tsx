"use client";

import { Edit2, Trash2, MoreVertical } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

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

interface PaymentListProps {
    payments: Payment[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export function PaymentList({ payments, onEdit, onDelete }: PaymentListProps) {
    const { t } = useLanguage();
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(amount);
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: Payment['status']) => {
        const styles = {
            active: 'bg-green-500/20 text-green-400 border-green-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
            cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };

        const labels = {
            active: t.payments.statusActive,
            pending: t.payments.statusPending,
            overdue: t.payments.statusOverdue,
            cancelled: t.payments.statusCancelled,
            completed: t.payments.statusCompleted,
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getFrequencyLabel = (frequency: Payment['billing_frequency']) => {
        const labels = {
            monthly: t.payments.frequencyMonthly,
            quarterly: t.payments.frequencyQuarterly,
            yearly: t.payments.frequencyYearly,
            'one-time': t.payments.frequencyOneTime,
        };

        return labels[frequency];
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/60 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium">{t.payments.tableClient}</th>
                            <th className="p-4 font-medium">{t.payments.tableService}</th>
                            <th className="p-4 font-medium">{t.payments.tableAmount}</th>
                            <th className="p-4 font-medium">{t.payments.tableFrequency}</th>
                            <th className="p-4 font-medium">{t.payments.tableNextPayment}</th>
                            <th className="p-4 font-medium">{t.payments.tableStatus}</th>
                            <th className="p-4 font-medium text-right">{t.payments.tableActions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-semibold">{payment.client_name}</td>
                                <td className="p-4">
                                    <div>
                                        <div className="font-medium">{payment.service_name}</div>
                                        <div className="text-xs text-white/60">{payment.service_type}</div>
                                    </div>
                                </td>
                                <td className="p-4 font-mono font-bold">
                                    {formatCurrency(payment.amount, payment.currency)}
                                </td>
                                <td className="p-4 text-white/80">
                                    {getFrequencyLabel(payment.billing_frequency)}
                                </td>
                                <td className="p-4 text-white/80">
                                    {formatDate(payment.next_payment_date)}
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(payment.status)}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(payment.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                                            title={t.payments.edit}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(payment.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/60 hover:text-red-400"
                                            title={t.payments.delete}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
