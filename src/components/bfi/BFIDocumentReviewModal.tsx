/**
 * BFIDocumentReviewModal
 * Adapts Smart Comparator's DocumentPreviewModal + FieldReviewModal
 * for the BFI Agency Fee demo (DOE-2847 / Q-2026-0089).
 *
 * Left panel (3/5): Tabs — SIF document preview | Floor Plan
 * Right panel (2/5): Field review with OVNIQ-based discrepancy resolution
 *
 * step prop controls which fields and funnel position are shown.
 */

import { useState, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X, FileText, Truck, Package,
    ChevronDown, ChevronUp, CheckCircle2, Sparkles,
    Edit, Zap, Info, MapPin, Send, MessageSquare, Users, AlertCircle,
    Download
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BFIReviewStep = 'extract' | 'quote' | 'val-sif' | 'val-ovniq' | 'labor' | 'cpr' | 'fee'

interface BFIDocumentReviewModalProps {
    isOpen: boolean
    onClose: () => void
    step: BFIReviewStep
    onValidate?: () => void
    scenario?: 'match' | 'gap'  // for step='fee'
}

interface ReviewField {
    id: string
    name: string
    category: 'header' | 'labor' | 'items' | 'logistics' | 'fee'
    extractedValue: string
    expectedValue?: string
    ovniqSuggestion?: string
    status: 'valid' | 'inconsistent' | 'missing'
    reason?: string
}

// ─── Floor Plan SVG ──────────────────────────────────────────────────────────

export function FloorPlanSVG() {
    return (
        <svg viewBox="0 0 300 145" width="100%" className="block rounded border border-zinc-300 bg-white">
            <rect x="0.5" y="0.5" width="299" height="144" fill="#f9f9f9" stroke="#52525b" strokeWidth="1.5"/>
            <line x1="188" y1="0.5" x2="188" y2="144.5" stroke="#52525b" strokeWidth="1.5"/>
            <line x1="188" y1="73" x2="299.5" y2="73" stroke="#52525b" strokeWidth="1.5"/>
            <line x1="8" y1="65" x2="185" y2="65" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3"/>
            <line x1="93" y1="14" x2="93" y2="140" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3"/>
            <text x="6" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ZONE A · WORKSTATIONS ×24</text>
            {([[8,18],[100,18],[8,78],[100,78]] as [number,number][]).map(([px,py],pi) => (
                <g key={pi}>
                    {[0,1,2].map(i => (
                        <g key={i}>
                            <rect x={px+i*27} y={py} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5"/>
                            <rect x={px+i*27+8} y={py+11} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5"/>
                            <rect x={px+i*27+8} y={py+19} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5"/>
                            <rect x={px+i*27} y={py+24} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5"/>
                        </g>
                    ))}
                </g>
            ))}
            <text x="193" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ZONE B · LOUNGE ×12</text>
            <rect x="192" y="17" width="50" height="20" rx="3" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8"/>
            <rect x="192" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5"/>
            <rect x="235" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5"/>
            <line x1="199" y1="30" x2="235" y2="30" stroke="#71717a" strokeWidth="0.4" strokeDasharray="2,2"/>
            <ellipse cx="217" cy="48" rx="13" ry="6" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="192" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="242" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="204" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="219" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <text x="193" y="82" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ZONE C · FILING ×6</text>
            {[0,1,2,3,4,5].map(i => (
                <g key={i}>
                    <rect x={193+i*18} y={89} width={15} height={22} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" rx="0.5"/>
                    <line x1={193+i*18} y1={100} x2={208+i*18} y2={100} stroke="#71717a" strokeWidth="0.4"/>
                    <circle cx={200.5+i*18} cy={95} r="1.2" fill="#71717a"/>
                    <circle cx={200.5+i*18} cy={106} r="1.2" fill="#71717a"/>
                </g>
            ))}
        </svg>
    )
}

// ─── Specs PDF Tab ───────────────────────────────────────────────────────────

const SPECS_PDF_ROWS = [
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', finish: 'White/Silver', net: '$2,840.00', list: '$4,200.00' },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', finish: 'Fog fabric',   net: '$1,960.00', list: '$2,900.00' },
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  finish: 'Platinum',     net: '$740.00',   list: '$1,100.00' },
]

function SpecsPDFTab() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950 scrollbar-minimal">
                <div className="mx-auto w-full bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    {/* Brand bar */}
                    <div className="h-1.5 bg-gradient-to-r from-primary to-[#C3E433]" />

                    {/* Doc header */}
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
                        <div>
                            <span className="inline-block text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded mb-2">Product Specification</span>
                            <p className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight">DOE-2847</p>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">NYC Dept. of Education · Q-2026-0089</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">MILLER KNOLL</div>
                            <div className="text-xs text-zinc-400 mt-0.5">Robert Chen · Rep</div>
                        </div>
                    </div>

                    {/* Band */}
                    <div className="bg-zinc-800 dark:bg-zinc-700 px-6 py-1.5">
                        <span className="text-[8px] font-bold uppercase text-zinc-200 tracking-widest">PRODUCT SPECIFICATIONS</span>
                    </div>

                    {/* Spec rows */}
                    <div className="px-6 py-4 space-y-3">
                        <div className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Product Specifications</div>
                        {SPECS_PDF_ROWS.map(item => (
                            <div key={item.code} className="flex gap-3 items-start border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{item.code} · {item.name} {item.qty}</div>
                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Finish: {item.finish}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{item.net}</div>
                                    <div className="text-[9px] text-zinc-400 dark:text-zinc-500">List {item.list}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center py-3 border-t border-zinc-100 dark:border-zinc-800">
                        Read-only · Submitted by Robert Chen · Miller Knoll
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── SIF Document Mock Preview ───────────────────────────────────────────────

interface SifField { name: string; value: string; status: 'valid' | 'inconsistent' | 'missing' }
interface SifGroup { id: string; label: string; icon: typeof FileText; fields: SifField[] }

const SIF_GROUPS: SifGroup[] = [
    {
        id: 'header', label: 'Document Header', icon: FileText,
        fields: [
            { name: 'Quote #',    value: 'Q-2026-0089',            status: 'valid' },
            { name: 'Contract',   value: 'CoNY · City of New York', status: 'valid' },
            { name: 'Agency',     value: 'NYC Dept. of Education',  status: 'valid' },
            { name: 'Date',       value: 'May 6, 2026',            status: 'valid' },
        ]
    },
    {
        id: 'labor', label: 'Labor (from SIF)', icon: Package,
        fields: [
            { name: 'Carpenters labor',    value: '50h',     status: 'inconsistent' },
            { name: 'Overtime labor',      value: '8h',      status: 'inconsistent' },
            { name: 'Zone A workstations', value: '24 units', status: 'valid' },
            { name: 'Zone B chairs',       value: '48 units', status: 'valid' },
        ]
    },
    {
        id: 'logistics', label: 'Pricing & Delivery', icon: Truck,
        fields: [
            { name: 'Installation',    value: '$12,400',   status: 'valid' },
            { name: 'Delivery window', value: 'May 14–21', status: 'valid' },
            { name: 'Total value',     value: '$48,200',   status: 'valid' },
        ]
    },
]

function SIFDocumentPreview() {
    const allFields = SIF_GROUPS.flatMap(g => g.fields)
    const validCount = allFields.filter(f => f.status === 'valid').length
    const issueCount = allFields.filter(f => f.status !== 'valid').length

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950 scrollbar-minimal">
                <div className="mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    {/* Brand bar */}
                    <div className="h-1.5 bg-gradient-to-r from-primary to-[#C3E433]" />

                    {/* Doc header */}
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
                        <div>
                            <span className="inline-block text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded mb-2">SIF Document</span>
                            <p className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight">DOE-2847</p>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">NYC Dept. of Education · Herman Miller</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-extrabold text-zinc-900 dark:text-white">Q-2026-0089</div>
                            <div className="text-xs text-zinc-400 mt-0.5">May 6, 2026</div>
                        </div>
                    </div>

                    {/* Stats mini row */}
                    <div className="grid grid-cols-3 border-b border-zinc-100 dark:border-zinc-800">
                        {[
                            { label: 'Valid', value: validCount, color: 'text-success', bg: 'bg-success/10' },
                            { label: 'Issues', value: issueCount, color: 'text-warning', bg: 'bg-warning/10' },
                            { label: 'Total', value: allFields.length, color: 'text-foreground', bg: 'bg-muted/30' },
                        ].map((s, i) => (
                            <div key={i} className={`${s.bg} px-3 py-2 ${i < 2 ? 'border-r border-border' : ''}`}>
                                <div className={`text-base font-extrabold ${s.color}`}>{s.value}</div>
                                <div className="text-[9px] text-zinc-500 uppercase tracking-wide">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Field groups */}
                    <div className="px-6 py-4 space-y-4">
                        {SIF_GROUPS.map(group => (
                            <div key={group.id}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-3 bg-primary rounded-full" />
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{group.label}</p>
                                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                                </div>
                                <div className="rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                    {group.fields.map((field, i) => (
                                        <div key={i} className={`flex items-center justify-between py-1.5 px-3 text-[11px] ${
                                            i % 2 === 0 ? '' : 'bg-muted/30'
                                        } ${field.status === 'inconsistent' ? '!bg-warning/10' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                                    field.status === 'valid' ? 'bg-success' : 'bg-warning'
                                                }`} />
                                                <span className="text-muted-foreground">{field.name}</span>
                                            </div>
                                            <span className={`font-semibold ${
                                                field.status === 'inconsistent' ? 'text-warning' : 'text-foreground'
                                            }`}>{field.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mx-6 mb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
                                <span className="text-[8px] font-extrabold text-primary">S</span>
                            </div>
                            <span className="text-[9px] text-zinc-400">Strata AI · OCR Extraction</span>
                        </div>
                        <span className="text-[9px] text-zinc-300 dark:text-zinc-600">Confidential</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Field data per step ─────────────────────────────────────────────────────

const FIELDS_EXTRACT: ReviewField[] = [
    {
        id: 'f1', name: 'Carpenters labor', category: 'labor',
        extractedValue: '50h', expectedValue: '45h', ovniqSuggestion: '45h',
        status: 'inconsistent',
        reason: 'OmniQuote detectó 45h en contrato CoNY. El SIF indica 50h — discrepancia de 5h · Impact: −$1,800.',
    },
    {
        id: 'f2', name: 'Overtime labor', category: 'labor',
        extractedValue: '8h', expectedValue: '6h', ovniqSuggestion: '6h',
        status: 'inconsistent',
        reason: 'OmniQuote establece 6h overtime según T-code aplicado. SIF indica 8h · Impact: −$540.',
    },
    { id: 'f3', name: 'Zone A workstations', category: 'items', extractedValue: '24 units', status: 'valid' },
    { id: 'f4', name: 'Zone B chairs',       category: 'items', extractedValue: '48 units', status: 'valid' },
    { id: 'f5', name: 'Installation',        category: 'logistics', extractedValue: '$12,400', status: 'valid' },
    { id: 'f6', name: 'Delivery window',     category: 'logistics', extractedValue: 'May 14–21', status: 'valid' },
]

const FIELDS_LABOR: ReviewField[] = [
    {
        id: 'l1', name: 'PO Labor hours', category: 'labor',
        extractedValue: '48h', expectedValue: '45h', ovniqSuggestion: '45h',
        status: 'inconsistent',
        reason: 'PO indica 48h pero el quote ajustado por OmniQuote es 45h.',
    },
    { id: 'l2', name: 'WIG delivery date', category: 'logistics', extractedValue: 'May 14, 2026', status: 'valid' },
    { id: 'l3', name: 'Install crew',      category: 'labor',    extractedValue: '3 techs', status: 'valid' },
    { id: 'l4', name: 'PO total',          category: 'fee',      extractedValue: '$45,860', status: 'valid' },
]

const FIELDS_CPR: ReviewField[] = [
    {
        id: 'c1', name: 'Carpenters (CPR)', category: 'labor',
        extractedValue: '45h', expectedValue: '50h', ovniqSuggestion: '45h',
        status: 'inconsistent',
        reason: 'CPR muestra 45h reales vs 50h citados. OmniQuote confirma 45h — aceptar CPR.',
    },
    {
        id: 'c2', name: 'OT Carpenters (CPR)', category: 'labor',
        extractedValue: '6h', expectedValue: '8h', ovniqSuggestion: '6h',
        status: 'inconsistent',
        reason: 'CPR muestra 6h OT vs 8h citados. OmniQuote confirma 6h — aceptar CPR.',
    },
    { id: 'c3', name: 'Equipment rental', category: 'items',    extractedValue: '$1,200', status: 'valid' },
    { id: 'c4', name: 'Delivery (actual)', category: 'logistics', extractedValue: 'May 15, 2026', status: 'valid' },
]

const FIELDS_FEE_MATCH: ReviewField[] = [
    { id: 'fe1', name: 'Zone A workstations', category: 'fee', extractedValue: '$18,400', status: 'valid' },
    { id: 'fe2', name: 'Zone B chairs',       category: 'fee', extractedValue: '$9,600',  status: 'valid' },
    { id: 'fe3', name: 'Installation',        category: 'fee', extractedValue: '$12,400', status: 'valid' },
    { id: 'fe4', name: 'Agency fee total',    category: 'fee', extractedValue: '$4,820',  status: 'valid' },
]

const FIELDS_FEE_GAP: ReviewField[] = [
    { id: 'fe1', name: 'Zone A workstations', category: 'fee', extractedValue: '$18,400', status: 'valid' },
    { id: 'fe2', name: 'Zone B chairs',       category: 'fee', extractedValue: '$9,600',  status: 'valid' },
    { id: 'fe3', name: 'Installation',        category: 'fee', extractedValue: '$12,400', status: 'valid' },
    {
        id: 'fe4', name: 'Agency fee total', category: 'fee',
        extractedValue: '$4,505', expectedValue: '$4,820', ovniqSuggestion: '$4,820',
        status: 'inconsistent',
        reason: 'MK Invoice muestra $4,505. Expected $4,820 — gap de −$315. Contactar Robert Chen.',
    },
]

function getFields(step: BFIReviewStep, scenario?: 'match' | 'gap'): ReviewField[] {
    if (step === 'labor')   return FIELDS_LABOR
    if (step === 'cpr')     return FIELDS_CPR
    if (step === 'fee')     return scenario === 'gap' ? FIELDS_FEE_GAP : FIELDS_FEE_MATCH
    return FIELDS_EXTRACT
}

// ─── Attachments Panel ───────────────────────────────────────────────────────

const BFI_ATTACHMENTS = [
    {
        category: 'CPR',
        files: [
            { name: 'CPR-DOT-25271.pdf',   path: '/docs/bfi/cpr/CPR-DOT-25271.pdf'   },
            { name: 'CPR-NYPL-17706.pdf',  path: '/docs/bfi/cpr/CPR-NYPL-17706.pdf'  },
        ],
    },
    {
        category: 'Invoices',
        files: [
            { name: 'invoice-030923-NYPL.pdf',       path: '/docs/bfi/invoices/invoice-030923-NYPL.pdf'       },
            { name: 'invoice-email-17706.pdf',        path: '/docs/bfi/invoices/invoice-email-17706.pdf'        },
            { name: 'lauren-email-assessment.pdf',    path: '/docs/bfi/invoices/lauren-email-assessment.pdf'    },
        ],
    },
    {
        category: 'Receiving',
        files: [
            { name: 'RR-37577-missing.pdf', path: '/docs/bfi/receiving/RR-37577-missing.pdf' },
            { name: 'RR-37578-normal.pdf',  path: '/docs/bfi/receiving/RR-37578-normal.pdf'  },
        ],
    },
    {
        category: 'Sign-In',
        files: [
            { name: 'signin-NYPL-17706.pdf', path: '/docs/bfi/signin/signin-NYPL-17706.pdf' },
        ],
    },
]

function AttachmentsPanel() {
    const [expanded, setExpanded] = useState<string | null>(null)

    return (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {BFI_ATTACHMENTS.map(group => (
                <div key={group.category}>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{group.category}</p>
                    <div className="space-y-1.5">
                        {group.files.map(file => {
                            const isOpen = expanded === file.path
                            return (
                                <div key={file.path} className={`rounded-xl border transition-all ${isOpen ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                                    <div className="flex items-center gap-2.5 px-3 py-2">
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-[11px] font-medium text-foreground flex-1 min-w-0 truncate">{file.name}</span>
                                        <button
                                            onClick={() => setExpanded(isOpen ? null : file.path)}
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors shrink-0 ${
                                                isOpen
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {isOpen ? 'Close' : 'Preview'}
                                        </button>
                                    </div>
                                    {isOpen && (
                                        <div className="px-3 pb-3 animate-in fade-in duration-200">
                                            <iframe
                                                src={file.path}
                                                className="w-full rounded-lg border border-border"
                                                style={{ height: 220 }}
                                                title={file.name}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── CPR Review Panel ─────────────────────────────────────────────────────────

const CPR_LINES = [
    { id: 'teamsters',       category: 'Teamsters',      quoted: '24h', cpr: '24h', diff: null,   impact: null,     ok: true  },
    { id: 'carpenters',      category: 'Carpenters',     quoted: '50h', cpr: '45h', diff: '-5h',  impact: '-$1,800', ok: false },
    { id: 'ot-carpenters',   category: 'OT Carpenters',  quoted: '8h',  cpr: '6h',  diff: '-2h',  impact: '-$540',  ok: false },
    { id: 'inside-delivery', category: 'Inside Delivery', quoted: '4h', cpr: '4h',  diff: null,   impact: null,     ok: true  },
]

function CPRReviewPanel({ onValidate }: { onValidate?: () => void }) {
    const [approved, setApproved] = useState<Set<string>>(new Set())
    const [sent, setSent]         = useState(false)
    const [rightTab, setRightTab] = useState<'review' | 'attachments'>('review')

    const diffLines    = CPR_LINES.filter(l => !l.ok)
    const allApproved  = diffLines.every(l => approved.has(l.id))
    const totalImpact  = '-$2,340'

    const handleApprove = (id: string) => setApproved(prev => new Set([...prev, id]))

    const handleSend = () => {
        setSent(true)
        setTimeout(() => onValidate?.(), 600)
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 min-h-0">
            {/* Header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">CPR RECONCILIATION</h4>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">DOE-2847 · Approve adjusted labor lines</p>
            </div>

            {/* Right panel tabs */}
            <div className="flex gap-1 px-5 py-2 border-b border-border shrink-0 bg-background">
                {(['review', 'attachments'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setRightTab(t)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            rightTab === t
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {t === 'review' ? 'CPR Review' : 'Attachments'}
                    </button>
                ))}
            </div>

            {rightTab === 'attachments' ? (
                <AttachmentsPanel />
            ) : (
            <div className="flex-1 overflow-y-auto">
                {/* AI Banner */}
                <div className="mx-5 mt-4 flex items-start gap-2 p-3 bg-ai/5 border border-ai/20 rounded-xl">
                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                    <p className="text-[11px] text-ai leading-relaxed">
                        CPR reconciliation complete · Carpenters −5h · OT −2h · Total impact: <span className="font-bold">{totalImpact}</span>
                    </p>
                </div>

                {/* CPR table */}
                <div className="px-5 mt-4">
                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="grid grid-cols-4 px-3 py-2 bg-muted/40 border-b border-border">
                            {['Category', 'Quoted', 'CPR', 'Impact'].map(h => (
                                <span key={h} className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>
                        {CPR_LINES.map(line => {
                            const isApproved = approved.has(line.id)
                            return (
                                <div key={line.id} className={`grid grid-cols-4 items-center px-3 py-2.5 border-b border-border/50 last:border-0 transition-colors ${
                                    isApproved ? 'bg-success/5' : line.ok ? '' : 'bg-warning/5'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                            isApproved ? 'bg-success' : line.ok ? 'bg-success' : 'bg-warning'
                                        }`} />
                                        <span className="text-[11px] font-medium text-foreground">{line.category}</span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground font-mono">{line.quoted}</span>
                                    <span className={`text-[11px] font-mono font-semibold ${line.ok ? 'text-foreground' : 'text-warning'}`}>
                                        {line.cpr}
                                    </span>
                                    <div className="flex items-center justify-between gap-1">
                                        <span className={`text-[11px] font-mono font-semibold ${line.impact ? 'text-warning' : 'text-muted-foreground'}`}>
                                            {line.impact ?? '—'}
                                        </span>
                                        {!line.ok && !isApproved && (
                                            <button
                                                onClick={() => handleApprove(line.id)}
                                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all shrink-0"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {isApproved && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                                    </div>
                                </div>
                            )
                        })}
                        <div className="grid grid-cols-4 px-3 py-2 bg-warning/5 border-t border-warning/20">
                            <span className="text-[10px] font-black text-foreground col-span-3 uppercase tracking-wide">Total impact</span>
                            <span className="text-[11px] font-black text-warning font-mono">{totalImpact}</span>
                        </div>
                    </div>
                </div>

                {/* Relay message — appears when all approved */}
                {allApproved && (
                    <div className="mx-5 mt-4 rounded-xl border border-ai/30 bg-ai/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-ai/20 bg-ai/10">
                            <MessageSquare className="h-3.5 w-3.5 text-ai shrink-0" />
                            <span className="text-[11px] font-bold text-ai">Relay to Stakeholders</span>
                            {sent && <CheckCircle2 className="h-3.5 w-3.5 text-success ml-auto" />}
                        </div>
                        <div className="px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <Users className="h-3 w-3 shrink-0" />
                                <span>To: <span className="font-semibold text-foreground">Michael Chen, Nancy Rodriguez</span></span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Subject: <span className="font-semibold text-foreground">CPR Revision — DOE-2847</span>
                            </div>
                            <div className="mt-2 p-3 bg-card rounded-lg border border-border text-[11px] text-foreground leading-relaxed">
                                CPR reconciliation complete. Labor adjusted: Carpenters −5h (−$1,800), OT −2h (−$540). Total impact: −$2,340. SIF has been updated accordingly.
                            </div>
                        </div>
                        <div className="flex gap-2 px-4 pb-3">
                            <button
                                onClick={handleSend}
                                disabled={sent}
                                className={`flex items-center gap-1.5 flex-1 justify-center py-2 text-[12px] font-bold rounded-lg transition-all ${
                                    sent ? 'bg-success/10 text-success border border-success/20' : 'bg-ai text-white hover:opacity-90'
                                }`}
                            >
                                <Send className="h-3.5 w-3.5" />
                                {sent ? 'Sent' : 'Send Message'}
                            </button>
                            <button
                                onClick={() => {}}
                                className="py-2 px-4 text-[12px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all flex items-center gap-1.5"
                            >
                                <Edit className="h-3.5 w-3.5" /> Edit
                            </button>
                        </div>
                    </div>
                )}

                <div className="h-4" />
            </div>
            )}

            {/* Footer — only shown on CPR Review tab */}
            {rightTab === 'review' && (
            <div className="px-5 py-4 border-t border-border bg-white dark:bg-zinc-900 shrink-0">
                <div className="text-[10px] text-muted-foreground font-bold text-center mb-3 uppercase tracking-widest">
                    {approved.size}/{diffLines.length} lines approved
                </div>
                <button
                    onClick={allApproved ? () => {} : undefined}
                    disabled={!allApproved}
                    className={`w-full py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${
                        allApproved
                            ? 'bg-muted/50 text-muted-foreground border border-border cursor-default'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
                    }`}
                >
                    {allApproved ? 'Relay message to confirm →' : 'Approve lines to continue'}
                </button>
            </div>
            )}
        </div>
    )
}

// ─── Fee Review Panel ─────────────────────────────────────────────────────────

const FEE_LINES = [
    { product: 'Workstations (×24)',   sale: '$144,000', tcode: '4.0%', fee: '$5,760' },
    { product: 'Lounge Seating (×12)', sale: '$84,000',  tcode: '3.9%', fee: '$3,276' },
    { product: 'Filing Units (×6)',    sale: '$7,560',   tcode: '2.9%', fee: '$219'   },
]

const EXPECTED_FEE = '$9,255'
const MK_INVOICE_MATCH = '$9,255'
const MK_INVOICE_GAP   = '$8,940'
const FEE_GAP          = '−$315'

function FeeReviewPanel({ scenario, onValidate }: { scenario: 'match' | 'gap'; onValidate?: () => void }) {
    const isMatch   = scenario === 'match'
    const mkInvoice = isMatch ? MK_INVOICE_MATCH : MK_INVOICE_GAP

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 min-h-0">
            {/* Header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">AGENCY FEE VERIFICATION</h4>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">Patricia Reyes · Finance & AR · DOE-2847</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Status banner */}
                <div className={`mx-5 mt-4 flex items-start gap-2 p-3 rounded-xl border ${
                    isMatch ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
                }`}>
                    {isMatch
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        : <AlertCircle  className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    }
                    <p className={`text-[11px] leading-relaxed font-medium ${isMatch ? 'text-success' : 'text-warning'}`}>
                        {isMatch
                            ? 'Fee verified · MK Invoice matches T-code calculation · Ready to confirm'
                            : `Fee gap detected · MK Invoice ${MK_INVOICE_GAP} vs expected ${EXPECTED_FEE} · Difference: ${FEE_GAP}`
                        }
                    </p>
                </div>

                {/* Fee breakdown table */}
                <div className="px-5 mt-4">
                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="grid grid-cols-4 px-3 py-2 bg-muted/40 border-b border-border">
                            {['Product', 'Sale', 'T-Code', 'Fee'].map(h => (
                                <span key={h} className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>
                        {FEE_LINES.map((line, i) => (
                            <div key={i} className="grid grid-cols-4 px-3 py-2.5 border-b border-border/50 last:border-0">
                                <span className="text-[11px] font-medium text-foreground pr-1 leading-tight">{line.product}</span>
                                <span className="text-[11px] text-muted-foreground font-mono">{line.sale}</span>
                                <span className="text-[11px] text-muted-foreground font-mono">{line.tcode}</span>
                                <span className="text-[11px] font-semibold text-foreground font-mono">{line.fee}</span>
                            </div>
                        ))}
                        <div className="grid grid-cols-4 px-3 py-2.5 bg-muted/30 border-t border-border">
                            <span className="text-[10px] font-black text-foreground col-span-2 uppercase tracking-wide">Expected total</span>
                            <span />
                            <span className="text-[12px] font-black text-foreground font-mono">{EXPECTED_FEE}</span>
                        </div>
                    </div>
                </div>

                {/* MK Invoice comparison */}
                <div className="px-5 mt-3">
                    <div className={`rounded-xl border p-3 flex items-center gap-3 ${
                        isMatch ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'
                    }`}>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">MK Invoice</p>
                            <p className={`text-[20px] font-black font-mono mt-0.5 ${isMatch ? 'text-success' : 'text-warning'}`}>
                                {mkInvoice}
                            </p>
                        </div>
                        {!isMatch && (
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Gap</p>
                                <p className="text-[16px] font-black text-warning font-mono mt-0.5">{FEE_GAP}</p>
                            </div>
                        )}
                        <div className="flex-1 text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Expected</p>
                            <p className="text-[20px] font-black font-mono mt-0.5 text-foreground">{EXPECTED_FEE}</p>
                        </div>
                    </div>
                </div>

                <div className="h-4" />
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border bg-white dark:bg-zinc-900 shrink-0">
                {isMatch ? (
                    <button
                        onClick={() => onValidate?.()}
                        className="w-full py-2.5 text-[11px] font-black rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all uppercase tracking-widest shadow-sm"
                    >
                        Confirm Fee
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onValidate?.()}
                            className="flex-1 py-2.5 text-[11px] font-black rounded-xl bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-all uppercase tracking-widest"
                        >
                            Request Changes
                        </button>
                        <button
                            onClick={() => onValidate?.()}
                            className="flex-1 py-2.5 text-[11px] font-black rounded-xl border border-border text-foreground bg-card hover:bg-muted/50 transition-all uppercase tracking-widest"
                        >
                            Flag for Review
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Quote Review Panel ───────────────────────────────────────────────────────

interface OvniqLine { product: string; sifPrice: string; ovniq: string; corrected: boolean }

const INITIAL_OVNIQ_LINES: OvniqLine[] = [
    { product: 'Filing Units ×6',    sifPrice: '$8,100',   ovniq: '$7,560',   corrected: true  },
    { product: 'Workstations ×24',   sifPrice: '$144,000', ovniq: '$144,000', corrected: false },
    { product: 'Lounge Seating ×12', sifPrice: '$84,000',  ovniq: '$84,000',  corrected: false },
]

function EditableCell({
    value,
    onChange,
    mono = true,
    className = '',
}: {
    value: string
    onChange: (v: string) => void
    mono?: boolean
    className?: string
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-transparent border-b border-dashed border-border focus:border-primary focus:outline-none text-[11px] ${mono ? 'font-mono' : ''} ${className} py-0.5`}
        />
    )
}

function QuoteReviewPanel({ onValidate }: { onValidate?: () => void }) {
    const [activeTab, setActiveTab]       = useState<'ovniq' | 'discount'>('ovniq')
    const [contract, setContract]         = useState<'city' | 'state'>('city')
    const [filingAccepted, setFiling]     = useState(false)
    const [copiedToCore, setCopiedToCore] = useState(false)

    // Editable OmniQuote comparison rows
    const [ovniqLines, setOvniqLines] = useState<OvniqLine[]>(INITIAL_OVNIQ_LINES)

    const updateLine = (i: number, field: keyof OvniqLine, val: string) => {
        setOvniqLines(prev => {
            const n = [...prev]
            n[i] = { ...n[i], [field]: val }
            return n
        })
    }

    // Editable discount calc values
    const [sellPrice, setSellPrice] = useState('$7,560')
    const [listPrice, setListPrice] = useState('$12,000')

    const computeDiscount = () => {
        const sell = parseFloat(sellPrice.replace(/[^0-9.]/g, ''))
        const list = parseFloat(listPrice.replace(/[^0-9.]/g, ''))
        if (!list) return '—'
        const disc = ((sell / list) - 1) * 100
        return `${disc >= 0 ? '+' : ''}${disc.toFixed(1)}%`
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 min-h-0">
            {/* Header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">QUOTE REVIEW</h4>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">OmniQuote · DOE-2847 · Q-2026-0089</p>
                    </div>
                    {/* Contract toggle */}
                    <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg border border-border shrink-0">
                        {(['city', 'state'] as const).map(c => (
                            <button
                                key={c}
                                onClick={() => setContract(c)}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                                    contract === c
                                        ? 'bg-card text-foreground shadow-sm border border-border'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {c === 'city' ? '● City' : '○ State'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-0 mt-3 border-b border-border -mx-5 px-5">
                    {([
                        { id: 'ovniq'    as const, label: 'OmniQuote Comparison' },
                        { id: 'discount' as const, label: 'Discount Calc' },
                    ]).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 text-[10px] font-bold border-b-2 transition-all mr-1 ${
                                activeTab === tab.id
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'ovniq' ? (
                    <div className="px-5 mt-4 space-y-4">
                        {/* OmniQuote comparison table — all cells editable */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="grid grid-cols-3 px-3 py-2 bg-muted/40 border-b border-border">
                                {['Product', 'SIF Price', 'OmniQuote'].map(h => (
                                    <span key={h} className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                                ))}
                            </div>
                            {ovniqLines.map((line, i) => (
                                <div key={i} className={`grid grid-cols-3 items-center px-3 py-2.5 border-b border-border/50 last:border-0 transition-colors ${
                                    line.corrected && !filingAccepted ? 'bg-warning/5' : line.corrected ? 'bg-success/5' : ''
                                }`}>
                                    {/* Product — editable */}
                                    <EditableCell
                                        value={line.product}
                                        onChange={v => updateLine(i, 'product', v)}
                                        mono={false}
                                        className="font-medium text-foreground"
                                    />
                                    {/* SIF Price — editable */}
                                    <EditableCell
                                        value={line.sifPrice}
                                        onChange={v => updateLine(i, 'sifPrice', v)}
                                        className={line.corrected && !filingAccepted ? 'text-warning line-through' : 'text-muted-foreground'}
                                    />
                                    {/* OmniQuote — editable + accept */}
                                    <div className="flex items-center gap-1.5">
                                        <EditableCell
                                            value={line.ovniq}
                                            onChange={v => updateLine(i, 'ovniq', v)}
                                            className={`font-semibold ${
                                                line.corrected ? (filingAccepted ? 'text-success' : 'text-warning') : 'text-foreground'
                                            }`}
                                        />
                                        {line.corrected && !filingAccepted && (
                                            <button
                                                onClick={() => setFiling(true)}
                                                className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all shrink-0"
                                            >
                                                Accept ✓
                                            </button>
                                        )}
                                        {line.corrected && filingAccepted && (
                                            <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                        )}
                                        {!line.corrected && (
                                            <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!filingAccepted && (
                            <button
                                onClick={() => setFiling(true)}
                                className="w-full py-2 text-[10px] font-black rounded-xl bg-muted/50 text-muted-foreground border border-border hover:bg-muted/70 transition-all uppercase tracking-widest"
                            >
                                Apply All Corrections
                            </button>
                        )}

                        {filingAccepted && (
                            <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl animate-in fade-in duration-300">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                <p className="text-[11px] text-success font-medium">
                                    Filing Units corrected · {ovniqLines[0].sifPrice} → {ovniqLines[0].ovniq} · Quote updated
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="px-5 mt-4 space-y-4">
                        {/* Discount Calc — sell and list prices are editable */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="px-4 py-3 bg-muted/30 border-b border-border">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Formula · {contract === 'city' ? 'City' : 'State'} Contract</p>
                            </div>
                            <div className="px-4 py-4 space-y-3">
                                <div className="font-mono text-[12px] text-foreground">
                                    sell ÷ list − 1 = discount%
                                </div>
                                <div className="font-mono text-[14px] font-bold text-foreground">
                                    {sellPrice} ÷ {listPrice} − 1 = <span className="text-warning">{computeDiscount()}</span>
                                </div>
                                <div className="h-px bg-border" />
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Sell Price — editable */}
                                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Sell Price</p>
                                        <input
                                            type="text"
                                            value={sellPrice}
                                            onChange={e => setSellPrice(e.target.value)}
                                            className="w-full bg-transparent text-[13px] font-black font-mono text-foreground focus:outline-none border-b border-dashed border-border focus:border-primary"
                                        />
                                    </div>
                                    {/* List Price — editable */}
                                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">List Price</p>
                                        <input
                                            type="text"
                                            value={listPrice}
                                            onChange={e => setListPrice(e.target.value)}
                                            className="w-full bg-transparent text-[13px] font-black font-mono text-muted-foreground focus:outline-none border-b border-dashed border-border focus:border-primary"
                                        />
                                    </div>
                                    {/* Discount — computed */}
                                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Discount</p>
                                        <p className="text-[13px] font-black font-mono mt-0.5 text-warning">{computeDiscount()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setCopiedToCore(true)}
                            className={`w-full py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${
                                copiedToCore
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : 'bg-muted/50 text-foreground border border-border hover:bg-muted/70'
                            }`}
                        >
                            {copiedToCore ? '✓ Copied to CORE' : 'Copy to CORE'}
                        </button>
                    </div>
                )}

                <div className="h-4" />
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border bg-white dark:bg-zinc-900 shrink-0">
                <div className="text-[10px] text-muted-foreground font-bold text-center mb-3 uppercase tracking-widest">
                    {filingAccepted ? '1/1 correction accepted' : '0/1 corrections accepted'}
                </div>
                <button
                    onClick={() => filingAccepted && onValidate?.()}
                    disabled={!filingAccepted}
                    className={`w-full py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${
                        filingAccepted
                            ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    }`}
                >
                    Validate →
                </button>
            </div>
        </div>
    )
}

// ─── Right Panel Dispatcher ───────────────────────────────────────────────────

function RightPanel({ step, scenario, onValidate }: {
    step: BFIReviewStep
    scenario?: 'match' | 'gap'
    onValidate?: () => void
}) {
    if (step === 'quote') return <QuoteReviewPanel onValidate={onValidate} />
    if (step === 'cpr')   return <CPRReviewPanel onValidate={onValidate} />
    if (step === 'fee')   return <FeeReviewPanel scenario={scenario ?? 'match'} onValidate={onValidate} />
    return <BFIFieldReview step={step} scenario={scenario} onValidate={onValidate} />
}

// ─── Funnel Stepper ──────────────────────────────────────────────────────────

const FUNNEL_STEPS = [
    { id: 'intake',    label: 'Intake'     },
    { id: 'quote',     label: 'Quote'      },
    { id: 'po-labor',  label: 'PO & Labor' },
    { id: 'cpr',       label: 'CPR'        },
    { id: 'fee-verify',label: 'Fee Verify' },
]

const STEP_TO_FUNNEL_IDX: Record<BFIReviewStep, number> = {
    extract:     0,
    quote:       1,
    'val-sif':   1,
    'val-ovniq': 1,
    labor:       2,
    cpr:         3,
    fee:         4,
}

function FunnelStepper({ step }: { step: BFIReviewStep }) {
    const activeIdx = STEP_TO_FUNNEL_IDX[step]
    return (
        <div className="flex items-center gap-1 shrink-0">
            {FUNNEL_STEPS.map((s, i) => {
                const active = i === activeIdx
                const past   = i < activeIdx
                return (
                    <Fragment key={s.id}>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all shrink-0 ${
                            active ? 'bg-primary text-primary-foreground'
                            : past  ? 'bg-muted/60 text-foreground/70'
                            :         'bg-muted/30 text-muted-foreground'
                        }`}>
                            <span className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${
                                active ? 'bg-primary-foreground/20'
                                : past  ? 'bg-success/20'
                                :         'bg-muted-foreground/20'
                            }`}>
                                {past
                                    ? <CheckCircle2 className="h-2.5 w-2.5 text-success" />
                                    : <span className="text-[8px] font-bold">{i + 1}</span>
                                }
                            </span>
                            {s.label}
                        </div>
                        {i < FUNNEL_STEPS.length - 1 && (
                            <div className="h-px w-3 bg-border shrink-0" />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}

// ─── Field Review Panel ──────────────────────────────────────────────────────

function BFIFieldReview({ step, scenario, onValidate }: {
    step: BFIReviewStep
    scenario?: 'match' | 'gap'
    onValidate?: () => void
}) {
    const [fields]            = useState<ReviewField[]>(() => getFields(step, scenario))
    const [resolved, setResolved] = useState<Set<string>>(new Set())
    const [expanded, setExpanded] = useState<string | null>(() => {
        const first = getFields(step, scenario).find(f => f.status !== 'valid')
        return first?.id ?? null
    })
    const [editing]    = useState<Record<string, boolean>>({})
    const [editValues, setEditValues] = useState<Record<string, string>>({})

    const issueFields    = fields.filter(f => f.status !== 'valid')
    const totalIssues    = issueFields.length
    const resolvedCount  = resolved.size
    const allResolved    = resolvedCount >= totalIssues

    const handleAcceptOVNIQ = (id: string) => {
        setResolved(prev => new Set([...prev, id]))
        setExpanded(null)
    }

    const handleEditResolved = (id: string) => {
        setResolved(prev => { const n = new Set(prev); n.delete(id); return n })
        setExpanded(id)
    }

    const handleAutoResolve = () => {
        const remaining = issueFields.filter(f => !resolved.has(f.id))
        remaining.forEach((f, i) => {
            setTimeout(() => setResolved(prev => new Set([...prev, f.id])), i * 150)
        })
    }

    const resolveLabel = step === 'fee' ? 'APPLY CORRECTION' : 'APPLY OmniQuote'
    const actionLabel  = step === 'cpr' ? 'Accept CPR'    :
                         step === 'fee' ? 'Confirm value'  : 'Accept OmniQuote'
    const altLabel     = step === 'cpr' ? 'Edit'           :
                         step === 'fee' ? 'Flag gap'       : 'Keep SIF'

    const PANEL_TITLE: Partial<Record<BFIReviewStep, string>> = {
        extract:     'SIF EXTRACTION',
        labor:       'PO & LABOR REVIEW',
        'val-sif':   'SIF VALIDATION',
        'val-ovniq': 'OMNIQUOTE VALIDATION',
    }
    const PANEL_SUBTITLE: Partial<Record<BFIReviewStep, string>> = {
        extract:     'DOE-2847 · Validate extracted SIF fields',
        labor:       'DOE-2847 · Validate PO & labor figures vs OmniQuote',
        'val-sif':   'DOE-2847 · SIF field validation',
        'val-ovniq': 'DOE-2847 · OmniQuote vs CoNY contract',
    }
    const VALIDATE_LABEL: Partial<Record<BFIReviewStep, string>> = {
        extract: 'Validate Extraction →',
        labor:   'Confirm & Continue →',
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 min-h-0">
            {/* Panel header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">
                    {PANEL_TITLE[step] ?? 'FIELD REVIEW'}
                </h4>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {PANEL_SUBTITLE[step] ?? 'DOE-2847 · Validate fields'}
                </p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-5 pt-4 pb-2">
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                            <div className="h-full bg-zinc-200 dark:bg-zinc-700 rounded-full" style={{ width: '100%' }} />
                            <div
                                className="h-full bg-success rounded-full absolute top-0 left-0 transition-all duration-700"
                                style={{ width: `${totalIssues > 0 ? (resolvedCount / totalIssues) * 100 : 100}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap shrink-0">
                            {resolvedCount}/{totalIssues} resolved
                        </span>
                    </div>

                    {/* Status dots + auto-resolve */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-success" />
                                <span className="text-xs font-bold text-foreground">{fields.filter(f => f.status === 'valid').length}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-warning" />
                                <span className="text-xs font-bold text-foreground">{fields.filter(f => f.status === 'inconsistent').length}</span>
                            </div>
                            {fields.some(f => f.status === 'missing') && (
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    <span className="text-xs font-bold text-foreground">{fields.filter(f => f.status === 'missing').length}</span>
                                </div>
                            )}
                        </div>
                        {totalIssues > 0 && (
                            <button
                                onClick={handleAutoResolve}
                                className="flex items-center gap-1.5 text-[10px] font-black text-foreground hover:opacity-70 transition-all uppercase tracking-wider"
                            >
                                <Zap className="h-3 w-3 fill-current" /> {resolveLabel}
                            </button>
                        )}
                    </div>
                </div>

                {/* Field list */}
                <div className="px-5 py-3 space-y-3 pb-6">
                    {fields.map(field => {
                        const isExpanded  = expanded === field.id
                        const isResolved  = resolved.has(field.id)
                        const isIssue     = field.status !== 'valid'
                        const isEditing   = editing[field.id]

                        const canEdit = field.status === 'valid' || isResolved

                        return (
                            <div key={field.id} className={`border rounded-xl transition-all ${
                                isExpanded && field.status === 'valid' ? 'border-primary/30 bg-primary/5 shadow-sm'
                                : isExpanded  ? 'border-warning/40 dark:border-warning/30 bg-white dark:bg-zinc-900 shadow-sm'
                                : isResolved  ? 'border-success/20 dark:border-success/20 bg-success/5'
                                :               'border-border'
                            }`}>
                                {/* Row header */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="relative shrink-0">
                                        <span className={`h-2 w-2 rounded-full block ${
                                            isResolved ? 'bg-success' :
                                            field.status === 'inconsistent' ? 'bg-warning' :
                                            field.status === 'missing' ? 'bg-destructive' : 'bg-success'
                                        }`} />
                                        {isExpanded && isIssue && <div className="absolute inset-0 h-2 w-2 rounded-full bg-warning animate-ping opacity-40" />}
                                    </div>

                                    {/* Name + value — clickable only for issue fields */}
                                    <button
                                        onClick={() => isIssue && !isResolved ? setExpanded(isExpanded ? null : field.id) : undefined}
                                        className={`flex-1 min-w-0 text-left ${isIssue && !isResolved ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-bold text-foreground truncate">{field.name}</span>
                                            {field.status === 'inconsistent' && !isResolved && (
                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-warning text-white uppercase tracking-tighter shrink-0">OmniQuote</span>
                                            )}
                                            {isResolved && (
                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-success text-white uppercase tracking-tighter shrink-0">RESOLVED</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                            {isResolved && field.ovniqSuggestion ? field.ovniqSuggestion : field.extractedValue || 'empty'}
                                            {field.ovniqSuggestion && !isResolved && (
                                                <span className="ml-1 text-warning font-semibold">→ {field.ovniqSuggestion}</span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Edit icon for valid/resolved fields */}
                                    {canEdit && (
                                        <button
                                            onClick={() => isResolved
                                                ? handleEditResolved(field.id)
                                                : setExpanded(isExpanded ? null : field.id)
                                            }
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                            aria-label="Edit field"
                                        >
                                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                                        </button>
                                    )}

                                    {/* Chevron for issue fields */}
                                    {isIssue && !isResolved && (
                                        <div className="text-muted-foreground shrink-0 pointer-events-none">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    )}
                                </div>

                                {/* Expanded: valid field — simple edit view */}
                                {isExpanded && field.status === 'valid' && (
                                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1.5">
                                            <p className="text-[12px] font-semibold text-foreground">Current Value</p>
                                            <input
                                                type="text"
                                                value={editValues[field.id] ?? field.extractedValue ?? ''}
                                                onChange={e => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                className="w-full rounded-lg border border-primary px-3 py-2 bg-card ring-2 ring-primary/20 text-[13px] font-mono text-foreground focus:outline-none"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => setExpanded(null)}
                                                className="flex-1 py-2 text-[12px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setExpanded(null)}
                                                className="py-2 px-4 text-[12px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Expanded: issue field — OmniQuote review */}
                                {isExpanded && isIssue && !isResolved && (
                                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1.5">
                                            <p className="text-[12px] font-semibold text-foreground">Extracted Value (SIF)</p>
                                            <div className={`rounded-lg border px-3 py-2 ${
                                                isEditing ? 'bg-card border-primary ring-2 ring-primary/20' : 'bg-background border-border'
                                            }`}>
                                                <span className="text-[13px] font-mono text-foreground">{field.extractedValue || '—'}</span>
                                            </div>
                                        </div>

                                        {field.ovniqSuggestion && (
                                            <div className="space-y-1.5">
                                                <p className="text-[12px] font-semibold text-foreground">OmniQuote suggests</p>
                                                <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                                                    <span className="text-[13px] font-mono font-bold text-warning">{field.ovniqSuggestion}</span>
                                                </div>
                                            </div>
                                        )}

                                        {field.reason && (
                                            <div className="flex items-start gap-2 p-3 bg-ai/5 border border-ai/20 rounded-lg">
                                                <Info className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-ai leading-relaxed">{field.reason}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                onClick={() => handleAcceptOVNIQ(field.id)}
                                                className="flex-1 py-2 text-[12px] font-bold bg-success text-white rounded-lg hover:opacity-90 transition-all"
                                            >
                                                {actionLabel}
                                            </button>
                                            <button
                                                onClick={() => setExpanded(null)}
                                                className="flex-1 py-2 text-[12px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Edit className="h-3.5 w-3.5" /> {altLabel}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border bg-white dark:bg-zinc-900 shrink-0">
                <div className="text-[10px] text-muted-foreground font-bold text-center mb-3 uppercase tracking-widest">
                    {fields.length} fields · {totalIssues} need review
                </div>
                <div className="flex gap-2">
                    <button className="flex-1 py-2.5 text-[11px] font-black border border-border text-foreground rounded-xl hover:bg-muted/50 transition-all uppercase tracking-widest">
                        SAVE
                    </button>
                    <button
                        onClick={() => allResolved && onValidate?.()}
                        disabled={!allResolved}
                        className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${
                            allResolved
                                ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                    >
                        {allResolved
                            ? (VALIDATE_LABEL[step] ?? 'VALIDATE')
                            : 'Resolve all fields to continue'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function BFIDocumentReviewModal({
    isOpen, onClose, step, onValidate, scenario
}: BFIDocumentReviewModalProps) {
    const [activeTab, setActiveTab] = useState<'sif' | 'specs' | 'floorplan'>('sif')
    const [downloadConfirm, setDownloadConfirm] = useState<string | null>(null)

    const handleDownload = () => {
        const filename = activeTab === 'sif' ? 'DOE-2847.sif' : 'NYC-DOE-2847-specs.pdf'
        setDownloadConfirm(filename)
        setTimeout(() => setDownloadConfirm(null), 2000)
    }

    const STEP_LABELS: Record<BFIReviewStep, string> = {
        extract:     'Extracting fields',
        quote:       'Quote · OmniQuote Comparison',
        'val-sif':   'Validating SIF',
        'val-ovniq': 'Validating OmniQuote',
        labor:       'PO & Labor Review',
        cpr:         'CPR Reconciliation',
        fee:         'Agency Fee Verification',
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/50 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed top-16 left-80 right-0 bottom-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-6xl h-[calc(100vh-5rem)] transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left shadow-2xl transition-all border border-border flex flex-col">

                                {/* ── Header ── */}
                                <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 gap-4">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="h-9 w-9 rounded-xl bg-ai/10 flex items-center justify-center shrink-0">
                                            <Sparkles className="h-4.5 w-4.5 text-ai" />
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] font-bold text-foreground leading-tight">
                                                Document Review — DOE-2847
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground">
                                                NYC Dept. of Education · Quote Q-2026-0089 · {STEP_LABELS[step]}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Funnel stepper in header */}
                                    <div className="flex-1 flex justify-center">
                                        <FunnelStepper step={step} />
                                    </div>

                                    <button
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* AI context banner — contextual per step */}
                                <div className="px-6 py-2 bg-ai/5 border-b border-ai/20 flex items-center gap-2 shrink-0">
                                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                                    <p className="text-[11px] text-ai font-medium">
                                        {step === 'quote'
                                            ? <><span className="font-bold">OmniQuote</span> comparison · Filing Units $8,100 → $7,560 · 1 correction to accept · Discount: −37.0%</>
                                            : step === 'cpr'
                                                ? <><span className="font-bold">CPR</span> reconciliation · Carpenters −5h · OT −2h · Impact: −$2,340 · 2 lines to approve</>
                                                : step === 'fee'
                                                    ? scenario === 'gap'
                                                        ? <><span className="font-bold">Agency fee</span> gap detected · MK Invoice {MK_INVOICE_GAP} vs expected {EXPECTED_FEE} · {FEE_GAP}</>
                                                        : <><span className="font-bold">Agency fee</span> verified · MK Invoice matches T-code calculation</>
                                                    : step === 'labor'
                                                        ? <><span className="font-bold">Strata AI</span> · PO &amp; Labor Quote extracted · DOE-2847 · confirm receipt</>
                                                        : <><span className="font-bold">OmniQuote</span> detectó cambios en el contrato CoNY · T-codes actualizados · 2 discrepancias a resolver</>
                                        }
                                    </p>
                                </div>

                                {/* ── Split pane ── */}
                                <div className="flex-1 grid grid-cols-5 min-h-0">

                                    {/* Left: Document tabs (3/5) */}
                                    <div className="col-span-3 border-r border-border flex flex-col min-h-0">
                                        {/* Tab bar */}
                                        <div className="flex items-center gap-0 border-b border-border bg-muted/30 shrink-0 px-4 pt-2">
                                            {([
                                                { id: 'sif' as const,      icon: FileText, label: 'SIF · DOE-2847' },
                                                { id: 'specs' as const,    icon: FileText, label: 'NYC-DOE-2847-specs.pdf' },
                                                { id: 'floorplan' as const, icon: MapPin,   label: 'Floor Plan' },
                                            ]).map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-all mr-1 ${
                                                        activeTab === tab.id
                                                            ? 'border-primary text-foreground'
                                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    <tab.icon className="h-3 w-3" />
                                                    {tab.label}
                                                </button>
                                            ))}
                                            {/* Download button — only for SIF and Specs tabs */}
                                            {(activeTab === 'sif' || activeTab === 'specs') && (
                                                <div className="ml-auto pb-1.5 shrink-0">
                                                    {downloadConfirm ? (
                                                        <span className="flex items-center gap-1 text-[10px] text-success font-semibold px-2">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            {downloadConfirm} downloaded
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={handleDownload}
                                                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            {activeTab === 'sif' ? 'Download SIF' : 'Download PDF'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tab content */}
                                        <div className="flex-1 min-h-0 overflow-hidden">
                                            {activeTab === 'sif' ? (
                                                <SIFDocumentPreview />
                                            ) : activeTab === 'specs' ? (
                                                <SpecsPDFTab />
                                            ) : (
                                                <div className="h-full overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950">
                                                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                                                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/40 border-b border-border">
                                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                                                Architectural Layout · 52 Chambers St · Floor 12
                                                            </span>
                                                            <span className="ml-auto text-[9px] text-success font-medium">OCR ✓</span>
                                                        </div>
                                                        <div className="p-3">
                                                            <FloorPlanSVG />
                                                        </div>
                                                        <div className="px-3.5 py-2 bg-muted/20 border-t border-border">
                                                            <p className="text-[10px] text-muted-foreground">
                                                                NYC Dept. of Education · DOE-2847 · by Robert Chen · Miller Knoll
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Contextual panel per step (2/5) */}
                                    <div className="col-span-2 flex flex-col min-h-0">
                                        <RightPanel step={step} scenario={scenario} onValidate={onValidate} />
                                    </div>

                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
