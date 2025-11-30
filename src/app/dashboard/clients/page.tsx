"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical, Plus, X, Trash2, Edit2, Mail, Phone, Globe } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

type ClientStatus = "Active" | "Inactive";

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    status: ClientStatus;
    notes: string;
}

export default function ClientsPage() {
    const supabase = createClient();
    const [clients, setClients] = useState<Client[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ClientStatus | "All">("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newClient, setNewClient] = useState<Partial<Client>>({
        name: "",
        email: "",
        phone: "",
        website: "",
        status: "Active",
        notes: "",
    });

    useEffect(() => {
        setMounted(true);
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clients:', error);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "All" || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data, error } = await supabase
            .from('clients')
            .insert([{
                name: newClient.name,
                email: newClient.email,
                phone: newClient.phone,
                website: newClient.website,
                status: newClient.status,
                notes: newClient.notes
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding client:', error);
            alert('Error adding client');
        } else {
            setClients([data, ...clients]);
            setIsModalOpen(false);
            setNewClient({ name: "", email: "", phone: "", website: "", status: "Active", notes: "" });
        }
    };

    const handleDeleteClient = async (id: number) => {
        if (confirm("Are you sure you want to delete this client?")) {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting client:', error);
                alert('Error deleting client');
            } else {
                setClients(clients.filter(c => c.id !== id));
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Clients</h1>
                    <p className="text-white/60">Manage your client relationships.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4" /> Add Client
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClientStatus | "All")}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Clients Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/60 text-sm uppercase">
                            <tr>
                                <th className="p-4 font-medium">Client Name</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Notes</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/40">Loading clients...</td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/40">
                                        No clients found.
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{client.name}</div>
                                            {client.website && (
                                                <a href={`https://${client.website}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                                    <Globe className="w-3 h-3" /> {client.website}
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-sm text-white/60">
                                                {client.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3" /> {client.email}
                                                    </div>
                                                )}
                                                {client.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3" /> {client.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${client.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white/60 text-sm truncate max-w-xs">{client.notes}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Client Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                    <h2 className="text-xl font-bold text-white">Add New Client</h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleAddClient} className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Company Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Acme Corp"
                                            value={newClient.name}
                                            onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Email</label>
                                            <input
                                                type="email"
                                                placeholder="contact@company.com"
                                                value={newClient.email}
                                                onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/60">Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="+1 (555) ..."
                                                value={newClient.phone}
                                                onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Website</label>
                                        <input
                                            type="text"
                                            placeholder="company.com"
                                            value={newClient.website}
                                            onChange={e => setNewClient({ ...newClient, website: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Notes</label>
                                        <textarea
                                            placeholder="Internal notes about this client..."
                                            value={newClient.notes}
                                            onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 h-24 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Status</label>
                                        <select
                                            value={newClient.status}
                                            onChange={e => setNewClient({ ...newClient, status: e.target.value as ClientStatus })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            Add Client
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
