"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, RefreshCw, ExternalLink, Save, Loader2, History, MousePointer2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function QRCodeGenerator() {
    const [url, setUrl] = useState("https://www.framaxsolutions.com");
    const [slug, setSlug] = useState("");
    const [fgColor, setFgColor] = useState("#000000");
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [myQrs, setMyQrs] = useState<any[]>([]);
    const [isDynamic, setIsDynamic] = useState(false);
    const qrRef = useRef<SVGSVGElement>(null);
    const supabase = createClient();

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://framaxsolutions.com';

    useEffect(() => {
        fetchQRCodes();
    }, []);

    const fetchQRCodes = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('qr_codes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (data) setMyQrs(data);
        }
        setLoading(false);
    };

    const downloadQRCode = () => {
        const svg = qrRef.current;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = 1000;
            canvas.height = 1000;
            if (ctx) {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, 1000, 1000);
                ctx.drawImage(img, 0, 0, 1000, 1000);
            }
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `qrcode-framax-${Date.now()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveDynamicQR = async () => {
        if (!slug || !url) return;
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setSaving(false);
            return;
        }

        const { error } = await supabase
            .from('qr_codes')
            .insert({
                slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                target_url: url,
                user_id: user.id
            });

        if (error) {
            console.error("Error saving QR:", error);
            if (error.code === '23505') alert("Este slug já está em uso!");
        } else {
            setSlug("");
            setIsDynamic(false);
            fetchQRCodes();
        }
        setSaving(false);
    };

    const displayUrl = isDynamic && slug
        ? `${baseUrl}/qr/${slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`
        : url;

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Controls */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 flex-1">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <h3 className="text-lg font-bold">Configuração</h3>
                            <button
                                onClick={() => setIsDynamic(!isDynamic)}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${isDynamic ? "bg-blue-500 text-white" : "bg-white/10 text-white/40"
                                    }`}
                            >
                                {isDynamic ? "Link Dinâmico (Trackable)" : "Link Direto (Estático)"}
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40">URL de Destino</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ExternalLink className="h-4 w-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono text-[13px]"
                                        placeholder="https://framaxsolutions.com"
                                    />
                                </div>
                            </div>

                            {isDynamic && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Slug Identificador (ex: cartao-quico)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/20 text-xs font-mono">
                                            /qr/
                                        </div>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono text-[13px]"
                                            placeholder="meu-qr"
                                        />
                                    </div>
                                    <p className="text-[10px] text-white/30 italic">Pode mudar o destino deste QR a qualquer momento se for dinâmico.</p>
                                </div>
                            )}

                            <div className="pt-2 space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40">Cor do QR Code</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center gap-3 p-2.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-all">
                                        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/10">
                                            <input
                                                type="color"
                                                value={fgColor}
                                                onChange={(e) => setFgColor(e.target.value)}
                                                className="absolute inset-[-10px] w-[50px] h-[50px] cursor-pointer shadow-inner"
                                            />
                                        </div>
                                        <span className="text-xs text-white/60 font-mono tracking-wider">{fgColor.toUpperCase()}</span>
                                    </div>
                                    <button
                                        onClick={() => setFgColor("#000000")}
                                        className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
                                        title="Reset Cor"
                                    >
                                        <RefreshCw className="w-4 h-4 text-white/40" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {isDynamic ? (
                            <button
                                onClick={saveDynamicQR}
                                disabled={saving || !slug}
                                className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Criar QR Dinâmico
                            </button>
                        ) : (
                            <button
                                onClick={downloadQRCode}
                                className="flex-1 bg-white text-black font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-xl active:scale-[0.98]"
                            >
                                <Download className="w-5 h-5" />
                                Download PNG
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[450px]">
                    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative group">
                        <div className="absolute inset-[-20px] bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative">
                            <QRCodeSVG
                                ref={qrRef}
                                value={displayUrl}
                                size={220}
                                level="H"
                                fgColor={fgColor}
                                includeMargin={false}
                                imageSettings={{
                                    src: "/logos/framax_icon.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 50,
                                    width: 50,
                                    excavate: true,
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-10 space-y-3 relative z-10 w-full max-w-[280px]">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60">Digital Assets</span>
                            <h4 className="text-xl font-bold text-white tracking-tight">
                                {isDynamic ? "Dynamic Link" : "QR Business Card"}
                            </h4>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="flex items-center justify-center gap-2 text-white/30 truncate">
                            <span className="text-[11px] font-mono truncate">{displayUrl.replace(/^https?:\/\//, '')}</span>
                            <button onClick={() => copyToClipboard(displayUrl)} className="hover:text-white transition-colors">
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active QRs Table */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xl font-bold">QR Codes Ativos</h3>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">QR Code</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Destino Actual</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Acessos</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Acções</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-white/20 italic">A carregar os seus códigos...</td>
                                    </tr>
                                ) : myQrs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-white/20 italic">Ainda não criou códigos dinâmicos.</td>
                                    </tr>
                                ) : (
                                    myQrs.map((qr) => (
                                        <tr key={qr.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg">
                                                        <QRCodeSVG value={`${baseUrl}/qr/${qr.slug}`} size={32} fgColor="#000" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">/qr/{qr.slug}</div>
                                                        <div className="text-[10px] text-white/40">{new Date(qr.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-[200px] truncate text-xs text-white/60 font-mono">
                                                    {qr.target_url}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="flex items-center gap-1.5 text-blue-400 font-black text-lg">
                                                        <MousePointer2 className="w-4 h-4" />
                                                        {qr.scans_count || 0}
                                                    </div>
                                                    <span className="text-[10px] text-white/30 uppercase tracking-tighter">scans</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(`${baseUrl}/qr/${qr.slug}`)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                                                        title="Copiar Link"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setUrl(qr.target_url);
                                                            setSlug(qr.slug);
                                                            setIsDynamic(true);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                                                        title="Editar"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
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
            </div>
        </div>
    );
}

