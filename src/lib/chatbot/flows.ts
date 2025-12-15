import { MessageCircle, Clock, CreditCard, Code, Wrench, Briefcase, Phone } from 'lucide-react';

export type PresetQuestion = {
    id: string;
    text: string;
    icon?: any; // Using any for icon component mainly for flexibility
    keyword?: string;
};

export const PRESET_QUESTIONS: PresetQuestion[] = [
    { id: 'timeline', text: 'How long does a project take?', icon: Clock },
    { id: 'pricing', text: 'How does pricing work?', icon: CreditCard },
    { id: 'maintenance', text: 'Do you offer maintenance?', icon: Wrench },
    { id: 'services', text: 'What services do you offer?', icon: Briefcase },
    { id: 'contact', text: 'How can I contact you?', icon: Phone },
];

export const ANSWERS: Record<string, string> = {
    timeline: `⏱️ **Project timelines:**
- Website (Standard): 2-4 weeks
- Website Redesign: 3-4 weeks
- Custom Web App: 4-8 weeks
- Booking System / Blog Add-ons: 1-2 weeks

We provide customized timelines in our proposal.`,

    pricing: `💳 **Our Pricing Structure:**

**Core Services (Custom Quote):**
- Website (Design & Dev)
- Website Redesign
- Custom Web Applications

**Add-Ons (Starting at):**
- Advanced SEO: 299€
- Blog/CMS: 399€+
- Booking System: 499€+

**Monthly Plans:**
- Maintenance: 20€/month
- Domain & Hosting: 29€/month

Book a discovery call for a precise quote!`,

    maintenance: `🔧 **Maintenance Plan:**

**Price:** 20€/month
**Setup:** Immediate
**Includes:**
- Regular updates
- Security patches
- Technical support

We also offer **Domain & Hosting** for 29€/month.`,

    services: `💼 **Our Services:**

**Core:**
- Full Websites (Domain + Hosting + Basic SEO)
- Custom Web Applications
- Website Redesigns

**Add-Ons:**
- Advanced SEO Strategies
- Booking Systems
- Blog/CMS Integration

**Monthly:**
- Maintenance (20€/mo)
- Domain & Hosting (29€/mo)`,

    contact: `📞 **Let's connect:**
- Email: contact@framaxsolutions.com
- Book a discovery call on our website

How else can I help you?`,

    default: `I can help you with questions about our services, pricing, timelines, or maintenance. What would you like to know?`
};

type QuestionMatcher = {
    id: string;
    patterns: RegExp[];
    keywords: string[];
};

export const QUESTION_MATCHERS: QuestionMatcher[] = [
    {
        id: 'timeline',
        patterns: [
            /how long/i,
            /duration/i,
            /when.*finish/i,
            /delivery time/i,
            /turnaround/i,
            /time.*take/i
        ],
        keywords: ['timeline', 'schedule', 'deadline']
    },
    {
        id: 'pricing',
        patterns: [
            /how much/i,
            /cost/i,
            /price/i,
            /pricing/i,
            /quote/i,
            /budget/i,
            /rates/i,
            /payment/i,
            /deposit/i
        ],
        keywords: ['money', 'expense', 'bill', 'invoice']
    },
    {
        id: 'maintenance',
        patterns: [
            /maintenance/i,
            /support/i,
            /update/i,
            /after.*project/i,
            /fix/i,
            /errors/i,
            /bugs/i,
            /help/i
        ],
        keywords: ['care', 'monthly', 'plan']
    },
    {
        id: 'services',
        patterns: [
            /what.*offer/i,
            /services/i,
            /what.*do/i,
            /build/i,
            /make/i,
            /design/i,
            /development/i,
            /website/i,
            /app/i
        ],
        keywords: ['offerings', 'work', 'create']
    },
    {
        id: 'contact',
        patterns: [
            /contact/i,
            /email/i,
            /phone/i,
            /call/i,
            /whatsapp/i,
            /reach/i,
            /talk/i,
            /speak/i,
            /meeting/i
        ],
        keywords: ['touch', 'message', 'number']
    }
];

export function findBestMatch(input: string): string {
    const lowerInput = input.toLowerCase();

    // 1. Check for exact regex matches (highest priority)
    for (const matcher of QUESTION_MATCHERS) {
        if (matcher.patterns.some(pattern => pattern.test(input))) {
            return matcher.id;
        }
    }

    // 2. Check for keyword inclusion (word boundary check is safer)
    for (const matcher of QUESTION_MATCHERS) {
        if (matcher.keywords.some(keyword => lowerInput.includes(keyword))) {
            return matcher.id;
        }
    }

    return 'default';
}

export const INITIAL_MESSAGE = `👋 Hi! I'm the Framax Solutions Assistant. I can answer questions about our services, pricing, timelines, and more. What would you like to know?`;
