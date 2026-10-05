import type { Metadata } from 'next';

// Tracking redirect for printed QR codes; keep it out of search results
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function QRCodeLayout({ children }: { children: React.ReactNode }) {
    return children;
}
