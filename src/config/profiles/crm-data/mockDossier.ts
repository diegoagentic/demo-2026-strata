// Mock AI Dossier · portado del standalone · usado por StrataAIDossier
// cuando user hace click en "Generate insights" en Opportunity Detail.

export interface DossierData {
    disc: { type: string; title: string; strategy: string }
    insights: string[]
    connection: { text: string; action: string }
    resource: string
}

export const MOCK_DOSSIER: DossierData = {
    disc: {
        type: 'D',
        title: 'High Dominance · The Decision Maker',
        strategy:
            'Skip the small talk. Lead with timelines, ROI, and lead times. Executive summaries, not 50-page catalogs.',
    },
    insights: [
        'Recent CRE filings show a 50,000 sq ft lease signed in Midtown last month.',
        'Announced a hybrid 3-day in-office policy — favors collaborative ancillary over dense workstations.',
        'Public sustainability commitments — lead with eco-certified lines.',
    ],
    connection: {
        text: 'You tagged Gensler ATL as the A&D firm. Dave Smith has closed 4 projects with them this year.',
        action: 'Ping Dave',
    },
    resource:
        'Assign Sarah as Spec Checker — her meticulous documentation suits Financial-sector compliance.',
}
