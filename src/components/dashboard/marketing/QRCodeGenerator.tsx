"use client";

import { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, RefreshCw } from "lucide-react";

export function QRCodeGenerator() {
    const [fgColor, setFgColor] = useState("#000000");
    const [copied, setCopied] = useState(false);
    const downloadQrRef = useRef<HTMLCanvasElement>(null);

    // Always use production domain for the QR code content so it works when printed/shared
    const qrUrl = "https://www.framaxsolutions.com/qr-code";

    const downloadQRCode = () => {
        const canvas = downloadQrRef.current;
        if (!canvas) return;

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qrcode-framax-${Date.now()}.png`;
        downloadLink.href = pngUrl;
        downloadLink.click();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Controls */}
            <div className="flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    <div className="pb-2 border-b border-white/5">
                        <h3 className="text-lg font-bold">Settings</h3>
                        <p className="text-xs text-white/40 mt-1">Create QR codes for your business cards</p>
                    </div>

                    <div className="space-y-5">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <p className="text-sm text-blue-400 font-medium">
                                📊 This QR code is tracked automatically
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                                View scan analytics in the Analytics page
                            </p>
                        </div>

                        <div className="pt-2 space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-white/40">QR Code Color</label>
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
                                    title="Reset Color"
                                >
                                    <RefreshCw className="w-4 h-4 text-white/40" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={downloadQRCode}
                    className="w-full bg-white text-black font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-xl active:scale-[0.98]"
                >
                    <Download className="w-5 h-5" />
                    Download PNG
                </button>
            </div>

            {/* Preview Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-6 rounded-xl">
                    <QRCodeSVG
                        value={qrUrl}
                        size={220}
                        level="H"
                        fgColor={fgColor}
                        includeMargin={false}
                        imageSettings={{
                            src: "/logos/framax_icon.png",
                            x: undefined,
                            y: undefined,
                            height: 60,
                            width: 60,
                            excavate: true,
                        }}
                    />
                </div>

                {/* Hidden high-res canvas for download */}
                <div style={{ display: "none" }}>
                    <QRCodeCanvas
                        ref={downloadQrRef}
                        value={qrUrl}
                        size={1000}
                        level="H"
                        fgColor={fgColor}
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

                <div className="mt-6 space-y-2 w-full max-w-[280px]">
                    <h4 className="text-base font-semibold text-white">
                        Framax Solutions QR Code
                    </h4>
                    <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                        <span className="text-xs font-mono">framaxsolutions.com/qr-code</span>
                    </div>
                    <p className="text-xs text-white/30 italic">
                        Scans are tracked automatically
                    </p>
                </div>
            </div>
        </div>
    );
}
