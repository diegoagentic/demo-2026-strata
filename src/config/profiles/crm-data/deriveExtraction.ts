import type { ImportFile, ExtractionResult, Participant, Vertical } from './types'
import { blankOpp, fmtFull } from './factories'

export const fileKind = (name: string): ImportFile['kind'] => {
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    if (['eml', 'msg'].includes(ext)) return 'email'
    if (ext === 'pdf') return 'pdf'
    if (['dwg', 'dxf'].includes(ext)) return 'cad'
    if (['png', 'jpg', 'jpeg', 'heic', 'tif', 'tiff', 'gif', 'webp', 'bmp'].includes(ext)) return 'image'
    return 'other'
}

export const prettySize = (b: number): string =>
    b < 1024
        ? `${b} B`
        : b < 1048576
            ? `${(b / 1024).toFixed(0)} KB`
            : `${(b / 1048576).toFixed(1)} MB`

// AI extraction mock · pattern matching simple sobre filenames para
// inferir company / vertical / station count / participants / revenue split.
// Portado as-is del standalone · misma lógica determinística.
export function deriveExtraction(files: ImportFile[]): ExtractionResult {
    const names = files.map(f => f.name)
    const blob = names.join(' ').toLowerCase()
    const kinds = files.map(f => f.kind)
    const firstOf = (k: ImportFile['kind']) => files.find(f => f.kind === k)?.name
    const has = (k: ImportFile['kind']) => kinds.includes(k)

    const COMPANY: [RegExp, { company: string; vertical: Vertical }][] = [
        [/jpmorgan|jpm|chase/, { company: 'JPMorgan', vertical: 'Financial' }],
        [/health|hospital|clinic|jude|medical/, { company: 'Regional Health Partners', vertical: 'Healthcare' }],
        [/gsa|federal|\bgov\b|agency|doh/, { company: 'Dept. of General Services', vertical: 'Government' }],
        [/univers|college|campus|\bedu\b/, { company: 'State University', vertical: 'Education (Higher Ed)' }],
        [/\blaw\b|legal|llp/, { company: 'Morrison & Reed LLP', vertical: 'Legal' }],
        [/tech|labs|data|\bai\b/, { company: 'Northwind Technologies', vertical: 'Technology' }],
    ]
    const match = COMPANY.find(([re]) => re.test(blob))
    const base = match ? match[1] : { company: 'Northwind Trading Co.', vertical: 'Commercial / Corporate' as Vertical }

    const ad =
        (/gensler/.test(blob) && 'Gensler') ||
        (/\bhok\b/.test(blob) && 'HOK') ||
        (/perkins/.test(blob) && 'Perkins&Will') ||
        null
    const gc =
        (/turner/.test(blob) && 'Turner Construction') ||
        (/skanska/.test(blob) && 'Skanska') ||
        (/gilbane/.test(blob) && 'Gilbane') ||
        null

    const stations = has('cad') ? 120 : has('pdf') ? 60 : 30
    const furniture = stations * 6500
    const arch = has('cad') ? stations * 1500 : 0
    const install = Math.round(furniture * 0.12)
    const prof = Math.round(furniture * 0.05)
    const total = furniture + arch + install + prof

    const participants: Participant[] = [{ name: base.company, role: 'End User (Client)' }]
    if (ad) participants.push({ name: ad, role: 'A&D Firm' })
    if (gc) participants.push({ name: gc, role: 'General Contractor' })

    const close = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10)
    const ancillary = has('image') ? ['Coalesse'] : []

    const prefill = {
        ...blankOpp(),
        name: `${base.company} — New Workspace`,
        company: base.company,
        vertical: base.vertical,
        stage: 'Lead' as const,
        probability: 35,
        closeDate: close,
        primaryMfr: 'Steelcase',
        ancillaryMfrs: ancillary,
        revenue: { furniture, arch, install, prof },
        participants,
        headcount: String(stations),
        sources: names,
    }

    const rows = [
        { label: 'Company', value: base.company, source: firstOf('email') || firstOf('pdf'), conf: 'high' as const },
        { label: 'Vertical', value: base.vertical, source: firstOf('pdf') || firstOf('email'), conf: (match ? 'high' : 'med') as 'high' | 'med' },
        { label: 'Estimated value', value: fmtFull(total), source: firstOf('pdf') || firstOf('cad'), conf: 'med' as const },
        { label: 'Station count', value: `~${stations} stations`, source: firstOf('cad') || firstOf('pdf'), conf: (has('cad') ? 'high' : 'med') as 'high' | 'med' },
        { label: 'Primary manufacturer', value: 'Steelcase', source: firstOf('pdf') || firstOf('image'), conf: 'med' as const },
        { label: 'Stakeholders', value: participants.map(p => p.name).join(', '), source: firstOf('email') || firstOf('pdf'), conf: 'med' as const },
    ].filter(r => r.source)

    return { prefill, rows }
}
