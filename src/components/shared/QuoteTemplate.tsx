/**
 * Shared Quote/Invoice Template Component
 * Used in both preview modal and PDF generation to ensure design consistency
 */

import Image from "next/image";
import { QuotePDFData } from '@/utils/generateQuotePDF';

interface QuoteTemplateProps {
    data: QuotePDFData;
    type?: 'quote' | 'invoice';
    translations: {
        quote: string;
        invoice: string;
        quoteNumber: string;
        invoiceNumber: string;
        billTo: string;
        issueDate: string;
        validity: string;
        dueDate: string;
        description: string;
        qty: string;
        price: string;
        total: string;
        subtotal: string;
        tax: string;
        notesTerms: string;
        legalNote: string;
        invoiceLegalNote: string;
        nif: string;
    };
    /** When true, uses img tag instead of Next.js Image (for PDF generation) */
    useStaticImage?: boolean;
}

export function QuoteTemplate({ data, type = 'quote', translations: t, useStaticImage = false }: QuoteTemplateProps) {
    const isQuote = type === 'quote';
    const documentNumber = isQuote ? data.quote_number : data.invoice_number;
    const documentDate = isQuote ? data.quote_date : data.invoice_date;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div className="bg-white text-black flex flex-col" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="p-12 flex flex-col relative" style={{ minHeight: '297mm' }}>
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div className="w-48">
                        {/* Logo */}
                        <div className="relative w-full h-16 mb-4">
                            {useStaticImage ? (
                                <img
                                    src="https://www.framaxsolutions.com/logos/framax-logo-black.png"
                                    alt="Framax Solutions"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        objectPosition: 'left'
                                    }}
                                />
                            ) : (
                                <Image
                                    src="/logos/framax-logo-black.png"
                                    alt="Framax Solutions"
                                    fill
                                    className="object-contain object-left"
                                    priority
                                />
                            )}
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p className="font-bold text-gray-900">Framax Solutions</p>
                            <p>contact@framaxsolutions.com</p>
                            <p>framaxsolutions.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-light text-blue-600 mb-2">
                            {isQuote ? t.quote.toUpperCase() : t.invoice.toUpperCase()}
                        </h1>
                        <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">
                            {isQuote ? t.quoteNumber : t.invoiceNumber}
                        </p>
                        <p className="text-gray-700 font-bold text-lg">{documentNumber}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="flex justify-between mb-12">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t.billTo}</p>
                        <div className="text-sm text-gray-800 space-y-1">
                            <p className="font-bold text-base">{data.client_name}</p>
                            {data.client_contact && <p className="font-medium">{data.client_contact}</p>}
                            {data.client_address && data.client_address.split('\n').map((line: string, i: number) => (
                                <p key={i}>{line}</p>
                            ))}
                            {data.client_email && <p className="text-blue-600">{data.client_email}</p>}
                            {data.client_phone && <p className="text-gray-600">{data.client_phone}</p>}
                            {data.client_nif && (
                                <p className="text-gray-600">
                                    <span className="font-medium">{t.nif}:</span> {data.client_nif}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="text-right space-y-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.issueDate}</p>
                            <p className="text-sm font-medium">
                                {documentDate ? new Date(documentDate).toLocaleDateString('pt-PT') : '-'}
                            </p>
                        </div>
                        {isQuote ? (
                            data.expiry_date && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.validity}</p>
                                    <p className="text-sm font-medium">
                                        {new Date(data.expiry_date).toLocaleDateString('pt-PT')}
                                    </p>
                                </div>
                            )
                        ) : (
                            (data as any).due_date && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.dueDate}</p>
                                    <p className="text-sm font-medium">
                                        {new Date((data as any).due_date).toLocaleDateString('pt-PT')}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <div className="border-b-2 border-blue-600 pb-2 mb-4 flex text-xs font-bold text-gray-400 uppercase">
                        <div className="flex-1">{t.description}</div>
                        <div className="w-20 text-center">{t.qty}</div>
                        <div className="w-32 text-right">{t.price}</div>
                        <div className="w-32 text-right">{t.total}</div>
                    </div>
                    <div className="space-y-4">
                        {(data.items || []).map((item, index) => (
                            <div key={index} className="flex text-sm text-gray-800 border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex-1">
                                    <p className="font-medium">{item.description}</p>
                                </div>
                                <div className="w-20 text-center text-gray-500">{item.quantity}</div>
                                <div className="w-32 text-right text-gray-500">{formatCurrency(item.price)}</div>
                                <div className="w-32 text-right font-medium">
                                    {formatCurrency(item.quantity * item.price)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{t.subtotal}</span>
                            <span>{formatCurrency(data.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{t.tax} ({(data.tax_rate * 100).toFixed(0)}%)</span>
                            <span>{formatCurrency(data.tax_amount)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-blue-600">
                            <span>{t.total}</span>
                            <span>{formatCurrency(data.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {data.notes && (
                    <div className="pt-8 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t.notesTerms}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-8 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 italic">
                        {isQuote ? t.legalNote : t.invoiceLegalNote}
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Generate HTML string from QuoteTemplate for PDF generation
 * This ensures the exact same HTML is used for both preview and PDF
 */
export function generateQuoteTemplateHTML(
    data: QuotePDFData,
    type: 'quote' | 'invoice',
    translations: QuoteTemplateProps['translations']
): string {
    const isQuote = type === 'quote';
    const documentNumber = isQuote ? data.quote_number : data.invoice_number;
    const documentDate = isQuote ? data.quote_date : data.invoice_date;
    const t = translations;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
        .page { width: 210mm; min-height: 297mm; background: white; color: black; }
        .content { padding: 48px; display: flex; flex-direction: column; min-height: 297mm; position: relative; }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
        .logo-section { width: 192px; }
        .logo { width: 100%; height: 64px; margin-bottom: 16px; }
        .logo img { width: 100%; height: 100%; object-fit: contain; object-position: left; }
        .company-info { font-size: 12px; color: #6b7280; }
        .company-info p { margin-bottom: 4px; }
        .company-name { font-weight: bold; color: #111827; }

        .doc-header { text-align: right; }
        .doc-title { font-size: 36px; font-weight: 300; color: #2563eb; margin-bottom: 8px; }
        .doc-number-label { color: #6b7280; font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        .doc-number { color: #374151; font-weight: bold; font-size: 18px; }

        /* Info Grid */
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 48px; }
        .bill-to-label { font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; }
        .client-info { font-size: 14px; color: #1f2937; }
        .client-info p { margin-bottom: 4px; }
        .client-name { font-weight: bold; font-size: 16px; }
        .client-contact { font-weight: 500; }
        .client-email { color: #2563eb; }
        .client-phone { color: #4b5563; }
        .client-nif { color: #4b5563; }
        .client-nif .label { font-weight: 500; }

        .dates { text-align: right; }
        .date-block { margin-bottom: 16px; }
        .date-label { font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
        .date-value { font-size: 14px; font-weight: 500; }

        /* Items Table */
        .items-section { margin-bottom: 32px; }
        .items-header { border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 16px; display: flex; font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; }
        .items-body { }
        .item-row { display: flex; font-size: 14px; color: #1f2937; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 16px; }
        .item-row:last-child { border-bottom: none; }
        .item-desc { flex: 1; font-weight: 500; }
        .item-qty { width: 80px; text-align: center; color: #6b7280; }
        .item-price { width: 128px; text-align: right; color: #6b7280; }
        .item-total { width: 128px; text-align: right; font-weight: 500; }

        /* Totals */
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 48px; }
        .totals { width: 256px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .totals-row.final { border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 18px; font-weight: bold; color: #2563eb; }

        /* Notes */
        .notes-section { padding-top: 32px; border-top: 1px solid #f3f4f6; }
        .notes-label { font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; }
        .notes-content { font-size: 14px; color: #4b5563; white-space: pre-wrap; }

        /* Footer */
        .footer { margin-top: auto; padding-top: 32px; border-top: 1px solid #e5e7eb; text-align: center; }
        .footer p { font-size: 12px; color: #6b7280; font-style: italic; }
    </style>
</head>
<body>
    <div class="page">
        <div class="content">
            <!-- Header -->
            <div class="header">
                <div class="logo-section">
                    <div class="logo">
                        <img src="https://www.framaxsolutions.com/logos/framax-logo-black.png" alt="Framax Solutions">
                    </div>
                    <div class="company-info">
                        <p class="company-name">Framax Solutions</p>
                        <p>contact@framaxsolutions.com</p>
                        <p>framaxsolutions.com</p>
                    </div>
                </div>
                <div class="doc-header">
                    <h1 class="doc-title">${isQuote ? t.quote.toUpperCase() : t.invoice.toUpperCase()}</h1>
                    <p class="doc-number-label">${isQuote ? t.quoteNumber : t.invoiceNumber}</p>
                    <p class="doc-number">${documentNumber}</p>
                </div>
            </div>

            <!-- Info Grid -->
            <div class="info-grid">
                <div>
                    <p class="bill-to-label">${t.billTo}</p>
                    <div class="client-info">
                        <p class="client-name">${data.client_name}</p>
                        ${data.client_contact ? `<p class="client-contact">${data.client_contact}</p>` : ''}
                        ${data.client_address ? data.client_address.split('\n').map(line => `<p>${line}</p>`).join('') : ''}
                        ${data.client_email ? `<p class="client-email">${data.client_email}</p>` : ''}
                        ${data.client_phone ? `<p class="client-phone">${data.client_phone}</p>` : ''}
                        ${data.client_nif ? `<p class="client-nif"><span class="label">${t.nif}:</span> ${data.client_nif}</p>` : ''}
                    </div>
                </div>
                <div class="dates">
                    <div class="date-block">
                        <p class="date-label">${t.issueDate}</p>
                        <p class="date-value">${documentDate ? new Date(documentDate).toLocaleDateString('pt-PT') : '-'}</p>
                    </div>
                    ${isQuote ? (
                        data.expiry_date ? `
                        <div class="date-block">
                            <p class="date-label">${t.validity}</p>
                            <p class="date-value">${new Date(data.expiry_date).toLocaleDateString('pt-PT')}</p>
                        </div>
                        ` : ''
                    ) : (
                        (data as any).due_date ? `
                        <div class="date-block">
                            <p class="date-label">${t.dueDate}</p>
                            <p class="date-value">${new Date((data as any).due_date).toLocaleDateString('pt-PT')}</p>
                        </div>
                        ` : ''
                    )}
                </div>
            </div>

            <!-- Items Table -->
            <div class="items-section">
                <div class="items-header">
                    <div style="flex: 1;">${t.description}</div>
                    <div style="width: 80px; text-align: center;">${t.qty}</div>
                    <div style="width: 128px; text-align: right;">${t.price}</div>
                    <div style="width: 128px; text-align: right;">${t.total}</div>
                </div>
                <div class="items-body">
                    ${(data.items || []).map(item => `
                    <div class="item-row">
                        <div class="item-desc">${item.description}</div>
                        <div class="item-qty">${item.quantity}</div>
                        <div class="item-price">${formatCurrency(item.price)}</div>
                        <div class="item-total">${formatCurrency(item.quantity * item.price)}</div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <!-- Totals -->
            <div class="totals-section">
                <div class="totals">
                    <div class="totals-row">
                        <span>${t.subtotal}</span>
                        <span>${formatCurrency(data.subtotal)}</span>
                    </div>
                    <div class="totals-row">
                        <span>${t.tax} (${(data.tax_rate * 100).toFixed(0)}%)</span>
                        <span>${formatCurrency(data.tax_amount)}</span>
                    </div>
                    <div class="totals-row final">
                        <span>${t.total}</span>
                        <span>${formatCurrency(data.total)}</span>
                    </div>
                </div>
            </div>

            <!-- Notes -->
            ${data.notes ? `
            <div class="notes-section">
                <p class="notes-label">${t.notesTerms}</p>
                <p class="notes-content">${data.notes}</p>
            </div>
            ` : ''}

            <!-- Footer -->
            <div class="footer">
                <p>${isQuote ? t.legalNote : t.invoiceLegalNote}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}
