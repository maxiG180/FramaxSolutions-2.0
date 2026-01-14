import { Download, Send, Check, X, Trash2, Edit } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Invoice {
    id: string;
    displayId?: string;
    client: string;
    amount: string;
    date: string;
    status: "paid" | "pending" | "overdue" | "draft" | "sent" | "accepted" | "declined" | "converted";
    type: "invoice" | "quote";
    rawData?: any;
}

interface InvoiceListProps {
    invoices: Invoice[];
    onAcceptQuote?: (id: string) => void;
    onDeclineQuote?: (id: string) => void;
    onDelete?: (id: string) => void;
    onDownload?: (id: string) => void;
    onSend?: (id: string) => void;
    onEdit?: (id: string) => void;
    onView?: (id: string) => void;
}

export function InvoiceList({ invoices, onAcceptQuote, onDeclineQuote, onDelete, onDownload, onSend, onEdit, onView }: InvoiceListProps) {
    const { t } = useLanguage();

    const handleDownload = (invoice: Invoice) => {
        if (onDownload) {
            onDownload(invoice.id);
        } else {
            // Fallback: Try to download using the rawData
            alert(`${t.invoices.downloadPdf}: ${invoice.displayId || invoice.id}`);
        }
    };

    const handleSend = (invoice: Invoice) => {
        if (onSend) {
            onSend(invoice.id);
        } else {
            // Fallback: Show alert
            alert(`${t.invoices.send}: ${invoice.displayId || invoice.id}`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-500/20 text-green-400";
            case "pending": return "bg-yellow-500/20 text-yellow-400";
            case "overdue": return "bg-red-500/20 text-red-400";
            case "draft": return "bg-gray-500/20 text-gray-400";
            case "sent": return "bg-blue-500/20 text-blue-400";
            case "accepted": return "bg-green-500/20 text-green-400";
            case "declined": return "bg-red-500/20 text-red-400";
            case "converted": return "bg-purple-500/20 text-purple-400";
            default: return "bg-white/10 text-white/40";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "paid": return t.invoices.statusPaid;
            case "pending": return t.invoices.statusPending;
            case "overdue": return t.invoices.statusOverdue;
            case "draft": return t.invoices.statusDraft;
            case "sent": return t.invoices.statusSent;
            case "accepted": return t.invoices.statusAccepted;
            case "declined": return t.invoices.statusDeclined;
            case "converted": return t.invoices.statusConverted;
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const getTypeColor = (type: string) => {
        return type === "invoice"
            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
            : "bg-purple-500/20 text-purple-400 border-purple-500/30";
    };

    const getTypeText = (type: string) => {
        return type === "invoice" ? t.invoices.typeInvoice : t.invoices.typeQuote;
    };

    const translateDocumentId = (id: string) => {
        // Replace old prefixes with Portuguese ones for display
        return id
            .replace(/^QTE-/, 'ORC-')
            .replace(/^INV-/, 'FAT-');
    };

    return (
        <div className="h-full overflow-y-auto bg-white/5 border border-white/10 rounded-2xl">
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-neutral-950 border-b border-white/10">
                    <tr className="text-white/40">
                        <th className="p-4 font-medium">{t.invoices.tableId}</th>
                        <th className="p-4 font-medium">{t.invoices.tableType}</th>
                        <th className="p-4 font-medium">{t.invoices.tableClient}</th>
                        <th className="p-4 font-medium">{t.invoices.tableAmount}</th>
                        <th className="p-4 font-medium">{t.invoices.tableDate}</th>
                        <th className="p-4 font-medium">{t.invoices.tableStatus}</th>
                        <th className="p-4 font-medium text-right">{t.invoices.tableActions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4">
                                <button
                                    onClick={() => onView?.(invoice.id)}
                                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors hover:underline cursor-pointer"
                                >
                                    {translateDocumentId(invoice.displayId || invoice.id)}
                                </button>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getTypeColor(invoice.type)}`}>
                                    {getTypeText(invoice.type)}
                                </span>
                            </td>
                            <td className="p-4 text-white/60">{invoice.client}</td>
                            <td className="p-4 font-bold">{invoice.amount}</td>
                            <td className="p-4 text-white/60">{invoice.date}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                    {getStatusText(invoice.status)}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Editar - só para quotes em draft */}
                                    {invoice.type === "quote" && invoice.status === "draft" && onEdit && (
                                        <button
                                            onClick={() => onEdit(invoice.id)}
                                            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                                            title={t.invoices.editQuote}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Download PDF */}
                                    <button
                                        onClick={() => handleDownload(invoice)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                        title={t.invoices.downloadPdf}
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>

                                    {/* Enviar */}
                                    <button
                                        onClick={() => handleSend(invoice)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                        title={t.invoices.send}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>

                                    {/* Aceitar/Recusar - só para quotes não aceites/recusadas */}
                                    {invoice.type === "quote" && invoice.status !== "accepted" && invoice.status !== "declined" && (
                                        <>
                                            {onAcceptQuote && (
                                                <button
                                                    onClick={() => onAcceptQuote(invoice.id)}
                                                    className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                                                    title={t.invoices.acceptQuote}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDeclineQuote && (
                                                <button
                                                    onClick={() => onDeclineQuote(invoice.id)}
                                                    className="p-2 hover:bg-orange-500/20 rounded-lg text-orange-400 hover:text-orange-300 transition-colors"
                                                    title={t.invoices.declineQuote}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {/* Apagar - só para quotes não aceites */}
                                    {invoice.type === "quote" && invoice.status !== "accepted" && onDelete && (
                                        <button
                                            onClick={() => onDelete(invoice.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                            title={t.invoices.deleteQuote}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
