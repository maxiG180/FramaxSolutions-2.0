import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('terms', 'en');

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
