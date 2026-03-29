import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Framax Solutions - Soluções Digitais para PMEs | Sites, SEO, Automação',
  description:
    'Sites profissionais, sistemas de marcação online e automação para salões, ginásios, clínicas e oficinas. Ajudamos PMEs portuguesas a crescer online com soluções que realmente funcionam.',
  keywords: [
    'sites para pequenas empresas',
    'website para salões',
    'sistema de marcações online',
    'automação para negócios',
    'SEO local Portugal',
    'sites para ginásios',
    'sites para clínicas',
    'websites para oficinas',
    'desenvolvimento web PME',
    'digital marketing PMEs',
  ],
  openGraph: {
    title: 'Framax Solutions - Soluções Digitais para PMEs',
    description:
      'Sites profissionais e sistemas de marcação online para salões, ginásios, clínicas e oficinas. Aumente a sua visibilidade online.',
    type: 'website',
    locale: 'pt_PT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Framax Solutions - Soluções Digitais para PMEs',
    description:
      'Sites profissionais e sistemas de marcação online para salões, ginásios, clínicas e oficinas.',
  },
};

export default function NewLandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${outfit.className} antialiased`}>
      <LanguageProvider>{children}</LanguageProvider>
    </div>
  );
}
