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
    Edit, Edit2, Zap, Info, MapPin, Send, AlertCircle,
    Download, Mail, Upload, Loader2, Paperclip
} from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BFIReviewStep = 'extract' | 'quote' | 'val-sif' | 'val-ovniq' | 'labor' | 'cpr' | 'fee'

interface BFIDocumentReviewModalProps {
    isOpen: boolean
    onClose: () => void
    step: BFIReviewStep
    onValidate?: () => void
    scenario?: 'match' | 'gap'  // for step='fee'
    /** Michael mode: pre-approves CPR lines, changes footer to send-to-Nancy */
    michaelMode?: boolean
    /** Invoice upload mode: opens on Attachments tab, adds upload zone + Strata detection + forward to Patricia */
    invoiceUpload?: boolean
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

// ─── Quote Document Tab ───────────────────────────────────────────────────────

const QUOTE_LINE_ITEMS = [
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', tcode: '18%', sif: '$144,000', net: '$144,000' },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', tcode: '18%', sif: '$84,000',  net: '$84,000'  },
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  tcode: '18%', sif: '$8,100',   net: '$7,560'   },
]

function QuoteDocumentTab() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950 scrollbar-minimal">
                <div className="mx-auto w-full bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    {/* Brand bar */}
                    <div className="h-1.5 bg-gradient-to-r from-primary to-[#C3E433]" />

                    {/* Doc header */}
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
                        <div>
                            <span className="inline-block text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded mb-2">Quote · OmniQuote</span>
                            <p className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight">Q-2026-0089</p>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">DOE-2847 · NYC Dept. of Education</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">MILLER KNOLL</div>
                            <div className="text-xs text-zinc-400 mt-0.5">Robert Chen · Rep · May 6, 2026</div>
                        </div>
                    </div>

                    {/* Band */}
                    <div className="bg-zinc-800 dark:bg-zinc-700 px-6 py-1.5 flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase text-zinc-200 tracking-widest">LINE ITEMS · CoNY CONTRACT</span>
                        <span className="text-[8px] font-bold text-primary tracking-widest">OmniQuote VALIDATED ✓</span>
                    </div>

                    {/* Column headers */}
                    <div className="px-6 pt-3 pb-1 grid grid-cols-6 gap-2">
                        {['Code', 'Product', 'Qty', 'T-Code', 'SIF Price', 'Net'].map(h => (
                            <span key={h} className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">{h}</span>
                        ))}
                    </div>

                    {/* Quote rows */}
                    <div className="px-6 pb-4 space-y-0">
                        {QUOTE_LINE_ITEMS.map((item) => {
                            const corrected = item.sif !== item.net
                            return (
                                <div key={item.code} className={`grid grid-cols-6 gap-2 items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${corrected ? 'bg-warning/5 -mx-6 px-6' : ''}`}>
                                    <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate">{item.code}</span>
                                    <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-100 col-span-1 truncate">{item.name} {item.qty}</span>
                                    <span className="text-[10px] font-mono text-zinc-500">{item.qty}</span>
                                    <span className="text-[10px] font-mono text-zinc-500">{item.tcode}</span>
                                    <span className={`text-[10px] font-mono ${corrected ? 'text-warning line-through' : 'text-zinc-600 dark:text-zinc-300'}`}>{item.sif}</span>
                                    <span className={`text-[10px] font-semibold font-mono ${corrected ? 'text-success' : 'text-zinc-800 dark:text-zinc-100'}`}>
                                        {item.net}
                                        {corrected && <span className="ml-1 text-[8px] font-black text-success">↓</span>}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Totals */}
                    <div className="mx-6 mb-4 rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        {[
                            { label: 'SIF Total',      value: '$236,100', muted: true },
                            { label: 'Adjusted Total', value: '$235,560', bold: true  },
                            { label: 'Discount (−37.5% CoNY)', value: '−$88,335', accent: true },
                        ].map(row => (
                            <div key={row.label} className={`flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${row.bold ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}`}>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{row.label}</span>
                                <span className={`text-[11px] font-mono font-semibold ${row.accent ? 'text-success' : row.muted ? 'text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center py-3 border-t border-zinc-100 dark:border-zinc-800">
                        Generated by OmniQuote · 1 correction applied · Validated against CoNY contract
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── SIF Document Mock Preview ───────────────────────────────────────────────

interface SifField { name: string; value: string; status: 'valid' | 'inconsistent' | 'missing'; fieldId?: string; resolvedValue?: string }
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
            { name: 'Carpenters labor', value: '50h', status: 'inconsistent', fieldId: 'f1', resolvedValue: '45h' },
            { name: 'Overtime labor',   value: '8h',  status: 'inconsistent', fieldId: 'f2', resolvedValue: '6h'  },
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

function SIFDocumentPreview({ resolvedIds = new Set<string>() }: { resolvedIds?: Set<string> }) {
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
                                    {group.fields.map((field, i) => {
                                        const isFieldResolved = field.fieldId ? resolvedIds.has(field.fieldId) : false
                                        const displayValue = isFieldResolved && field.resolvedValue ? field.resolvedValue : field.value
                                        const isInconsistent = field.status === 'inconsistent' && !isFieldResolved
                                        return (
                                        <div key={i} className={`flex items-center justify-between py-1.5 px-3 text-[11px] transition-colors duration-300 ${
                                            i % 2 === 0 ? '' : 'bg-muted/30'
                                        } ${isInconsistent ? '!bg-warning/10' : ''} ${isFieldResolved ? '!bg-success/5' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                                                    isFieldResolved || field.status === 'valid' ? 'bg-success' : 'bg-warning'
                                                }`} />
                                                <span className="text-muted-foreground">{field.name}</span>
                                            </div>
                                            <span className={`font-semibold transition-colors duration-300 ${
                                                isInconsistent ? 'text-warning' : 'text-foreground'
                                            }`}>{displayValue}</span>
                                        </div>
                                        )
                                    })}
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
    { id: 'fh1', name: 'Quote #',    category: 'header', extractedValue: 'Q-2026-0089',            status: 'valid' },
    { id: 'fh2', name: 'Contract',   category: 'header', extractedValue: 'CoNY · City of New York', status: 'valid' },
    { id: 'fh3', name: 'Agency',     category: 'header', extractedValue: 'NYC Dept. of Education',  status: 'valid' },
    { id: 'fh4', name: 'Date',       category: 'header', extractedValue: 'May 6, 2026',             status: 'valid' },
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
    { name: 'CPR-NYPL-17706.pdf',      path: '/docs/bfi/cpr/CPR-NYPL-17706.pdf?v=2',          category: 'CPR'     },
    { name: 'invoice-030923-NYPL.pdf', path: '/docs/bfi/invoices/invoice-030923-NYPL.pdf?v=2', category: 'Invoice' },
    { name: 'signin-NYPL-17706.pdf',   path: '/docs/bfi/signin/signin-NYPL-17706.pdf?v=2',     category: 'Sign-In' },
]

const CATEGORY_COLORS: Record<string, string> = {
    CPR:     'bg-info/10 text-info border-info/20',
    Invoice: 'bg-muted text-muted-foreground border-border',
    'Sign-In': 'bg-success/10 text-success border-success/20',
}

// ─── Patricia Dialog ──────────────────────────────────────────────────────────

const PATRICIA_MESSAGE =
`Hi Patricia,

The OmniQuote approved invoice for DOE-2847 (NYC Dept. of Education) has been received and attached.

Invoice details:
  · Vendor: Herman Miller
  · Order: Q-2026-0089
  · Amount: $6,920 (CPR reconciliation approved)
  · OmniQuote status: Approved · May 6, 2026

Please proceed with agency fee verification at your earliest convenience.

— Lauren DeMarco
  BFI Furniture · CoNY Account Manager`

function PatriciaDialog({ isOpen, onSent }: { isOpen: boolean; onSent: () => void }) {
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [message,   setMessage]   = useState(PATRICIA_MESSAGE)
    const [sending,   setSending]   = useState(false)
    const [sent,      setSent]      = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => { setSending(false); setSent(true); setTimeout(() => onSent(), 900) }, 800)
    }

    const META_ROWS = [
        { label: 'From', editable: true },
        { label: 'To',   value: 'patricia.hayes@bfifurniture.com · Finance / AR' },
        { label: 'CC',   value: 'michael.chen@bfifurniture.com', muted: true },
        { label: 'Subj', value: 'OmniQuote Approved Invoice · DOE-2847 · Fee Verification' },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => {}} className="relative z-[400]">
                <TransitionChild as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                    <TransitionChild as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] border border-border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                                <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-ai">ST</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground">Fee Verification · DOE-2847</p>
                                    <p className="text-[10px] text-muted-foreground">OmniQuote invoice attached · Strata AI</p>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Invoice verified chip */}
                                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-success/30 bg-success/5">
                                    <Paperclip className="h-3.5 w-3.5 text-success shrink-0" />
                                    <span className="text-[11px] font-semibold text-foreground flex-1">invoice-OQ-DOE2847.pdf</span>
                                    <span className="text-[9px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded">OmniQuote Approved</span>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                </div>

                                {/* Email metadata */}
                                <div className="rounded-xl border border-border overflow-hidden text-[11px]">
                                    {META_ROWS.map((row, i) => (
                                        <div key={row.label} className={`flex gap-3 px-3 py-2.5 ${i < META_ROWS.length - 1 ? 'border-b border-border/60' : ''}`}>
                                            <span className="text-muted-foreground font-semibold w-10 shrink-0">{row.label}</span>
                                            {row.editable ? (
                                                <input value={fromEmail} onChange={e => setFromEmail(e.target.value)}
                                                    className="flex-1 bg-transparent outline-none text-foreground border-b border-transparent hover:border-border/60 focus:border-primary/50 transition-colors" />
                                            ) : (
                                                <span className={row.muted ? 'text-muted-foreground italic' : 'text-foreground'}>{row.value}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Editable message */}
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={12}
                                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono" />

                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />
                            </div>

                            <div className="px-5 py-4 border-t border-border shrink-0">
                                {sent ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="text-[12px] font-bold text-success">Sent to Patricia · Fee verification initiated</span>
                                    </div>
                                ) : (
                                    <button onClick={handleSend} disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-60">
                                        <Send className="h-3.5 w-3.5" />
                                        {sending ? 'Sending…' : 'Send to Patricia →'}
                                    </button>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Attachments Panel ────────────────────────────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'detected'

function AttachmentsPanel({ onValidate }: { invoiceUpload?: boolean; onValidate?: () => void }) {
    const [lightbox, setLightbox] = useState<{ path: string; name: string } | null>(null)
    const [uploadState,        setUploadState]        = useState<UploadState>('idle')
    const [progress,           setProgress]           = useState(0)
    const [showPatriciaDialog, setShowPatriciaDialog] = useState(false)

    const simulateUpload = () => {
        if (uploadState !== 'idle') return
        setUploadState('uploading')
        setProgress(0)
        const start = Date.now()
        const tick = setInterval(() => {
            const p = Math.min(100, Math.round(((Date.now() - start) / 1400) * 100))
            setProgress(p)
            if (p >= 100) { clearInterval(tick); setUploadState('detected') }
        }, 40)
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

                {/* ── Invoice upload zone ── */}
                <div className="space-y-3">
                    {uploadState === 'idle' && (
                            <button
                                onClick={simulateUpload}
                                className="w-full border-2 border-dashed border-ai/30 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-ai/60 hover:bg-ai/5 transition-all group"
                            >
                                <Upload className="h-6 w-6 text-ai/60 group-hover:text-ai transition-colors" />
                                <p className="text-[12px] font-bold text-foreground">Drop OmniQuote invoice PDF · or click to upload</p>
                                <p className="text-[10px] text-muted-foreground">invoice-OQ-DOE2847.pdf · Accepted: PDF · Max 10MB</p>
                            </button>
                        )}

                        {uploadState === 'uploading' && (
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 text-ai animate-spin shrink-0" />
                                    <span className="text-[11px] font-bold text-foreground">Uploading invoice-OQ-DOE2847.pdf…</span>
                                    <span className="ml-auto text-[10px] font-mono text-muted-foreground">{progress}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-ai rounded-full transition-all duration-75" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Strata AI scanning document…</p>
                            </div>
                        )}

                        {uploadState === 'detected' && (
                            <div className="rounded-2xl border-2 border-ai/50 bg-ai/8 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Detection header */}
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-ai shrink-0" />
                                    <span className="text-[14px] font-black text-ai">Strata AI · Invoice Detected</span>
                                    <CheckCircle2 className="h-5 w-5 text-success ml-auto shrink-0" />
                                </div>

                                {/* Detection detail */}
                                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-ai/20 px-3 py-3 space-y-1.5">
                                    {[
                                        ['Document type', 'OmniQuote Invoice · APPROVED'],
                                        ['Order',         'Q-2026-0089 · DOE-2847'],
                                        ['Vendor',        'Herman Miller'],
                                        ['Amount',        '$6,920 · Matches CPR reconciliation ✓'],
                                        ['Date',          'May 6, 2026'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex gap-2 text-[11px]">
                                            <span className="text-muted-foreground w-24 shrink-0">{label}</span>
                                            <span className="font-semibold text-foreground">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* File chip */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-success/30 bg-success/5">
                                    <Paperclip className="h-3.5 w-3.5 text-success shrink-0" />
                                    <span className="text-[11px] font-medium text-foreground flex-1">invoice-OQ-DOE2847.pdf · 284 KB</span>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => setShowPatriciaDialog(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Forward to Patricia · Fee Verification →
                                </button>
                            </div>
                        )}

                        {/* Divider */}
                        {uploadState !== 'idle' && (
                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest text-center">Existing attachments</p>
                        )}
                </div>

                {/* Existing files list */}
                {BFI_ATTACHMENTS.map(file => (
                    <div key={file.path} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[11px] font-medium text-foreground flex-1 min-w-0 truncate">{file.name}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${CATEGORY_COLORS[file.category]}`}>
                            {file.category}
                        </span>
                        <button
                            onClick={() => setLightbox(file)}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                        >
                            Preview
                        </button>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 z-[500] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setLightbox(null)}>
                    <div className="relative bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ width: 680, height: '88vh' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 shrink-0">
                            <span className="text-[10px] font-bold text-zinc-300 truncate">{lightbox.name}</span>
                            <button onClick={() => setLightbox(null)} className="text-zinc-400 hover:text-white text-lg leading-none ml-4 transition-colors">×</button>
                        </div>
                        <iframe
                            src={`${lightbox.path}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                            title={lightbox.name}
                            className="flex-1 w-full border-none bg-zinc-950"
                        />
                    </div>
                </div>
            )}

            <PatriciaDialog isOpen={showPatriciaDialog} onSent={() => { setShowPatriciaDialog(false); onValidate?.() }} />
        </>
    )
}

// ─── CPR Review Panel ─────────────────────────────────────────────────────────

const CPR_LINES = [
    { id: 'teamsters',       category: 'Teamsters',      quoted: '24h', cpr: '24h', diff: null,   impact: null,     ok: true  },
    { id: 'carpenters',      category: 'Carpenters',     quoted: '50h', cpr: '45h', diff: '-5h',  impact: '-$1,800', ok: false },
    { id: 'ot-carpenters',   category: 'OT Carpenters',  quoted: '8h',  cpr: '6h',  diff: '-2h',  impact: '-$540',  ok: false },
    { id: 'inside-delivery', category: 'Inside Delivery', quoted: '4h', cpr: '4h',  diff: null,   impact: null,     ok: true  },
]

// ─── CPR Notify Dialog ────────────────────────────────────────────────────────

function CPRNotifyDialog({ isOpen, onSent }: { isOpen: boolean; onSent: () => void }) {
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [message, setMessage]     = useState(
`Hi Michael, Nancy,

CPR reconciliation for DOE-2847 is complete. Labor hours have been adjusted and CORE has been updated accordingly.

Adjustments approved:
  · Carpenters: 50h → 45h (−$1,800)
  · OT Carpenters: 8h → 6h (−$540)
  · Total impact: −$2,340

The SIF has been updated and the order is ready to proceed to fee verification. Please review and confirm.

— Lauren DeMarco
  BFI Furniture · CoNY Account Manager`
    )
    const [sending, setSending] = useState(false)
    const [sent, setSent]       = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(() => onSent(), 900)
        }, 800)
    }

    const META_ROWS = [
        { label: 'From', editable: true },
        { label: 'To',   value: 'michael.chen@bfifurniture.com · Nancy Rodriguez' },
        { label: 'CC',   value: 'walter@conyny.gov · lena.watts@bfi-warehouse.com', muted: true },
        { label: 'Date', value: 'May 6, 2026 · 11:30 AM' },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => {}} className="relative z-[400]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] border border-border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                                <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-ai">ST</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground">Stakeholder Notification · DOE-2847</p>
                                    <p className="text-[10px] text-muted-foreground">Strata AI pre-drafted · CORE updated</p>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Section A — CORE update summary */}
                                <div className="rounded-xl border border-success/30 bg-success/5 p-3.5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        <span className="text-[11px] font-bold text-success">CORE Updated · WO-2026-0089 · DOE-2847</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-5 text-[10px]">
                                        <span className="text-muted-foreground">Carpenters labor</span>
                                        <span className="font-mono font-semibold text-foreground">50h → 45h (−5h)</span>
                                        <span className="text-muted-foreground">OT Carpenters</span>
                                        <span className="font-mono font-semibold text-foreground">8h → 6h (−2h)</span>
                                        <span className="text-muted-foreground">Total impact</span>
                                        <span className="font-mono font-bold text-warning">−$2,340</span>
                                        <span className="text-muted-foreground">SIF</span>
                                        <span className="font-semibold text-foreground">Updated accordingly</span>
                                    </div>
                                </div>

                                {/* Section B — Email metadata */}
                                <div className="rounded-xl border border-border overflow-hidden text-[11px]">
                                    {META_ROWS.map((row, i) => (
                                        <div key={row.label} className={`flex gap-3 px-3 py-2.5 ${i < META_ROWS.length - 1 ? 'border-b border-border/60' : ''}`}>
                                            <span className="text-muted-foreground font-semibold w-10 shrink-0">{row.label}</span>
                                            {row.editable ? (
                                                <input
                                                    value={fromEmail}
                                                    onChange={e => setFromEmail(e.target.value)}
                                                    className="flex-1 bg-transparent outline-none text-foreground border-b border-transparent hover:border-border/60 focus:border-primary/50 transition-colors"
                                                />
                                            ) : (
                                                <span className={row.muted ? 'text-muted-foreground italic' : 'text-foreground'}>
                                                    {row.value}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Section C — Editable message */}
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={12}
                                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                />

                                {/* DataSources */}
                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-border shrink-0">
                                {sent ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="text-[12px] font-bold text-success">Sent & CORE confirmed</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-60"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        {sending ? 'Sending…' : 'Send & Confirm →'}
                                    </button>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── CPR Review Panel ─────────────────────────────────────────────────────────

function CPRReviewPanel({ onValidate, michaelMode, invoiceUpload }: { onValidate?: () => void; michaelMode?: boolean; invoiceUpload?: boolean }) {
    const diffLines = CPR_LINES.filter(l => !l.ok)
    // Michael mode: lines arrive pre-approved (Lauren already signed off)
    const [approved, setApproved] = useState<Set<string>>(
        michaelMode ? new Set(diffLines.map(l => l.id)) : new Set()
    )
    const [sent, setSent]         = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    // invoiceUpload mode starts on attachments tab
    const [rightTab, setRightTab] = useState<'review' | 'attachments'>(invoiceUpload ? 'attachments' : 'review')

    const allApproved  = diffLines.every(l => approved.has(l.id))
    const totalImpact  = '-$2,340'

    const handleApprove = (id: string) => setApproved(prev => new Set([...prev, id]))

    const handleDialogSent = () => {
        setSent(true)
        setShowDialog(false)
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
                <AttachmentsPanel invoiceUpload={invoiceUpload} onValidate={onValidate} />
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

                <div className="h-4" />
            </div>
            )}

            {/* Footer — only shown on CPR Review tab */}
            {rightTab === 'review' && !invoiceUpload && (
            <div className="px-5 py-4 border-t border-border bg-white dark:bg-zinc-900 shrink-0">
                {!michaelMode && (
                    <div className="text-[10px] text-muted-foreground font-bold text-center mb-3 uppercase tracking-widest">
                        {approved.size}/{diffLines.length} lines approved
                    </div>
                )}
                <button
                    onClick={allApproved ? (michaelMode ? () => onValidate?.() : () => setShowDialog(true)) : undefined}
                    disabled={!allApproved}
                    className={`w-full py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${
                        allApproved
                            ? 'bg-ai text-white hover:opacity-90 cursor-pointer'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
                    }`}
                >
                    {michaelMode
                        ? 'Send Final Quote to Nancy →'
                        : (sent ? '✓ CORE Updated & Notified' : allApproved ? 'Update CORE & Notify →' : 'Approve lines to continue')
                    }
                </button>
            </div>
            )}

            {!michaelMode && <CPRNotifyDialog isOpen={showDialog} onSent={handleDialogSent} />}
        </div>
    )
}

// ─── Ask Lauren Dialog ────────────────────────────────────────────────────────

const ASK_LAUREN_MESSAGE =
`Hi Lauren,

I'm reviewing the agency fee for DOE-2847. Before I confirm, can you verify that the OmniQuote invoice ($6,920) matches the final CPR reconciliation you approved?

Specifically: are Carpenters 45h and OT 6h the figures that went to Herman Miller, or are there any updates I should be aware of?

— Patricia Hayes
  BFI Furniture · Finance & AR`

function AskLaurenDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [message, setMessage] = useState(ASK_LAUREN_MESSAGE)
    const [sending, setSending] = useState(false)
    const [sent,    setSent]    = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(onClose, 900)
        }, 800)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[500]" onClose={onClose}>
                <TransitionChild as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                    <TransitionChild as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-foreground">Ask Lauren · Fee Verification</p>
                                        <p className="text-[11px] text-muted-foreground">DOE-2847 · Clarification request</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="px-5 pt-4 pb-2 space-y-2.5">
                                {[
                                    { label: 'From', value: 'patricia.hayes@bfifurniture.com' },
                                    { label: 'To',   value: 'lauren.demarco@bfifurniture.com · Account Manager' },
                                ].map(row => (
                                    <div key={row.label} className="flex items-start gap-2 text-[11px]">
                                        <span className="text-muted-foreground w-10 shrink-0 pt-0.5">{row.label}</span>
                                        <span className="font-medium text-foreground">{row.value}</span>
                                    </div>
                                ))}

                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={9}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>

                            <div className="px-5 pb-4">
                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />
                            </div>

                            <div className="px-5 py-4 border-t border-border flex items-center gap-3">
                                <button onClick={onClose} className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || sent}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] font-black hover:opacity-90 transition-all uppercase tracking-widest disabled:opacity-60"
                                >
                                    {sent
                                        ? <><CheckCircle2 className="h-3.5 w-3.5" /> Sent to Lauren</>
                                        : sending
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</>
                                        : <><Send className="h-3.5 w-3.5" /> Send to Lauren →</>
                                    }
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
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
    const isMatch        = scenario === 'match'
    const mkInvoice      = isMatch ? MK_INVOICE_MATCH : MK_INVOICE_GAP
    const [showAskLauren, setShowAskLauren] = useState(false)
    const [confirming,    setConfirming]    = useState(false)
    const [showSuccess,   setShowSuccess]   = useState(false)

    const handleConfirm = () => {
        setConfirming(true)
        setTimeout(() => {
            setConfirming(false)
            setShowSuccess(true)
        }, 1200)
    }

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
            <div className="px-5 py-4 border-t border-border bg-white dark:bg-zinc-900 shrink-0 space-y-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAskLauren(true)}
                        className="px-3 py-2.5 text-[11px] font-bold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all shrink-0"
                    >
                        Ask Lauren →
                    </button>
                    {isMatch ? (
                        <button
                            onClick={handleConfirm}
                            disabled={confirming}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all uppercase tracking-widest shadow-sm disabled:opacity-70"
                        >
                            {confirming
                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</>
                                : 'Confirm Fee'
                            }
                        </button>
                    ) : (
                        <>
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
                                Flag
                            </button>
                        </>
                    )}
                </div>
                <AskLaurenDialog isOpen={showAskLauren} onClose={() => setShowAskLauren(false)} />
            </div>

            {/* Success overlay modal */}
            <Transition show={showSuccess} as={Fragment}>
                <Dialog as="div" className="relative z-[500]" onClose={() => {}}>
                    <TransitionChild as={Fragment}
                        enter="ease-out duration-250" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/50 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-8">
                        <TransitionChild as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-90" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-90"
                        >
                            <DialogPanel className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden text-center">
                                {/* Success icon */}
                                <div className="px-8 pt-8 pb-5">
                                    <div className="h-16 w-16 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-success" />
                                    </div>
                                    <h3 className="text-[17px] font-black text-foreground mb-1">Process Closed Successfully</h3>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                                        Agency fee verification complete for DOE-2847
                                    </p>
                                </div>

                                {/* Summary */}
                                <div className="mx-6 mb-6 rounded-xl border border-success/20 bg-success/5 px-4 py-3 space-y-1.5 text-left">
                                    {[
                                        ['Order',    'DOE-2847 · NYC Dept. of Education'],
                                        ['Invoice',  'Q-2026-0089 · OmniQuote Approved'],
                                        ['Amount',   '$6,920 · Agency fee confirmed'],
                                        ['Verified', 'Patricia Hayes · Finance & AR'],
                                        ['Date',     'May 13, 2026'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex gap-2 text-[11px]">
                                            <span className="text-muted-foreground w-16 shrink-0">{label}</span>
                                            <span className="font-semibold text-foreground">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-6 pb-6">
                                    <button
                                        onClick={() => { setShowSuccess(false); onValidate?.() }}
                                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[12px] font-black hover:opacity-90 transition-all uppercase tracking-widest shadow-sm"
                                    >
                                        Done →
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
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

function RightPanel({ step, scenario, onValidate, michaelMode, invoiceUpload, onResolveChange }: {
    step: BFIReviewStep
    scenario?: 'match' | 'gap'
    onValidate?: () => void
    michaelMode?: boolean
    invoiceUpload?: boolean
    onResolveChange?: (ids: Set<string>) => void
}) {
    if (step === 'extract') return <ExtractReviewPanel onValidate={onValidate} onResolveChange={onResolveChange} />
    if (step === 'quote') return <QuoteReviewPanel onValidate={onValidate} />
    if (step === 'cpr')   return <CPRReviewPanel onValidate={onValidate} michaelMode={michaelMode} invoiceUpload={invoiceUpload} />
    if (step === 'fee')   return <FeeReviewPanel scenario={scenario ?? 'match'} onValidate={onValidate} />
    return <BFIFieldReview step={step} scenario={scenario} onValidate={onValidate} onResolveChange={onResolveChange} />
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

// ─── Extract Review Panel (tabs: SIF · Quote · Zones) ────────────────────────

interface ExtractQuoteLine { code: string; name: string; qty: string; sif: string; net: string; corrected: boolean }

const EXTRACT_QUOTE_LINES: ExtractQuoteLine[] = [
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  sif: '$8,100',   net: '$7,560',   corrected: true  },
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', sif: '$144,000', net: '$144,000', corrected: false },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', sif: '$84,000',  net: '$84,000',  corrected: false },
]

const EXTRACT_ZONES = [
    { id: 'A', label: 'Zone A · Workstations ×24', qty: '24 units', chip: 'bg-info/10 text-info border-info/20',             dot: 'bg-info'    },
    { id: 'B', label: 'Zone B · Lounge ×12',        qty: '12 units', chip: 'bg-ai/10 text-ai border-ai/20',                   dot: 'bg-ai'      },
    { id: 'C', label: 'Zone C · Filing ×6',         qty: '6 units',  chip: 'bg-success/10 text-success border-success/20',    dot: 'bg-success' },
]

function ExtractReviewPanel({ onValidate, onResolveChange }: { onValidate?: () => void; onResolveChange?: (ids: Set<string>) => void }) {
    const [tab, setTab] = useState<'sif' | 'quote' | 'zones'>('sif')
    const [quoteLines, setQuoteLines] = useState<ExtractQuoteLine[]>(EXTRACT_QUOTE_LINES)
    const [editingIdx, setEditingIdx] = useState<number | null>(null)

    const updateLine = (idx: number, val: string) => {
        setQuoteLines(prev => prev.map((l, i) => i === idx ? { ...l, net: val } : l))
    }

    const TABS = [
        { id: 'sif'   as const, label: 'SIF Fields'   },
        { id: 'quote' as const, label: 'Quote'         },
        { id: 'zones' as const, label: 'Zones'         },
    ]

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 min-h-0">
            {/* Tab bar */}
            <div className="flex gap-1 px-4 py-2.5 border-b border-border bg-background shrink-0">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                            tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'sif' && (
                <BFIFieldReview step="extract" onValidate={onValidate} onResolveChange={onResolveChange} />
            )}

            {tab === 'quote' && (
                <div className="flex flex-col h-full min-h-0">
                    <div className="bg-background px-5 py-3 border-b border-border shrink-0">
                        <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">QUOTE REVIEW</h4>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">Q-2026-0089 · OmniQuote validated</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        {/* Column headers */}
                        <div className="grid grid-cols-4 gap-2 px-1">
                            {['Product', 'Qty', 'SIF', 'Net (OmniQ)'].map(h => (
                                <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>
                        {/* Editable line items */}
                        {quoteLines.map((line, idx) => {
                            const isEditing = editingIdx === idx
                            return (
                                <div key={line.code} className={`rounded-xl border p-3 transition-all ${
                                    isEditing ? 'border-primary/40 bg-primary/5' :
                                    line.corrected ? 'border-warning/30 bg-warning/5' : 'border-border bg-card'
                                }`}>
                                    <div className="grid grid-cols-4 gap-2 items-center">
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-mono text-muted-foreground truncate">{line.code}</p>
                                            <p className="text-[10px] font-semibold text-foreground leading-tight truncate">{line.name}</p>
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground">{line.qty}</span>
                                        <span className={`text-[10px] font-mono ${line.corrected ? 'text-warning line-through' : 'text-muted-foreground'}`}>{line.sif}</span>
                                        <div className="flex items-center gap-1">
                                            {isEditing ? (
                                                <input type="text" value={line.net} onChange={e => updateLine(idx, e.target.value)}
                                                    className="w-full text-[10px] font-mono font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className={`text-[10px] font-mono font-semibold ${line.corrected ? 'text-success' : 'text-foreground'}`}>{line.net}</span>
                                            )}
                                            <button onClick={() => setEditingIdx(isEditing ? null : idx)}
                                                className="text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label="Edit">
                                                {isEditing ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Edit2 className="h-3 w-3" />}
                                            </button>
                                        </div>
                                    </div>
                                    {line.corrected && (
                                        <p className="text-[9px] text-success mt-1.5">↓ Corrected from {line.sif} per CoNY T-code 18%</p>
                                    )}
                                </div>
                            )
                        })}
                        {/* Totals */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            {[
                                { label: 'SIF Total',         value: '$236,100', muted: true  },
                                { label: 'Adjusted Total',    value: '$235,560', bold: true   },
                                { label: 'Discount (−37.5%)', value: '−$88,335', accent: true },
                            ].map(row => (
                                <div key={row.label} className={`flex items-center justify-between px-4 py-2 border-b border-border/50 last:border-0 text-[11px] ${row.bold ? 'bg-muted/20' : ''}`}>
                                    <span className="text-muted-foreground">{row.label}</span>
                                    <span className={`font-mono font-semibold ${row.accent ? 'text-success' : row.muted ? 'text-muted-foreground' : 'text-foreground'}`}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />
                    </div>
                </div>
            )}

            {tab === 'zones' && (
                <div className="flex flex-col h-full min-h-0">
                    <div className="bg-background px-5 py-3 border-b border-border shrink-0">
                        <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">FLOOR PLAN ZONES</h4>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">30 Court St · Brooklyn · Floor 12</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        <FloorPlanSVG />
                        <div className="space-y-2">
                            {EXTRACT_ZONES.map(zone => (
                                <div key={zone.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${zone.chip}`}>
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${zone.dot}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold">{zone.label}</p>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold">{zone.qty}</span>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-1.5">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Install Details</p>
                            {[
                                { label: 'Window',    value: 'May 14–21, 2026'       },
                                { label: 'Crew',      value: '3 technicians'         },
                                { label: 'Carpenters', value: '45h (reconciled)'     },
                                { label: 'Location',  value: '30 Court St, Brooklyn' },
                            ].map(r => (
                                <div key={r.label} className="flex gap-2 text-[10px]">
                                    <span className="text-muted-foreground w-20 shrink-0">{r.label}</span>
                                    <span className="font-semibold text-foreground">{r.value}</span>
                                </div>
                            ))}
                        </div>
                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Field Review Panel ──────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { label: string; chip: string }> = {
    header:    { label: 'Document Header',    chip: 'bg-muted text-muted-foreground border-border'          },
    labor:     { label: 'Labor (from SIF)',   chip: 'bg-info/10 text-info border-info/20'                   },
    items:     { label: 'Products',           chip: 'bg-ai/10 text-ai border-ai/20'                         },
    logistics: { label: 'Pricing & Delivery', chip: 'bg-success/10 text-success border-success/20'          },
    fee:       { label: 'Agency Fee',         chip: 'bg-warning/10 text-warning border-warning/20'          },
}

function BFIFieldReview({ step, scenario, onValidate, onResolveChange }: {
    step: BFIReviewStep
    scenario?: 'match' | 'gap'
    onValidate?: () => void
    onResolveChange?: (ids: Set<string>) => void
}) {
    const [fields]            = useState<ReviewField[]>(() => getFields(step, scenario))
    const [resolved, setResolved] = useState<Set<string>>(new Set())
    const [expanded, setExpanded] = useState<string | null>(() => {
        const first = getFields(step, scenario).find(f => f.status !== 'valid')
        return first?.id ?? null
    })
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    const [manualEditId, setManualEditId] = useState<string | null>(null)

    const issueFields    = fields.filter(f => f.status !== 'valid')
    const totalIssues    = issueFields.length
    const resolvedCount  = resolved.size
    const allResolved    = resolvedCount >= totalIssues

    const handleAcceptOVNIQ = (id: string) => {
        setResolved(prev => {
            const next = new Set([...prev, id])
            onResolveChange?.(next)
            return next
        })
        setExpanded(null)
    }

    const handleEditResolved = (id: string) => {
        setResolved(prev => { const n = new Set(prev); n.delete(id); return n })
        setExpanded(id)
    }

    const handleAutoResolve = () => {
        const remaining = issueFields.filter(f => !resolved.has(f.id))
        remaining.forEach((f, i) => {
            setTimeout(() => setResolved(prev => {
                const next = new Set([...prev, f.id])
                onResolveChange?.(next)
                return next
            }), i * 150)
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

                {/* Field list — grouped by category */}
                <div className="px-5 py-3 pb-6 space-y-4">
                    {(() => {
                        const seenCategories = new Set<string>()
                        return fields.map(field => {
                        const showHeader = !seenCategories.has(field.category)
                        if (showHeader) seenCategories.add(field.category)
                        const catStyle = CATEGORY_STYLE[field.category] ?? CATEGORY_STYLE.header

                        const isExpanded  = expanded === field.id
                        const isResolved  = resolved.has(field.id)
                        const isIssue     = field.status !== 'valid'
                        const canEdit = field.status === 'valid' || isResolved

                        return (
                            <div key={field.id}>
                            {showHeader && (
                                <div className="flex items-center gap-2 mb-2.5">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${catStyle.chip}`}>
                                        {catStyle.label}
                                    </span>
                                    <div className="flex-1 h-px bg-border/60" />
                                </div>
                            )}
                            <div className={`border rounded-xl transition-all ${
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
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${catStyle.chip}`}>
                                                {catStyle.label}
                                            </span>
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
                                            <div className="flex items-center justify-between">
                                                <p className="text-[12px] font-semibold text-foreground">Extracted Value (SIF)</p>
                                                <button
                                                    onClick={() => setManualEditId(prev => prev === field.id ? null : field.id)}
                                                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                                        manualEditId === field.id
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                                                    }`}
                                                >
                                                    <Edit2 className="h-2.5 w-2.5" />
                                                    Enter manually
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={editValues[field.id] ?? field.extractedValue ?? ''}
                                                onChange={e => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                readOnly={manualEditId !== field.id}
                                                autoFocus={manualEditId === field.id}
                                                className={`w-full rounded-lg border px-3 py-2 text-[13px] font-mono text-foreground focus:outline-none transition-all ${
                                                    manualEditId === field.id
                                                        ? 'border-primary bg-card ring-2 ring-primary/20 cursor-text'
                                                        : 'border-border bg-background cursor-default'
                                                }`}
                                            />
                                            {manualEditId === field.id && (
                                                <p className="text-[10px] text-primary font-medium animate-in fade-in duration-200">
                                                    Type your custom value above, then click Save.
                                                </p>
                                            )}
                                        </div>

                                        {field.ovniqSuggestion && manualEditId !== field.id && (
                                            <div className="space-y-1.5">
                                                <p className="text-[12px] font-semibold text-foreground">OmniQuote suggests</p>
                                                <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                                                    <span className="text-[13px] font-mono font-bold text-warning">{field.ovniqSuggestion}</span>
                                                </div>
                                            </div>
                                        )}

                                        {field.reason && manualEditId !== field.id && (
                                            <div className="flex items-start gap-2 p-3 bg-ai/5 border border-ai/20 rounded-lg">
                                                <Info className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-ai leading-relaxed">{field.reason}</p>
                                            </div>
                                        )}

                                        {manualEditId === field.id ? (
                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    onClick={() => { handleAcceptOVNIQ(field.id); setManualEditId(null) }}
                                                    className="flex-1 py-2 text-[12px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                                                >
                                                    Save custom value
                                                </button>
                                                <button
                                                    onClick={() => setManualEditId(null)}
                                                    className="py-2 px-4 text-[12px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
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
                                        )}
                                    </div>
                                )}
                            </div>
                            </div>
                        )
                    })
                    })()}
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
    isOpen, onClose, step, onValidate, scenario, michaelMode, invoiceUpload
}: BFIDocumentReviewModalProps) {
    const [activeTab, setActiveTab] = useState<'sif' | 'specs' | 'floorplan'>(step === 'quote' ? 'specs' : 'sif')
    const [downloadConfirm, setDownloadConfirm] = useState<string | null>(null)
    const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())

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
                                                { id: 'specs' as const,    icon: FileText, label: 'Q-2026-0089 · Quote' },
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
                                                            {activeTab === 'sif' ? 'Download SIF' : 'Download Quote'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tab content */}
                                        <div className="flex-1 min-h-0 overflow-hidden">
                                            {activeTab === 'sif' ? (
                                                <SIFDocumentPreview resolvedIds={resolvedIds} />
                                            ) : activeTab === 'specs' ? (
                                                <QuoteDocumentTab />
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
                                        <RightPanel step={step} scenario={scenario} onValidate={onValidate} michaelMode={michaelMode} invoiceUpload={invoiceUpload} onResolveChange={setResolvedIds} />
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
