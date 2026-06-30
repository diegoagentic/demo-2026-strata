import type { Opportunity } from './types'

export const fmtFull = (v: number): string => '$' + Math.round(v).toLocaleString('en-US')
export const fmtK = (v: number): string => '$' + Math.round(v / 1000).toLocaleString('en-US') + 'k'

export const initials = (name: string): string =>
    name
        .replace(/[^a-zA-Z ]/g, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 3)
        .map(w => w[0])
        .join('')
        .toUpperCase()

export const totalRevenue = (revenue: Opportunity['revenue']): number =>
    revenue.furniture + revenue.arch + revenue.install + revenue.prof

export const blankOpp = (): Opportunity => ({
    id: null,
    name: '',
    company: '',
    vertical: '',
    stage: 'Lead',
    probability: 30,
    closeDate: '',
    color: 'blue',
    primaryMfr: '',
    ancillaryMfrs: [],
    revenue: { furniture: 0, arch: 0, install: 0, prof: 0 },
    participants: [],
    gsaContract: '',
    contractVehicle: '',
    pricingTier: '',
    gpo: '',
    phasedSchedule: '',
    generalContractor: '',
    permitStatus: '',
    prevailingWage: false,
    headcount: '',
    budgetSF: '',
    sources: [],
    aiGenerated: false,
})

export const nextOppId = (opps: Opportunity[]): string => {
    const max = opps.reduce((m, o) => {
        const n = parseInt(String(o.id ?? '').replace(/\D/g, ''), 10)
        return isNaN(n) ? m : Math.max(m, n)
    }, 1000)
    return `OPP-${max + 1}`
}
