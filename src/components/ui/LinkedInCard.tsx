"use client";

import { motion } from "framer-motion";
import { Linkedin, Github, ExternalLink, Terminal } from "lucide-react";
import Image from "next/image";

interface LinkedInCardProps {
    name: string;
    role: string;
    description: string;
    linkedinUrl: string;
    imageUrl?: string;
    viewProfileLabel?: string;
}

export function LinkedInCard({ name, role, description, linkedinUrl, imageUrl, viewProfileLabel = "View Profile" }: LinkedInCardProps) {
    const isGithub = linkedinUrl.includes("github.com");
    
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-muted/30 p-6 backdrop-blur-sm transition-all hover:bg-muted/50 hover:shadow-2xl hover:shadow-blue-500/10"
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Image Section */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-white/10 md:h-32 md:w-32">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-600/20 text-blue-400">
                             <Terminal size={40} className="animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-foreground md:text-2xl">{name}</h3>
                                <p className="text-sm font-medium text-primary">{role}</p>
                            </div>
                            <a
                                href={linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-blue-600/20 p-2 text-blue-400 transition-colors hover:bg-blue-600 hover:text-white"
                                aria-label={`${isGithub ? 'GitHub' : 'LinkedIn'} of ${name}`}
                            >
                                {isGithub ? <Github size={20} /> : <Linkedin size={20} />}
                            </a>
                        </div>
                        <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 transition-colors hover:text-blue-300"
                        >
                            {viewProfileLabel}
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-600/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />
        </motion.div>
    );
}
