import type { MetadataRoute } from 'next';
import { SEO_PAGES, absoluteUrl } from '@/lib/seo';
import { localizePath } from '@/lib/i18n-routes';

// Served at /sitemap.xml: every public page in English and Portuguese,
// each listing its other-language version
export default function sitemap(): MetadataRoute.Sitemap {
    return SEO_PAGES.flatMap((path) => {
        const languages = {
            en: absoluteUrl(path),
            'pt-PT': absoluteUrl(localizePath(path, 'pt')),
        };
        const isLegal = path.startsWith('/legal');

        return Object.values(languages).map((url) => ({
            url,
            changeFrequency: isLegal ? ('yearly' as const) : ('monthly' as const),
            priority: path === '/' ? 1 : isLegal ? 0.3 : 0.8,
            alternates: { languages },
        }));
    });
}
