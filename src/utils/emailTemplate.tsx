/**
 * Email template component for quote/invoice emails
 * Used in both preview and actual email sending to ensure consistency
 */

interface EmailTemplateProps {
    clientName: string;
    documentNumber: string;
    documentType?: 'quote' | 'invoice';
    validUntil?: string;
    brandBlue?: string;
    language?: 'pt' | 'en';
}

// Translation strings
const translations = {
    pt: {
        quote: 'ORÇAMENTO',
        invoice: 'FATURA',
        dear: 'Caro(a)',
        quoteMessage: 'Segue em anexo o orçamento solicitado. Ficamos à disposição para qualquer esclarecimento.',
        invoiceMessage: 'Segue em anexo a fatura referente aos serviços prestados.',
        document: 'DOCUMENTO',
        validUntil: 'VÁLIDO ATÉ',
        attachmentNote: 'O documento encontra-se em anexo neste email.',
        quotePS: 'P.S. Para aceitar o orçamento ou esclarecer qualquer dúvida, é só responder a este email.',
        invoicePS: 'P.S. Se tiver alguma questão, não hesite em contactar-nos.',
        copyright: '© 2026 Framax Solutions'
    },
    en: {
        quote: 'QUOTE',
        invoice: 'INVOICE',
        dear: 'Dear',
        quoteMessage: 'Please find attached the requested quote. We remain at your disposal for any clarification.',
        invoiceMessage: 'Please find attached the invoice for the services provided.',
        document: 'DOCUMENT',
        validUntil: 'VALID UNTIL',
        attachmentNote: 'The document is attached to this email.',
        quotePS: 'P.S. To accept the quote or clarify any questions, just reply to this email.',
        invoicePS: 'P.S. If you have any questions, please do not hesitate to contact us.',
        copyright: '© 2026 Framax Solutions'
    }
};

export function EmailTemplatePreview({
    clientName,
    documentNumber,
    documentType = 'quote',
    validUntil,
    brandBlue = '#2563eb',
    language = 'pt'
}: EmailTemplateProps) {
    const isQuote = documentType === 'quote';
    const t = translations[language];
    const docTypeLabel = isQuote ? t.quote : t.invoice;

    return (
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif', backgroundColor: '#fafafa', padding: '50px 20px' }}>
            <div style={{ maxWidth: '560px', margin: '0 auto', backgroundColor: '#ffffff' }}>
                {/* Header with Logo */}
                <div style={{ padding: '56px 40px 32px 40px' }}>
                    <img
                        src="https://www.framaxsolutions.com/logos/framax-logo-black.png"
                        alt="Framax Solutions"
                        width="260"
                        style={{ maxWidth: '260px', height: 'auto', marginBottom: '32px', display: 'block' }}
                    />
                    <h1 style={{ margin: '0 0 40px 0', fontSize: '28px', fontWeight: 400, color: brandBlue, lineHeight: 1.3, letterSpacing: '-0.3px' }}>
                        {docTypeLabel} {documentNumber}
                    </h1>
                </div>

                {/* Content */}
                <div style={{ padding: '0 40px 40px 40px' }}>
                    <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#1a1a1a', lineHeight: 1.5 }}>
                        {t.dear} {clientName},
                    </p>

                    <p style={{ margin: '0 0 32px 0', fontSize: '16px', color: '#404040', lineHeight: 1.6 }}>
                        {isQuote ? t.quoteMessage : t.invoiceMessage}
                    </p>

                    {/* Document Info Block */}
                    <div style={{ margin: '0 0 32px 0', borderLeft: `3px solid ${brandBlue}`, backgroundColor: '#fafafa', padding: '28px 24px' }}>
                        <div style={{ paddingBottom: validUntil ? '14px' : '0' }}>
                            <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#737373', letterSpacing: '0.8px' }}>
                                {t.document}
                            </p>
                            <p style={{ margin: '0', fontSize: '15px', color: brandBlue, fontWeight: 500 }}>
                                {documentNumber}
                            </p>
                        </div>
                        {validUntil && (
                            <div>
                                <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#737373', letterSpacing: '0.8px' }}>
                                    {t.validUntil}
                                </p>
                                <p style={{ margin: '0', fontSize: '15px', color: brandBlue, fontWeight: 500 }}>
                                    {new Date(validUntil).toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        )}
                    </div>

                    <p style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#595959', lineHeight: 1.6 }}>
                        {t.attachmentNote}
                    </p>

                    <p style={{ margin: '0 0 32px 0', fontSize: '15px', color: '#737373', lineHeight: 1.6, fontStyle: 'italic' }}>
                        {isQuote ? t.quotePS : t.invoicePS}
                    </p>

                    {/* Separator */}
                    <div style={{ height: '1px', backgroundColor: '#e5e5e5', margin: '40px 0' }}></div>

                    {/* Signature */}
                    <p style={{ margin: '0 0 4px 0', fontSize: '15px', color: brandBlue, fontWeight: 500 }}>
                        Framax Solutions
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#737373' }}>
                        <a href="https://framaxsolutions.com" style={{ color: brandBlue, textDecoration: 'none' }}>
                            framaxsolutions.com
                        </a>
                    </p>
                </div>

                {/* Footer */}
                <div style={{ padding: '32px 40px', backgroundColor: '#fafafa', borderTop: '1px solid #e5e5e5' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#a3a3a3' }}>
                        {t.copyright}
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Generate HTML email template string for actual email sending
 */
export function generateEmailTemplateHTML(data: EmailTemplateProps): string {
    const { clientName, documentNumber, documentType = 'quote', validUntil, language = 'pt' } = data;
    const isQuote = documentType === 'quote';
    const t = translations[language];
    const docTypeLabel = isQuote ? t.quote : t.invoice;
    const brandBlue = '#2563eb';
    const locale = language === 'pt' ? 'pt-PT' : 'en-US';

    return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa;">
        <tr>
            <td style="padding: 50px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff;">

                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 56px 40px 32px 40px;">
                        <img src="https://www.framaxsolutions.com/logos/framax-logo-black.png"
                             alt="Framax Solutions"
                             width="260"
                             style="max-width: 260px; height: auto; margin-bottom: 32px; display: block;" />
                            <h1 style="margin: 0 0 40px 0; font-size: 28px; font-weight: 400; color: ${brandBlue}; line-height: 1.3; letter-spacing: -0.3px;">${docTypeLabel} ${documentNumber}</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1a1a1a; line-height: 1.5;">
                                ${t.dear} ${clientName},
                            </p>

                            <p style="margin: 0 0 32px 0; font-size: 16px; color: #404040; line-height: 1.6;">
                                ${isQuote ? t.quoteMessage : t.invoiceMessage}
                            </p>

                            <!-- Document Info Block -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0; border-left: 3px solid ${brandBlue}; background-color: #fafafa;">
                                <tr>
                                    <td style="padding: 28px 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom: ${validUntil ? '14px' : '0'};">
                                                    <p style="margin: 0 0 2px 0; font-size: 12px; color: #737373; letter-spacing: 0.8px;">${t.document}</p>
                                                    <p style="margin: 0; font-size: 15px; color: ${brandBlue}; font-weight: 500;">${documentNumber}</p>
                                                </td>
                                            </tr>
                                            ${validUntil ? `
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 2px 0; font-size: 12px; color: #737373; letter-spacing: 0.8px;">${t.validUntil}</p>
                                                    <p style="margin: 0; font-size: 15px; color: ${brandBlue}; font-weight: 500;">${new Date(validUntil).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #595959; line-height: 1.6;">
                                ${t.attachmentNote}
                            </p>

                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #737373; line-height: 1.6; font-style: italic;">
                                ${isQuote ? t.quotePS : t.invoicePS}
                            </p>

                            <!-- Separator -->
                            <div style="height: 1px; background-color: #e5e5e5; margin: 40px 0;"></div>

                            <!-- Signature -->
                            <p style="margin: 0 0 4px 0; font-size: 15px; color: ${brandBlue}; font-weight: 500;">
                                Framax Solutions
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #737373;">
                                <a href="https://framaxsolutions.com" style="color: ${brandBlue}; text-decoration: none;">framaxsolutions.com</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 12px; color: #a3a3a3;">${t.copyright}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
