import { Plus } from "lucide-react";

const faqs = [
    {
        question: "How long does a typical project take?",
        answer: "For a standard landing page, we typically deliver within 1 week. Larger corporate sites take 2-3 weeks, while custom web applications can take 4-8 weeks depending on complexity.",
    },
    {
        question: "Do you offer hosting and maintenance?",
        answer: "Yes! We offer managed hosting plans that include daily backups, security updates, and 24/7 monitoring. We handle the technical side so you can focus on your business.",
    },
    {
        question: "What is your payment structure?",
        answer: "We typically require a 50% deposit to start the project, with the remaining 50% due upon completion and launch. For larger projects, we can discuss milestone-based payments.",
    },
    {
        question: "Can you update my existing website?",
        answer: "Absolutely. We can audit your current site and propose a redesign or migration plan to modern technologies like Next.js for better performance and SEO.",
    },
    {
        question: "Will my website be mobile-friendly?",
        answer: "100%. We take a mobile-first approach, ensuring your site looks and performs perfectly on smartphones, tablets, and desktops.",
    },
];

export function FAQ() {
    return (
        <section id="faq" className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Have a different question? Contact us and we'll be happy to help.
                    </p>
                </div>

                <div className="mx-auto max-w-3xl space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="group rounded-xl border border-border bg-card transition-all hover:border-primary/50"
                        >
                            <details className="group [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-medium text-foreground">
                                    {faq.question}
                                    <span className="ml-4 shrink-0 rounded-full border border-border p-1 transition-transform duration-300 group-open:rotate-45">
                                        <Plus className="h-4 w-4" />
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground">
                                    <p>{faq.answer}</p>
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
