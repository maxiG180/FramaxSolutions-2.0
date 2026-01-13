import { Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FAQ() {
    const { t } = useLanguage();

    return (
        <section id="faq" className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                        {t.faqSection.title}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        {t.faqSection.subtitle}
                    </p>
                </div>

                <div className="mx-auto max-w-3xl space-y-4">
                    {t.faqSection.questions.map((faq, index) => (
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
