/**
 * COMPONENT: DesignerResponseScene  (a1.2)
 * PURPOSE: Agency Fee step 2 — Robert Chen (Miller Knoll Rep) reads Lauren's
 *          confirmation email in his mail client and reviews the mapped documents:
 *          Tab 1 (SIF): email body + key SIF fields
 *          Tab 2 (Quote): Q-2026-0089 line items — editable
 *          Tab 3 (Zones): floor plan zones
 */

import { useState } from 'react'
import { CheckCircle2, FileText, MapPin, ArrowLeft, Mail, Edit2 } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import { FloorPlanSVG } from './BFIDocumentReviewModal'

interface DesignerResponseSceneProps {
    onAcknowledge?: () => void
}

// ─── SIF fields (read-only summary) ─────────────────────────────────────────

const SIF_SUMMARY = [
    { section: 'Document Header', fields: [
        { label: 'Quote #',    value: 'Q-2026-0089'           },
        { label: 'Contract',   value: 'CoNY · City of New York' },
        { label: 'Agency',     value: 'NYC Dept. of Education' },
        { label: 'Date',       value: 'May 6, 2026'           },
    ]},
    { section: 'Labor (from SIF)', fields: [
        { label: 'Carpenters', value: '45h', corrected: true, original: '50h' },
        { label: 'OT',         value: '6h',  corrected: true, original: '8h'  },
    ]},
    { section: 'Pricing & Delivery', fields: [
        { label: 'Installation',    value: '$12,400'   },
        { label: 'Delivery window', value: 'May 14–21' },
        { label: 'Total value',     value: '$48,200'   },
    ]},
]

// ─── Quote line items (editable) ─────────────────────────────────────────────

interface QuoteLine { code: string; name: string; qty: string; sif: string; net: string; corrected: boolean }

const INITIAL_QUOTE_LINES: QuoteLine[] = [
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  sif: '$8,100',   net: '$7,560',   corrected: true  },
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', sif: '$144,000', net: '$144,000', corrected: false },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', sif: '$84,000',  net: '$84,000',  corrected: false },
]

// ─── Floor plan zones ─────────────────────────────────────────────────────────

const ZONES = [
    { id: 'A', label: 'Zone A · Workstations ×24', color: 'bg-info/10 text-info border-info/20',       dot: 'bg-info'    },
    { id: 'B', label: 'Zone B · Lounge ×12',        color: 'bg-ai/10 text-ai border-ai/20',             dot: 'bg-ai'      },
    { id: 'C', label: 'Zone C · Filing ×6',         color: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function DesignerResponseScene({ onAcknowledge }: DesignerResponseSceneProps) {
    const [acknowledged, setAcknowledged] = useState(false)
    const [activeTab, setActiveTab] = useState<'sif' | 'quote' | 'zones'>('sif')
    const [quoteLines, setQuoteLines] = useState<QuoteLine[]>(INITIAL_QUOTE_LINES)
    const [editingIdx, setEditingIdx] = useState<number | null>(null)

    const handleAcknowledge = () => {
        setAcknowledged(true)
        setTimeout(() => { onAcknowledge?.() }, 800)
    }

    const updateLine = (idx: number, field: keyof QuoteLine, val: string) => {
        setQuoteLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l))
    }

    const TABS = [
        { id: 'sif'   as const, icon: FileText, label: 'SIF'    },
        { id: 'quote' as const, icon: FileText, label: 'Quote'  },
        { id: 'zones' as const, icon: MapPin,   label: 'Zones'  },
    ]

    return (
        <div className="flex flex-col h-full bg-background">

            {/* Email client header bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card shrink-0">
                <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-info">RC</span>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[11px] font-bold text-foreground leading-none truncate">Robert Chen</div>
                        <div className="text-[9px] text-muted-foreground leading-none mt-0.5">Miller Knoll Rep</div>
                    </div>
                </div>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>

            {/* Email metadata */}
            <div className="px-4 pt-3 pb-2.5 border-b border-border/60 shrink-0">
                <div className="text-[12px] font-bold text-foreground leading-snug mb-1.5">
                    Re: Quote Q-2026-0089 Confirmed · DOE-2847
                </div>
                <div className="space-y-0.5">
                    {[
                        { label: 'From', value: 'lauren.demarco@bfifurniture.com' },
                        { label: 'To',   value: 'robert.chen@millerknoll.com' },
                        { label: 'Date', value: 'May 6, 2026 · 8:21 AM' },
                    ].map(r => (
                        <div key={r.label} className="flex items-center gap-2 text-[10px]">
                            <span className="text-muted-foreground w-7 shrink-0">{r.label}:</span>
                            <span className="text-foreground font-medium truncate">{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-0 border-b border-border bg-muted/20 shrink-0 px-3 pt-1.5">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold border-b-2 transition-all mr-0.5 ${
                            activeTab === tab.id
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <tab.icon className="h-3 w-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto min-h-0">

                {/* ── SIF Tab ── */}
                {activeTab === 'sif' && (
                    <div className="px-4 py-3 space-y-3">
                        {/* Email body */}
                        <div className="text-[11px] text-foreground leading-relaxed space-y-2.5">
                            <p>Hi Robert,</p>
                            <p>
                                We've received and ingested all documents for{' '}
                                <span className="font-semibold">DOE-2847</span> — SIF, spec sheet, and floor plan.
                                The quote is being validated against the CoNY contract and the order is moving forward.
                            </p>
                            <p>
                                During our CPR review we identified a labor reconciliation —{' '}
                                <span className="font-semibold">Carpenters: 50h → 45h</span> and{' '}
                                <span className="font-semibold">OT: 8h → 6h</span> — which we are processing with the team.
                                This will not affect the delivery window.
                            </p>
                            <p>
                                Quote <span className="font-semibold">Q-2026-0089</span> is confirmed.
                                Updated SIF and CPR package attached for your records.
                            </p>
                            <p className="text-muted-foreground text-[10px]">— Lauren DeMarco · BFI Furniture · CoNY Account Manager</p>
                        </div>

                        {/* SIF field summary */}
                        <div className="space-y-2.5">
                            {SIF_SUMMARY.map(group => (
                                <div key={group.section}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className="w-0.5 h-3 bg-primary rounded-full" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{group.section}</span>
                                    </div>
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        {group.fields.map((f, i) => (
                                            <div key={f.label} className={`flex items-center justify-between px-3 py-1.5 text-[10px] ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                                                <span className="text-muted-foreground">{f.label}</span>
                                                <div className="flex items-center gap-1">
                                                    {'corrected' in f && f.corrected && (
                                                        <span className="text-[9px] text-warning line-through font-mono">{f.original}</span>
                                                    )}
                                                    <span className={`font-semibold font-mono ${'corrected' in f && f.corrected ? 'text-success' : 'text-foreground'}`}>{f.value}</span>
                                                    {'corrected' in f && f.corrected && (
                                                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Attachments */}
                        <div className="flex flex-col gap-1">
                            {[
                                { name: 'DOE-2847-SIF-updated.pdf',  label: 'Updated SIF' },
                                { name: 'Q-2026-0089-OmniQuote.pdf', label: 'Quote'        },
                                { name: 'DOE-2847-CPR-package.pdf',  label: 'CPR Package' },
                            ].map(a => (
                                <div key={a.name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border text-[10px] text-foreground font-medium">
                                    <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                    {a.name}
                                    <span className="text-[9px] text-muted-foreground ml-auto">· {a.label}</span>
                                </div>
                            ))}
                        </div>

                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                    </div>
                )}

                {/* ── Quote Tab ── */}
                {activeTab === 'quote' && (
                    <div className="px-4 py-3 space-y-3">
                        {/* Doc header */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-primary to-[#C3E433]" />
                            <div className="px-3 py-2.5 flex items-start justify-between">
                                <div>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded">Quote · OmniQuote</span>
                                    <p className="text-[13px] font-extrabold text-foreground mt-1">Q-2026-0089</p>
                                    <p className="text-[9px] font-mono text-muted-foreground">DOE-2847 · NYC Dept. of Education</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground">MILLER KNOLL</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">Robert Chen · May 6, 2026</p>
                                    <span className="text-[8px] font-bold text-primary">OmniQuote ✓</span>
                                </div>
                            </div>
                        </div>

                        {/* Column headers */}
                        <div className="grid grid-cols-4 gap-1 px-1">
                            {['Product', 'Qty', 'SIF Price', 'Net'].map(h => (
                                <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>

                        {/* Editable line items */}
                        <div className="space-y-2">
                            {quoteLines.map((line, idx) => {
                                const isEditing = editingIdx === idx
                                return (
                                    <div key={line.code} className={`rounded-xl border p-2.5 transition-all ${
                                        isEditing ? 'border-primary/40 bg-primary/5' :
                                        line.corrected ? 'border-warning/30 bg-warning/5' : 'border-border bg-card'
                                    }`}>
                                        <div className="grid grid-cols-4 gap-1 items-center">
                                            <div className="col-span-1 min-w-0">
                                                <p className="text-[9px] font-mono text-muted-foreground truncate">{line.code}</p>
                                                <p className="text-[10px] font-semibold text-foreground leading-tight truncate">{line.name}</p>
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground">{line.qty}</span>
                                            <span className={`text-[10px] font-mono ${line.corrected ? 'text-warning line-through' : 'text-muted-foreground'}`}>{line.sif}</span>
                                            <div className="flex items-center gap-1">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={line.net}
                                                        onChange={e => updateLine(idx, 'net', e.target.value)}
                                                        className="w-full text-[10px] font-mono font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className={`text-[10px] font-mono font-semibold ${line.corrected ? 'text-success' : 'text-foreground'}`}>{line.net}</span>
                                                )}
                                                <button
                                                    onClick={() => setEditingIdx(isEditing ? null : idx)}
                                                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                                    aria-label="Edit price"
                                                >
                                                    {isEditing
                                                        ? <CheckCircle2 className="h-3 w-3 text-success" />
                                                        : <Edit2 className="h-3 w-3" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                        {line.corrected && (
                                            <p className="text-[9px] text-success mt-1.5 pl-0.5">↓ Corrected from {line.sif} per CoNY T-code 18%</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Totals */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            {[
                                { label: 'SIF Total',         value: '$236,100', muted: true  },
                                { label: 'Adjusted Total',    value: '$235,560', bold: true   },
                                { label: 'Discount (−37.5%)', value: '−$88,335', accent: true },
                            ].map(row => (
                                <div key={row.label} className={`flex items-center justify-between px-3 py-1.5 border-b border-border/50 last:border-0 text-[10px] ${row.bold ? 'bg-muted/20' : ''}`}>
                                    <span className="text-muted-foreground">{row.label}</span>
                                    <span className={`font-mono font-semibold ${row.accent ? 'text-success' : row.muted ? 'text-muted-foreground' : 'text-foreground'}`}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />
                    </div>
                )}

                {/* ── Zones Tab ── */}
                {activeTab === 'zones' && (
                    <div className="px-4 py-3 space-y-3">
                        {/* Floor plan */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                                    Floor Plan · 30 Court St · Floor 12
                                </span>
                                <span className="ml-auto text-[8px] text-success font-semibold">OCR ✓</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-zinc-900">
                                <FloorPlanSVG />
                            </div>
                        </div>

                        {/* Zone legend */}
                        <div className="space-y-2">
                            {ZONES.map(zone => (
                                <div key={zone.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${zone.color}`}>
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${zone.dot}`} />
                                    <span className="text-[11px] font-semibold">{zone.label}</span>
                                    <span className="ml-auto text-[9px] font-bold opacity-60">Zone {zone.id}</span>
                                </div>
                            ))}
                        </div>

                        {/* Install info */}
                        <div className="rounded-xl border border-border bg-card px-3 py-2.5 space-y-1.5">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Install Details</p>
                            {[
                                { label: 'Location',  value: '30 Court St · Brooklyn, NY' },
                                { label: 'Window',    value: 'May 14–21, 2026'            },
                                { label: 'Crew',      value: '3 technicians'              },
                                { label: 'Carpenters', value: '45h (reconciled)'          },
                            ].map(r => (
                                <div key={r.label} className="flex items-center gap-2 text-[10px]">
                                    <span className="text-muted-foreground w-20 shrink-0">{r.label}</span>
                                    <span className="font-semibold text-foreground">{r.value}</span>
                                </div>
                            ))}
                        </div>

                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                    </div>
                )}
            </div>

            {/* Acknowledged state */}
            {acknowledged && (
                <div className="mx-4 mb-2 bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300 shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Receipt acknowledged · Q-2026-0089 · May 6 · 9:25 AM</div>
                        <div className="text-muted-foreground mt-0.5">Loop closed in Strata · BFI proceeding to OmniQuote validation</div>
                    </div>
                </div>
            )}

            {/* CTA */}
            {!acknowledged && (
                <div className="px-4 py-3 border-t border-border bg-card shrink-0">
                    <button
                        onClick={handleAcknowledge}
                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        Continue →
                    </button>
                </div>
            )}
        </div>
    )
}
