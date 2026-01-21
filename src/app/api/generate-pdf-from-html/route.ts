import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import puppeteer from 'puppeteer';
import { z } from 'zod';
import { validateRequest } from '@/utils/validation';
import { logger } from '@/utils/logger';

/**
 * API route to generate PDF from HTML using puppeteer
 * This ensures consistency between preview and PDF output
 */

const generatePDFSchema = z.object({
    html: z.string().min(1, 'HTML content is required'),
}).strict();

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/generate-pdf-from-html',
                request.headers.get('x-forwarded-for') || undefined
            );
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Validate request
        const body = await request.json();
        const validation = validateRequest(generatePDFSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/generate-pdf-from-html',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const { html } = validation.data;

        // 3. Generate PDF using puppeteer
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

            // 4. Return PDF as blob
            return new NextResponse(new Uint8Array(pdfBuffer), {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="document.pdf"'
                }
            });

        } catch (error) {
            await browser.close();
            throw error;
        }

    } catch (error: any) {
        logger.logApiError('/api/generate-pdf-from-html', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error.message },
            { status: 500 }
        );
    }
}
