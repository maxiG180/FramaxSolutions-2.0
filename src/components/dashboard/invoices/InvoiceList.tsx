import { MoreVertical, Download, Send } from "lucide-react";

interface Invoice {
    id: string;
    client: string;
    amount: string;
    date: string;
    status: "paid" | "pending" | "overdue";
}

interface InvoiceListProps {
    invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-500/20 text-green-400";
            case "pending": return "bg-yellow-500/20 text-yellow-400";
            case "overdue": return "bg-red-500/20 text-red-400";
            default: return "bg-white/10 text-white/40";
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-white/40">
                            <th className="p-4 font-medium">Invoice ID</th>
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
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Send Reminder">
                                            <Send className="w-4 h-4" />
                                        </button>
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
        </div>
    );
}
