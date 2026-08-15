// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · Personas · F74 Phase 1 (2026-08-14)
// SOT §1 Client snapshot · stakeholders + roles verbatim
// ═══════════════════════════════════════════════════════════════════════════════

export interface Persona {
    id: string
    fullName: string
    initials: string
    role: string
    department: 'Accounting' | 'Coordination' | 'Walls' | 'Design' | 'Executive' | 'External'
    // Avatar color hint (semantic · applied via bg-{color}/15 text-{color})
    avatarTone: 'primary' | 'info' | 'success' | 'warning' | 'ai' | 'muted'
    quote?: string  // A verbatim SOT quote character-ally relevant
}

export const PROJEX_PERSONAS: Record<string, Persona> = {
    matt: {
        id: 'matt',
        fullName: 'Matt Magrann',
        initials: 'MM',
        role: 'CEO',
        department: 'Executive',
        avatarTone: 'primary',
        quote: '75% AI with the human touch on it.',
    },
    jacob: {
        id: 'jacob',
        fullName: 'Jacob Swearingen',
        initials: 'JS',
        role: 'Director of Accounting',
        department: 'Accounting',
        avatarTone: 'info',
        quote: 'I\'ve worked with OCRs and I just generally think they\'re great.',
    },
    daniel: {
        id: 'daniel',
        fullName: 'Daniel Louw',
        initials: 'DL',
        role: 'Senior Accountant',
        department: 'Accounting',
        avatarTone: 'info',
    },
    isabella: {
        id: 'isabella',
        fullName: 'Isabella Bressler',
        initials: 'IB',
        role: 'Furniture Coordination Lead',
        department: 'Coordination',
        avatarTone: 'ai',
        quote: 'I created something in Claude where Claude pulls the order entries for me.',
    },
    kelly: {
        id: 'kelly',
        fullName: 'Kelly',
        initials: 'KE',
        role: 'Furniture Coordinator',
        department: 'Coordination',
        avatarTone: 'ai',
    },
    stacy: {
        id: 'stacy',
        fullName: 'Stacy Aiuppy',
        initials: 'SA',
        role: 'Walls Coordinator (sole)',
        department: 'Walls',
        avatarTone: 'warning',
    },
    alec: {
        id: 'alec',
        fullName: 'Alec Gieser',
        initials: 'AG',
        role: 'Walls Director',
        department: 'Walls',
        avatarTone: 'warning',
    },
    jeff: {
        id: 'jeff',
        fullName: 'Jeff Smith',
        initials: 'JS',
        role: 'Project Manager',
        department: 'Coordination',
        avatarTone: 'muted',
    },
    // External roles/apps que aparecen en el flow
    strata: {
        id: 'strata',
        fullName: 'Strata',
        initials: 'ST',
        role: 'AI Assistant',
        department: 'External',
        avatarTone: 'ai',
    },
}
