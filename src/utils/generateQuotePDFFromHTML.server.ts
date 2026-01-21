/**
 * Generate PDF from HTML template - SERVER-SIDE ONLY
 * Uses puppeteer directly for PDF generation
 * This file should only be imported in server-side code (API routes, server components)
 */

import puppeteer from 'puppeteer';
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
 * Generate PDF Buffer from HTML (server-side only, for email attachments)
 */
export async function generateQuotePDFBufferFromHTML(
    data: QuotePDFData,
    options: QuotePDFOptions = {}
): Promise<Buffer> {
    const { type = 'quote', translations } = options;

    // Generate HTML from template
    const html = generateQuoteTemplateHTML(data, type, translations || DEFAULT_TRANSLATIONS);

    // Server-side only: Use puppeteer directly
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set content
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'a4',
            printBackground: true,
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        });

        await browser.close();

        return Buffer.from(pdfBuffer);
    } catch (error) {
        await browser.close();
        throw error;
    }
}
