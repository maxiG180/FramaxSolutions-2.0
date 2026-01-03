"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const trustIndicators = [
    "Proposta clara em 48h ou menos",
    "Preço fixo - sem surpresas no final",
    "Rápido no telemóvel e computador",
    "O site é seu - sem dependências",
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/5 to-transparent skew-x-12 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 max-w-2xl"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                A Sua Empresa Devia Ter{" "}
                <span className="text-primary relative inline-block">
                  Mais Clientes
                  <svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-secondary/30 -z-10"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Sites lentos, desatualizados ou invisíveis no Google custam-lhe
                dinheiro todos os dias. Nós resolvemos isso em semanas, não
                meses.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 relative">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all bg-primary rounded-lg hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Marcar Reunião Gratuita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/#process"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold transition-all bg-transparent border-2 border-primary/20 rounded-lg text-foreground hover:bg-primary/5 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Ver Como Funciona
              </Link>
              
              {/* Hand-drawn Arrow */}
              <div className="absolute -bottom-12 left-32 hidden sm:block pointer-events-none opacity-60 rotate-12">
                 <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10 C 30 40, 70 40, 80 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/>
                    <path d="M70 70 L 80 80 L 90 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground"/>
                 </svg>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4"
            >
              {trustIndicators.map((text, index) => (
                <div key={index} className="flex items-start sm:items-center gap-2 sm:gap-3 group">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 sm:mt-0">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-tight">
                    {text}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual/Geometric Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block relative h-full min-h-[500px]"
          >
             {/* Abstract Geometric Composition */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-2xl rotate-12 backdrop-blur-sm border border-white/10 shadow-2xl animate-float" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-12 left-12 w-48 h-48 bg-secondary/5 rounded-full backdrop-blur-md border border-white/10 shadow-xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-accent/10 rounded-lg rotate-45 backdrop-blur-md border border-white/10 animate-float" style={{ animationDelay: '4s' }} />
                
                {/* Code/Browser Abstract Representation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-auto bg-background/80 backdrop-blur-xl rounded-xl border border-border shadow-2xl p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                   <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                   </div>
                   <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
                      <div className="h-4 w-full bg-muted rounded animate-pulse delay-75" />
                      <div className="h-4 w-5/6 bg-muted rounded animate-pulse delay-150" />
                      <div className="grid grid-cols-2 gap-3 mt-4">
                         <div className="h-20 bg-muted/50 rounded-lg" />
                         <div className="h-20 bg-muted/50 rounded-lg" />
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
