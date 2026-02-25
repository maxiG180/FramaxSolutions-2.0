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

    // Actions
    toggleOpen: () => void;
    setOpen: (open: boolean) => void;
    addMessage: (role: 'bot' | 'user', content: string, intentKey?: string) => void;
    handleUserMessage: (content: string, answers: Record<string, string>) => Promise<void>;
    resetChat: (initialMessage: string) => void;
};

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            isOpen: false,
            isTyping: false,
            hasSeenWelcome: false,
            sessionId: uuidv4(),
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

            handleUserMessage: async (content, answers) => {
                const { addMessage, sessionId } = get();
                const supabase = createClient();

                // Add user message
                addMessage('user', content);

                // Set typing
                set({ isTyping: true });

                // Simulate network delay / cognitive processing
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Find answer key and resolve text
                const matchKey = findBestMatch(content);
                const answer = answers[matchKey] ?? answers['default'];

                // Add bot message — store both the resolved text and the intent key
                set({ isTyping: false });
                addMessage('bot', answer, matchKey);

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
