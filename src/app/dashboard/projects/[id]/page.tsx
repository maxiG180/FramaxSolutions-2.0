"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Globe, Calendar, Plus, Trash2, User, Mail, Phone, Package, CheckCircle2, Circle, ExternalLink, FileText, DollarSign, Lock, Server, Clock, MessageSquare, Paperclip, Download, Eye, Copy, MapPin, Building2, AlertTriangle, MoreVertical, Edit2, X, Check, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";

type ProjectStatus = "in-progress" | "completed";

interface Task {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
}

interface Note {
    id: number;
    content: string;
    createdAt: string;
}

interface ProjectFile {
    id: number;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
}

interface Invoice {
    id: number;
    number: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    date: string;
}

interface TechInfo {
    domain: string;
    hosting: string;
    registrar?: string;
    deploymentUrl?: string;
}

interface ClientInfo {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    address?: string;
    nif?: string;
    website?: string;
    company?: string;
}

interface ProjectType {
    id: string; // UUID
    title: string;
    client: string;
    status: ProjectStatus;
    websiteOnline?: boolean;
    websiteUrl?: string;
    startDate: string;
    deadline?: string;
    addOns?: string[];
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();

    console.log('🔍 ProjectDetailPage mounted with params:', params);
    const projectId = params.id as string; // UUID, not number
    console.log('🆔 Project ID (UUID):', projectId);

    const [project, setProject] = useState<ProjectType | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'files' | 'notes' | 'invoices' | 'tech'>('overview');

    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");

    const [files, setFiles] = useState<ProjectFile[]>([]);

    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const [techInfo, setTechInfo] = useState<TechInfo>({
        domain: "",
        hosting: "",
        registrar: "Namecheap",
        deploymentUrl: "",
    });

    const [clientInfo, setClientInfo] = useState<ClientInfo>({
        name: "",
        logo: "",
        email: "",
        phone: "",
        address: "",
        nif: "",
        website: "",
        company: "",
    });

    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch project data
    useEffect(() => {
        const fetchProjectData = async () => {
            console.log('🚀 Starting to fetch project data for ID:', projectId);
            try {
                setLoading(true);
                console.log('⏳ Loading set to true');
                const supabase = createClient();

                // Fetch project with client info
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select(`
                        *,
                        clients (
                            id,
                            name,
                            email,
                            phone,
                            website,
                            nif,
                            contact_person,
                            logo,
                            address
                        )
                    `)
                    .eq('id', projectId)
                    .single();

                if (projectError) {
                    console.error('❌ Project fetch error:', projectError.message);
                    console.error('Code:', projectError.code);
                    console.error('Details:', projectError.details);
                    console.error('Hint:', projectError.hint);
                    throw projectError;
                }

                console.log('✅ Project data fetched successfully');

                if (projectData) {
                    console.log('Project data:', projectData);
                    const client = projectData.clients;

                    setProject({
                        id: projectData.id,
                        title: projectData.title,
                        client: client?.name || 'Unknown Client',
                        status: projectData.status === 'Completed' ? 'completed' : 'in-progress',
                        websiteOnline: !!client?.website,
                        websiteUrl: client?.website || '',
                        startDate: projectData.start_date,
                        deadline: projectData.deadline,
                        addOns: [],
                    });

                    // Set client info
                    const clientName = client?.name || '';
                    // @ts-ignore - contact_person and logo may not exist yet in database
                    const contactPerson = client?.contact_person || '';
                    // @ts-ignore
                    const logoUrl = client?.logo || '';

                    console.log('=== CLIENT INFO DEBUG ===');
                    console.log('Client object:', client);
                    console.log('Client name:', clientName);
                    console.log('Contact person:', contactPerson);
                    console.log('Logo URL:', logoUrl);
                    console.log('========================');

                    setClientInfo({
                        name: clientName,
                        logo: logoUrl, // Only show logo if client has one uploaded
                        email: client?.email || '',
                        phone: client?.phone || '',
                        address: client?.address || '',
                        nif: client?.nif || '',
                        website: client?.website || '',
                        company: contactPerson, // Show contact person
                    });

                    // Set tech info based on website
                    if (client?.website) {
                        setTechInfo({
                            domain: client.website,
                            hosting: "Vercel (Free Plan)",
                            registrar: "Namecheap",
                        });
                    }

                    // Fetch tasks
                    const { data: tasksData } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('project_id', projectId)
                        .order('created_at', { ascending: true });

                    if (tasksData) {
                        setTasks(tasksData.map(task => ({
                            id: task.id,
                            title: task.title,
                            completed: task.status === 'Done',
                            createdAt: task.created_at.split('T')[0],
                        })));
                    }

                    // Fetch notes
                    const { data: notesData } = await supabase
                        .from('notes')
                        .select('*')
                        .eq('project_id', projectId)
                        .order('created_at', { ascending: false });

                    if (notesData) {
                        setNotes(notesData.map(note => ({
                            id: note.id,
                            content: note.content || note.title,
                            createdAt: note.created_at.split('T')[0],
                        })));
                    }

                    // Fetch documents (files)
                    const { data: documentsData } = await supabase
                        .from('documents')
                        .select('*')
                        .eq('project_id', projectId)
                        .order('created_at', { ascending: false });

                    if (documentsData) {
                        setFiles(documentsData.map(doc => ({
                            id: doc.id,
                            name: doc.name,
                            type: doc.type || 'File',
                            size: doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
                            uploadedAt: doc.created_at.split('T')[0],
                        })));
                    }

                    // Fetch invoices if they exist
                    console.log('📄 Fetching invoices for client_id:', projectData.client_id);
                    const { data: invoicesData, error: invoicesError } = await supabase
                        .from('invoices')
                        .select('*')
                        .eq('client_id', projectData.client_id)
                        .order('invoice_date', { ascending: false });

                    if (invoicesError) {
                        console.error('⚠️ Error fetching invoices (non-critical):', invoicesError.message);
                    }

                    if (invoicesData) {
                        console.log('✅ Invoices fetched:', invoicesData.length);
                        setInvoices(invoicesData.map(inv => ({
                            id: inv.id,
                            number: inv.invoice_number,
                            amount: parseFloat(inv.total),
                            status: inv.status === 'paid' ? 'paid' : inv.status === 'overdue' ? 'overdue' : 'pending',
                            date: inv.invoice_date,
                        })));
                    }
                }
            } catch (error) {
                console.error('❌ FATAL ERROR fetching project data:');
                console.error('Error object:', error);
                console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
                console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
                setProject(null);
            } finally {
                console.log('🏁 Finished loading project data, setting loading to false');
                setLoading(false);
            }
        };

        if (projectId) {
            console.log('✅ Project ID exists and is valid (UUID):', projectId);
            fetchProjectData();
        } else {
            console.warn('⚠️ No valid project ID found:', { projectId, paramsId: params.id });
            setLoading(false); // Important: stop loading if no ID
        }
    }, [projectId]);

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Hoje';
        if (diffInDays === 1) return 'Há 1 dia';
        if (diffInDays < 30) return `Há ${diffInDays} dias`;
        if (diffInDays < 60) return 'Há 1 mês';
        if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
        }
        if (diffInDays < 730) return 'Há 1 ano';
        const years = Math.floor(diffInDays / 365);
        return `Há ${years} anos`;
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    project_id: projectId,
                    title: newTaskTitle,
                    status: 'Todo',
                })
                .select()
                .single();

            if (error) throw error;

            const newTask: Task = {
                id: data.id,
                title: data.title,
                completed: false,
                createdAt: new Date().toISOString().split('T')[0],
            };

            setTasks([...tasks, newTask]);
            setNewTaskTitle("");
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const toggleTask = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            const supabase = createClient();
            const newStatus = task.completed ? 'Todo' : 'Done';

            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', taskId);

            if (error) throw error;

            setTasks(tasks.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
            ));
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;

            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('notes')
                .insert({
                    project_id: projectId,
                    title: 'Note',
                    content: newNote,
                })
                .select()
                .single();

            if (error) throw error;

            const note: Note = {
                id: data.id,
                content: newNote,
                createdAt: new Date().toISOString().split('T')[0],
            };

            setNotes([note, ...notes]);
            setNewNote("");
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const deleteNote = async (noteId: number) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);

            if (error) throw error;

            setNotes(notes.filter(note => note.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            router.push('/dashboard/projects');
        } catch (error) {
            console.error('Error deleting project:', error);
            setIsDeleting(false);
        }
    };

    const handleEditTitle = () => {
        setEditedTitle(project?.title || "");
        setIsEditingTitle(true);
        setShowDropdown(false);
    };

    const handleSaveTitle = async () => {
        if (editedTitle.trim() && project) {
            try {
                const supabase = createClient();
                const { error } = await supabase
                    .from('projects')
                    .update({ title: editedTitle })
                    .eq('id', projectId);

                if (error) throw error;

                setProject({ ...project, title: editedTitle });
                setIsEditingTitle(false);
            } catch (error) {
                console.error('Error updating project title:', error);
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditingTitle(false);
        setEditedTitle("");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showDropdown) setShowDropdown(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown]);

    if (loading) {
        return <Loader />;
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Projeto não encontrado</h1>
                    <button
                        onClick={() => router.push('/dashboard/projects')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Voltar aos Projetos
                    </button>
                </div>
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;

    const tabs = [
        { id: 'overview', label: 'Visão Geral', icon: Eye },
        { id: 'tasks', label: 'Tarefas', icon: CheckCircle2, badge: `${completedTasks}/${totalTasks}` },
        { id: 'files', label: 'Ficheiros', icon: Paperclip, badge: files.length },
        { id: 'notes', label: 'Notas', icon: MessageSquare, badge: notes.length },
        { id: 'invoices', label: 'Faturas', icon: DollarSign, badge: invoices.length },
        { id: 'tech', label: 'Técnico', icon: Server },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => router.push('/dashboard/projects')}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitle();
                                        if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                    onBlur={handleCancelEdit}
                                    className="text-3xl font-bold bg-white/5 border border-blue-500/50 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
                                    autoFocus
                                    style={{ minWidth: '300px', maxWidth: '600px' }}
                                />
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold">{project.title}</h1>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDropdown(!showDropdown);
                                            }}
                                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {showDropdown && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-50 py-1">
                                                <button
                                                    onClick={handleEditTitle}
                                                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Editar Título
                                                </button>
                                                <div className="h-px bg-white/10 my-1" />
                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar Projeto
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-white/60 text-sm">
                            <span>Iniciado {getRelativeTime(project.startDate)}</span>
                            {project.deadline && (
                                <>
                                    <span>•</span>
                                    <span>Deadline: {new Date(project.deadline).toLocaleDateString('pt-PT')}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                    project.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                    {project.status === 'completed' ? 'Completo' : 'Em Progresso'}
                </span>
            </div>

            {/* Tabs */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-1">
                <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.badge && (
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                                        activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Website Card */}
                                {project.websiteUrl && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                                        <Globe className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white">Website do Projeto</h3>
                                                </div>
                                                <a
                                                    href={`https://${project.websiteUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group text-lg font-medium"
                                                >
                                                    {project.websiteUrl}
                                                    <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                </a>
                                                {project.websiteOnline && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <div className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                        </div>
                                                        <span className="text-sm text-green-400 font-medium">Website Online</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Tasks */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Tarefas</h3>
                                                <p className="text-xs text-white/60">{completedTasks} de {totalTasks} concluídas</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('tasks')}
                                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Ver todas
                                        </button>
                                    </div>
                                    {tasks.length === 0 ? (
                                        <p className="text-white/40 text-sm text-center py-4">Nenhuma tarefa criada</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {tasks.slice(0, 5).map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                                                >
                                                    {task.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 text-white/40 shrink-0" />
                                                    )}
                                                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                            ))}
                                            {tasks.length > 5 && (
                                                <p className="text-xs text-white/40 text-center pt-2">
                                                    +{tasks.length - 5} tarefas adicionais
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Invoices */}
                                {invoices.length > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-500/20 rounded-lg">
                                                    <DollarSign className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Faturas</h3>
                                                    <p className="text-xs text-white/60">
                                                        {invoices.filter(inv => inv.status === 'paid').length} pagas, {invoices.filter(inv => inv.status === 'pending').length} pendentes
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('invoices')}
                                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Ver todas
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {invoices.slice(0, 3).map((invoice) => (
                                                <div
                                                    key={invoice.id}
                                                    className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-white font-medium">{invoice.number}</p>
                                                            <p className="text-xs text-white/60">{new Date(invoice.date).toLocaleDateString('pt-PT')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-white">{invoice.amount}€</p>
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            invoice.status === 'paid'
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : invoice.status === 'pending'
                                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                                : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {invoice.status === 'paid' ? 'Paga' : invoice.status === 'pending' ? 'Pendente' : 'Vencida'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {invoices.length > 3 && (
                                                <p className="text-xs text-white/40 text-center pt-2">
                                                    +{invoices.length - 3} faturas adicionais
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Files */}
                                {files.length > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                                    <Paperclip className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Ficheiros</h3>
                                                    <p className="text-xs text-white/60">{files.length} documentos</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('files')}
                                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Ver todos
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {files.slice(0, 3).map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                                                >
                                                    <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-white/60">{file.size} • {getRelativeTime(file.uploadedAt)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {files.length > 3 && (
                                                <p className="text-xs text-white/40 text-center pt-2">
                                                    +{files.length - 3} ficheiros adicionais
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Notes */}
                                {notes.length > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-500/20 rounded-lg">
                                                    <MessageSquare className="w-5 h-5 text-orange-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Notas Recentes</h3>
                                                    <p className="text-xs text-white/60">{notes.length} notas</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('notes')}
                                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Ver todas
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {notes.slice(0, 3).map((note) => (
                                                <div
                                                    key={note.id}
                                                    className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                                                >
                                                    <p className="text-sm text-white line-clamp-2">{note.content}</p>
                                                    <p className="text-xs text-white/40 mt-2">{getRelativeTime(note.createdAt)}</p>
                                                </div>
                                            ))}
                                            {notes.length > 3 && (
                                                <p className="text-xs text-white/40 text-center pt-2">
                                                    +{notes.length - 3} notas adicionais
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Tasks Tab */}
                        {activeTab === 'tasks' && (
                            <motion.div
                                key="tasks"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Tarefas</h2>
                                        <p className="text-sm text-white/60 mt-1">{completedTasks} de {totalTasks} concluídas</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddTask} className="mb-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            placeholder="Adicionar nova tarefa..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>

                                {tasks.length === 0 ? (
                                    <div className="text-center py-12 text-white/40">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhuma tarefa criada ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {tasks.map((task) => (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                    className="group flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                                                >
                                                    <button
                                                        onClick={() => toggleTask(task.id)}
                                                        className="shrink-0"
                                                    >
                                                        {task.completed ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-white/40 hover:text-white/60 transition-colors" />
                                                        )}
                                                    </button>
                                                    <span className={`flex-1 ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
                                                        {task.title}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteTask(task.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Files Tab */}
                        {activeTab === 'files' && (
                            <motion.div
                                key="files"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Ficheiros</h2>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Upload
                                    </button>
                                </div>

                                {files.length === 0 ? (
                                    <div className="text-center py-12 text-white/40">
                                        <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhum ficheiro adicionado ainda.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {files.map((file) => (
                                            <div
                                                key={file.id}
                                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                                        <FileText className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">{file.name}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                                            <span>{file.type}</span>
                                                            <span>•</span>
                                                            <span>{file.size}</span>
                                                        </div>
                                                        <p className="text-xs text-white/40 mt-1">{getRelativeTime(file.uploadedAt)}</p>
                                                    </div>
                                                    <button className="p-2 hover:bg-blue-500/20 rounded-lg text-white/40 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Notes Tab */}
                        {activeTab === 'notes' && (
                            <motion.div
                                key="notes"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6">Notas</h2>

                                <form onSubmit={handleAddNote} className="mb-6">
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Adicionar nova nota..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            Adicionar Nota
                                        </button>
                                    </div>
                                </form>

                                {notes.length === 0 ? (
                                    <div className="text-center py-12 text-white/40">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhuma nota adicionada ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {notes.map((note) => (
                                                <motion.div
                                                    key={note.id}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors group"
                                                >
                                                    <div className="flex justify-between items-start gap-3">
                                                        <p className="text-white flex-1">{note.content}</p>
                                                        <button
                                                            onClick={() => deleteNote(note.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-all shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-white/40 mt-2">{getRelativeTime(note.createdAt)}</p>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Invoices Tab */}
                        {activeTab === 'invoices' && (
                            <motion.div
                                key="invoices"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6">Faturas</h2>

                                {invoices.length === 0 ? (
                                    <div className="text-center py-12 text-white/40">
                                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhuma fatura associada ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {invoices.map((invoice) => (
                                            <div
                                                key={invoice.id}
                                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-blue-500/20 rounded-lg">
                                                            <FileText className="w-6 h-6 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{invoice.number}</p>
                                                            <p className="text-sm text-white/60 mt-1">{new Date(invoice.date).toLocaleDateString('pt-PT')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-white">{invoice.amount}€</p>
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                                            invoice.status === 'paid'
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : invoice.status === 'pending'
                                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                                : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {invoice.status === 'paid' ? 'Paga' : invoice.status === 'pending' ? 'Pendente' : 'Vencida'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Tech Tab */}
                        {activeTab === 'tech' && (
                            <motion.div
                                key="tech"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6">Informações Técnicas</h2>

                                <div className="space-y-4">
                                    {techInfo.domain && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                                                <Globe className="w-4 h-4" />
                                                <span>Domínio</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <a
                                                    href={`https://${techInfo.domain}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-white font-mono hover:text-blue-400 transition-colors"
                                                >
                                                    {techInfo.domain}
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(techInfo.domain)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {techInfo.registrar && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                                                <Globe className="w-4 h-4" />
                                                <span>Registrar</span>
                                            </div>
                                            <p className="text-white">{techInfo.registrar}</p>
                                        </div>
                                    )}

                                    {techInfo.hosting && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                                                <Server className="w-4 h-4" />
                                                <span>Hospedagem</span>
                                            </div>
                                            <p className="text-white">{techInfo.hosting}</p>
                                        </div>
                                    )}

                                    {techInfo.deploymentUrl && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                                                <ExternalLink className="w-4 h-4" />
                                                <span>URL de Deployment</span>
                                            </div>
                                            <a
                                                href={techInfo.deploymentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-400 hover:underline font-mono text-sm flex items-center gap-2 break-all"
                                            >
                                                {techInfo.deploymentUrl}
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </a>
                                        </div>
                                    )}

                                    {!techInfo.domain && !techInfo.hosting && (
                                        <div className="text-center py-12 text-white/40">
                                            <Server className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>Nenhuma informação técnica disponível.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                            {clientInfo.logo && (
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                                    <img
                                        src={clientInfo.logo}
                                        alt={clientInfo.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Failed to load image:', clientInfo.logo);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                        onLoad={() => console.log('Image loaded successfully:', clientInfo.logo)}
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white truncate">{clientInfo.name}</h3>
                                {clientInfo.company && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Briefcase className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                                        <p className="text-sm text-white/60 truncate">{clientInfo.company}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {clientInfo.email && (
                                <div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>Email</span>
                                    </div>
                                    <a href={`mailto:${clientInfo.email}`} className="text-white text-sm hover:text-blue-400 transition-colors break-all">
                                        {clientInfo.email}
                                    </a>
                                </div>
                            )}

                            {clientInfo.phone && (
                                <div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>Telefone</span>
                                    </div>
                                    <a href={`tel:${clientInfo.phone}`} className="text-white text-sm hover:text-blue-400 transition-colors">
                                        {clientInfo.phone}
                                    </a>
                                </div>
                            )}

                            {clientInfo.address && (
                                <div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Morada</span>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        {clientInfo.address}
                                    </p>
                                </div>
                            )}

                            {clientInfo.nif && (
                                <div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>NIF</span>
                                    </div>
                                    <p className="text-white/80 text-sm font-mono">
                                        {clientInfo.nif}
                                    </p>
                                </div>
                            )}

                            {clientInfo.website && (
                                <div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>Website</span>
                                    </div>
                                    <a
                                        href={`https://${clientInfo.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 text-sm hover:underline flex items-center gap-1"
                                    >
                                        {clientInfo.website}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Services */}
                    {project.addOns && project.addOns.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Serviços</h3>
                            <div className="space-y-2">
                                {project.addOns.map((addon, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80"
                                    >
                                        <Package className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span className="text-sm">{addon}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {mounted && showDeleteModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isDeleting && setShowDeleteModal(false)}
                        className="absolute inset-0 bg-black/90"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md bg-[#0A0A0A] border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden z-10"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Eliminar Projeto</h3>
                                    <p className="text-sm text-white/60 mt-1">Esta ação não pode ser revertida</p>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                                <p className="text-white/80 text-sm">
                                    Tens a certeza que queres eliminar o projeto <span className="font-bold text-white">{project.title}</span>?
                                </p>
                                <p className="text-white/60 text-xs mt-2">
                                    Todas as tarefas, notas e ficheiros associados serão permanentemente eliminados.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            A eliminar...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
}
