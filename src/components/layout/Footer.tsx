import Link from "next/link";
import { Twitter, Github, Linkedin, Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold tracking-tighter mb-4 block">
                            <span className="text-[#2563eb]">Framax</span><span className="text-white">Solutions</span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            Building digital experiences that feel alive. Fast, responsive, and delightful.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Studio</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                        © {new Date().getFullYear()} Framax Solutions. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                            <Twitter size={20} />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                            <Github size={20} />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                            <Linkedin size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
