import { MoreVertical, Download, Send, FileText, RefreshCw } from "lucide-react";

interface Invoice {
    id: string;
    client: string;
    amount: string;
    date: string;
    status: "paid" | "pending" | "overdue" | "draft" | "sent" | "accepted" | "declined" | "converted";
    type: "invoice" | "quote";
}

interface InvoiceListProps {
    invoices: Invoice[];
    onConvertToInvoice?: (id: string) => void;
}

export function InvoiceList({ invoices, onConvertToInvoice }: InvoiceListProps) {
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

    const getTypeColor = (type: string) => {
        return type === "invoice"
            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
            : "bg-purple-500/20 text-purple-400 border-purple-500/30";
    };

    return (
        <div className="h-full overflow-y-auto bg-white/5 border border-white/10 rounded-2xl">
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-neutral-950 border-b border-white/10">
                    <tr className="text-white/40">
                        <th className="p-4 font-medium">ID</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Client</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 font-medium text-white">{invoice.id}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getTypeColor(invoice.type)}`}>
                                    {invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)}
                                </span>
                            </td>
                            <td className="p-4 text-white/60">{invoice.client}</td>
                            <td className="p-4 font-bold">{invoice.amount}</td>
                            <td className="p-4 text-white/60">{invoice.date}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Download PDF">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Send">
                                        <Send className="w-4 h-4" />
                                    </button>
                                    {invoice.type === "quote" && invoice.status !== "converted" && (
                                        <button
                                            onClick={() => onConvertToInvoice?.(invoice.id)}
                                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                                            title="Convert to Invoice"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
