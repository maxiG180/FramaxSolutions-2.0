// Public pages exist in English at their normal path and in Portuguese under /pt
// (e.g. /about and /pt/about), so search engines can index both languages.

export type Locale = 'en' | 'pt';

/** English paths of the pages that also have a /pt version */
export const LOCALIZED_PATHS = ['/', '/about', '/legal/privacy', '/legal/terms'] as const;

/** The locale a URL path is explicitly in, or null for unprefixed (English or user-preference) paths */
export function getUrlLocale(pathname: string | null | undefined): Locale | null {
    if (!pathname) return null;
    return pathname === '/pt' || pathname.startsWith('/pt/') ? 'pt' : null;
}

/** '/pt/about' -> '/about', '/pt' -> '/' */
export function stripLocale(pathname: string): string {
    if (pathname === '/pt') return '/';
    return pathname.startsWith('/pt/') ? pathname.slice(3) : pathname;
}

/**
 * Turn an English path (optionally with a #hash) into the given locale's path.
 * Paths without a Portuguese version (login, dashboard...) are returned unchanged.
 */
export function localizePath(path: string, locale: Locale): string {
    const hashIndex = path.indexOf('#');
    const base = hashIndex === -1 ? path : path.slice(0, hashIndex);
    const hash = hashIndex === -1 ? '' : path.slice(hashIndex);

    if (locale === 'en' || !(LOCALIZED_PATHS as readonly string[]).includes(base)) return path;
    return (base === '/' ? '/pt' : `/pt${base}`) + hash;
}
