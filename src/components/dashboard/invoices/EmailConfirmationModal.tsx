"use client";

import { useState, useEffect } from "react";
import { X, Send, Mail, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface EmailConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (emailData: { email: string }) => void;
    defaultEmail: string;
    clientName: string;
    quoteNumber?: string;
    loading?: boolean;
}

export function EmailConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    defaultEmail,
    clientName,
    quoteNumber,
    loading = false
}: EmailConfirmationModalProps) {
    const { t } = useLanguage();
    const [email, setEmail] = useState(defaultEmail);
    const [emailError, setEmailError] = useState("");
    const [showFullPreview, setShowFullPreview] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleConfirm = () => {
        setEmailError("");

        if (!email.trim()) {
            setEmailError(t.emailConfirmation?.emailRequired || "Email é obrigatório");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError(t.emailConfirmation?.invalidEmail || "Email inválido");
            return;
        }

        onConfirm({ email });
    };

    // Reset email when modal opens or defaultEmail changes
    useEffect(() => {
        if (isOpen) {
            setEmail(defaultEmail);
            setEmailError("");
        }
    }, [isOpen, defaultEmail]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                        className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Send className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {t.emailConfirmation?.title || "Confirmar Envio por Email"}
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        {t.emailConfirmation?.subtitle || "Reveja os detalhes antes de enviar"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Error Display */}
                            {emailError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {emailError}
                                </div>
                            )}

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {t.emailConfirmation?.emailLabel || "Email do Destinatário"}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError("");
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                    placeholder={t.emailConfirmation?.emailPlaceholder || "cliente@exemplo.com"}
                                    disabled={loading}
                                />
                            </div>

                            {/* Email Preview */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {t.emailConfirmation?.previewLabel || "Preview do Email"}
                                    </label>
                                    <button
                                        onClick={() => setShowFullPreview(!showFullPreview)}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                    >
                                        {showFullPreview ? (
                                            <>
                                                <EyeOff className="w-3 h-3" />
                                                {t.emailConfirmation?.hidePreview || "Ocultar Preview"}
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-3 h-3" />
                                                {t.emailConfirmation?.showFullPreview || "Ver Preview Completo"}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {showFullPreview ? (
                                    <div className="bg-white border border-white/10 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                        {/* Email HTML Preview - simulating the actual email */}
                                        <div className="p-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif', backgroundColor: '#fafafa' }}>
                                            <div className="max-w-[560px] mx-auto bg-white">
                                                {/* Header */}
                                                <div className="p-8 pb-6">
                                                    <div className="text-xs text-gray-500 mb-6">
                                                        <p className="font-bold text-gray-900">Framax Solutions</p>
                                                        <p>contact@framaxsolutions.com</p>
                                                        <p>framaxsolutions.com</p>
                                                    </div>
                                                    <h1 className="text-3xl font-light text-blue-600 mb-0" style={{ letterSpacing: '-0.3px' }}>
                                                        ORÇAMENTO {quoteNumber || 'XXX'}
                                                    </h1>
                                                </div>

                                                {/* Content */}
                                                <div className="px-8 pb-8">
                                                    <p className="mb-4 text-base text-gray-900">
                                                        Olá {clientName},
                                                    </p>

                                                    <p className="mb-6 text-base text-gray-600">
                                                        Segue em anexo o orçamento solicitado. Ficamos à disposição para qualquer esclarecimento.
                                                    </p>

                                                    {/* Document Info Block */}
                                                    <div className="mb-6 border-l-3 border-blue-600 bg-gray-50 p-5" style={{ borderLeftWidth: '3px', borderLeftColor: '#2563eb' }}>
                                                        <div className="mb-3">
                                                            <p className="text-xs text-gray-500 mb-1" style={{ letterSpacing: '0.8px' }}>DOCUMENTO</p>
                                                            <p className="text-sm text-blue-600 font-medium">{quoteNumber || 'ORC-2026-XXX'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1" style={{ letterSpacing: '0.8px' }}>VÁLIDO ATÉ</p>
                                                            <p className="text-sm text-blue-600 font-medium">
                                                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="mb-4 text-sm text-gray-600">
                                                        O documento encontra-se em anexo neste email.
                                                    </p>

                                                    <p className="mb-6 text-sm text-gray-500 italic">
                                                        P.S. Para aceitar o orçamento ou esclarecer qualquer dúvida, é só responder a este email.
                                                    </p>

                                                    {/* Separator */}
                                                    <div className="h-px bg-gray-200 my-8"></div>

                                                    {/* Signature */}
                                                    <p className="text-sm text-blue-600 font-medium mb-1">
                                                        Framax Solutions
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        <a href="https://framaxsolutions.com" className="text-blue-600 no-underline">framaxsolutions.com</a>
                                                    </p>
                                                </div>

                                                {/* Footer */}
                                                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                                                    <p className="text-xs text-gray-400 m-0">© 2026 Framax Solutions</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/70">
                                        <p className="mb-3">Olá {clientName},</p>
                                        <p className="mb-3">
                                            Segue em anexo o orçamento solicitado. Ficamos à disposição para qualquer esclarecimento.
                                        </p>
                                        <p className="text-white/50 text-xs italic">
                                            P.S. Para aceitar o orçamento ou esclarecer qualquer dúvida, é só responder a este email.
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <p className="text-blue-400 text-xs font-medium">Framax Solutions</p>
                                            <p className="text-white/40 text-xs">framaxsolutions.com</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-blue-400">
                                    <span className="font-medium">
                                        {t.emailConfirmation?.attachmentInfo || "📎 Anexo:"}
                                    </span>{" "}
                                    {quoteNumber ? `Quote-${quoteNumber}.pdf` : "Quote.pdf"}
                                </p>
                                <p className="text-xs text-blue-400/60 mt-1">
                                    {t.emailConfirmation?.willBeSaved || "O orçamento será guardado e enviado por email"}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {t.emailConfirmation?.cancel || "Cancelar"}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading || !email.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t.emailConfirmation?.sending || "A enviar..."}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        {t.emailConfirmation?.confirm || "Guardar e Enviar"}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
