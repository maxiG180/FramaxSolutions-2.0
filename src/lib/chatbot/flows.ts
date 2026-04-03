type QuestionMatcher = {
    id: string;
    patterns: RegExp[];
    keywords: string[];
};

export const QUESTION_MATCHERS: QuestionMatcher[] = [
    // Greetings — checked first to avoid false positives
    {
        id: 'greeting',
        patterns: [
            /^hi+$/i, /^hey+$/i, /^hello+$/i, /^yo$/i,
            /^olá$/i, /^ola$/i, /^oi$/i,
            /^good morning/i, /^good afternoon/i, /^good evening/i,
            /^bom dia/i, /^boa tarde/i, /^boa noite/i,
            /^what can you (do|help)/i,
            /^how can you help/i,
        ],
        keywords: ['hello', 'hey', 'olá', 'ola', 'greetings']
    },
    {
        id: 'farewell',
        patterns: [
            /^bye+$/i, /^goodbye$/i, /^see ya$/i, /^cya$/i, /^later$/i,
            /^tchau$/i, /^adeus$/i, /^até logo/i, /^ate logo/i, /^até já/i,
            /thanks.*bye/i, /thank you.*bye/i,
        ],
        keywords: ['bye', 'goodbye', 'farewell', 'tchau', 'adeus']
    },
    {
        id: 'thanks',
        patterns: [
            /^thanks?$/i, /^thank you/i, /^thx$/i, /^ty$/i,
            /^obrigad/i, /^muito obrigad/i,
            /^cheers$/i, /^perfect$/i, /^great(,| |$)/i,
            /^awesome$/i, /^got it$/i, /^makes sense$/i,
            /^perfeito$/i, /^ótimo$/i, /^fixe$/i,
        ],
        keywords: ['thanks', 'thank', 'obrigado', 'obrigada', 'cheers']
    },
    {
        id: 'timeline',
        patterns: [
            /how long/i,
            /duration/i,
            /when.*finish/i,
            /delivery time/i,
            /turnaround/i,
            /time.*take/i,
            /quanto.*tempo/i,
            /quando.*termina/i,
            /prazo/i,
            /duraç/i
        ],
        keywords: ['timeline', 'schedule', 'deadline', 'date', 'tempo', 'prazo', 'quando']
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
            /cheap/i,
            /quanto/i,
            /preço/i,
            /valor/i,
            /custo/i,
            /orçamento/i,
            /pagamento/i
        ],
        keywords: ['money', 'expense', 'bill', 'invoice', 'euro', 'dollar', 'dinheiro', 'preço', 'valor', 'custo']
    },
    {
        id: 'maintenance',
        patterns: [
            /maintenance/i,
            /support plan/i,
            /update.*site/i,
            /after.*project/i,
            /fix.*bug/i,
            /bug.*fix/i,
            /manutenç/i,
            /suporte/i,
            /atualiz/i,
            /ajuda.*técni/i,
        ],
        keywords: ['care', 'monthly', 'plan', 'hosting', 'manutenção', 'suporte']
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
            /app/i,
            /serviço/i,
            /fazem/i,
            /oferecem/i,
            /constroem/i
        ],
        keywords: ['offerings', 'work', 'create', 'product', 'serviços', 'trabalho']
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
            /book/i,
            /contacto/i,
            /falar/i,
            /ligar/i,
            /reunião/i,
            /marcar/i
        ],
        keywords: ['touch', 'message', 'number', 'address', 'location', 'contacto', 'telefone', 'reunião']
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
            /see/i,
            /exemplo/i,
            /trabalho/i,
            /projeto/i,
            /ver/i
        ],
        keywords: ['sample', 'project', 'previous', 'done', 'exemplo', 'trabalho', 'portfólio']
    },
    {
        id: 'team',
        patterns: [
            /who/i,
            /team/i,
            /people/i,
            /developer/i,
            /designer/i,
            /company/i,
            /quem/i,
            /equipa/i,
            /pessoas/i
        ],
        keywords: ['us', 'we', 'about', 'story', 'equipa', 'nós']
    },
    {
        id: 'hiring',
        patterns: [
            /job/i,
            /career/i,
            /hiring/i,
            /work for/i,
            /join/i,
            /vacancy/i,
            /vaga/i,
            /emprego/i,
            /carreira/i,
            /trabalhar/i
        ],
        keywords: ['apply', 'resume', 'cv', 'candidat', 'currículo']
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

const FOLLOWUP_PATTERNS = [
    /^more$/i,
    /tell me more/i,
    /more (details?|info|information)/i,
    /what else/i,
    /can you (expand|elaborate|explain more)/i,
    /more about (that|this)/i,
    /go on/i,
    /^continue$/i,
    /^and\??$/i,
    /^ok(,| and| so)? (what|how|tell)/i,
    /keep going/i,
    /anything else/i,
    /mais (detalhes?|informaç)/i,
    /conta(r|-me) mais/i,
    /^mais$/i,
    /o que mais/i,
];

/** Context-aware intents that support _more follow-up variants */
const EXPANDABLE_INTENTS = new Set(['timeline', 'pricing', 'maintenance', 'services']);

export function findBestMatch(input: string, lastIntent?: string | null): string {
    const lowerInput = input.toLowerCase().trim();

    // 0. Follow-up detection — expand on last topic if user asks for more
    if (lastIntent && EXPANDABLE_INTENTS.has(lastIntent)) {
        if (FOLLOWUP_PATTERNS.some(p => p.test(lowerInput))) {
            return `${lastIntent}_more`;
        }
    }

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
