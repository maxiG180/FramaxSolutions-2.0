/**
 * Generate PDF from HTML template - CLIENT-SIDE ONLY
 * Uses API route with puppeteer for consistent rendering
 */

import { QuotePDFData, QuotePDFOptions } from './generateQuotePDF';
import { generateQuoteTemplateHTML } from '@/components/shared/QuoteTemplate';

const DEFAULT_TRANSLATIONS = {
    quote: 'ORÇAMENTO',
    invoice: 'FATURA',
    quoteNumber: 'Número de Orçamento',
    invoiceNumber: 'Número de Fatura',
    billTo: 'Faturar a',
    issueDate: 'Data de Emissão',
    validity: 'Validade',
    description: 'Descrição',
    qty: 'Qtd',
    price: 'Preço',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'IVA',
    notesTerms: 'Notas / Termos',
    legalNote: 'Este orçamento não constitui fatura. Após aceitação, será emitida fatura oficial através do Portal das Finanças.',
    nif: 'NIF',
};

/**
 * Generate PDF from HTML template (CLIENT-SIDE: calls API route)
 */
export async function generateQuotePDFFromHTML(
    data: QuotePDFData,
    options: QuotePDFOptions = {}
): Promise<Blob> {
    const { type = 'quote', translations } = options;

    // Generate HTML from template
    const html = generateQuoteTemplateHTML(data, type, translations || DEFAULT_TRANSLATIONS);

    // Client-side: Call API route to generate PDF
    const response = await fetch('/api/generate-pdf-from-html', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate PDF');
    }

    return await response.blob();
}
