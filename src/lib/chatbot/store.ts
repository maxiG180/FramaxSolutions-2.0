import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INITIAL_MESSAGE, ANSWERS, findBestMatch } from './flows';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';

export type Message = {
    id: string;
    role: 'bot' | 'user';
    content: string;
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
    addMessage: (role: 'bot' | 'user', content: string) => void;
    handleUserMessage: (content: string) => Promise<void>;
    resetChat: () => void;
};

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            isOpen: false,
            isTyping: false,
            hasSeenWelcome: false,
            sessionId: uuidv4(), // Initialize with a unique session ID
            messages: [
                {
                    id: 'welcome',
                    role: 'bot',
                    content: INITIAL_MESSAGE,
                    timestamp: Date.now(),
                },
            ],

            toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

            setOpen: (open) => set({ isOpen: open }),

            addMessage: (role, content) => {
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: uuidv4(),
                            role,
                            content,
                            timestamp: Date.now(),
                        },
                    ],
                }));
            },

            handleUserMessage: async (content) => {
                const { addMessage, sessionId } = get();
                const supabase = createClient();

                // Add user message
                addMessage('user', content);

                // Set typing
                set({ isTyping: true });

                // Simulate network delay / cognitive processing
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Find answer
                const matchKey = findBestMatch(content);
                const answer = ANSWERS[matchKey];

                // Add bot message
                set({ isTyping: false });
                addMessage('bot', answer);

                // Track interaction in Supabase (Question + Answer pair)
                try {
                    await supabase.from('chatbot_interactions').insert({
                        session_id: sessionId,
                        question: content,
                        answer: answer,
                        matched_intent: matchKey
                    });
                } catch (error) {
                    console.error('Failed to track interaction:', error);
                }
            },

            resetChat: () => {
                set({
                    sessionId: uuidv4(), // Reset session ID on chat reset
                    messages: [
                        {
                            id: uuidv4(),
                            role: 'bot',
                            content: INITIAL_MESSAGE,
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
                // Persist hasSeenWelcome to maintain history continuity
                hasSeenWelcome: state.hasSeenWelcome,
            }),
        }
    )
);
