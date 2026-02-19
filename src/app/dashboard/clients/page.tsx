"use client";

import { useState, useEffect } from "react";

import { Search, MoreVertical, Plus, X, Trash2, Edit2, Mail, Phone, Globe, MapPin, User, Building2, ImageIcon, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Loader } from "@/components/ui/loader";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { PhoneInput } from "@/components/ui/PhoneInput";

type ClientStatus = "Active" | "Inactive";

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    status: ClientStatus;
    logo?: string;
    contact_person?: string;
    country?: string;
    address?: string; // Should be added if not present in the DB, or just use it if it is
    preferred_language?: 'pt' | 'en';
}

export default function ClientsPage() {
    const supabase = createClient();
    const [clients, setClients] = useState<Client[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ClientStatus | "All">("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<number | null>(null);

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [justAdvanced, setJustAdvanced] = useState(false);
    const totalSteps = 3;

    // Form State
    const [formData, setFormData] = useState<Partial<Client>>({
        name: "",
        email: "",
        phone: "",
        website: "",
        logo: "",
        contact_person: "",
        country: "",
        address: "",
        preferred_language: "pt"
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
            (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (client.contact_person && client.contact_person.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "All" || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", website: "", logo: "", contact_person: "", country: "", address: "", preferred_language: "pt" });
        setEditingId(null);
        setCurrentStep(1);
        setIsModalOpen(false);
    };

    const handleOpenAdd = () => {
        resetForm();
        setCurrentStep(1);
        setIsModalOpen(true);
    };

    const handleEditClick = (client: Client) => {
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            website: client.website,
            logo: client.logo || "",
            contact_person: client.contact_person || "",
            country: client.country || "",
            address: client.address || "",
            preferred_language: client.preferred_language || "pt"
        });
        setEditingId(client.id);
        setCurrentStep(1);
        setIsTransitioning(false);
        setIsModalOpen(true);
    };

    const handleNextStep = () => {
        if (isTransitioning || currentStep >= totalSteps) return;

        setJustAdvanced(true);
        setIsTransitioning(true);
        setCurrentStep(prev => prev + 1);
        setTimeout(() => {
            setIsTransitioning(false);
            setJustAdvanced(false);
        }, 500);
    };

    const handlePreviousStep = () => {
        if (isTransitioning || currentStep <= 1) return;
        setIsTransitioning(true);
        setCurrentStep(prev => prev - 1);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent submission if just advanced to this step
        if (justAdvanced) {
            return;
        }

        // Prevent submission if not on final step
        if (currentStep < totalSteps) {
            setCurrentStep(prev => Math.min(totalSteps, prev + 1));
            return;
        }

        if (editingId) {
            // Update existing client
            const { error } = await supabase
                .from('clients')
                .update({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    status: 'Active',
                    logo: formData.logo,
                    contact_person: formData.contact_person,
                    country: formData.country,
                    address: formData.address,
                    preferred_language: formData.preferred_language
                })
                .eq('id', editingId);

            if (error) {
                console.error('Error updating client:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                alert(`Error updating client: ${error.message || 'Unknown error'}`);
            } else {
                setClients(clients.map(c => c.id === editingId ? { ...c, ...formData } as Client : c));
                resetForm();
            }
        } else {
            // Create new client
            const { data, error } = await supabase
                .from('clients')
                .insert([{
                    name: formData.name,
                    email: formData.email || "",
                    phone: formData.phone || "",
                    website: formData.website || "",
                    status: 'Active',
                    logo: formData.logo || "",
                    contact_person: formData.contact_person || "",
                    country: formData.country || "",
                    address: formData.address || "",
                    preferred_language: formData.preferred_language || "pt"
                }])
                .select()
                .single();

            if (error) {
                console.error('Error adding client:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                console.error('Error message:', error.message);
                console.error('Error hint:', error.hint);
                console.error('Error details object:', error.details);
                alert(`Error adding client: ${error.message || 'Unknown error. Check console for details.'}`);
            } else {
                // Create folder in Docs page for the new client
                console.log('🗂️ Starting folder creation in Docs for new client...');
                console.log('Client data:', data);

                try {
                    const clientFolderName = formData.name || `Client ${data.id}`;
                    console.log('📁 Creating Docs folder:', clientFolderName);

                    // Get current user
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        // Create folder in the folders table (for Docs page)
                        const folderPayload: any = {
                            user_id: user.id,
                            name: clientFolderName,
                            color: 'text-blue-400',
                            bg: 'bg-blue-400/10'
                        };

                        // Try to add client_id (will be ignored if column doesn't exist)
                        try {
                            folderPayload.client_id = data.id;
                        } catch (e) {
                            console.log('Note: client_id column not available yet');
                        }

                        const { data: folderData, error: folderError } = await supabase
                            .from('folders')
                            .insert(folderPayload)
                            .select()
                            .single();

                        if (folderError) {
                            console.error('❌ Could not create client folder in Docs:', folderError);
                            console.error('Error details:', folderError);
                            // Don't fail the client creation if folder creation fails
                        } else {
                            console.log('✅ Successfully created Docs folder for client:', clientFolderName);
                            console.log('Folder data:', folderData);
                        }
                    } else {
                        console.warn('⚠️ No authenticated user found, skipping folder creation');
                    }
                } catch (folderError) {
                    console.error('❌ Exception while creating client folder:', folderError);
                    // Don't fail the client creation if folder creation fails
                }

                setClients([data, ...clients]);
                resetForm();
            }
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
                    onClick={handleOpenAdd}
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
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    {(["All", "Active", "Inactive"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? status === "Active"
                                    ? "bg-green-500/10 text-green-400 shadow-sm ring-1 ring-green-500/20"
                                    : status === "Inactive"
                                        ? "bg-gray-500/10 text-gray-400 shadow-sm ring-1 ring-gray-500/20"
                                        : "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {status === "All" ? "All" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/60 text-sm uppercase">
                            <tr>
                                <th className="p-4 font-medium pl-6">Client</th>
                                <th className="p-4 font-medium">Contact Person</th>
                                <th className="p-4 font-medium">Region</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/40">
                                        <Loader />
                                    </td>
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
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                                    {client.logo ? (
                                                        <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 className="w-5 h-5 text-white/40" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{client.name}</div>
                                                    {client.website && (
                                                        <a href={`https://${client.website}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                                            <Globe className="w-3 h-3" /> {client.website}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {client.contact_person ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-white font-medium">
                                                        <User className="w-3 h-3 text-white/60" /> {client.contact_person}
                                                    </div>
                                                    <div className="text-sm text-white/60 pl-5">
                                                        {client.email}
                                                    </div>
                                                </div>
                                            ) : (
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
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {client.country ? (
                                                <div className="flex items-center gap-2 text-white/80">
                                                    <MapPin className="w-4 h-4 text-white/40" />
                                                    {client.country}
                                                </div>
                                            ) : (
                                                <span className="text-white/20">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${client.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(client)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
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

            {/* Add/Edit Client Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-7xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{editingId ? "Edit Client" : "Add New Client"}</h2>
                                        <p className="text-sm text-white/40 mt-1">Step {currentStep} of {totalSteps}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="px-6 pt-4">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3].map((step) => (
                                            <div key={step} className="flex-1 flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: currentStep >= step ? "100%" : "0%" }}
                                                        transition={{ duration: 0.3 }}
                                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                                                    />
                                                </div>
                                                {step < 3 && <div className="w-1 h-1 rounded-full bg-white/20" />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-3 text-xs">
                                        <span className={`transition-colors ${currentStep === 1 ? 'text-blue-400 font-medium' : 'text-white/40'}`}>Company</span>
                                        <span className={`transition-colors ${currentStep === 2 ? 'text-blue-400 font-medium' : 'text-white/40'}`}>Contact</span>
                                        <span className={`transition-colors ${currentStep === 3 ? 'text-blue-400 font-medium' : 'text-white/40'}`}>Location</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveClient} className="p-8">
                                    <AnimatePresence mode="wait">
                                        {/* Step 1: Company Details */}
                                        {currentStep === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-6 max-w-2xl mx-auto"
                                            >
                                                <div className="text-center mb-8">
                                                    <h3 className="text-2xl font-bold text-white mb-2">Company Information</h3>
                                                    <p className="text-white/60">Let's start with the basic company details</p>
                                                </div>

                                                {/* Logo Upload */}
                                                <div className="flex justify-center">
                                                    <div className="relative group">
                                                        <div className="w-32 h-32 rounded-full bg-black/40 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden relative">
                                                            {formData.logo ? (
                                                                <img src={formData.logo} alt="Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2 text-white/20">
                                                                    <ImageIcon className="w-8 h-8" />
                                                                    <span className="text-xs uppercase font-medium">Logo</span>
                                                                </div>
                                                            )}

                                                            {loading ? (
                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                                </div>
                                                            ) : (
                                                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                                    <Plus className="w-8 h-8 text-white mb-1" />
                                                                    <span className="text-xs text-white font-medium">Upload</span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;

                                                                            const fileExt = file.name.split('.').pop();
                                                                            const fileName = `${Math.random()}.${fileExt}`;
                                                                            const filePath = `${fileName}`;

                                                                            setLoading(true);
                                                                            const { error: uploadError } = await supabase.storage
                                                                                .from('client-logos')
                                                                                .upload(filePath, file);

                                                                            if (uploadError) {
                                                                                console.error('Error uploading image:', uploadError);
                                                                                alert('Error uploading image. Make sure "client-logos" bucket exists.');
                                                                                setLoading(false);
                                                                                return;
                                                                            }

                                                                            const { data: { publicUrl } } = supabase.storage
                                                                                .from('client-logos')
                                                                                .getPublicUrl(filePath);

                                                                            setFormData({ ...formData, logo: publicUrl });
                                                                            setLoading(false);
                                                                        }}
                                                                    />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Logo URL (Optional)</label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://example.com/logo.png"
                                                        value={formData.logo || ""}
                                                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-white/60">Company Name <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="e.g. Framax Solutions"
                                                            value={formData.name}
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-lg pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-white/60">Website</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="text"
                                                            placeholder="company.com"
                                                            value={formData.website}
                                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-lg pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                            </motion.div>
                                        )}

                                        {/* Step 2: Contact Person */}
                                        {currentStep === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-6 max-w-2xl mx-auto"
                                            >
                                                <div className="text-center mb-8">
                                                    <h3 className="text-2xl font-bold text-white mb-2">Contact Person</h3>
                                                    <p className="text-white/60">Who should we reach out to?</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-white/60">Full Name</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. John Doe"
                                                            value={formData.contact_person}
                                                            onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-lg pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-white/60">Email Address</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="email"
                                                            placeholder="contact@company.com"
                                                            value={formData.email}
                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-lg pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-white/60">Phone Number</label>
                                                    <PhoneInput
                                                        value={formData.phone || ""}
                                                        onChange={(value) => setFormData({ ...formData, phone: value })}
                                                        placeholder="Phone number"
                                                    />
                                                </div>

                                                {/* Language Preference - Clean Flags */}
                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium text-white/60">Content Language</label>
                                                    <div className="flex gap-3 justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, preferred_language: 'pt' })}
                                                            className={`group relative w-24 h-16 rounded-lg overflow-hidden transition-all ${
                                                                formData.preferred_language === 'pt'
                                                                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 scale-105'
                                                                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                                                            }`}
                                                            title="Português"
                                                        >
                                                            <svg viewBox="0 0 900 600" className="w-full h-full">
                                                                <rect fill="#060" width="360" height="600"/>
                                                                <rect fill="#D80027" x="360" width="540" height="600"/>
                                                                <circle fill="#FFDA44" cx="360" cy="300" r="120"/>
                                                                <path fill="#D80027" d="M360,180v240m-120-120h240" strokeWidth="20"/>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, preferred_language: 'en' })}
                                                            className={`group relative w-24 h-16 rounded-lg overflow-hidden transition-all ${
                                                                formData.preferred_language === 'en'
                                                                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 scale-105'
                                                                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                                                            }`}
                                                            title="English"
                                                        >
                                                            <svg viewBox="0 0 60 30" className="w-full h-full">
                                                                <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                                                                <clipPath id="t"><path d="M30,15 h30 v15 z v-30 h-30 z h-30 v15 z v-30 h30 z"/></clipPath>
                                                                <g clipPath="url(#s)">
                                                                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                                                                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                                                                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
                                                                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                                                                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                                                                </g>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 3: Location */}
                                        {currentStep === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-6"
                                            >
                                                <div className="text-center mb-8">
                                                    <h3 className="text-2xl font-bold text-white mb-2">Location & Address</h3>
                                                    <p className="text-white/60">Where is this company located?</p>
                                                </div>

                                                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                                                    <AddressAutocomplete
                                                        defaultValue={formData.address}
                                                        onSelect={(address, country) => {
                                                            setFormData(prev => ({ ...prev, address, country }));
                                                        }}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={handlePreviousStep}
                                            disabled={currentStep === 1 || isTransitioning}
                                            className="px-6 py-3 rounded-lg font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                        >
                                            ← Previous
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3].map((step) => (
                                                <button
                                                    key={step}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isTransitioning) {
                                                            setIsTransitioning(true);
                                                            setCurrentStep(step);
                                                            setTimeout(() => setIsTransitioning(false), 300);
                                                        }
                                                    }}
                                                    disabled={isTransitioning}
                                                    className={`w-2 h-2 rounded-full transition-all ${currentStep === step
                                                        ? 'w-8 bg-blue-500'
                                                        : 'bg-white/20 hover:bg-white/40'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {currentStep < totalSteps ? (
                                            <button
                                                type="button"
                                                onClick={handleNextStep}
                                                disabled={isTransitioning}
                                                className="px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next →
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                            >
                                                {editingId ? "✓ Save Changes" : "✓ Add Client"}
                                            </button>
                                        )}
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
