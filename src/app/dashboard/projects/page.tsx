"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProjectCard } from "@/components/dashboard/projects/ProjectCard";
import { Loader } from "@/components/ui/loader";
import { Plus, Search, Filter, X, Briefcase, User, Calendar as CalendarIcon, Globe, ChevronDown, Package } from "lucide-react";
import { Service } from "@/types/service";
import { useClients } from "@/hooks/useClients";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

type ProjectStatus = "in-progress" | "completed";

interface ProjectType {
    id: number;
    title: string;
    client: string;
    clientId: number;
    contactPerson?: string;
    clientLogo?: string;
    status: ProjectStatus;
    websiteOnline?: boolean;
    websiteUrl?: string;
    startDate: string;
    addOns?: string[]; // Service titles
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);

    // Load clients
    const { clients, loading: loadingClients } = useClients();
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const totalSteps = 3;

    // New Project Form State
    const [newProject, setNewProject] = useState<Partial<ProjectType>>({
        title: "",
        client: "",
        status: "in-progress",
        websiteOnline: false,
        websiteUrl: "",
        startDate: new Date().toISOString().split('T')[0],
        addOns: [],
    });

    // Fetch services from API
    const fetchServices = async () => {
        try {
            setLoadingServices(true);
            const response = await fetch('/api/services');
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Fetch projects from database
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    clients (
                        id,
                        name,
                        website,
                        contact_person,
                        logo
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Fetch projects error details:', error);
                throw error;
            }

            console.log('Fetched projects:', data);

            const formattedProjects: ProjectType[] = (data || []).map(project => ({
                id: project.id,
                title: project.title,
                client: project.clients?.name || 'Unknown Client',
                clientId: project.client_id,
                // @ts-ignore - contact_person may not exist yet
                contactPerson: project.clients?.contact_person || '',
                // @ts-ignore - logo may not exist yet
                clientLogo: project.clients?.logo || '',
                status: project.status === 'Completed' ? 'completed' : 'in-progress',
                websiteOnline: !!project.clients?.website,
                websiteUrl: project.clients?.website || '',
                startDate: project.start_date || new Date().toISOString().split('T')[0],
                addOns: [], // TODO: Fetch from project_services table when implemented
            }));

            setProjects(formattedProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchServices();
        fetchProjects();
    }, []);

    const [loading, setLoading] = useState(true);

    if (loading) return <Loader />;

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.client.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Only process if we're on the last step
        if (currentStep !== totalSteps) {
            return;
        }

        // Validate required fields before creating
        if (!selectedClientId) {
            return;
        }

        try {
            setLoading(true);
            const supabase = createClient();

            console.log('Creating project with:', {
                client_id: selectedClientId,
                title: newProject.title || `Website ${newProject.client}`,
                status: newProject.status === 'completed' ? 'Completed' : 'In Progress',
                start_date: newProject.startDate || new Date().toISOString().split('T')[0],
            });

            const projectData = {
                client_id: selectedClientId,
                title: newProject.title || `Website ${newProject.client}`,
                service_type: 'Website',
                start_date: newProject.startDate || new Date().toISOString().split('T')[0],
            };

            console.log('Project data to insert:', projectData);
            console.log('Selected client ID type:', typeof selectedClientId, selectedClientId);

            const { data, error } = await supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            console.log('Response data:', data);
            console.log('Response error:', error);

            if (error) {
                // Try different ways to log the error
                console.error('ERROR MESSAGE:', error.message || 'no message');
                console.error('ERROR DETAILS:', error.details || 'no details');
                console.error('ERROR HINT:', error.hint || 'no hint');
                console.error('ERROR CODE:', error.code || 'no code');

                // Log all keys in the error object
                console.error('ERROR KEYS:', Object.keys(error));

                // Try to stringify each property
                for (const key in error) {
                    console.error(`ERROR[${key}]:`, error[key]);
                }

                alert(`Erro: ${error.message || error.details || 'Unknown error'}`);
                throw error;
            }

            console.log('Project created:', data);

            // Refetch projects to update the list
            await fetchProjects();
            resetForm();
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Erro ao criar projeto. Verifica a consola para detalhes.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewProject({
            title: "",
            client: "",
            status: "in-progress",
            websiteOnline: false,
            websiteUrl: "",
            startDate: new Date().toISOString().split('T')[0],
            addOns: [],
        });
        setSelectedClientId(null);
        setCurrentStep(1);
        setIsModalOpen(false);
    };

    const handleNextStep = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isTransitioning || currentStep >= totalSteps) return;

        setIsTransitioning(true);
        setCurrentStep(prev => prev + 1);
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const handlePreviousStep = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (isTransitioning || currentStep <= 1) return;
        setIsTransitioning(true);
        setCurrentStep(prev => prev - 1);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const toggleAddOn = (serviceTitle: string) => {
        const currentAddOns = newProject.addOns || [];
        if (currentAddOns.includes(serviceTitle)) {
            setNewProject({ ...newProject, addOns: currentAddOns.filter(a => a !== serviceTitle) });
        } else {
            setNewProject({ ...newProject, addOns: [...currentAddOns, serviceTitle] });
        }
    };

    const selectClient = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClientId(clientId);
            setNewProject({
                ...newProject,
                client: client.name,
                title: `Website ${client.name}`,
                websiteUrl: client.website || "",
                websiteOnline: false,
            });
            setShowClientDropdown(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes((newProject.client || "").toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Projetos</h1>
                    <p className="text-white/60">Acompanhe e gira os projetos dos seus clientes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Projeto
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Pesquisar projetos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    {(["all", "in-progress", "completed"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? status === "completed"
                                    ? "bg-green-500/10 text-green-400 shadow-sm ring-1 ring-green-500/20"
                                    : status === "in-progress"
                                        ? "bg-blue-500/10 text-blue-400 shadow-sm ring-1 ring-blue-500/20"
                                        : "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {status === "all" ? "Todos" : status === "in-progress" ? "Em Progresso" : "Completo"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-20 text-center">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-white/20" />
                    <p className="text-white/40">Nenhum projeto encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </div>
            )}

            {/* New Project Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={resetForm}
                                className="absolute inset-0 bg-black/90"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Novo Projeto</h2>
                                        <p className="text-sm text-white/40 mt-1">Passo {currentStep} de {totalSteps}</p>
                                    </div>
                                    <button
                                        onClick={resetForm}
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
                                        <span className={`transition-colors ${currentStep === 1 ? 'text-blue-400 font-medium' : 'text-white/40'}`}>Cliente</span>
                                        <span className={`transition-colors ${currentStep === 2 ? 'text-blue-400 font-medium' : 'text-white/40'}`}>Detalhes</span>
                                        <span className={`transition-colors ${currentStep === 3 ? 'text-blue-400 font-medium' : 'text-white/40'}`}>Serviços</span>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateProject} className="p-8">
                                    <AnimatePresence mode="wait">
                                        {/* Step 1: Cliente */}
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
                                                    <h3 className="text-2xl font-bold text-white mb-2">Selecione o Cliente</h3>
                                                    <p className="text-white/60">Para quem é este projeto?</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/60">Cliente</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="Selecione ou escreva o nome do cliente"
                                                            value={newProject.client}
                                                            onChange={e => {
                                                                setNewProject({
                                                                    ...newProject,
                                                                    client: e.target.value,
                                                                    title: `Website ${e.target.value}`
                                                                });
                                                                setShowClientDropdown(true);
                                                            }}
                                                            onFocus={() => setShowClientDropdown(true)}
                                                            onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                                            className="w-full bg-black border border-white/10 rounded-lg pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                                                        />
                                                        {showClientDropdown && filteredClients.length > 0 && (
                                                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                                                                {filteredClients.map((client) => (
                                                                    <button
                                                                        key={client.id}
                                                                        type="button"
                                                                        onClick={() => selectClient(client.id)}
                                                                        className="w-full text-left px-4 py-3 hover:bg-white/5 text-white/80 hover:text-white transition-colors flex items-center justify-between border-b border-white/5 last:border-0"
                                                                    >
                                                                        <span className="font-medium">{client.name}</span>
                                                                        {client.website && <span className="text-xs text-white/40">{client.website}</span>}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {newProject.client && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-sm text-white/40 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2"
                                                        >
                                                            ✓ Título do projeto: <span className="text-blue-400 font-medium">{newProject.title || `Website ${newProject.client}`}</span>
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 2: Detalhes */}
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
                                                    <h3 className="text-2xl font-bold text-white mb-2">Detalhes do Projeto</h3>
                                                    <p className="text-white/60">Configure as informações básicas</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/60">Data de Início</label>
                                                    <div className="relative">
                                                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="date"
                                                            value={newProject.startDate}
                                                            onChange={e => setNewProject({ ...newProject, startDate: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-lg pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/60">URL do Website</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="text"
                                                            placeholder="exemplo.pt"
                                                            value={newProject.websiteUrl}
                                                            onChange={e => setNewProject({ ...newProject, websiteUrl: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-lg pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm text-white/60">Status do Website</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProject({ ...newProject, websiteOnline: false })}
                                                            className={`py-4 px-6 rounded-xl text-base font-medium transition-all ${
                                                                newProject.websiteOnline === false
                                                                    ? 'bg-gray-500 text-white ring-2 ring-gray-500 ring-offset-2 ring-offset-[#0A0A0A]'
                                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                        >
                                                            Em Desenvolvimento
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProject({ ...newProject, websiteOnline: true })}
                                                            className={`py-4 px-6 rounded-xl text-base font-medium transition-all ${
                                                                newProject.websiteOnline === true
                                                                    ? 'bg-green-500 text-white ring-2 ring-green-500 ring-offset-2 ring-offset-[#0A0A0A]'
                                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                        >
                                                            Online
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 3: Serviços */}
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
                                                    <h3 className="text-2xl font-bold text-white mb-2">Serviços Complementares</h3>
                                                    <p className="text-white/60">Selecione os serviços adicionais incluídos</p>
                                                </div>

                                                {loadingServices ? (
                                                    <div className="text-center text-white/40 py-8">A carregar serviços...</div>
                                                ) : (() => {
                                                    const subServices = services.filter(s =>
                                                        !s.title.toLowerCase().includes('website') &&
                                                        !s.title.toLowerCase().includes('web site')
                                                    );

                                                    return subServices.length === 0 ? (
                                                        <div className="text-center text-white/40 py-8">Nenhum serviço complementar disponível</div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {subServices.map((service) => {
                                                                const isSelected = (newProject.addOns || []).includes(service.title);
                                                                return (
                                                                    <button
                                                                        key={service.id}
                                                                        type="button"
                                                                        onClick={() => toggleAddOn(service.title)}
                                                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                                            isSelected
                                                                                ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/50'
                                                                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                                                                                <Package className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-white/40'}`} />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className={`font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                                                    {service.title}
                                                                                </div>
                                                                                {service.description && (
                                                                                    <div className="text-xs text-white/40 mt-1 line-clamp-2">
                                                                                        {service.description}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {isSelected && (
                                                                                <motion.div
                                                                                    initial={{ scale: 0 }}
                                                                                    animate={{ scale: 1 }}
                                                                                    className="text-blue-400"
                                                                                >
                                                                                    ✓
                                                                                </motion.div>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()}
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
                                            ← Anterior
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
                                                disabled={isTransitioning || !newProject.client}
                                                className="px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Próximo →
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={!newProject.client}
                                                className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                            >
                                                ✓ Criar Projeto
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
