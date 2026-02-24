/**
 * Utility to generate quote/invoice PDF
 * This function is shared between client-side (QuoteModal) and server-side (email API)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface QuotePDFData {
    quote_number?: string;
    invoice_number?: string;
    client_name: string;
    client_contact?: string;
    client_email?: string;
    client_phone?: string;
    client_address?: string;
    client_nif?: string;
    quote_date?: string;
    invoice_date?: string;
    expiry_date?: string;
    due_date?: string;
    items: Array<{
        description: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    notes?: string;
    currency?: string;
}

export interface QuotePDFOptions {
    type?: 'quote' | 'invoice';
    logoUrl?: string;
    fontBase64?: string;
    translations?: {
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
}

const DEFAULT_TRANSLATIONS = {
    quote: 'ORÇAMENTO',
    invoice: 'FATURA',
    quoteNumber: 'Número de Orçamento',
    invoiceNumber: 'Número de Fatura',
    billTo: 'Faturar a',
    issueDate: 'Data de Emissão',
    validity: 'Validade',
    dueDate: 'Data de Vencimento',
    description: 'Descrição',
    qty: 'Qtd',
    price: 'Preço',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'IVA',
    notesTerms: 'Notas / Termos',
    legalNote: 'Este orçamento não constitui fatura. Após aceitação, será emitida fatura oficial através do Portal das Finanças.',
    invoiceLegalNote: 'Esta fatura foi processada por computador e é válida sem assinatura.',
    nif: 'NIF',
};

/**
 * Generate quote or invoice PDF
 * Returns jsPDF instance
 */
export async function generateQuotePDF(
    data: QuotePDFData,
    options: QuotePDFOptions = {}
): Promise<jsPDF> {
    const {
        type = 'quote',
        logoUrl,
        fontBase64,
        translations = DEFAULT_TRANSLATIONS
    } = options;

    const t = { ...DEFAULT_TRANSLATIONS, ...translations };
    const isQuote = type === 'quote';
    const numberField = isQuote ? 'quote_number' : 'invoice_number';
    const dateField = isQuote ? 'quote_date' : 'invoice_date';

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Try to load custom font (Outfit)
    let customFontLoaded = false;
    if (fontBase64) {
        try {
            doc.addFileToVFS('Outfit-Regular.ttf', fontBase64);
            doc.addFont('Outfit-Regular.ttf', 'Outfit', 'normal');
            doc.addFont('Outfit-Regular.ttf', 'Outfit', 'bold');
            customFontLoaded = true;
        } catch (err) {
            console.error('Error loading custom font:', err);
        }
    }

    // Helper function to get adjusted font size
    const fs = (size: number) => customFontLoaded ? size : Math.round(size * 1.15);

    // Determine which font to use
    const fontFamily = customFontLoaded ? 'Outfit' : 'helvetica';

    // Colors (as tuples for jsPDF type compatibility)
    const primaryBlue: [number, number, number] = [37, 99, 235]; // #2563eb
    const lightGray: [number, number, number] = [107, 114, 128]; // #6b7280
    const darkGray: [number, number, number] = [31, 41, 55]; // #1f2937

    // Load and add logo
    let logoLoaded = false;
    if (logoUrl) {
        try {
            let logoDataUrl: string;

            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && !logoUrl.startsWith('file://')) {
                // Browser environment - use Image element for better compatibility
                await new Promise<void>((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous'; // Handle CORS
                    img.onload = () => {
                        try {
                            // Create canvas to convert image to base64
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                reject(new Error('Failed to get canvas context'));
                                return;
                            }
                            ctx.drawImage(img, 0, 0);
                            logoDataUrl = canvas.toDataURL('image/png');

                            const logoHeight = 8; // mm
                            const logoWidth = logoHeight * 6.92; // mm (maintaining 6.92:1 aspect ratio)
                            doc.addImage(logoDataUrl, 'PNG', 20, 20, logoWidth, logoHeight);
                            logoLoaded = true;
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    };
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = logoUrl;
                });
            } else {
                // Node.js environment (server-side) - use fetch
                const response = await fetch(logoUrl);
                const arrayBuffer = await response.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                logoDataUrl = `data:image/png;base64,${base64}`;

                const logoHeight = 8; // mm
                const logoWidth = logoHeight * 6.92; // mm (maintaining 6.92:1 aspect ratio)
                doc.addImage(logoDataUrl, 'PNG', 20, 20, logoWidth, logoHeight);
                logoLoaded = true;
            }
        } catch (err) {
            console.error('Error loading logo:', err);
        }
    }

    // Company info below logo
    const startY = logoLoaded ? 40 : 20;

    // "Framax Solutions" text
    if (!logoLoaded) {
        doc.setFontSize(fs(10));
        doc.setFont(fontFamily, 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Framax Solutions', 20, startY);
    } else {
        doc.setFontSize(fs(10));
        doc.setFont(fontFamily, 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Framax Solutions', 20, startY);
    }

    // Contacts
    doc.setFontSize(fs(10));
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('contact@framaxsolutions.com', 20, startY + 5);
    doc.text('framaxsolutions.com', 20, startY + 10);

    // Quote/Invoice Title (Right side)
    doc.setFontSize(fs(24));
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(isQuote ? t.quote : t.invoice, pageWidth - 20, 30, { align: 'right' });

    // Number label
    doc.setFontSize(fs(9));
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text((isQuote ? t.quoteNumber : t.invoiceNumber).toUpperCase(), pageWidth - 20, 40, { align: 'right' });

    // Number value
    doc.setFontSize(fs(16));
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const documentNumber = data[numberField] || 'N/A';
    doc.text(documentNumber, pageWidth - 20, 48, { align: 'right' });

    // Bill To Section (Left)
    let yPos = 70;
    doc.setFontSize(fs(9));
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(t.billTo.toUpperCase(), 20, yPos);

    yPos += 8;
    // Client name
    doc.setFontSize(fs(14));
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(data.client_name || 'N/A', 20, yPos);

    yPos += 7;
    // Client details
    doc.setFontSize(fs(11));
    doc.setFont(fontFamily, 'normal');

    if (data.client_contact) {
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(data.client_contact, 20, yPos);
        yPos += 5;
    }

    if (data.client_address) {
        const addressLines = data.client_address.split('\n');
        addressLines.forEach((line) => {
            doc.text(line, 20, yPos);
            yPos += 5;
        });
    }

    if (data.client_email) {
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text(data.client_email, 20, yPos);
        yPos += 5;
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    }

    if (data.client_phone) {
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text(data.client_phone, 20, yPos);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        yPos += 5;
    }

    if (data.client_nif) {
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setFont(fontFamily, 'normal');
        const nifText = `${t.nif}: ${data.client_nif}`;
        doc.text(nifText, 20, yPos);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        yPos += 5;
    }

    // Date Information (Right)
    let dateYPos = 70;
    doc.setFontSize(fs(9));
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(t.issueDate.toUpperCase(), pageWidth - 20, dateYPos, { align: 'right' });

    dateYPos += 7;
    doc.setFontSize(fs(11));
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const dateStr = data[dateField] ? new Date(data[dateField]).toLocaleDateString('pt-PT') : '-';
    doc.text(dateStr, pageWidth - 20, dateYPos, { align: 'right' });

    if (isQuote && data.expiry_date) {
        dateYPos += 15;
        doc.setFontSize(fs(9));
        doc.setFont(fontFamily, 'bold');
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text(t.validity.toUpperCase(), pageWidth - 20, dateYPos, { align: 'right' });

        dateYPos += 7;
        doc.setFontSize(fs(11));
        doc.setFont(fontFamily, 'normal');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const expiryDateStr = new Date(data.expiry_date).toLocaleDateString('pt-PT');
        doc.text(expiryDateStr, pageWidth - 20, dateYPos, { align: 'right' });
    }

    // Items Table
    const tableStartY = Math.max(yPos, dateYPos) + 10;

    const tableData = data.items.map((item) => [
        item.description || '',
        item.quantity.toString(),
        `${item.price.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`,
        `${(item.quantity * item.price).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [[t.description, t.qty, t.price, t.total]],
        body: tableData,
        theme: 'plain',
        styles: {
            font: fontFamily,
            fontSize: fs(11),
            cellPadding: 5,
            lineColor: [243, 244, 246],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: lightGray,
            fontStyle: 'bold',
            fontSize: fs(10),
            lineColor: primaryBlue,
            lineWidth: { bottom: 0.5, top: 0, left: 0, right: 0 },
        },
        bodyStyles: {
            textColor: darkGray,
            lineColor: [255, 255, 255],
            lineWidth: 0,
        },
        columnStyles: {
            0: { cellWidth: 'auto', fontStyle: 'normal', halign: 'left' },
            1: { cellWidth: 20, halign: 'center', textColor: lightGray },
            2: { cellWidth: 30, halign: 'right', textColor: lightGray },
            3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: function (data: any) {
            if (data.section === 'head') {
                if (data.column.index === 1) {
                    data.cell.styles.halign = 'center';
                } else if (data.column.index === 2 || data.column.index === 3) {
                    data.cell.styles.halign = 'right';
                }
            }
        },
        margin: { left: 20, right: 20 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : tableStartY + 50;
    const totalsX = pageWidth - 70;
    let totalsY = finalY;

    // Subtotal and Tax
    doc.setFontSize(fs(11));
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);

    // Subtotal
    doc.text(t.subtotal, totalsX, totalsY);
    doc.text(`${data.subtotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`, pageWidth - 20, totalsY, { align: 'right' });

    totalsY += 8;

    // IVA
    const taxPercentage = (data.tax_rate * 100).toFixed(0);
    doc.text(`${t.tax} (${taxPercentage}%)`, totalsX, totalsY);
    doc.text(`${data.tax_amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`, pageWidth - 20, totalsY, { align: 'right' });

    totalsY += 12;

    // Border line above total
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(totalsX, totalsY - 3, pageWidth - 20, totalsY - 3);

    // Total
    doc.setFontSize(fs(16));
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(t.total, totalsX, totalsY + 2);
    doc.text(`${data.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`, pageWidth - 20, totalsY + 2, { align: 'right' });

    // Notes
    if (data.notes) {
        totalsY += 20;

        // Border above notes
        doc.setDrawColor(243, 244, 246);
        doc.setLineWidth(0.4);
        doc.line(20, totalsY - 5, pageWidth - 20, totalsY - 5);

        // Notes header
        doc.setFontSize(fs(10));
        doc.setFont(fontFamily, 'bold');
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text(t.notesTerms.toUpperCase(), 20, totalsY);

        totalsY += 6;
        // Notes content
        doc.setFontSize(fs(11));
        doc.setFont(fontFamily, 'normal');
        doc.setTextColor(lightGray[0] + 20, lightGray[1] + 20, lightGray[2] + 20);

        const notesLines = doc.splitTextToSize(data.notes, pageWidth - 40);
        doc.text(notesLines, 20, totalsY);
    }

    // Footer - Legal Note
    const footerY = pageHeight - 25;

    doc.setFontSize(fs(10));
    doc.setFont(fontFamily, 'italic');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const legalNoteLines = doc.splitTextToSize(t.legalNote, pageWidth - 40);
    doc.text(legalNoteLines, pageWidth / 2, footerY, { align: 'center' });

    return doc;
}
