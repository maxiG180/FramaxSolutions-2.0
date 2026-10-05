import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Locale } from './i18n-routes';

// Share image (WhatsApp, LinkedIn, Discord, Google...) used by the opengraph-image files

const TEXT = {
    en: { pre: 'Software that', highlight: 'automates your business.', sub: 'Websites, management systems and automations for small businesses.' },
    pt: { pre: 'Software que', highlight: 'automatiza o seu negócio.', sub: 'Websites, sistemas de gestão e automações para pequenas empresas.' },
} as const;

export const OG_SIZE = { width: 1200, height: 630 };

export async function renderOgImage(locale: Locale) {
    const [font, logo] = await Promise.all([
        readFile(join(process.cwd(), 'public/fonts/Outfit-Regular.ttf')),
        readFile(join(process.cwd(), 'public/logos/framax-logo-white.png')),
    ]);
    const text = TEXT[locale];

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px 80px',
                    background: '#0a0a0a',
                    backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(37, 99, 235, 0.35), transparent 55%)',
                    fontFamily: 'Outfit',
                    color: '#ededed',
                }}
            >
                {/* 421x59 source logo */}
                <img src={`data:image/png;base64,${logo.toString('base64')}`} width={337} height={47} alt="" />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 84, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                        <span>{text.pre}</span>
                        <span style={{ color: '#3b82f6' }}>{text.highlight}</span>
                    </div>
                    <div style={{ marginTop: 32, fontSize: 32, color: '#a3a3a3' }}>{text.sub}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: '#737373' }}>
                    <div style={{ width: 40, height: 2, background: '#2563eb', marginRight: 16 }} />
                    framaxsolutions.com
                </div>
            </div>
        ),
        {
            ...OG_SIZE,
            fonts: [{ name: 'Outfit', data: font, style: 'normal', weight: 400 }],
        }
    );
}
