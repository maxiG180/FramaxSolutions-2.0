"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Phone, Mail, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const INITIAL_LEADS = [
    { id: 1, name: "TechStart Inc", contact: "Sarah Miller", value: "$15,000", status: "New", tag: "Redesign" },
    { id: 2, name: "Coffee House", contact: "Mike Ross", value: "$5,000", status: "Contacted", tag: "SEO" },
    { id: 3, name: "Legal Eagles", contact: "Jessica P.", value: "$25,000", status: "Proposal", tag: "App" },
    { id: 4, name: "Fitness Pro", contact: "Tom Hardy", value: "$8,000", status: "Proposal", tag: "Web" },
    { id: 5, name: "Bakery 101", contact: "Chef Gordon", value: "$3,000", status: "New", tag: "Social" },
];

const COLUMNS = ["New", "Contacted", "Proposal", "Won"];

type Lead = typeof INITIAL_LEADS[0];

export default function LeadsPage() {
    const [leads, setLeads] = useState(INITIAL_LEADS);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLead, setNewLead] = useState({ name: "", contact: "", value: "", tag: "" });
    const [draggedLead, setDraggedLead] = useState<number | null>(null);

    const getColumnColor = (status: string) => {
        switch (status) {
            case "New": return "bg-blue-500";
            case "Contacted": return "bg-yellow-500";
            case "Proposal": return "bg-purple-500";
            case "Won": return "bg-green-500";
            default: return "bg-gray-500";
        }
    };

    const moveLead = (leadId: number, newStatus: string) => {
        setLeads(leads.map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
    };

    const deleteLead = (leadId: number) => {
        setLeads(leads.filter(lead => lead.id !== leadId));
    };

    const addLead = () => {
        if (!newLead.name || !newLead.contact || !newLead.value) return;

        const lead = {
            id: Date.now(),
            name: newLead.name,
            contact: newLead.contact,
            value: newLead.value,
            status: "New",
            tag: newLead.tag || "General"
        };

        setLeads([lead, ...leads]);
        setNewLead({ name: "", contact: "", value: "", tag: "" });
        setShowAddModal(false);
    };

    const handleDragStart = (leadId: number) => {
        setDraggedLead(leadId);
    };

    const handleDragEnd = () => {
        setDraggedLead(null);
    };

    const handleDrop = (targetStatus: string) => {
        if (draggedLead !== null) {
            moveLead(draggedLead, targetStatus);
            setDraggedLead(null);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Leads Pipeline</h1>
                    <p className="text-white/60">Track your sales opportunities. Drag cards to move between stages.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Lead
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden">
                <div className="flex gap-4 h-full pb-4">
                    {COLUMNS.map((column) => (
                        <div
                            key={column}
                            className="flex-1 flex flex-col gap-4 min-w-0"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(column)}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getColumnColor(column)}`} />
                                    <span className="font-bold text-sm uppercase tracking-wider">{column}</span>
                                    <span className="text-white/40 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                                        {leads.filter(l => l.status === column).length}
                                    </span>
                                </div>
                            </div>

                            {/* Cards Container */}
                            <div className={`flex-1 border border-white/10 rounded-2xl p-3 space-y-3 overflow-y-auto transition-colors ${draggedLead && leads.find(l => l.id === draggedLead)?.status !== column
                                ? "bg-white/10 border-white/20"
                                : "bg-white/5"
                                }`}>
                                <AnimatePresence mode="popLayout">
                                    {leads.filter(l => l.status === column).map((lead) => (
                                        <motion.div
                                            key={lead.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            draggable
                                            onDragStart={() => handleDragStart(lead.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`bg-black/40 border border-white/10 p-4 rounded-xl hover:border-white/30 transition-all cursor-grab active:cursor-grabbing group ${draggedLead === lead.id ? "opacity-50 scale-95" : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-white/10 text-white/60">
                                                    {lead.tag}
                                                </span>
                                                <button
                                                    onClick={() => deleteLead(lead.id)}
                                                    className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <h4 className="font-bold text-lg mb-1">{lead.name}</h4>
                                            <p className="text-sm text-white/60 mb-4">{lead.contact}</p>

                                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                <span className="font-mono font-bold text-green-400">{lead.value}</span>
                                                <div className="flex gap-2">
                                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                                        <Phone className="w-3 h-3" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                                        <Mail className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {leads.filter(l => l.status === column).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-white/20 text-sm">
                                        {draggedLead && leads.find(l => l.id === draggedLead)?.status !== column
                                            ? "Drop here"
                                            : "Empty"}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Lead Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Add New Lead</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-white/60 mb-2 block">Company Name</label>
                                    <input
                                        type="text"
                                        value={newLead.name}
                                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/60 mb-2 block">Contact Person</label>
                                    <input
                                        type="text"
                                        value={newLead.contact}
                                        onChange={(e) => setNewLead({ ...newLead, contact: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/60 mb-2 block">Estimated Value</label>
                                    <input
                                        type="text"
                                        value={newLead.value}
                                        onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                        placeholder="e.g. $10,000"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/60 mb-2 block">Tag</label>
                                    <input
                                        type="text"
                                        value={newLead.tag}
                                        onChange={(e) => setNewLead({ ...newLead, tag: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                        placeholder="e.g. Web Design"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addLead}
                                    className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Add Lead
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
