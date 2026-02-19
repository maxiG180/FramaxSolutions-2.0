"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Lightbulb, Compass, Code2, Rocket } from "lucide-react";

const steps = [
    {
        id: "01",
        title: "Descoberta",
        description: "Mergulhamos profundamente nos objetivos do seu negócio, público-alvo e panorama competitivo para descobrir oportunidades únicas.",
        icon: Lightbulb,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
    },
    {
        id: "02",
        title: "Estratégia & Design",
        description: "Criamos um roteiro personalizado e visuais impressionantes que se alinham com a identidade da sua marca e as necessidades dos utilizadores.",
        icon: Compass,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        id: "03",
        title: "Desenvolvimento",
        description: "Os nossos engenheiros constroem a sua solução usando tecnologias de ponta, garantindo velocidade, segurança e escalabilidade.",
        icon: Code2,
        color: "text-blue-600",
        bg: "bg-blue-600/10",
    },
    {
        id: "04",
        title: "Lançamento & Escala",
        description: "Implementamos o seu projeto sem tempo de inatividade e fornecemos suporte contínuo para o ajudar a crescer e evoluir.",
        icon: Rocket,
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
];

export function Process() {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <section id="process" className="py-24 bg-background relative overflow-hidden">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 hidden lg:block opacity-30" />

            <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="mb-20 text-center max-w-3xl mx-auto"
                >
                    <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        Como <span className="text-primary">Damos Vida às Ideias</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Uma metodologia comprovada que garante resultados consistentes e de alta qualidade em cada projeto.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="relative group"
                        >
                            {/* Step Number Background */}
                            <div className="absolute -top-8 -right-4 text-9xl font-bold text-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 select-none pointer-events-none">
                                {step.id}
                            </div>

                            <div className="relative p-8 rounded-3xl border border-border bg-card h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20">
                                <div className={`mb-6 inline-flex rounded-2xl ${step.bg} p-4 ${step.color} shadow-sm`}>
                                    <step.icon className="h-8 w-8" />
                                </div>

                                <h3 className="mb-4 text-xl font-bold text-foreground flex items-center gap-3">
                                    <span className="text-sm font-mono text-muted-foreground opacity-50">0{index + 1}.</span>
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
