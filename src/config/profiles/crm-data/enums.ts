// CRM standalone enums · portados del HTML standalone (Downloads/strata crm)
// Diego ask · adaptar el CRM standalone como demo en demo-2026-strata.

export const STAGES = ['Lead', 'Opportunity', 'Quote', 'Order', 'Closed'] as const
export type Stage = typeof STAGES[number]

export const VERTICALS = [
    'Commercial / Corporate',
    'Technology',
    'Financial',
    'Legal',
    'Healthcare',
    'Education (Higher Ed)',
    'Education (K-12)',
    'Government',
    'Hospitality',
    'Life Sciences / Lab',
    'Non-Profit / NGO',
    'Architectural Interiors',
] as const
export type Vertical = typeof VERTICALS[number] | ''

export const PRIMARY_MFRS = [
    'Steelcase',
    'Herman Miller',
    'MillerKnoll',
    'Haworth',
    'Teknion',
    'Knoll',
    'Kimball',
    'Allsteel',
    'HON',
    'Global',
] as const

export const ANCILLARY_SUGGEST = [
    'Coalesse',
    'Designtex',
    'OFS',
    'Allermuir',
    'DIRTT',
    'Enwork',
    'Carolina',
    'Muraflex',
    'Andreu World',
    'Naughtone',
] as const

export const PARTICIPANT_TYPES = [
    'End User (Client)',
    'A&D Firm',
    'General Contractor',
    "PM Firm / Owner's Rep",
    'CRE Broker',
    'Manufacturer Rep',
    'Third-Party Installer',
    'Trades (Electrical / Data)',
] as const

export const CONTRACT_VEHICLES = [
    'GSA',
    'OMNIA Partners',
    'Sourcewell',
    'E&I Cooperative',
    'State Contract',
    'Other',
] as const

export const GPOS = ['Vizient', 'Premier', 'HealthTrust', 'None'] as const

export const PERMIT_STATUS = ['Not started', 'Submitted', 'Under review', 'Approved'] as const

export const INTAKE_COLUMNS = ['Intake', 'Design', 'Spec Check', 'Submission', 'Acknowledgment'] as const
export type IntakeColumn = typeof INTAKE_COLUMNS[number]
