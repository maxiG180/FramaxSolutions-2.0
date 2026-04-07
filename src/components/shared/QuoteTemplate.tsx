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
        <div className="bg-white text-black flex flex-col" style={{ width: '210mm' }}>
            <div className="p-12 flex flex-col relative">
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
                        {(data.tax_rate && data.tax_rate > 0) ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between text-lg font-bold text-blue-600">
                                    <span>{t.total}</span>
                                    <span>{formatCurrency(data.total)}</span>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-gray-600 italic">
                                        IVA — Isento nos termos do art.º 53.º do CIVA
                                    </p>
                                </div>
                            </>
                        )}
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; margin: 0; }

        @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
        }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .logo-section { width: 192px; }
        .logo { width: 100%; height: 64px; margin-bottom: 12px; }
        .logo img { width: 100%; height: 100%; object-fit: contain; object-position: left; }
        .company-info { font-size: 12px; color: #6b7280; }
        .company-info p { margin-bottom: 3px; }
        .company-name { font-weight: bold; color: #111827; }

        .doc-header { text-align: right; }
        .doc-title { font-size: 36px; font-weight: 300; color: #2563eb; margin-bottom: 8px; }
        .doc-number-label { color: #6b7280; font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        .doc-number { color: #374151; font-weight: bold; font-size: 18px; }

        /* Info Grid */
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 32px; }
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
        .items-section { margin-bottom: 20px; }
        .items-header { border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-bottom: 12px; display: flex; font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; }
        .items-body { }
        .item-row { display: flex; font-size: 14px; color: #1f2937; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 10px; }
        .item-row:last-child { border-bottom: none; }
        .item-desc { flex: 1; font-weight: 500; }
        .item-qty { width: 80px; text-align: center; color: #6b7280; }
        .item-price { width: 128px; text-align: right; color: #6b7280; }
        .item-total { width: 128px; text-align: right; font-weight: 500; }

        /* Totals */
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .totals { width: 256px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .totals-row.final { border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 18px; font-weight: bold; color: #2563eb; }

        /* Notes */
        .notes-section { padding-top: 16px; border-top: 1px solid #f3f4f6; }
        .notes-label { font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px; }
        .notes-content { font-size: 13px; color: #4b5563; white-space: pre-wrap; line-height: 1.4; }

        /* Footer */
        .footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; }
        .footer p { font-size: 11px; color: #6b7280; font-style: italic; line-height: 1.3; }

        /* Payment Conditions Section */
        .payment-section { margin-bottom: 20px; }
        .payment-section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }

        .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .payment-table th { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; padding: 5px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .payment-table th:nth-child(2), .payment-table th:nth-child(3) { text-align: center; }
        .payment-table th:last-child { text-align: left; }
        .payment-table td { font-size: 12px; color: #1f2937; padding: 6px 8px; border-bottom: 1px solid #f3f4f6; }
        .payment-table td:nth-child(2), .payment-table td:nth-child(3) { text-align: center; font-weight: 500; }
        .payment-table td:last-child { color: #4b5563; }
        .payment-table tr:last-child td { border-bottom: none; }

        .payment-methods { display: grid; gap: 5px; }
        .payment-method-row { display: flex; align-items: baseline; gap: 12px; }
        .payment-method-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; font-weight: 600; min-width: 75px; letter-spacing: 0.03em; }
        .payment-method-value { font-size: 11px; color: #1f2937; flex: 1; }
    </style>
</head>
<body>
    <!-- Page 1: Quote -->
    <div style="width: 210mm; background: white; color: black; padding: 36px 40px;">
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
                    ${(data.tax_rate && data.tax_rate > 0) ? `
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
                    ` : `
                    <div class="totals-row final">
                        <span>${t.total}</span>
                        <span>${formatCurrency(data.total)}</span>
                    </div>
                    <div style="margin-top: 8px;">
                        <p style="font-size: 12px; color: #4b5563; font-style: italic;">
                            IVA — Isento nos termos do art.º 53.º do CIVA
                        </p>
                    </div>
                    `}
                </div>
            </div>

            <!-- Notes and Payment Information -->
            <div class="notes-section">
                <p class="notes-label">${t.notesTerms}</p>

                ${data.notes ? `<p class="notes-content" style="margin-bottom: 12px;">${data.notes}</p>` : ''}

                <!-- Payment Conditions -->
                <div style="margin-bottom: 12px;">
                    <h3 class="payment-section-title">CONDIÇÕES DE PAGAMENTO</h3>
                    <table class="payment-table">
                        <tbody>
                            <tr>
                                <td style="font-weight: 600;">1.º Pagamento</td>
                                <td>50%</td>
                                <td>${formatCurrency(data.total * 0.5)}</td>
                                <td>Após aceitação do orçamento</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600;">2.º Pagamento</td>
                                <td>50%</td>
                                <td>${formatCurrency(data.total * 0.5)}</td>
                                <td>Após entrega e aprovação</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Payment Methods -->
                <div>
                    <h3 class="payment-section-title">MEIOS DE PAGAMENTO</h3>
                    <div class="payment-methods">
                        <div class="payment-method-row">
                            <span class="payment-method-label">MB Way</span>
                            <span class="payment-method-value">+351 911 178 179 (Francisco Farias)</span>
                        </div>
                        <div class="payment-method-row">
                            <span class="payment-method-label">IBAN</span>
                            <span class="payment-method-value">PT50 0023 0000 45498293582 94</span>
                        </div>
                        <div class="payment-method-row">
                            <span class="payment-method-label">Titular</span>
                            <span class="payment-method-value">Francisco Farias</span>
                        </div>
                        <div class="payment-method-row">
                            <span class="payment-method-label">Referência</span>
                            <span class="payment-method-value">${documentNumber}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>${isQuote ? t.legalNote : t.invoiceLegalNote}</p>
            </div>
    </div>

    ${isQuote ? `
    <!-- Page 2: Terms and Conditions -->
    <div class="page-break" style="width: 210mm; background: white; color: black; padding: 40px 48px;">
            <h2 style="font-size: 22px; font-weight: 600; color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                CLÁUSULAS E CONDIÇÕES
            </h2>

            <div style="margin-bottom: 12px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">1. Âmbito do Trabalho</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    A Framax Solutions compromete-se a entregar o website descrito neste orçamento, incluindo design, desenvolvimento, publicação e configuração do domínio e hospedagem, conforme os valores acordados.
                </p>
            </div>

            <div style="margin-bottom: 12px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">2. Prazo de Entrega</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    O website será entregue no prazo de 7 a 14 dias úteis após receção do primeiro pagamento e dos materiais necessários (logótipo, textos e fotografias, se existirem).
                </p>
            </div>

            <div style="margin-bottom: 12px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">3. Revisões</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    Estão incluídas até 2 rondas de revisões após entrega inicial. Alterações adicionais ou pedidos fora do âmbito acordado serão faturados à tarifa de 20 €/hora.
                </p>
            </div>

            <div style="margin-bottom: 12px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">4. Propriedade</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    Após liquidação total do valor acordado, o cliente adquire a propriedade do website, incluindo código-fonte e elementos de design produzidos pela Framax Solutions.
                </p>
            </div>

            <div style="margin-bottom: 12px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">5. Domínio e Hospedagem</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    O serviço de Domínio e Hospedagem é gerido pela Framax Solutions em nome do cliente. O valor apresentado neste orçamento é referente a 12 meses, contados desde a adjudicação do mesmo.
As condições da renovação anual deste serviço serão comunicadas para o e-mail do cliente, com 30 dias de antecedência.
                </p>
            </div>

            <div style="margin-bottom: 12px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">6. Cancelamento</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    Em caso de cancelamento após início do trabalho, o valor do 1.º pagamento não é reembolsável, sendo compensação pelo trabalho já realizado.
                </p>
            </div>

            <div style="margin-bottom: 12px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">7. Confidencialidade</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    Ambas as partes comprometem-se a manter confidencialidade sobre todas as informações partilhadas no âmbito deste projeto.
                </p>
            </div>

            <div style="margin-bottom: 18px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">8. Regime Fiscal</h3>
                <p style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    Prestador isento de IVA nos termos do art.º 53.º do CIVA. O recibo de ato isolado será emitido através do Portal das Finanças após receção de cada pagamento.
                </p>
            </div>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 14px; margin-top: 20px; page-break-inside: avoid;">
                <h2 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 14px;">ASSINATURAS</h2>
                <p style="font-size: 11px; color: #4b5563; margin-bottom: 16px; line-height: 1.4;">
                    Ao assinar abaixo, o cliente declara ter lido, compreendido e aceite os termos deste documento, autorizando o início do projeto após receção do primeiro pagamento.
                </p>

                <div style="display: flex; gap: 24px; justify-content: space-between;">
                    <!-- Assinatura Cliente -->
                    <div style="flex: 1;">
                        <p style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Pelo Cliente:</p>
                        <div style="margin-bottom: 6px;">
                            <p style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Nome:</p>
                            <div style="border-bottom: 1px solid #d1d5db; width: 100%; height: 16px;"></div>
                        </div>
                        <div style="margin-bottom: 6px;">
                            <p style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Assinatura:</p>
                            <div style="border-bottom: 1px solid #d1d5db; width: 100%; height: 28px;"></div>
                        </div>
                        <div>
                            <p style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Data:</p>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <div style="border-bottom: 1px solid #d1d5db; width: 35px; height: 16px;"></div>
                                <span style="color: #9ca3af; font-size: 11px;">/</span>
                                <div style="border-bottom: 1px solid #d1d5db; width: 35px; height: 16px;"></div>
                                <span style="color: #9ca3af; font-size: 11px;">/</span>
                                <div style="border-bottom: 1px solid #d1d5db; width: 55px; height: 16px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Assinatura Framax Solutions -->
                    <div style="flex: 1;">
                        <p style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Pela Framax Solutions:</p>
                        <div style="margin-bottom: 6px;">
                            <p style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Nome:</p>
                            <div style="border-bottom: 1px solid #d1d5db; width: 100%; height: 16px;"></div>
                        </div>
                        <div style="margin-bottom: 6px;">
                            <p style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Assinatura:</p>
                            <div style="border-bottom: 1px solid #d1d5db; width: 100%; height: 28px;"></div>
                        </div>
                        <div>
                            <p style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Data:</p>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <div style="border-bottom: 1px solid #d1d5db; width: 35px; height: 16px;"></div>
                                <span style="color: #9ca3af; font-size: 11px;">/</span>
                                <div style="border-bottom: 1px solid #d1d5db; width: 35px; height: 16px;"></div>
                                <span style="color: #9ca3af; font-size: 11px;">/</span>
                                <div style="border-bottom: 1px solid #d1d5db; width: 55px; height: 16px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>
    ` : ''}
</body>
</html>
    `.trim();
}
