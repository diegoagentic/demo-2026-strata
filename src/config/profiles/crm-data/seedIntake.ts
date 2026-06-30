import type { IntakeCardData } from './types'

// Seed intake cards · portado del standalone (3 cards: NYC DOH / JPM ATL / GSA DC2).
export const SEED_INTAKE: IntakeCardData[] = [
    {
        code: 'NYC-DOH-2847',
        badge: 'DOH',
        color: 'green',
        org: 'NYC Dept. of Health · Brooklyn',
        meta: 'Form received · 18 stations · awaiting designer assignment',
        assignee: 'Unassigned',
        amount: 148200,
        column: 'Intake',
    },
    {
        code: 'JPM-ATL-4471',
        badge: 'JPM',
        color: 'orange',
        org: 'JPMorgan · Atlanta HQ',
        meta: 'Full floor · 200+ stations · 3-day burst week',
        assignee: "James O'Brien (DC)",
        amount: 892400,
        column: 'Spec Check',
    },
    {
        code: 'GSA-DC2-0892',
        badge: 'GSA',
        color: 'yellow',
        org: 'GSA · DC2 (price-protected)',
        meta: 'SP4 in NetSuite · awaiting Caitlin to release PO',
        assignee: 'Sandra Park (DC)',
        amount: 76500,
        column: 'Submission',
    },
]
