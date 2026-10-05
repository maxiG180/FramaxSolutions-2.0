import { renderOgImage } from '@/lib/og-image';

export const alt = 'Framax Solutions: software that automates your business';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return renderOgImage('en');
}
