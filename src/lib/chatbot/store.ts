import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { findBestMatch } from './flows';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';

export type Message = {
    id: string;
    role: 'bot' | 'user';
    content: string;
    /**
     * For bot messages only: the matched intent key (e.g. 'pricing', 'timeline').
     * Stored so the component can re-resolve the translated answer text whenever
     * the user switches language — without needing to replay the conversation.
     * 'welcome' is the special key for the initial greeting message.
     */
    intentKey?: string;
    timestamp: number;
};

type ChatState = {
    isOpen: boolean;
    isTyping: boolean;
    hasSeenWelcome: boolean;
    messages: Message[];
    sessionId: string;
    lastIntent: string | null;

    // Actions
    toggleOpen: () => void;
    setOpen: (open: boolean) => void;
    addMessage: (role: 'bot' | 'user', content: string, intentKey?: string) => void;
    handleUserMessage: (content: string, answers: Record<string, string>, language: 'en' | 'pt') => Promise<void>;
    resetChat: (initialMessage: string) => void;
};

/** How many recent messages are sent to the AI as context */
const AI_HISTORY_LENGTH = 10;

/** Ask the AI assistant via our API route. Returns null when it's unavailable. */
async function askAI(
    history: { role: 'bot' | 'user'; content: string }[],
    language: 'en' | 'pt'
): Promise<string | null> {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: history, language }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return typeof data.reply === 'string' && data.reply.trim() ? data.reply : null;
    } catch {
        return null;
    }
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            isOpen: false,
            isTyping: false,
            hasSeenWelcome: false,
            sessionId: uuidv4(),
            lastIntent: null,
            messages: [
                {
                    id: 'welcome',
                    role: 'bot',
                    // Content is a placeholder; the component always renders
                    // bot messages via intentKey → t.chatbot.answers[intentKey]
                    content: '',
                    intentKey: 'welcome',
                    timestamp: Date.now(),
                },
            ],

            toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

            setOpen: (open) => set({ isOpen: open }),

            addMessage: (role, content, intentKey) => {
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: uuidv4(),
                            role,
                            content,
                            intentKey,
                            timestamp: Date.now(),
                        },
                    ],
                }));
            },

            handleUserMessage: async (content, answers, language) => {
                const { addMessage, sessionId, lastIntent, messages } = get();
                const supabase = createClient();

                // Add user message
                addMessage('user', content);

                // Set typing
                set({ isTyping: true });

                const history = [...messages, { role: 'user' as const, content, intentKey: undefined }]
                    .filter((m) => m.intentKey !== 'welcome' && m.content.trim())
                    .slice(-AI_HISTORY_LENGTH)
                    .map(({ role, content }) => ({ role, content: content.slice(0, 2000) }));

                let matchKey = 'ai';
                let answer = await askAI(history, language);

                if (!answer) {
                    // AI unavailable (no key, quota used up, network) — use keyword answers.
                    // Pass lastIntent for contextual follow-up detection.
                    await new Promise((resolve) => setTimeout(resolve, 600));
                    matchKey = findBestMatch(content, lastIntent);
                    answer = answers[matchKey] ?? answers['default'];
                }

                // AI replies have no intentKey, so they're shown as-is; keyword replies
                // keep theirs so they re-translate when the language changes
                set({ isTyping: false, lastIntent: matchKey });
                addMessage('bot', answer, matchKey === 'ai' ? undefined : matchKey);

                // Track interaction in Supabase
                try {
                    await supabase.from('chatbot_interactions').insert({
                        session_id: sessionId,
                        question: content,
                        answer: answer,
                        matched_intent: matchKey
                    });
                } catch (error) {
                    // Non-critical — silently ignore
                }
            },

            resetChat: (initialMessage: string) => {
                set({
                    sessionId: uuidv4(),
                    lastIntent: null,
                    messages: [
                        {
                            id: uuidv4(),
                            role: 'bot',
                            content: initialMessage,
                            intentKey: 'welcome',
                            timestamp: Date.now(),
                        },
                    ],
                });
            }
        }),
        {
            name: 'framax-chatbot-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Persist messages so conversation survives page refresh
                messages: state.messages,
                hasSeenWelcome: state.hasSeenWelcome,
            }),
        }
    )
);
