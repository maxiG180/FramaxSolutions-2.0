"use client";

import { useEffect, useRef } from 'react';
import { useChatStore, Message } from '@/lib/chatbot/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
    MessageCircle,
    X,
    Minus,
    Send,
    Bot,
    RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function Chatbot() {
    const { t, language } = useLanguage();
    const cb = t.chatbot;

    const {
        isOpen,
        isTyping,
        messages,
        toggleOpen,
        setOpen,
        handleUserMessage,
        resetChat,
    } = useChatStore();

    const [inputValue, setInputValue] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Greeting bubble: shown a few seconds after load, until the visitor has opened the chat once
    useEffect(() => {
        if (isOpen) {
            setShowNotification(false);
            localStorage.setItem('framax-chatbot-opened', 'true');
            return;
        }
        if (localStorage.getItem('framax-chatbot-opened')) return;
        const timer = setTimeout(() => setShowNotification(true), 8000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Escape closes the chat
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, setOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        const text = inputValue;
        setInputValue('');
        // Pass the translated answers so the keyword fallback uses the right language
        await handleUserMessage(text, cb.answers as Record<string, string>, language);
    };

    const handlePresetClick = async (text: string) => {
        await handleUserMessage(text, cb.answers as Record<string, string>, language);
    };

    /**
     * Resolve the display text for a bot message.
     * Bot messages store an intentKey so we can re-resolve on language change.
     * User messages display their content directly.
     */
    const resolveContent = (msg: Message): string => {
        if (msg.role === 'user') return msg.content;
        if (!msg.intentKey) return msg.content;
        if (msg.intentKey === 'welcome') return cb.initialMessage;
        const answer = (cb.answers as Record<string, string>)[msg.intentKey];
        return answer ?? msg.content; // fallback to stored content if key missing
    };

    const presets = [
        cb.presets.services,
        cb.presets.pricing,
        cb.presets.timeline,
        cb.presets.contact,
    ];

    // Quick questions only help to get started; hide them once the visitor has asked something
    const hasUserMessage = messages.some((msg) => msg.role === 'user');

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-label={cb.title}
                        className="fixed inset-0 z-[10000] h-[100dvh] flex flex-col bg-[#050505]/95 backdrop-blur-xl overflow-hidden md:inset-auto md:bottom-24 md:right-6 md:w-[420px] md:h-[650px] md:max-h-[80vh] md:rounded-2xl md:border md:border-white/10 md:bg-[#050505]/80 md:shadow-2xl"
                        style={{ boxShadow: "0 0 50px -12px rgba(37, 99, 235, 0.25)" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-2 h-2 absolute bottom-0 right-0 bg-green-500 rounded-full border border-[#050505]" />
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                        <Bot size={18} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm">{cb.title}</h3>
                                    <p className="text-xs text-white/50">{cb.online}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => resetChat(cb.initialMessage)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                                    aria-label="New conversation"
                                    title="New conversation"
                                >
                                    <RotateCcw size={16} />
                                </button>
                                <button
                                    onClick={toggleOpen}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                                    aria-label="Close chat"
                                >
                                    <X size={20} className="md:hidden" />
                                    <Minus size={18} className="hidden md:block" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full",
                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                        msg.role === 'user'
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none"
                                            : "bg-white/10 text-white/90 rounded-bl-none border border-white/5"
                                    )}>
                                        {msg.role === 'bot' ? (
                                            <ReactMarkdown
                                                components={{
                                                    strong: ({ node, ...props }) => <span className="font-semibold text-white" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="text-white/80" {...props} />,
                                                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    a: ({ node, href, ...props }) => {
                                                        // On-site links (e.g. /#booking) close the chat so the section is visible
                                                        const isExternal = href?.startsWith('http');
                                                        // "#booking" only exists on the homepage, so make it work from other pages too
                                                        const target = href?.startsWith('#') ? `/${href}` : href;
                                                        return (
                                                            <a
                                                                href={target}
                                                                className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
                                                                {...(isExternal
                                                                    ? { target: '_blank', rel: 'noopener noreferrer' }
                                                                    : { onClick: () => setOpen(false) })}
                                                                {...props}
                                                            />
                                                        );
                                                    },
                                                }}
                                            >
                                                {resolveContent(msg)}
                                            </ReactMarkdown>
                                        ) : (
                                            resolveContent(msg)
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex w-full justify-start">
                                    <div className="bg-white/10 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3">
                                        <div className="flex gap-1 h-5 items-center">
                                            {[0, 0.2, 0.4].map((delay, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 h-1.5 bg-white/50 rounded-full"
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        {!isTyping && !hasUserMessage && (
                            <div className="px-4 pb-2">
                                <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                                    {cb.suggestedQuestions}
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible">
                                    {presets.map((text) => (
                                        <button
                                            key={text}
                                            onClick={() => handlePresetClick(text)}
                                            className="flex-shrink-0 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 text-white/90 hover:text-white px-4 py-2 rounded-full text-xs transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                        >
                                            {text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <form
                                onSubmit={handleSubmit}
                                className="flex items-center gap-2 bg-[#050505]/50 border border-white/10 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition-colors"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={cb.inputPlaceholder}
                                    aria-label={cb.inputPlaceholder}
                                    maxLength={500}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    aria-label="Send"
                                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button & Notification Bubble */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 flex-col items-end gap-2 isolate pointer-events-none",
                isOpen ? "hidden md:flex" : "flex"
            )}>
                <AnimatePresence>
                    {showNotification && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="pointer-events-auto bg-white text-blue-600 px-4 py-2 rounded-xl rounded-br-none shadow-xl mb-2 font-medium text-sm flex items-center gap-2 cursor-pointer"
                            onClick={toggleOpen}
                        >
                            <span>{cb.notificationBubble}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={toggleOpen}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all bg-blue-600 hover:bg-blue-500 text-white relative",
                        isOpen && "rotate-90 bg-white/10 hover:bg-white/20 backdrop-blur-md"
                    )}
                    style={{ boxShadow: isOpen ? "none" : "0 0 20px rgba(37, 99, 235, 0.5)" }}
                    aria-label={isOpen ? "Close chat" : "Open chat"}
                >
                    {/* Notification Badge */}
                    {!isOpen && showNotification && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#050505] flex items-center justify-center z-10"
                        >
                            <span className="text-[10px] font-bold text-white">1</span>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                            >
                                <X size={24} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, rotate: 90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: -90 }}
                            >
                                <MessageCircle size={28} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}
