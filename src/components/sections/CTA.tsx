import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section id="contact" className="relative overflow-hidden py-24">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 text-center">
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    Pronto para Transformar o Seu Negócio?
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
                    Junte-se às empresas visionarias que confiam na Framax Solutions para construir o seu futuro digital.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="#contact"
                        className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-foreground px-8 text-lg font-medium text-background transition-all hover:scale-105 hover:bg-foreground/90 hover:shadow-lg hover:shadow-primary/20"
                    >
                        <span className="mr-2">🚀</span> Iniciar o Seu Projeto
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 opacity-0 transition-opacity group-hover:opacity-10" />
                    </Link>
                    <Link
                        href="mailto:hello@framaxsolutions.com"
                        className="inline-flex h-14 items-center justify-center rounded-full border border-input bg-background px-8 text-lg font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Contactar Vendas
                    </Link>
                </div>
            </div>
        </section>
    );
}
