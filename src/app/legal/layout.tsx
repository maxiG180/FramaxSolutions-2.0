export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {children}
                </div>
            </div>
        </div>
    );
}
