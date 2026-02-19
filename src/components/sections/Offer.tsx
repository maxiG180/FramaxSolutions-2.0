"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, Check, Zap, Rocket, Coffee } from "lucide-react";

export function Offer() {
    const [isHovered, setIsHovered] = useState(false);

    const handleConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#6366f1", "#ec4899", "#8b5cf6", "#ffffff"],
        });
    };

    return (
        <section id="offer" className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Copy & Value */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Vagas limitadas disponíveis para Dezembro
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
                        >
                            Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">concretizar</span> o seu sonho?
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground max-w-lg"
                        >
                            Sem formulários complicados. Sem reuniões intermitáveis. Apenas execução pura. Criamos websites de alta conversão que fazem de si uma referência no mercado.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <a
                                href="mailto:hello@framaxsolutions.com"
                                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-foreground px-8 text-lg font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 hover:shadow-2xl hover:shadow-primary/20"
                            >
                                <span className="mr-2">🚀</span> Marcar uma Chamada
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>

                            <button
                                onClick={handleConfetti}
                                className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-muted bg-background px-8 text-lg font-bold text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
                            >
                                <Coffee className="mr-2 h-5 w-5" />
                                Não carregar aqui
                            </button>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4 pt-8">
                            {[
                                { icon: Zap, label: "Entrega Ultra-Rápida" },
                                { icon: Check, label: "Qualidade de Topo" },
                                { icon: Rocket, label: "Otimizado para SEO" },
                                { icon: Coffee, label: "Comunicação Assíncrona" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                                >
                                    <item.icon className="w-4 h-4 text-primary" />
                                    {item.label}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visual/Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-[2rem] blur-2xl opacity-20 animate-pulse" />
                        <div className="relative bg-card border border-border rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden group">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">O Pacote "Quero Tudo"</h3>
                                    <p className="text-muted-foreground">Tudo o que precisa para dominar o seu nicho.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold tracking-tight">€2,997</span>
                                        <span className="text-muted-foreground line-through">€5,000</span>
                                    </div>
                                    <p className="text-sm text-green-500 font-bold bg-green-500/10 inline-block px-3 py-1 rounded-full">
                                        Poupe €2.003 este mês
                                    </p>
                                </div>

                                <ul className="space-y-3">
                                    {[
                                        "Design & Desenvolvimento Personalizado",
                                        "Mobile Responsivo & Rápido",
                                        "SEO & Otimização de Performance",
                                        "Integração CMS (Edições fáceis)",
                                        "1 Mês de Suporte"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href="mailto:hello@framaxsolutions.com?subject=Quero o pacote!"
                                    className="block w-full py-4 text-center bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-1"
                                >
                                    Começar Agora
                                </a>

                                <p className="text-center text-xs text-muted-foreground">
                                    100% Garantia de Satisfação. Sem perguntas.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
