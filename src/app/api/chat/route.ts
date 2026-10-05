import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateRequest, chatRequestSchema } from '@/utils/validation';
import { logger } from '@/utils/logger';
import { buildSystemPrompt } from '@/lib/chatbot/knowledge';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_USER_MESSAGE_LENGTH = 500;
const REQUEST_TIMEOUT_MS = 15_000;

type GeminiContent = { role: 'user' | 'model'; parts: { text: string }[] };

type GeminiResponse = {
    candidates?: {
        content?: { parts?: { text?: string; thought?: boolean }[] };
        finishReason?: string;
    }[];
    promptFeedback?: { blockReason?: string };
};

/**
 * Website chatbot. Answers with Gemini when it's configured and available;
 * otherwise returns { fallback: true, reason } and the widget uses its keyword answers.
 * Failures are logged with console.* because the shared logger only prints in development.
 */
export async function POST(request: NextRequest) {
    const rateLimitResponse = rateLimit(request, RATE_LIMITS.CHATBOT);
    if (rateLimitResponse) {
        const forwarded = request.headers.get('x-forwarded-for');
        logger.logRateLimit('/api/chat', forwarded ? forwarded.split(',')[0] : 'unknown');
        return rateLimitResponse;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('[api/chat] GEMINI_API_KEY is not set in this deployment');
        return NextResponse.json({ fallback: true, reason: 'not_configured' });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = validateRequest(chatRequestSchema, body);
    if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { messages, language } = validation.data;
    const last = messages[messages.length - 1];
    if (last.role !== 'user' || last.content.length > MAX_USER_MESSAGE_LENGTH) {
        return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Gemini expects alternating turns starting with the user
    const contents: GeminiContent[] = [];
    for (const message of messages) {
        const role = message.role === 'user' ? 'user' : 'model';
        if (contents.length === 0 && role === 'model') continue;
        const previous = contents[contents.length - 1];
        if (previous?.role === role) {
            previous.parts.push({ text: message.content });
        } else {
            contents.push({ role, parts: [{ text: message.content }] });
        }
    }

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: buildSystemPrompt(language) }] },
                contents,
                generationConfig: { maxOutputTokens: 1024 },
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
            // 429 = free quota used up; 400/403 = invalid or restricted API key
            console.warn('[api/chat] Gemini request failed', response.status, (await response.text()).slice(0, 300));
            return NextResponse.json({ fallback: true, reason: `upstream_${response.status}` });
        }

        const data = (await response.json()) as GeminiResponse;
        const reply = (data.candidates?.[0]?.content?.parts ?? [])
            .filter((part) => !part.thought)
            .map((part) => part.text ?? '')
            .join('')
            .trim();

        if (!reply) {
            console.warn('[api/chat] Gemini returned no text', data.candidates?.[0]?.finishReason, data.promptFeedback?.blockReason);
            return NextResponse.json({ fallback: true, reason: 'empty_reply' });
        }

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('[api/chat] Gemini request error', error instanceof Error ? error.message : error);
        return NextResponse.json({ fallback: true, reason: 'request_failed' });
    }
}
