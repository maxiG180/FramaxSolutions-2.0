"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Edit3, Share, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotes, createNote, updateNote, deleteNote } from "./actions";
import { formatDistanceToNow } from "date-fns";

type Note = {
    id: number;
    title: string;
    content: string;
    created_at: string;
    created_by: string;
};

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        const data = await getNotes();
        setNotes(data);
        if (data.length > 0 && !selectedNoteId) {
            setSelectedNoteId(data[0].id);
        }
        setLoading(false);
    };

    const handleCreateNote = async () => {
        const { data, error } = await createNote();
        if (data) {
            setNotes([data, ...notes]);
            setSelectedNoteId(data.id);
        }
    };

    const handleDeleteNote = async (id: number) => {
        const { success } = await deleteNote(id);
        if (success) {
            const newNotes = notes.filter(n => n.id !== id);
            setNotes(newNotes);
            if (selectedNoteId === id) {
                setSelectedNoteId(newNotes[0]?.id || null);
            }
        }
    };

    // Debounce update
    const debouncedUpdate = useCallback((id: number, updates: { title?: string; content?: string }) => {
        setSaving(true);
        const timeoutId = setTimeout(async () => {
            await updateNote(id, updates);
            setSaving(false);
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, []);

    const handleUpdateNote = (id: number, updates: { title?: string; content?: string }) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
        debouncedUpdate(id, updates);
    };

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                {/* Header */}
                <div className="p-4 border-b border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-yellow-400" /> Notes
                        </h2>
                        <button
                            onClick={handleCreateNote}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-yellow-400 hover:text-yellow-300"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400/50 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredNotes.map((note) => (
                        <button
                            key={note.id}
                            onClick={() => setSelectedNoteId(note.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all group ${selectedNoteId === note.id
                                ? "bg-yellow-400/10 border border-yellow-400/20"
                                : "hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <div className={`font-bold mb-1 truncate ${selectedNoteId === note.id ? "text-yellow-400" : "text-white"}`}>
                                {note.title || "Untitled Note"}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="truncate">{(note.content || "").substring(0, 20)}...</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl relative">
                {selectedNote ? (
                    <>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <span className="text-xs font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
                                {formatDistanceToNow(new Date(selectedNote.created_at), { addSuffix: true })} • {(selectedNote.content || "").length} chars
                                {saving && <span className="text-yellow-400 animate-pulse">Saving...</span>}
                            </span>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                                    <Share className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteNote(selectedNote.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <input
                                type="text"
                                value={selectedNote.title}
                                onChange={(e) => handleUpdateNote(selectedNote.id, { title: e.target.value })}
                                className="w-full bg-transparent text-4xl font-bold text-white mb-6 focus:outline-none placeholder:text-white/20"
                                placeholder="Title"
                            />
                            <textarea
                                value={selectedNote.content || ""}
                                onChange={(e) => handleUpdateNote(selectedNote.id, { content: e.target.value })}
                                className="w-full h-full bg-transparent text-lg text-white/80 leading-relaxed focus:outline-none resize-none placeholder:text-white/20 font-sans"
                                placeholder="Start typing..."
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-white/20">
                        Select a note to view
                    </div>
                )}
            </div>
        </div>
    );
}
