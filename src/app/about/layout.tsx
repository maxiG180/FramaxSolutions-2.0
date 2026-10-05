import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('about', 'en');

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
