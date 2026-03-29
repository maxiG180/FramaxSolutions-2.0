"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Mail, User, Edit2, Eye, ArrowLeft, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { EmailTemplatePreview } from "@/utils/emailTemplate";

interface EmailPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (emailData: { email: string; language: 'pt' | 'en' }) => void;
    defaultEmail: string;
    clientName: string;
    quoteNumber: string;
    validUntil?: string;
    loading?: boolean;
    defaultLanguage?: 'pt' | 'en';
}

export function EmailPreviewModal({
    isOpen,
    onClose,
    onConfirm,
    defaultEmail,
    clientName,
    quoteNumber,
    validUntil,
    loading = false,
    defaultLanguage
}: EmailPreviewModalProps) {
    const { t, language } = useLanguage();
    const [email, setEmail] = useState(defaultEmail);
    const [emailError, setEmailError] = useState("");
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<'pt' | 'en'>(defaultLanguage || language as 'pt' | 'en');
    const modalRef = useRef<HTMLDivElement>(null);

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

        onConfirm({ email, language: selectedLanguage });
    };

    // Reset email when modal opens or defaultEmail changes
    useEffect(() => {
        if (isOpen) {
            setEmail(defaultEmail);
            setEmailError("");
            setIsEditingEmail(false);
            setSelectedLanguage(defaultLanguage || language as 'pt' | 'en');
        }
    }, [isOpen, defaultEmail, defaultLanguage, language]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="email-preview-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        key="email-preview-container"
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        {/* Back Button */}
                        <motion.button
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={onClose}
                            disabled={loading}
                            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t.emailPreview?.back || "Voltar"}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </motion.button>

                        <motion.div
                            key="email-preview-modal"
                            ref={modalRef}
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                            className="w-full max-w-6xl h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0A0A0A]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Eye className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {t.emailPreview?.title || "Pré-visualização do Email"}
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        {t.emailPreview?.subtitle || "Reveja o email antes de enviar"}
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

                        {/* Content - Split View */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Side - Email Settings */}
                            <div className="w-80 border-r border-white/10 p-6 overflow-y-auto bg-[#0A0A0A]">
                                <div className="space-y-6">
                                    {/* Error Display */}
                                    {emailError && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                            {emailError}
                                        </div>
                                    )}

                                    {/* Recipient */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {t.emailPreview?.recipient || "Destinatário"}
                                            </label>
                                            <button
                                                onClick={() => setIsEditingEmail(!isEditingEmail)}
                                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                                disabled={loading}
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                {isEditingEmail ? (t.emailPreview?.done || "Concluir") : (t.emailPreview?.edit || "Editar")}
                                            </button>
                                        </div>

                                        {isEditingEmail ? (
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setEmailError("");
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                                                placeholder="cliente@exemplo.com"
                                                disabled={loading}
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm">
                                                {email || <span className="text-white/40">Sem email</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Language Selector */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                            <Languages className="w-4 h-4" />
                                            {t.emailPreview?.language || "Idioma do Email"}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLanguage('pt')}
                                                disabled={loading}
                                                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                                    selectedLanguage === 'pt'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                {t.emailPreview?.languagePortuguese || "Português"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLanguage('en')}
                                                disabled={loading}
                                                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                                    selectedLanguage === 'en'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                {t.emailPreview?.languageEnglish || "Inglês"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email Details */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {t.emailPreview?.emailDetails || "Detalhes do Email"}
                                        </label>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between py-2 border-b border-white/5">
                                                <span className="text-white/60">{t.emailPreview?.subject || "Assunto"}:</span>
                                                <span className="text-white font-medium">Orçamento {quoteNumber}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-white/5">
                                                <span className="text-white/60">{t.emailPreview?.from || "De"}:</span>
                                                <span className="text-white">Framax Solutions</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-white/5">
                                                <span className="text-white/60">{t.emailPreview?.attachment || "Anexo"}:</span>
                                                <span className="text-blue-400">{quoteNumber}.pdf</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <p className="text-xs text-blue-400">
                                            {t.emailPreview?.info || "O orçamento será enviado como anexo PDF junto com este email."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Email Preview */}
                            <div className="flex-1 bg-[#111111] p-8 overflow-y-auto">
                                <div className="max-w-2xl mx-auto">
                                    {/* Email Preview Card */}
                                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                                        <EmailTemplatePreview
                                            clientName={clientName}
                                            documentNumber={quoteNumber}
                                            documentType="quote"
                                            validUntil={validUntil}
                                            language={selectedLanguage}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[#0A0A0A]">
                            <p className="text-sm text-white/60">
                                {t.emailPreview?.footerNote || "Será enviado para"}: <span className="text-white font-medium">{email || "..."}</span>
                            </p>
                            <button
                                onClick={handleConfirm}
                                disabled={loading || !email.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t.emailPreview?.sending || "A enviar..."}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        {t.emailPreview?.send || "Enviar Email"}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
