"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Folder, FileText, Image as ImageIcon, MoreVertical, Download, Upload, Grid, List, File, Plus, Clock, Star, ChevronRight, ArrowLeft, Trash2, X, Eye, Video, Music, FileCode, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { getFolders, getFiles, createFolder, deleteFile, createFileRecord, deleteFolder, type Folder as FolderType, type File as FileType } from './actions';

const FOLDER_COLORS = [
    { color: "text-blue-400", bg: "bg-blue-400/10" },
    { color: "text-purple-400", bg: "bg-purple-400/10" },
    { color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { color: "text-orange-400", bg: "bg-orange-400/10" },
    { color: "text-pink-400", bg: "bg-pink-400/10" },
    { color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { color: "text-red-400", bg: "bg-red-400/10" },
    { color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { color: "text-lime-400", bg: "bg-lime-400/10" },
    { color: "text-teal-400", bg: "bg-teal-400/10" },
    { color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { color: "text-gray-400", bg: "bg-gray-400/10" },
];

export default function DocsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentFolder, setCurrentFolder] = useState<{ id: string; name: string } | null>(null);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [files, setFiles] = useState<FileType[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [activeFolderMenu, setActiveFolderMenu] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [textPreviewContent, setTextPreviewContent] = useState<string | null>(null);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderData, setNewFolderData] = useState({ name: "", colorIndex: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    useEffect(() => {
        if (selectedFile?.type === 'code' && selectedFile.url) {
            setTextPreviewContent('Loading...');
            fetch(selectedFile.url)
                .then(res => res.text())
                .then(text => setTextPreviewContent(text))
                .catch(err => setTextPreviewContent('Error loading preview: ' + err.message));
        } else {
            setTextPreviewContent(null);
        }
    }, [selectedFile]);

    const loadData = async () => {
        setIsLoadingData(true);
        const [foldersResult, filesResult] = await Promise.all([
            getFolders(),
            getFiles()
        ]);

        if (foldersResult.folders) {
            setFolders(foldersResult.folders);
        }
        if (filesResult.files) {
            setFiles(filesResult.files);
        }
        setIsLoadingData(false);
    };

    const handleCreateFolder = () => {
        setNewFolderData({ name: "", colorIndex: 0 });
        setIsCreateFolderOpen(true);
    };

    const submitCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderData.name) return;

        const colorScheme = FOLDER_COLORS[newFolderData.colorIndex];
        const result = await createFolder(newFolderData.name, colorScheme.color, colorScheme.bg);

        if (result.folder) {
            setFolders([result.folder, ...folders]);
            setIsCreateFolderOpen(false);
        } else {
            alert('Error creating folder: ' + result.error);
        }
    };

    const handleDeleteFolder = async (e: React.MouseEvent, folderId: string, folderName: string) => {
        e.stopPropagation();
        if (!confirm(`Delete folder "${folderName}" and all its contents?`)) return;

        const result = await deleteFolder(folderId);
        if (!result.error) {
            setFolders(folders.filter(f => f.id !== folderId));
            if (currentFolder?.id === folderId) {
                setCurrentFolder(null);
            }
        } else {
            alert('Error deleting folder: ' + result.error);
        }
        setActiveFolderMenu(null);
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await processFileUpload(files[0]);
        }
    };

    const processFileUpload = async (file: File) => {

        try {
            // Optimistic update
            const tempId = 'temp-' + Date.now();
            const tempFile: FileType = {
                id: tempId,
                name: file.name,
                type: getFileType(file.name),
                size: (file.size / 1024).toFixed(1) + ' KB',
                date: 'Uploading...',
                folder: currentFolder?.name || 'Unsorted',
                folder_id: currentFolder?.id || null,
                url: '',
                storage_path: ''
            };
            setFiles(prev => [tempFile, ...prev]);

            // 1. Upload to Supabase Storage (Client-side)
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const timestamp = Date.now();
            const folderId = currentFolder?.id || null;
            const storagePath = `${user.id}/${folderId || 'unsorted'}/${timestamp}_${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(storagePath, file);

            if (uploadError) throw uploadError;

            // 2. Create DB Record (Server Action)
            const result = await createFileRecord({
                name: file.name,
                type: getFileType(file.name),
                size: file.size,
                storage_path: storagePath,
                folder_id: folderId
            });

            if (result.file) {
                // Replace temp file with real one
                setFiles(prev => [result.file!, ...prev.filter(f => f.id !== tempId)]);

                // Update folder item count
                if (currentFolder) {
                    setFolders(folders.map(f =>
                        f.id === currentFolder.id
                            ? { ...f, items: f.items + 1 }
                            : f
                    ));
                }

                // Background refresh to ensure consistency
                await loadData();
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            console.error('Upload failed:', err);
            // Remove temp file on error
            setFiles(prev => prev.filter(f => !f.id.startsWith('temp-')));
            alert('Error uploading file: ' + (err.message || 'Unknown error'));
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await processFileUpload(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteFile = async (e: React.MouseEvent, file: FileType) => {
        e.stopPropagation();
        if (file.id.startsWith('temp-')) return; // Prevent deleting uploading files
        if (!confirm(`Delete "${file.name}"?`)) return;

        const result = await deleteFile(file.id, file.storage_path);

        if (!result.error) {
            setFiles(files.filter(f => f.id !== file.id));

            // Update folder item count
            if (file.folder_id) {
                setFolders(folders.map(f =>
                    f.id === file.folder_id
                        ? { ...f, items: Math.max(0, f.items - 1) }
                        : f
                ));
            }
        } else {
            alert('Error deleting file: ' + result.error);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case "image": return <ImageIcon className="w-8 h-8 text-purple-400" />;
            case "video": return <Video className="w-8 h-8 text-pink-400" />;
            case "audio": return <Music className="w-8 h-8 text-cyan-400" />;
            case "pdf": return <FileText className="w-8 h-8 text-red-400" />;
            case "sheet": return <FileText className="w-8 h-8 text-green-400" />;
            case "zip": return <Folder className="w-8 h-8 text-yellow-400" />;
            case "code": return <FileCode className="w-8 h-8 text-blue-400" />;
            case "doc": return <FileText className="w-8 h-8 text-blue-400" />;
            default: return <File className="w-8 h-8 text-gray-400" />;
        }
    };

    const displayedFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = currentFolder
            ? file.folder_id === currentFolder.id
            : !file.folder_id; // Only show root files (no folder_id) when in root
        return matchesSearch && matchesFolder;
    });

    if (isLoadingData) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div
            className="space-y-6 relative"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 border-dashed rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-bounce" />
                        <p className="text-xl font-bold text-blue-100">Drop files to upload</p>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-white/40 mb-1">
                        <button
                            onClick={() => setCurrentFolder(null)}
                            className="hover:text-white transition-colors"
                        >
                            Documents
                        </button>
                        {currentFolder && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-white">{currentFolder.name}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {currentFolder?.name || "All Documents"}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    {!currentFolder && (
                        <button
                            onClick={handleCreateFolder}
                            className="bg-white/5 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/10"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Folder</span>
                        </button>
                    )}
                    <button
                        onClick={handleUpload}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                    </button>
                </div>
            </div>

            {/* Back Button (Mobile/Context) */}
            {currentFolder && (
                <button
                    onClick={() => setCurrentFolder(null)}
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Folders
                </button>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 sticky top-0 bg-neutral-950/80 backdrop-blur-xl py-4 z-10">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                    />
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white")}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-2 rounded-md transition-all", viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white")}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Folders Grid (Only show at root) */}
            {!currentFolder && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Folder className="w-3 h-3" /> Folders
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {displayedFolders.map((folder) => (
                            <motion.div
                                key={folder.id}
                                onClick={() => setCurrentFolder({ id: folder.id, name: folder.name })}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all cursor-pointer group hover:border-white/20 relative"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={cn("p-2 rounded-lg", folder.bg)}>
                                        <Folder className={cn("w-5 h-5", folder.color)} />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveFolderMenu(activeFolderMenu === folder.id ? null : folder.id);
                                            }}
                                            className={cn(
                                                "text-white/20 hover:text-white transition-opacity p-1 hover:bg-white/10 rounded",
                                                activeFolderMenu === folder.id ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-100"
                                            )}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {activeFolderMenu === folder.id && (
                                            <div className="absolute top-full right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
                                                <button
                                                    onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="font-medium truncate">{folder.name}</div>
                                <div className="text-xs text-white/40 mt-1">{folder.items} items</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Files */}
            <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {currentFolder ? "Files" : "Recent Files"}
                </h3>

                {filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-2xl">
                        <p>No files found in this folder.</p>
                        <button onClick={handleUpload} className="text-blue-400 hover:underline mt-2 text-sm">Upload a file</button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {viewMode === "grid" ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
                            >
                                {filteredFiles.map((file) => (
                                    <motion.div
                                        key={file.id}
                                        onClick={() => !file.id.startsWith('temp-') && setSelectedFile(file)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            "bg-white/5 border border-white/10 rounded-xl p-4 transition-all flex flex-col aspect-square relative overflow-hidden",
                                            file.id.startsWith('temp-') ? "opacity-70 cursor-wait" : "hover:bg-white/[0.07] cursor-pointer group hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                            <button
                                                onClick={(e) => handleDeleteFile(e, file)}
                                                className="p-1.5 hover:bg-red-500/80 rounded-lg text-white backdrop-blur-sm transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            {file.id.startsWith('temp-') ? (
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            ) : (
                                                getFileIcon(file.type)
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <div className="font-medium truncate text-sm mb-1 text-white/90">{file.name}</div>
                                            <div className="flex items-center justify-between text-[10px] text-white/40 font-medium uppercase tracking-wider">
                                                <span>{file.size}</span>
                                                <span>{file.date}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                                        <tr>
                                            <th className="p-4 font-medium">Name</th>
                                            <th className="p-4 font-medium hidden sm:table-cell">Size</th>
                                            <th className="p-4 font-medium hidden md:table-cell">Date</th>
                                            <th className="p-4 font-medium hidden lg:table-cell">Folder</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredFiles.map((file, i) => (
                                            <motion.tr
                                                key={file.id}
                                                onClick={() => !file.id.startsWith('temp-') && setSelectedFile(file)}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={cn(
                                                    "transition-colors",
                                                    file.id.startsWith('temp-') ? "opacity-70 cursor-wait" : "hover:bg-white/5 cursor-pointer group"
                                                )}
                                            >
                                                <td className="p-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                                        {file.id.startsWith('temp-') ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                        ) : (
                                                            getFileIcon(file.type)
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-sm text-white/90">{file.name}</span>
                                                </td>
                                                <td className="p-4 text-white/40 font-mono text-xs hidden sm:table-cell">{file.size}</td>
                                                <td className="p-4 text-white/40 text-sm hidden md:table-cell">{file.date}</td>
                                                <td className="p-4 text-white/40 text-sm hidden lg:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <Folder className="w-3 h-3" /> {file.folder}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {!file.id.startsWith('temp-') && (
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => handleDeleteFile(e, file)}
                                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-white/60 hover:text-red-400"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Create Folder Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isCreateFolderOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsCreateFolderOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Create New Folder</h3>
                                    <button
                                        onClick={() => setIsCreateFolderOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={submitCreateFolder} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Folder Name</label>
                                        <input
                                            type="text"
                                            value={newFolderData.name}
                                            onChange={(e) => setNewFolderData({ ...newFolderData, name: e.target.value })}
                                            placeholder="e.g., Marketing Assets"
                                            autoFocus
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Color Code</label>
                                        <div className="relative overflow-hidden px-2">
                                            <motion.div
                                                drag="x"
                                                dragConstraints={{ left: -400, right: 0 }}
                                                className="flex gap-3 cursor-grab active:cursor-grabbing py-2"
                                            >
                                                {FOLDER_COLORS.map((theme, index) => (
                                                    <motion.button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => setNewFolderData({ ...newFolderData, colorIndex: index })}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={cn(
                                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 flex-shrink-0",
                                                            newFolderData.colorIndex === index ? "border-white scale-110" : "border-transparent",
                                                            theme.bg
                                                        )}
                                                    >
                                                        <div className={cn("w-5 h-5 rounded-full", theme.color.replace('text-', 'bg-'))} />
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!newFolderData.name}
                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create Folder
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* File Preview Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {selectedFile && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedFile(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] z-10"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            {getFileIcon(selectedFile.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{selectedFile.name}</h3>
                                            <p className="text-xs text-white/40">{selectedFile.size} • {selectedFile.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className={cn(
                                    "flex-1 overflow-hidden bg-black/50 flex flex-col",
                                    selectedFile.type === "pdf" && selectedFile.url ? "" : "p-8 items-center justify-center overflow-y-auto"
                                )}>
                                    {selectedFile.type === "image" ? (
                                        <div className="relative w-full h-full min-h-[400px] bg-white/5 rounded-xl flex items-center justify-center border border-white/10 border-dashed overflow-hidden">
                                            {selectedFile.url ? (
                                                <img src={selectedFile.url} alt={selectedFile.name} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                                    <p className="text-white/40">Image Preview</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedFile.type === "video" ? (
                                        <div className="relative w-full h-full min-h-[400px] bg-black rounded-xl flex items-center justify-center overflow-hidden">
                                            {selectedFile.url ? (
                                                <video controls className="max-w-full max-h-full" src={selectedFile.url} />
                                            ) : (
                                                <div className="text-center">
                                                    <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                                    <p className="text-white/40">Video Preview</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedFile.type === "code" ? (
                                        <div className="w-full h-full bg-[#1e1e1e] p-6 overflow-auto rounded-xl shadow-inner">
                                            <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                                                {textPreviewContent || (
                                                    <div className="flex items-center gap-2 text-white/40">
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading content...
                                                    </div>
                                                )}
                                            </pre>
                                        </div>
                                    ) : selectedFile.type === "pdf" ? (
                                        <div className="w-full h-full rounded-xl shadow-lg overflow-hidden bg-transparent">
                                            {selectedFile.url ? (
                                                <iframe src={selectedFile.url} className="w-full h-full border-none" title={selectedFile.name} />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-white/5">
                                                    <p className="text-white/40">PDF Preview Unavailable</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20">
                                            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                {getFileIcon(selectedFile.type)}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 text-white">No Preview Available</h3>
                                            <p className="text-white/40 max-w-xs mx-auto mb-8">
                                                This file type cannot be previewed directly in the browser. Please download it to view the contents.
                                            </p>
                                            <a
                                                href={selectedFile.url}
                                                download={selectedFile.name}
                                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

function getFileType(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image'
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) return 'video'
    if (['mp3', 'wav', 'm4a'].includes(ext || '')) return 'audio'
    if (['pdf'].includes(ext || '')) return 'pdf'
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'sheet'
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'zip'
    if (['doc', 'docx'].includes(ext || '')) return 'doc'
    if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'css', 'html', 'xml', 'yml', 'yaml'].includes(ext || '')) return 'code'
    return 'file'
}
