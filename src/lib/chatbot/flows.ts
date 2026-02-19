import { MessageCircle, Clock, CreditCard, Code, Wrench, Briefcase, Phone } from 'lucide-react';

export type PresetQuestion = {
    id: string;
    text: string;
    icon?: any; // Using any for icon component mainly for flexibility
    keyword?: string;
};

export const PRESET_QUESTIONS: PresetQuestion[] = [
    { id: 'timeline', text: 'Quanto tempo demora um projeto?', icon: Clock },
    { id: 'pricing', text: 'Como funciona o preço?', icon: CreditCard },
    { id: 'maintenance', text: 'Oferecem manutenção?', icon: Wrench },
    { id: 'services', text: 'Que serviços oferecem?', icon: Briefcase },
    { id: 'contact', text: 'Como posso contactar-vos?', icon: Phone },
];

export const ANSWERS: Record<string, string> = {
    timeline: `⏱️ **Prazos dos projetos:**
- Website (Standard): 2-4 semanas
- Redesign de Website: 3-4 semanas
- Aplicação Web Personalizada: 4-8 semanas
- Sistemas de Reservas / Blog Add-ons: 1-2 semanas

Fornecemos prazos personalizados na nossa proposta.`,

    pricing: `💳 **Estrutura de Preços:**

**Serviços Core (Orçamento Personalizado):**
- Website (Design & Desenvolvimento)
- Redesign de Website
- Aplicações Web Personalizadas

**Add-Ons (A partir de):**
- SEO Avançado: 299€
- Blog/CMS: 399€+
- Sistema de Reservas: 499€+

**Planos Mensais:**
- Manutenção: 20€/mês
- Domínio & Alojamento: 29€/mês

Marque uma chamada de descoberta para um orçamento preciso!`,

    maintenance: `🔧 **Plano de Manutenção:**

**Preço:** 20€/mês
**Configuração:** Imediata
**Inclui:**
- Atualizações regulares
- Patches de segurança
- Suporte técnico

Oferecemos também **Domínio & Alojamento** por 29€/mês.`,

    services: `💼 **Os Nossos Serviços:**

**Core:**
- Websites Completos (Domínio + Alojamento + SEO Básico)
- Aplicações Web Personalizadas
- Redesigns de Websites

**Add-Ons:**
- Estratégias de SEO Avançado
- Sistemas de Reservas
- Integração de Blog/CMS

**Mensais:**
- Manutenção (20€/mês)
- Domínio & Alojamento (29€/mês)`,

    contact: `📞 **Vamos ligar-nos:**
- Email: contact@framaxsolutions.com
- Marque uma chamada de descoberta no nosso site
- Facebook: Framax Solutions

Como posso ajudá-lo mais?`,



    portfolio: `🎨 **O Nosso Trabalho:**

A nossa sessão de portfólio está atualmente em manutenção enquanto selecionamos os nossos projetos mais recentes.
No entanto, aqui estão algumas das nossas soluções mais impactantes:

- **Lumina Finance** (Dashboard Fintech)
- **Velvet & Oak** (E-commerce de Luxo)
- **Nexus Health** (Plataforma SaaS)

Volte em breve para a montra visual completa!`,

    team: `👥 **Sobre Nós:**

Somos uma equipa de programadores de **Portugal**, também com presença nos **Países Baixos**.

Construímos soluções personalizadas com base nas suas necessidades reais:
- Sistemas de automação
- Dashboards de gestão
- Plataformas de reservas
- Ferramentas de negócio

Pessoas reais, código real, resultados reais.`,

    hiring: `🚀 **Junte-se à Equipa:**

Procuramos principalmente **Especialistas de Marketing** e **Designers** criativos para ajudar os nossos clientes a crescer.

Estamos também abertos a Programadores talentosos, embora o nosso foco atual seja em funções de crescimento e design.

Envie o seu portfólio/CV para: careers@framaxsolutions.com`,

    default: `Posso ajudá-lo com perguntas sobre os nossos **Serviços**, **Preços**, **Prazos** ou **Manutenção**. O que gostaria de saber?`
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

export const INITIAL_MESSAGE = `👋 Olá! Como posso ajudá-lo hoje?`;
