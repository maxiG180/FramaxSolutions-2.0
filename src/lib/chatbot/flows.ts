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
- Facebook: Framax Solutions

How else can I help you?`,



    portfolio: `🎨 **Our Work:**

Our portfolio section is currently under maintenance as we curate our latest projects. 
However, here are some of our recent high-impact solutions:

- **Lumina Finance** (Fintech Dashboard)
- **Velvet & Oak** (Luxury E-commerce)
- **Nexus Health** (SaaS Platform)

Check back soon for the full visual showcase!`,

    team: `👥 **About Us:**

We're a team of software developers from **Portugal**, also based in the **Netherlands**. 

We build custom solutions based on your actual business needs:
- Automation systems
- Management dashboards
- Booking platforms
- Business tools

Real people, real code, real results.`,

    hiring: `🚀 **Join the Team:**

We are primarily looking for creative **Marketing Specialists** and **Designers** to help our clients grow. 

We are also open to talented Developers, though our current focus is on growth and design roles.

Please send your portfolio/CV to: careers@framaxsolutions.com`,

    default: `I can help you with questions about our **Services**, **Pricing**, **Timelines**, or **Maintenance**. What would you like to know?`
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
        keywords: ['timeline', 'schedule', 'deadline', 'date']
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
            /deposit/i,
            /expensive/i,
            /cheap/i
        ],
        keywords: ['money', 'expense', 'bill', 'invoice', 'euro', 'dollar']
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
        keywords: ['care', 'monthly', 'plan', 'hosting']
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
        keywords: ['offerings', 'work', 'create', 'product']
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
            /meeting/i,
            /book/i
        ],
        keywords: ['touch', 'message', 'number', 'address', 'location']
    },

    {
        id: 'portfolio',
        patterns: [
            /example/i,
            /work/i,
            /portfolio/i,
            /case/i,
            /client/i,
            /show/i,
            /see/i
        ],
        keywords: ['sample', 'project', 'previous', 'done']
    },
    {
        id: 'team',
        patterns: [
            /who/i,
            /team/i,
            /people/i,
            /developer/i,
            /designer/i,
            /company/i
        ],
        keywords: ['us', 'we', 'about', 'story']
    },
    {
        id: 'hiring',
        patterns: [
            /job/i,
            /career/i,
            /hiring/i,
            /work for/i,
            /join/i,
            /vacancy/i
        ],
        keywords: ['apply', 'resume', 'cv']
    }
];


// Levenshtein distance algorithm for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export function findBestMatch(input: string): string {
    const lowerInput = input.toLowerCase().trim();

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

    // 3. Fuzzy Matching (Levenshtein Distance) - "Fake AI"
    // We check if any word in the input is close to any keyword
    const inputWords = lowerInput.split(/\s+/);
    let bestMatchId: string | null = null;
    let minDistance = Infinity;

    for (const matcher of QUESTION_MATCHERS) {
        for (const keyword of matcher.keywords) {
            for (const word of inputWords) {
                // Skip very short words to avoid false positives
                if (word.length < 3 || keyword.length < 3) continue;

                const distance = levenshteinDistance(word, keyword);

                // Allow a distance of 1 for shorter words (3-5 chars), and 2 for longer words
                const maxAllowedDistance = keyword.length > 5 ? 2 : 1;

                if (distance <= maxAllowedDistance && distance < minDistance) {
                    minDistance = distance;
                    bestMatchId = matcher.id;
                }
            }
        }
    }

    if (bestMatchId) {
        return bestMatchId;
    }

    return 'default';
}

export const INITIAL_MESSAGE = `👋 Hey! How can I help you today?`;
