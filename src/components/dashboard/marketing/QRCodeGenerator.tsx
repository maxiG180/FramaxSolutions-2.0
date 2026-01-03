"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, Plus, Trash2, Edit2, ExternalLink, QrCode, X, Loader2, BarChart2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface QRCodeData {
    id: string;
    name: string;
    target_url: string;
    slug: string;
    user_id: string;
    scans_count: number;
    created_at: string;
}

export function QRCodeGenerator() {
    const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
    const [selectedQr, setSelectedQr] = useState<QRCodeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');

    // Form states
    const [name, setName] = useState("");
    const [targetUrl, setTargetUrl] = useState("");
    const [saving, setSaving] = useState(false);

    const downloadQrRef = useRef<HTMLCanvasElement>(null);
    const supabase = createClient();
    const baseUrl = "https://www.framaxsolutions.com"; // Production domain

    useEffect(() => {
        fetchQrCodes();
    }, []);

    const fetchQrCodes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("qr_codes")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            setQrCodes(data || []);
            if (data && data.length > 0 && !selectedQr) {
                setSelectedQr(data[0]);
            }
        } catch (error) {
            console.error("Error fetching QR codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch("/api/create-qr-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, targetUrl }),
            });

            if (!response.ok) throw new Error("Failed to create QR code");

            const newQr = await response.json();
            setQrCodes([newQr, ...qrCodes]);
            setSelectedQr(newQr);
            setView("list");
            setName("");
            setTargetUrl("");
        } catch (error) {
            console.error("Error creating QR code:", error);
            alert("Failed to create QR code");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQr) return;
        setSaving(true);
        try {
            const response = await fetch("/api/update-qr-code", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedQr.id, name, targetUrl }),
            });

            if (!response.ok) throw new Error("Failed to update QR code");

            const updatedQr = await response.json();
            setQrCodes(qrCodes.map(q => q.id === updatedQr.id ? updatedQr : q));
            setSelectedQr(updatedQr);
            setView("list");
        } catch (error) {
            console.error("Error updating QR code:", error);
            alert("Failed to update QR code");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this QR code? This action cannot be undone.")) return;

        try {
            const response = await fetch(`/api/delete-qr-code?id=${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete QR code");

            const newQrCodes = qrCodes.filter(q => q.id !== id);
            setQrCodes(newQrCodes);
            if (selectedQr?.id === id) {
                setSelectedQr(newQrCodes.length > 0 ? newQrCodes[0] : null);
            }
        } catch (error) {
            console.error("Error deleting QR code:", error);
            alert("Failed to delete QR code");
        }
    };

    const startEdit = (qr: QRCodeData) => {
        setName(qr.name);
        setTargetUrl(qr.target_url);
        setSelectedQr(qr);
        setView("edit");
    };

    const downloadQRCode = () => {
        const canvas = downloadQrRef.current;
        if (!canvas || !selectedQr) return;

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        // Sanitize name for filename (remove invalid chars but keep spaces for readability)
        const safeName = selectedQr.name.replace(/[/\\?%*:|"<>]/g, '-');
        downloadLink.download = `QR Code - ${safeName}.png`;
        downloadLink.href = pngUrl;
        downloadLink.click();
    };

    // Get the display URL for the selected QR code
    const getDisplayUrl = (qr: QRCodeData) => {
        return `${baseUrl}/qr/${qr.slug}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-white/40">Loading QR codes...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: List & Form */}
            <div className="lg:col-span-5 flex flex-col gap-4 h-full">

                {view === 'list' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-25rem)] min-h-[350px]">
                        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <h3 className="font-bold text-base">My QR Codes</h3>
                            <button
                                onClick={() => {
                                    setName("");
                                    setTargetUrl("");
                                    setView("create");
                                }}
                                className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                                title="Create New QR Code"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {qrCodes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                                    <QrCode className="w-10 h-10 mb-4 opacity-50" />
                                    <p className="text-sm">No QR codes yet.</p>
                                    <button
                                        onClick={() => setView("create")}
                                        className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium"
                                    >
                                        Create your first one
                                    </button>
                                </div>
                            ) : (
                                qrCodes.map(qr => (
                                    <div
                                        key={qr.id}
                                        onClick={() => setSelectedQr(qr)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedQr?.id === qr.id
                                            ? "bg-white/10 border-blue-500/50 shadow-lg"
                                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-sm text-white mb-0.5 truncate">{qr.name}</h4>
                                                <p className="text-[10px] text-white/40 truncate">{qr.target_url}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 bg-black/20 px-1.5 py-0.5 rounded shrink-0">
                                                <BarChart2 className="w-2.5 h-2.5" />
                                                {qr.scans_count}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {(view === 'create' || view === 'edit') && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 h-fit">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-lg font-bold">{view === 'create' ? "New QR Code" : "Edit QR Code"}</h3>
                            <button
                                onClick={() => setView("list")}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={view === 'create' ? handleCreate : handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Business Card"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Destination URL</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <p className="text-xs text-white/40">Scan will redirect here.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setView("list")}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {view === 'create' ? "Create" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Right Side: Preview & Details */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                {selectedQr ? (
                    <>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-full">
                            {/* Date Overlay */}
                            <div className="absolute top-4 left-4 text-[10px] font-mono text-white/40 bg-black/20 px-2 py-1 rounded border border-white/5">
                                {new Date(selectedQr.created_at).toLocaleDateString()}
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button
                                    onClick={() => startEdit(selectedQr)}
                                    className="p-1.5 bg-black/20 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5"
                                    title="Edit Details"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedQr.id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                                    title="Delete QR Code"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-2xl mb-6 w-full max-w-[200px] flex items-center justify-center">
                                <QRCodeSVG
                                    value={getDisplayUrl(selectedQr)}
                                    size={200}
                                    style={{ width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/logos/framax_icon.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 48,
                                        width: 48,
                                        excavate: true,
                                    }}
                                />
                            </div>

                            {/* Hidden high-res canvas for download */}
                            <div style={{ display: "none" }}>
                                <QRCodeCanvas
                                    ref={downloadQrRef}
                                    value={getDisplayUrl(selectedQr)}
                                    size={1000}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/logos/framax_icon.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 272,
                                        width: 272,
                                        excavate: true,
                                    }}
                                />
                            </div>

                            <div className="space-y-1 w-full max-w-md">
                                <h2 className="text-xl font-bold text-white">{selectedQr.name}</h2>
                                <a
                                    href={getDisplayUrl(selectedQr)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    {getDisplayUrl(selectedQr).replace('https://', '')}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                                <p className="text-xs text-white/40 mt-1">
                                    Redirects to: <span className="text-white/60">{selectedQr.target_url}</span>
                                </p>
                            </div>

                            {/* Stats & Download */}
                            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-xs">
                                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Scans</p>
                                    <p className="text-xl font-bold text-white">{selectedQr.scans_count}</p>
                                </div>
                                <button
                                    onClick={downloadQRCode}
                                    className="bg-white text-black font-bold p-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-xs">Download PNG</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-12 text-white/40">
                        <QrCode className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-white/60 mb-2">No QR Code Selected</h3>
                        <p className="max-w-xs mx-auto">Select a QR code from the list or create a new one to see details and download options.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
