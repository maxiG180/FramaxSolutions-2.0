import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section id="hero" className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-background px-4 pt-20 text-center md:pt-32">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#2563eb]/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#2563eb]/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-[20%] left-[50%] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#2563eb]/10 blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl space-y-8">
                {/* Badge */}
                <div className="animate-fade-in-up mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-white/90">More Than Just a Website.</span>
                </div>

                <div className="animate-fade-in-up space-y-6 opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
                    <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl md:text-8xl leading-[1.1]">
                        We Build Websites That <br />
                        <span className="bg-gradient-to-r from-[#2563eb] via-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">
                            Drive Real Growth
                        </span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                        Stop losing customers to outdated design. We craft high-performance, SEO-optimized websites that turn visitors into loyal clients.
                    </p>
                </div>

                <div className="animate-fade-in-up flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
                    <Link
                        href="#booking"
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-foreground px-8 font-medium text-background transition-all hover:scale-105 hover:bg-foreground/90 hover:shadow-lg hover:shadow-primary/20"
                    >
                        <span className="mr-2"></span> Get a Proposal
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2563eb] via-[#2563eb] to-[#3b82f6] opacity-0 transition-opacity group-hover:opacity-10" />
                    </Link>
                    <Link
                        href="#portfolio"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        View Our Work
                    </Link>
                </div>

                {/* Social Proof / Trust Indicator */}
                <div className="animate-fade-in-up pt-12 opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
                    <p className="text-sm font-medium text-muted-foreground">
                        Trusted by forward-thinking companies
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
                        <Image
                            src="/logos/formCoachAILogo.png"
                            alt="Form Coach AI"
                            width={240}
                            height={80}
                            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-110"
                        />
                        <Image
                            src="/logos/15minutecoachesLogo.png"
                            alt="15 Minute Coaches"
                            width={180}
                            height={60}
                            className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-110"
                        />
                        <Image
                            src="/logos/toursphereLogo.png"
                            alt="Toursphere"
                            width={240}
                            height={80}
                            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-110"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
